from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Query, Response, status

from app.core.deps import AdminUser
from app.modules.categorias.service import CategoriaNoEncontrada

from .schemas import ProductoCreate, ProductoRead, ProductosPaginados, ProductoStockUpdate, ProductoUpdate
from .service import ProductoNoEncontrado, ProductoService
from .unit_of_work import ProductoUnitOfWork

router = APIRouter(prefix="/productos", tags=["Productos"])


def get_producto_service() -> ProductoService:
    return ProductoService(ProductoUnitOfWork())


ServiceDep = Annotated[ProductoService, Depends(get_producto_service)]


def _not_found(exc: Exception) -> HTTPException:
    return HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc))


@router.get("", response_model=ProductosPaginados, summary="Lista paginada de productos activos")
def listar_productos(
    service: ServiceDep,
    skip: Annotated[int, Query(ge=0)] = 0,
    limit: Annotated[int, Query(ge=1, le=100)] = 20,
    search: Annotated[str | None, Query(description="Busca en el nombre, sin distinguir mayúsculas")] = None,
    categoria_id: int | None = None,
    disponible: bool | None = None,
):
    return service.listar(skip, limit, search, categoria_id, disponible)


@router.get("/{id}", response_model=ProductoRead, summary="Detalle de un producto con su categoría")
def obtener_producto(id: int, service: ServiceDep):
    try:
        return service.obtener(id)
    except ProductoNoEncontrado as exc:
        raise _not_found(exc)


@router.post("", response_model=ProductoRead, status_code=status.HTTP_201_CREATED, summary="Crea un producto")
def crear_producto(data: ProductoCreate, _: AdminUser, service: ServiceDep):
    try:
        return service.crear(data)
    except CategoriaNoEncontrada as exc:
        raise _not_found(exc)


@router.put("/{id}", response_model=ProductoRead, summary="Actualiza los campos enviados")
def actualizar_producto(id: int, data: ProductoUpdate, _: AdminUser, service: ServiceDep):
    try:
        return service.actualizar(id, data)
    except (ProductoNoEncontrado, CategoriaNoEncontrada) as exc:
        raise _not_found(exc)


@router.patch("/{id}/stock", response_model=ProductoRead, summary="Actualiza stock y disponible")
def actualizar_stock(id: int, data: ProductoStockUpdate, _: AdminUser, service: ServiceDep):
    try:
        return service.actualizar_stock(id, data)
    except ProductoNoEncontrado as exc:
        raise _not_found(exc)


@router.delete("/{id}", status_code=status.HTTP_204_NO_CONTENT, summary="Baja lógica (activo = false)")
def eliminar_producto(id: int, _: AdminUser, service: ServiceDep) -> Response:
    try:
        service.eliminar(id)
    except ProductoNoEncontrado as exc:
        raise _not_found(exc)
    return Response(status_code=status.HTTP_204_NO_CONTENT)
