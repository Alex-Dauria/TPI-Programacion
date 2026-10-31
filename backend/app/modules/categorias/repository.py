from collections.abc import Sequence

from sqlmodel import func, select

from app.core.base_repository import BaseRepository

from .models import Categoria


class CategoriaRepository(BaseRepository[Categoria]):
    model = Categoria

    def get_by_nombre(self, nombre: str) -> Categoria | None:
        """Sin distinguir mayúsculas ("pizzas" = "Pizzas"). Incluye las dadas de baja: la baja lógica no libera
        el nombre único."""
        consulta = select(Categoria).where(func.lower(Categoria.nombre) == nombre.strip().lower())
        return self.session.exec(consulta).first()

    def list_activas(self) -> Sequence[Categoria]:
        return self.session.exec(select(Categoria).where(Categoria.activo).order_by(Categoria.nombre)).all()
