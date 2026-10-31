from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Query, status

from app.core.deps import AdminUser, CurrentUser
from app.modules.productos.service import ProductoNoEncontrado

from .schemas import CambioEstado, EstadoPedido, PedidoCreate, PedidoRead, PedidosPaginados, ResumenPedidos
from .service import PedidoAjeno, PedidoError, PedidoNoEncontrado, PedidoService
from .unit_of_work import PedidoUnitOfWork

router = APIRouter(prefix="/pedidos", tags=["Pedidos"])


def get_pedido_service() -> PedidoService:
    return PedidoService(PedidoUnitOfWork())


ServiceDep = Annotated[PedidoService, Depends(get_pedido_service)]


def _a_http(exc: Exception) -> HTTPException:
    """Traduce las excepciones de dominio: 404 inexistente, 403 pedido ajeno, 400 el resto de las reglas."""
    if isinstance(exc, (PedidoNoEncontrado, ProductoNoEncontrado)):
        codigo = status.HTTP_404_NOT_FOUND
    elif isinstance(exc, PedidoAjeno):
        codigo = status.HTTP_403_FORBIDDEN
    else:
        codigo = status.HTTP_400_BAD_REQUEST
    return HTTPException(status_code=codigo, detail=str(exc))


@router.post("", response_model=PedidoRead, status_code=status.HTTP_201_CREATED, summary="Crea el pedido (RN-01)")
def crear_pedido(data: PedidoCreate, usuario: CurrentUser, service: ServiceDep):
    try:
        return service.crear(data, usuario)
    except (PedidoError, ProductoNoEncontrado) as exc:
        raise _a_http(exc)


@router.get("", response_model=PedidosPaginados, summary="Pedidos propios (user) o todos (admin)")
def listar_pedidos(
    usuario: CurrentUser,
    service: ServiceDep,
    skip: Annotated[int, Query(ge=0)] = 0,
    limit: Annotated[int, Query(ge=1, le=100)] = 20,
    estado: EstadoPedido | None = None,
):
    return service.listar(usuario, skip, limit, estado)


# Se declara antes de /{id} para que "resumen" no se interprete como un id.
@router.get("/resumen", response_model=ResumenPedidos, summary="Indicadores del panel")
def resumen_pedidos(_: AdminUser, service: ServiceDep):
    return service.resumen()


@router.get("/{id}", response_model=PedidoRead, summary="Detalle con sus líneas (dueño o admin)")
def obtener_pedido(id: int, usuario: CurrentUser, service: ServiceDep):
    try:
        return service.obtener(id, usuario)
    except PedidoError as exc:
        raise _a_http(exc)


@router.patch("/{id}/estado", response_model=PedidoRead, summary="Avanza o cancela (RN-02, RN-03)")
def cambiar_estado(id: int, data: CambioEstado, _: AdminUser, service: ServiceDep):
    try:
        return service.cambiar_estado(id, data.estado)
    except PedidoError as exc:
        raise _a_http(exc)


@router.patch("/{id}/cancelar", response_model=PedidoRead, summary="Cancela un pedido propio en PENDIENTE")
def cancelar_pedido(id: int, usuario: CurrentUser, service: ServiceDep):
    try:
        return service.cancelar(id, usuario)
    except PedidoError as exc:
        raise _a_http(exc)
