from .schemas import UserPublic
from .unit_of_work import UsuarioUnitOfWork


class UsuarioNoEncontrado(Exception):
    pass


class UsuarioDuplicado(Exception):
    pass


class AutoDesactivacion(Exception):
    pass


class UsuarioService:
    """Listado, activación y desactivación de usuarios (solo admin)."""

    def __init__(self, uow: UsuarioUnitOfWork) -> None:
        self.uow = uow

    def listar(self) -> list[UserPublic]:
        with self.uow as uow:
            return [UserPublic.model_validate(u) for u in uow.usuarios.list_ordered()]

    def activar(self, usuario_id: int) -> UserPublic:
        """Alta lógica. Idempotente: responde aunque el usuario ya esté activo."""
        with self.uow as uow:
            usuario = uow.usuarios.get_by_id(usuario_id)
            if usuario is None:
                raise UsuarioNoEncontrado("Usuario no encontrado")
            usuario.disabled = False
            uow.session.add(usuario)
            return UserPublic.model_validate(usuario)

    def desactivar(self, usuario_id: int, admin_id: int) -> UserPublic:
        """Baja lógica. Idempotente. El admin no puede desactivarse a sí mismo."""
        with self.uow as uow:
            usuario = uow.usuarios.get_by_id(usuario_id)
            if usuario is None:
                raise UsuarioNoEncontrado("Usuario no encontrado")
            if usuario.id == admin_id:
                raise AutoDesactivacion("No podés desactivar tu propia cuenta")
            usuario.disabled = True
            uow.session.add(usuario)
            return UserPublic.model_validate(usuario)
