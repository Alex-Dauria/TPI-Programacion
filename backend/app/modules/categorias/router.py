from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Response, status

from app.core.deps import AdminUser

from .schemas import CategoriaCreate, CategoriaRead, CategoriaUpdate
from .service import CategoriaNoEncontrada, CategoriaService, NombreDuplicado
from .unit_of_work import CategoriaUnitOfWork

router = APIRouter(prefix="/categorias", tags=["Categorías"])


def get_categoria_service() -> CategoriaService:
    return CategoriaService(CategoriaUnitOfWork())


ServiceDep = Annotated[CategoriaService, Depends(get_categoria_service)]


@router.get("", response_model=list[CategoriaRead], summary="Lista las categorías activas")
def listar_categorias(service: ServiceDep):
    return service.listar()


@router.get("/{id}", response_model=CategoriaRead, summary="Detalle de una categoría")
def obtener_categoria(id: int, service: ServiceDep):
    try:
        return service.obtener(id)
    except CategoriaNoEncontrada as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc))


@router.post("", response_model=CategoriaRead, status_code=status.HTTP_201_CREATED, summary="Crea una categoría")
def crear_categoria(data: CategoriaCreate, _: AdminUser, service: ServiceDep):
    try:
        return service.crear(data)
    except NombreDuplicado as exc:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=str(exc))


@router.put("/{id}", response_model=CategoriaRead, summary="Actualiza una categoría (parcial)")
def actualizar_categoria(id: int, data: CategoriaUpdate, _: AdminUser, service: ServiceDep):
    try:
        return service.actualizar(id, data)
    except CategoriaNoEncontrada as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc))
    except NombreDuplicado as exc:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=str(exc))


@router.delete("/{id}", status_code=status.HTTP_204_NO_CONTENT, summary="Baja lógica (activo = false)")
def eliminar_categoria(id: int, _: AdminUser, service: ServiceDep) -> Response:
    try:
        service.eliminar(id)
    except CategoriaNoEncontrada as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc))
    return Response(status_code=status.HTTP_204_NO_CONTENT)
