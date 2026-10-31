from collections.abc import AsyncIterator
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.openapi.docs import get_redoc_html
from fastapi.responses import HTMLResponse

from app.core.config import settings
from app.core.database import create_all_tables
from app.modules.auth.router import router as auth_router
from app.modules.categorias.router import router as categorias_router
from app.modules.pedidos.router import router as pedidos_router
from app.modules.productos.router import router as productos_router
from app.modules.usuarios.router import router as usuarios_router

API_PREFIX = "/api/v1"


@asynccontextmanager
async def lifespan(_: FastAPI) -> AsyncIterator[None]:
    create_all_tables()
    yield


app = FastAPI(
    title="Food Store API",
    description=(
        "API REST de Food Store: catálogo, carrito y pedidos de comida.\n\n"
        "**Para probar en /docs:** ejecutar `POST /api/v1/auth/token` (admin / Admin1234!). "
        "La cookie HttpOnly `access_token` queda en el navegador y se envía sola en las demás peticiones."
    ),
    version="1.0.0",
    docs_url="/docs",
    redoc_url=None,  # se define abajo con una versión fija de ReDoc
    lifespan=lifespan,
)


@app.get("/redoc", include_in_schema=False)
def redoc() -> HTMLResponse:
    # FastAPI carga "redoc@next", que hoy apunta a una versión preliminar (3.0 rc) que no funciona como script
    # clásico y deja la página en blanco. Se fija la última versión estable.
    return get_redoc_html(
        openapi_url=app.openapi_url or "/openapi.json",
        title=f"{app.title} - ReDoc",
        redoc_js_url="https://cdn.jsdelivr.net/npm/redoc@2.5.4/bundles/redoc.standalone.js",
    )

# CORS con credenciales: el navegador solo envía la cookie si el origen está permitido explícitamente.
app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.FRONTEND_ORIGIN],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

for router in (auth_router, usuarios_router, categorias_router, productos_router, pedidos_router):
    app.include_router(router, prefix=API_PREFIX)


@app.get("/", include_in_schema=False)
def root() -> dict[str, str]:
    return {"message": "Food Store API", "docs": "/docs", "redoc": "/redoc"}
