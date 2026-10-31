from typing import TYPE_CHECKING

from sqlmodel import Field, Relationship, SQLModel

if TYPE_CHECKING:
    from app.modules.categorias.models import Categoria
    from app.modules.pedidos.models import DetallePedido


class Producto(SQLModel, table=True):
    """Se vende solo si activo, disponible y stock >= cantidad (RN-01).

    stock se descuenta al crear el pedido (RN-01) y se restituye al cancelar (RN-03). Baja lógica: activo = false.
    """

    id: int | None = Field(default=None, primary_key=True)
    categoria_id: int = Field(foreign_key="categoria.id", index=True)
    nombre: str = Field(max_length=150)
    descripcion: str | None = Field(default=None)
    precio_base: float
    imagen_url: str | None = Field(default=None)
    stock: int = Field(default=0)
    disponible: bool = Field(default=True)
    activo: bool = Field(default=True)

    categoria: "Categoria" = Relationship(back_populates="productos")
    detalles: list["DetallePedido"] = Relationship(back_populates="producto")
