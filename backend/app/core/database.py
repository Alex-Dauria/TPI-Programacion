from sqlmodel import Session, SQLModel, create_engine

from app.core.config import settings

# SQLite (desarrollo) necesita check_same_thread=False porque FastAPI atiende peticiones en varios hilos.
_connect_args = {"check_same_thread": False} if settings.DATABASE_URL.startswith("sqlite") else {}

engine = create_engine(settings.DATABASE_URL, connect_args=_connect_args, pool_pre_ping=True)


def import_models() -> None:
    """Registra las cinco tablas en SQLModel.metadata y deja resolubles las relaciones entre módulos."""
    import app.modules.categorias.models  # noqa: F401
    import app.modules.pedidos.models  # noqa: F401
    import app.modules.productos.models  # noqa: F401
    import app.modules.usuarios.models  # noqa: F401


def create_all_tables() -> None:
    import_models()
    SQLModel.metadata.create_all(engine)


def session_factory() -> Session:
    # expire_on_commit=False: los objetos siguen legibles después del commit del Unit of Work.
    return Session(engine, expire_on_commit=False)
