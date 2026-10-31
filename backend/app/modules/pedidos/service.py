from datetime import date, datetime, time

from app.modules.productos.service import ProductoNoEncontrado
from app.modules.usuarios.schemas import UserPublic

from .models import DetallePedido, Pedido
from .schemas import EstadoPedido, PedidoCreate, PedidoRead, PedidosPaginados, ResumenPedidos
from .unit_of_work import PedidoUnitOfWork

# RN-02: máquina de estados. ENTREGADO y CANCELADO son terminales.
TRANSICIONES: dict[EstadoPedido, set[EstadoPedido]] = {
    EstadoPedido.PENDIENTE: {EstadoPedido.EN_PREPARACION, EstadoPedido.CANCELADO},
    EstadoPedido.EN_PREPARACION: {EstadoPedido.ENTREGADO, EstadoPedido.CANCELADO},
    EstadoPedido.ENTREGADO: set(),
    EstadoPedido.CANCELADO: set(),
}


# ------------------------------ Excepciones de dominio ------------------------------


class PedidoError(Exception):
    """Base de las excepciones del módulo pedidos."""


class PedidoNoEncontrado(PedidoError):  # 404
    pass


class PedidoAjeno(PedidoError):  # 403
    pass


class ReglaDeNegocio(PedidoError):  # 400
    pass


class ProductoRepetido(ReglaDeNegocio):
    pass


class ProductoNoDisponible(ReglaDeNegocio):
    pass


class StockInsuficiente(ReglaDeNegocio):
    pass


class TransicionInvalida(ReglaDeNegocio):
    pass


class PedidoNoCancelable(ReglaDeNegocio):
    pass


# -------------------------------------- Service --------------------------------------


