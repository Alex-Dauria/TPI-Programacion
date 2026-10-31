from collections.abc import Sequence
from datetime import datetime

from sqlmodel import col, func, select

from app.core.base_repository import BaseRepository

from .models import Pedido


class PedidoRepository(BaseRepository[Pedido]):
    model = Pedido

    def list_by_usuario(
        self, usuario_id: int | None, skip: int, limit: int, estado: str | None = None
    ) -> tuple[int, Sequence[Pedido]]:
        """Pedidos de un usuario (o de todos si usuario_id es None), del más nuevo al más viejo."""
        filtros = []
        if usuario_id is not None:
            filtros.append(Pedido.usuario_id == usuario_id)
        if estado is not None:
            filtros.append(Pedido.estado == estado)

        total = self.session.exec(select(func.count()).select_from(Pedido).where(*filtros)).one()
        items = self.session.exec(
            select(Pedido).where(*filtros).order_by(col(Pedido.id).desc()).offset(skip).limit(limit)
        ).all()
        return total, items

    def count_by_estado(self) -> dict[str, int]:
        """Cantidad de pedidos por estado, con func.count."""
        filas = self.session.exec(select(Pedido.estado, func.count()).group_by(Pedido.estado)).all()
        return {estado: cantidad for estado, cantidad in filas}

    def count_desde(self, desde: datetime) -> int:
        return self.session.exec(select(func.count()).select_from(Pedido).where(Pedido.created_at >= desde)).one()

    def sum_total_by_estado(self, estado: str) -> float:
        total = self.session.exec(select(func.sum(Pedido.total)).where(Pedido.estado == estado)).one()
        return float(total or 0)
