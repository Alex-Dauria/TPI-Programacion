from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Response, status
from fastapi.security import OAuth2PasswordRequestForm

from app.core.config import settings
from app.core.deps import COOKIE_NAME, CurrentUser
from app.modules.usuarios.schemas import UserCreate, UserPublic
from app.modules.usuarios.service import UsuarioDuplicado
from app.modules.usuarios.unit_of_work import UsuarioUnitOfWork

from .schemas import MessageResponse
from .service import AuthService, CredencialesInvalidas, CuentaDesactivada

router = APIRouter(prefix="/auth", tags=["Auth"])


def get_auth_service() -> AuthService:
    return AuthService(UsuarioUnitOfWork())


ServiceDep = Annotated[AuthService, Depends(get_auth_service)]


@router.post(
    "/register", response_model=UserPublic, status_code=status.HTTP_201_CREATED, summary="Registro público (rol user)"
)
def register(data: UserCreate, service: ServiceDep):
    try:
        return service.register(data)
    except UsuarioDuplicado as exc:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=str(exc))


@router.post("/token", response_model=MessageResponse, summary="Login con formulario OAuth2 (cookie HttpOnly)")
def login(form: Annotated[OAuth2PasswordRequestForm, Depends()], response: Response, service: ServiceDep):
    """El JWT viaja solo en la cookie HttpOnly `access_token`; el cuerpo no incluye el token."""
    try:
        token = service.login(form.username, form.password)
    except CredencialesInvalidas as exc:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail=str(exc))
    except CuentaDesactivada as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc))
    response.set_cookie(
        key=COOKIE_NAME,
        value=token,
        httponly=True,
        max_age=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        samesite="lax",
        secure=False,  # en producción con HTTPS: True
        path="/",
    )
    return MessageResponse(message="Login exitoso")


@router.post("/logout", response_model=MessageResponse, summary="Cerrar sesión (borra la cookie)")
def logout(response: Response):
    response.delete_cookie(key=COOKIE_NAME, path="/", httponly=True, samesite="lax")
    return MessageResponse(message="Logout exitoso")


@router.get("/me", response_model=UserPublic, summary="Usuario autenticado")
def me(usuario: CurrentUser):
    return usuario
