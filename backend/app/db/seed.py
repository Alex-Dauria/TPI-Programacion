"""Carga inicial idempotente: usuario admin, un cliente de prueba, categorías y productos.

Ejecutar desde la carpeta backend/:  python -m app.db.seed
Se puede correr varias veces: solo crea lo que todavía no existe.
"""

from sqlmodel import Session, select

from app.core.database import create_all_tables, engine
from app.core.security import hash_password
from app.modules.categorias.models import Categoria
from app.modules.productos.models import Producto
from app.modules.usuarios.models import Usuario

USUARIOS = [
    {"username": "admin", "full_name": "Administrador", "email": "admin@foodstore.com", "password": "Admin1234!", "role": "admin"},
    {"username": "cliente", "full_name": "Cliente de Prueba", "email": "cliente@foodstore.com", "password": "Cliente1234!", "role": "user"},
]

CATEGORIAS = [
    {"nombre": "Pizzas", "descripcion": "Pizzas a la piedra"},
    {"nombre": "Hamburguesas", "descripcion": "Hamburguesas caseras con papas"},
    {"nombre": "Empanadas", "descripcion": "Empanadas al horno"},
    {"nombre": "Bebidas", "descripcion": "Gaseosas, aguas y jugos"},
]


# Las imágenes viven en frontend/public/productos/: el frontend las sirve en /productos/<archivo>.webp.
PRODUCTOS = [
    ("Pizzas", "Pizza Muzzarella", "Salsa de tomate, muzzarella y aceitunas", 9500, 20, "pizza-muzzarella"),
    ("Pizzas", "Pizza Napolitana", "Muzzarella, tomate en rodajas y ajo", 10500, 15, "pizza-napolitana"),
    ("Pizzas", "Pizza Fugazzeta", "Cebolla y abundante muzzarella", 10000, 12, "pizza-fugazzeta"),
    ("Hamburguesas", "Hamburguesa Clásica", "Carne, lechuga, tomate y queso", 8500, 25, "hamburguesa-clasica"),
    ("Hamburguesas", "Hamburguesa Doble Cheddar", "Doble carne, doble cheddar y panceta", 11000, 18, "hamburguesa-doble-cheddar"),
    ("Hamburguesas", "Hamburguesa Veggie", "Medallón de lentejas y vegetales", 9000, 10, "hamburguesa-veggie"),
    ("Empanadas", "Empanada de Carne", "Carne cortada a cuchillo", 1500, 60, "empanada-carne"),
    ("Empanadas", "Empanada de Jamón y Queso", "Jamón cocido y muzzarella", 1400, 50, "empanada-jamon-queso"),
    ("Empanadas", "Empanada de Humita", "Choclo cremoso", 1400, 40, "empanada-humita"),
    ("Bebidas", "Gaseosa 1.5 L", "Línea cola, naranja y lima limón", 3500, 30, "gaseosa"),
    ("Bebidas", "Agua Mineral 500 ml", "Sin gas", 1500, 40, "agua-mineral"),
    ("Bebidas", "Jugo de Naranja", "Exprimido, 500 ml", 2800, 20, "jugo-naranja"),
]


def seed() -> None:
    create_all_tables()
    with Session(engine) as session:
        for datos in USUARIOS:
            existe = session.exec(select(Usuario).where(Usuario.username == datos["username"])).first()
            if existe is None:
                session.add(
                    Usuario(
                        username=datos["username"],
                        full_name=datos["full_name"],
                        email=datos["email"],
                        hashed_password=hash_password(datos["password"]),
                        role=datos["role"],
                    )
                )
                print(f"Usuario creado: {datos['username']}")

        categorias: dict[str, Categoria] = {}
        for datos in CATEGORIAS:
            categoria = session.exec(select(Categoria).where(Categoria.nombre == datos["nombre"])).first()
            if categoria is None:
                categoria = Categoria(**datos)
                session.add(categoria)
                session.flush()
                print(f"Categoría creada: {categoria.nombre}")
            categorias[categoria.nombre] = categoria

        for categoria_nombre, nombre, descripcion, precio, stock, imagen in PRODUCTOS:
            existe = session.exec(select(Producto).where(Producto.nombre == nombre)).first()
            if existe is None:
                session.add(
                    Producto(
                        categoria_id=categorias[categoria_nombre].id,
                        nombre=nombre,
                        descripcion=descripcion,
                        precio_base=precio,
                        imagen_url=f"/productos/{imagen}.webp",
                        stock=stock,
                    )
                )
                print(f"Producto creado: {nombre}")

        session.commit()
    print("Seed completado.")


if __name__ == "__main__":
    seed()
