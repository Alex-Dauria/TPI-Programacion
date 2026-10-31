from collections.abc import Callable
from types import TracebackType
from typing import Self

from sqlmodel import Session

from app.core.database import session_factory


class UnitOfWork:
    """Unidad de trabajo base: una sesión = una transacción.

    `__enter__` abre la sesión. `__exit__` hace commit si el bloque terminó sin excepción, o rollback si hubo
    una, y siempre cierra la sesión. Ningún Service ni Router llama a `session.commit()`.

    Cada módulo hereda de esta clase y crea sus repositorios sobre `self.session` en `__enter__`.
    """

    session: Session

    def __init__(self, factory: Callable[[], Session] = session_factory) -> None:
        self._factory = factory

    def __enter__(self) -> Self:
        self.session = self._factory()
        return self

    def __exit__(
        self,
        exc_type: type[BaseException] | None,
        exc: BaseException | None,
        tb: TracebackType | None,
    ) -> None:
        try:
            if exc_type is None:
                self.session.commit()
            else:
                self.session.rollback()
        except Exception:
            self.session.rollback()
            raise
        finally:
            self.session.close()
