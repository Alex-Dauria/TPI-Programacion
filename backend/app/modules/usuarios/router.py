from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status

from app.core.deps import AdminUser

from .schemas import UserPublic
from .service import AutoDesactivacion, UsuarioNoEncontrado, UsuarioService
from .unit_of_work import UsuarioUnitOfWork

router = APIRouter(prefix="/admin/usuarios", tags=["Usuarios (admin)"])


def get_usuario_service() -> UsuarioService:
    return UsuarioService(UsuarioUnitOfWork())


ServiceDep = Annotated[UsuarioService, Depends(get_usuario_service)]


@router.get("", response_model=list[UserPublic], summary="Listado de usuarios")
def listar_usuarios(_: AdminUser, service: ServiceDep):
    return service.listar()


@router.post("/{id}/activar", response_model=UserPublic, summary="Alta lógica (disabled = false)")
def activar_usuario(id: int, _: AdminUser, service: ServiceDep):
    try:
        return service.activar(id)
    except UsuarioNoEncontrado as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc))


@router.post("/{id}/desactivar", response_model=UserPublic, summary="Baja lógica (disabled = true)")
def desactivar_usuario(id: int, admin: AdminUser, service: ServiceDep):
    try:
        return service.desactivar(id, admin.id)
    except UsuarioNoEncontrado as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc))
    except AutoDesactivacion as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc))
