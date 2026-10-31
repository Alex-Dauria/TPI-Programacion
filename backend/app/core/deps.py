from collections.abc import Callable
from typing import Annotated

from fastapi import Depends, HTTPException, status
from fastapi.security import APIKeyCookie

from app.core.security import decode_access_token
from app.modules.usuarios.schemas import UserPublic
from app.modules.usuarios.unit_of_work import UsuarioUnitOfWork

COOKIE_NAME = "access_token"

# Lee el JWT de la cookie HttpOnly. En /docs aparece como esquema de seguridad: tras ejecutar
# POST /api/v1/auth/token el navegador guarda la cookie y la envía sola en las demás peticiones.
cookie_scheme = APIKeyCookie(name=COOKIE_NAME, auto_error=False)


def get_current_user(token: Annotated[str | None, Depends(cookie_scheme)]) -> UserPublic:
    """Usuario de la sesión. 401 si falta la cookie o el token es inválido o venció."""
    credentials_error = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED, detail="No autenticado o sesión vencida"
    )
    if not token:
        raise credentials_error
    username = decode_access_token(token)
    if username is None:
        raise credentials_error
    with UsuarioUnitOfWork() as uow:
        usuario = uow.usuarios.get_by_username(username)
        if usuario is None:
            raise credentials_error
        return UserPublic.model_validate(usuario)


def get_current_active_user(usuario: Annotated[UserPublic, Depends(get_current_user)]) -> UserPublic:
    """Igual que get_current_user, pero rechaza con 400 a los usuarios desactivados."""
    if usuario.disabled:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Cuenta de usuario desactivada")
    return usuario


def require_role(roles: list[str]) -> Callable[[UserPublic], UserPublic]:
    """Dependencia que exige uno de los roles indicados. 403 si el rol no está permitido."""

    def checker(usuario: Annotated[UserPublic, Depends(get_current_active_user)]) -> UserPublic:
        if usuario.role not in roles:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="No tiene permisos para esta acción")
        return usuario

    return checker


CurrentUser = Annotated[UserPublic, Depends(get_current_active_user)]
AdminUser = Annotated[UserPublic, Depends(require_role(["admin"]))]
