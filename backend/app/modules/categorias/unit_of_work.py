from typing import Self

from app.core.unit_of_work import UnitOfWork

from .repository import CategoriaRepository


class CategoriaUnitOfWork(UnitOfWork):
    categorias: CategoriaRepository

    def __enter__(self) -> Self:
        super().__enter__()
        self.categorias = CategoriaRepository(self.session)
        return self
