from collections.abc import Sequence

from sqlmodel import select

from app.core.base_repository import BaseRepository

from .models import Categoria


class CategoriaRepository(BaseRepository[Categoria]):
    model = Categoria

    def get_by_nombre(self, nombre: str) -> Categoria | None:
        """Incluye las dadas de baja: la baja lógica no libera el nombre único."""
        return self.session.exec(select(Categoria).where(Categoria.nombre == nombre)).first()

    def list_activas(self) -> Sequence[Categoria]:
        return self.session.exec(select(Categoria).where(Categoria.activo).order_by(Categoria.nombre)).all()
