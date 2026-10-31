from typing import Self

from app.core.unit_of_work import UnitOfWork
from app.modules.productos.repository import ProductoRepository

from .repository import PedidoRepository


class PedidoUnitOfWork(UnitOfWork):
    """Repositorios de pedidos y de productos sobre la misma sesión: el pedido y el stock
    se confirman (o se descartan) juntos en una sola transacción."""

    pedidos: PedidoRepository
    productos: ProductoRepository

    def __enter__(self) -> Self:
        super().__enter__()
        self.pedidos = PedidoRepository(self.session)
        self.productos = ProductoRepository(self.session)
        return self
