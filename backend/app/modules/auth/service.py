from app.core.security import create_access_token, hash_password, verify_password
from app.modules.usuarios.models import Usuario
from app.modules.usuarios.schemas import UserCreate, UserPublic
from app.modules.usuarios.service import UsuarioDuplicado
from app.modules.usuarios.unit_of_work import UsuarioUnitOfWork


class CredencialesInvalidas(Exception):
    pass


class CuentaDesactivada(Exception):
    pass


class AuthService:
    """Registro público y login. Usa el modelo Usuario a través del Unit of Work de usuarios."""

    def __init__(self, uow: UsuarioUnitOfWork) -> None:
        self.uow = uow

    def register(self, data: UserCreate) -> UserPublic:
        with self.uow as uow:
            if uow.usuarios.get_by_username(data.username) is not None:
                raise UsuarioDuplicado("El username ya está registrado")
            if uow.usuarios.get_by_email(data.email) is not None:
                raise UsuarioDuplicado("El email ya está registrado")
            usuario = uow.usuarios.add(
                Usuario(
                    username=data.username,
                    full_name=data.full_name,
                    email=data.email,
                    hashed_password=hash_password(data.password),
                    role="user",  # el registro público siempre crea usuarios "user"
                )
            )
            return UserPublic.model_validate(usuario)

    def login(self, username: str, password: str) -> str:
        """Valida las credenciales y devuelve el JWT (el Router lo coloca en la cookie HttpOnly)."""
        with self.uow as uow:
            usuario = uow.usuarios.get_by_username(username)
            if usuario is None or not verify_password(password, usuario.hashed_password):
                raise CredencialesInvalidas("Usuario o contraseña incorrectos")
            if usuario.disabled:
                raise CuentaDesactivada("Cuenta de usuario desactivada")
            return create_access_token(usuario.username)
