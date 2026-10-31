from collections.abc import Sequence
from typing import Generic, TypeVar

from sqlmodel import Session, SQLModel, select

T = TypeVar("T", bound=SQLModel)


class BaseRepository(Generic[T]):
    """Acceso a datos genérico de una tabla. Sin reglas de negocio y sin commit (eso es del Unit of Work)."""

    model: type[T]

    def __init__(self, session: Session) -> None:
        self.session = session

    def get_by_id(self, id: int) -> T | None:
        return self.session.get(self.model, id)

    def get_all(self) -> Sequence[T]:
        return self.session.exec(select(self.model)).all()

    def add(self, entity: T) -> T:
        self.session.add(entity)
        self.session.flush()  # asigna el id sin confirmar la transacción
        return entity

    def delete(self, entity: T) -> None:
        self.session.delete(entity)
        self.session.flush()