class PedidoService:
    def __init__(self, uow: PedidoUnitOfWork) -> None:
        self.uow = uow

    def crear(self, data: PedidoCreate, usuario: UserPublic) -> PedidoRead:
        """RN-01: todo en una sola transacción; si falla una validación no se persiste nada (rollback del UoW)."""
        with self.uow as uow:
            ids = [item.producto_id for item in data.items]
            if len(ids) != len(set(ids)):
                raise ProductoRepetido("Un producto no puede repetirse en el pedido")

            pedido = uow.pedidos.add(
                Pedido(
                    usuario_id=usuario.id,
                    estado=EstadoPedido.PENDIENTE.value,
                    forma_pago=data.forma_pago.value,
                    direccion_entrega=data.direccion_entrega,
                    notas=data.notas or None,
                    total=0,
                )
            )

            total = 0.0
            for item in data.items:
                producto = uow.productos.get_by_id(item.producto_id)
                if producto is None or not producto.activo:
                    raise ProductoNoEncontrado(f"Producto {item.producto_id} no encontrado")
                if not producto.disponible:
                    raise ProductoNoDisponible(f"El producto «{producto.nombre}» no está disponible")
                if producto.stock < item.cantidad:
                    raise StockInsuficiente(
                        f"Stock insuficiente para «{producto.nombre}» (disponible: {producto.stock})"
                    )
                producto.stock -= item.cantidad
                uow.session.add(producto)

                # Línea inmutable con copia del nombre y del precio (RN-05).
                subtotal = round(producto.precio_base * item.cantidad, 2)
                pedido.items.append(
                    DetallePedido(
                        producto_id=producto.id,
                        cantidad=item.cantidad,
                        nombre_producto=producto.nombre,
                        precio_unitario=producto.precio_base,
                        subtotal=subtotal,
                    )
                )
                total += subtotal

            pedido.total = round(total, 2)
            uow.session.add(pedido)
            uow.session.flush()
            return PedidoRead.model_validate(pedido)

    def listar(self, usuario: UserPublic, skip: int, limit: int, estado: EstadoPedido | None) -> PedidosPaginados:
        """RN-04: el user ve solo sus pedidos; el admin ve todos."""
        usuario_id = None if usuario.role == "admin" else usuario.id
        with self.uow as uow:
            total, pedidos = uow.pedidos.list_by_usuario(usuario_id, skip, limit, estado.value if estado else None)
            return PedidosPaginados(total=total, items=[PedidoRead.model_validate(p) for p in pedidos])

    def obtener(self, pedido_id: int, usuario: UserPublic) -> PedidoRead:
        with self.uow as uow:
            pedido = self._pedido(uow, pedido_id)
            if usuario.role != "admin" and pedido.usuario_id != usuario.id:
                raise PedidoAjeno("El pedido pertenece a otro usuario")
            return PedidoRead.model_validate(pedido)

    def cambiar_estado(self, pedido_id: int, nuevo: EstadoPedido) -> PedidoRead:
        """RN-02 (admin): solo transiciones del mapa. Al cancelar se restituye el stock (RN-03)."""
        with self.uow as uow:
            pedido = self._pedido(uow, pedido_id)
            actual = EstadoPedido(pedido.estado)
            if nuevo not in TRANSICIONES[actual]:
                raise TransicionInvalida(f"Transición inválida: {actual.value} → {nuevo.value}")
            if nuevo == EstadoPedido.CANCELADO:
                self._restituir_stock(uow, pedido)
            self._aplicar_estado(uow, pedido, nuevo)
            return PedidoRead.model_validate(pedido)

    def cancelar(self, pedido_id: int, usuario: UserPublic) -> PedidoRead:
        """RN-03 y RN-04: el dueño cancela su pedido solo desde PENDIENTE."""
        with self.uow as uow:
            pedido = self._pedido(uow, pedido_id)
            if pedido.usuario_id != usuario.id:
                raise PedidoAjeno("El pedido pertenece a otro usuario")
            if pedido.estado != EstadoPedido.PENDIENTE.value:
                raise PedidoNoCancelable("Solo se pueden cancelar pedidos en estado PENDIENTE")
            self._restituir_stock(uow, pedido)
            self._aplicar_estado(uow, pedido, EstadoPedido.CANCELADO)
            return PedidoRead.model_validate(pedido)

    def resumen(self) -> ResumenPedidos:
        with self.uow as uow:
            conteo = uow.pedidos.count_by_estado()
            inicio_de_hoy = datetime.combine(date.today(), time.min)
            return ResumenPedidos(
                pendientes=conteo.get(EstadoPedido.PENDIENTE.value, 0),
                en_preparacion=conteo.get(EstadoPedido.EN_PREPARACION.value, 0),
                entregados=conteo.get(EstadoPedido.ENTREGADO.value, 0),
                cancelados=conteo.get(EstadoPedido.CANCELADO.value, 0),
                pedidos_hoy=uow.pedidos.count_desde(inicio_de_hoy),
                ingresos_entregados=round(uow.pedidos.sum_total_by_estado(EstadoPedido.ENTREGADO.value), 2),
            )

    # ------------------------------------ Auxiliares ------------------------------------

    @staticmethod
    def _pedido(uow: PedidoUnitOfWork, pedido_id: int) -> Pedido:
        pedido = uow.pedidos.get_by_id(pedido_id)
        if pedido is None:
            raise PedidoNoEncontrado("Pedido no encontrado")
        return pedido

    @staticmethod
    def _restituir_stock(uow: PedidoUnitOfWork, pedido: Pedido) -> None:
        """RN-03: devuelve al stock la cantidad de cada línea, en la misma transacción que el cambio de estado."""
        for detalle in pedido.items:
            producto = uow.productos.get_by_id(detalle.producto_id)
            if producto is not None:
                producto.stock += detalle.cantidad
                uow.session.add(producto)

    @staticmethod
    def _aplicar_estado(uow: PedidoUnitOfWork, pedido: Pedido, estado: EstadoPedido) -> None:
        pedido.estado = estado.value
        pedido.updated_at = datetime.now()
        uow.session.add(pedido)
        uow.session.flush()
