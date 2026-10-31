from typing import Self

from app.core.unit_of_work import UnitOfWork

from .repository import UsuarioRepository


class UsuarioUnitOfWork(UnitOfWork):
    usuarios: UsuarioRepository

    def __enter__(self) -> Self:
        super().__enter__()
        self.usuarios = UsuarioRepository(self.session)
        return self
