# Food Store — Trabajo Práctico Integrador (Programación 4)

Aplicación web de pedidos de comida: los clientes se registran, recorren el catálogo, arman un carrito y confirman
pedidos con dirección y forma de pago; el administrador gestiona categorías, productos, stock, pedidos y usuarios.

- **Backend:** FastAPI + SQLModel + PostgreSQL. Arquitectura en capas con Unit of Work y JWT en cookie HttpOnly.
- **Frontend:** React + TypeScript (Vite, Tailwind), TanStack Query / Form / Table, Zustand y Axios.

| | |
|---|---|
| **Repositorio** | https://github.com/Alex-Dauria/TPI-Programacion |
| **Video de demostración** | https://LINK-AL-VIDEO *(completar)* |

---

## Requisitos

| Herramienta | Versión |
|---|---|
| Python | 3.11 a 3.13 (SQLModel no funciona con 3.14) |
| PostgreSQL | 15 o superior (para desarrollo se acepta SQLite, ver más abajo) |
| Node.js | 20.19 o superior |
| pnpm | 9 o superior (si no está instalado: `corepack enable` o `npm install -g pnpm`) |

---

## Backend

### 1. Instalación

```bash
cd backend
python -m venv .venv
# Windows:
.venv\Scripts\activate
# Linux / macOS:
source .venv/bin/activate

pip install -r requirements.txt
```

### 2. Base de datos y variables de entorno

Copiar `.env.example` a `.env` (dentro de `backend/`):

```bash
# Windows:
copy .env.example .env
# Linux / macOS:
cp .env.example .env
```

Con **PostgreSQL**, crear la base antes de seguir y ajustar usuario y contraseña en `DATABASE_URL`:

```sql
CREATE DATABASE foodstore_db;
```

Para probar **sin instalar PostgreSQL**, en el `.env` comentar la línea de PostgreSQL y descomentar la de SQLite:
`DATABASE_URL=sqlite:///./foodstore.db`.

| Variable | Descripción | Ejemplo |
|---|---|---|
| `DATABASE_URL` | Conexión a la base | `postgresql://postgres:postgres@localhost:5432/foodstore_db` (desarrollo: `sqlite:///./foodstore.db`) |
| `SECRET_KEY` | Firma del JWT (mínimo 32 caracteres) | `cambiar-esta-clave-de-al-menos-32-caracteres` |
| `ALGORITHM` | Algoritmo del JWT | `HS256` |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | Expiración del token y de la cookie | `30` |
| `FRONTEND_ORIGIN` | Origen permitido en CORS (con credenciales) | `http://localhost:5173` |

### 3. Datos iniciales (seed) y ejecución

```bash
python -m app.db.seed          # idempotente: se puede correr varias veces
uvicorn app.main:app --reload
```

- API: http://localhost:8000/api/v1
- Documentación: http://localhost:8000/docs (Swagger) y http://localhost:8000/redoc

> Para probar en `/docs`: ejecutar `POST /api/v1/auth/token` con *Try it out*. La cookie queda en el navegador y
> las demás peticiones la envían solas.

### Usuarios del seed

| Rol | Usuario | Contraseña |
|---|---|---|
| admin | `admin` | `Admin1234!` |
| user | `cliente` | `Cliente1234!` |

El seed también crea 4 categorías (Pizzas, Hamburguesas, Empanadas, Bebidas) y 12 productos con stock.

---

## Frontend

```bash
cd frontend
# Windows:
copy .env.example .env
# Linux / macOS:
cp .env.example .env

pnpm install
pnpm build      # verifica los tipos (tsc) y genera el build
pnpm dev        # http://localhost:5173
```

| Variable | Descripción | Ejemplo |
|---|---|---|
| `VITE_API_URL` | URL base de la API | `http://localhost:8000/api/v1` |

> Abrir el frontend en `http://localhost:5173` (no en `127.0.0.1`), para que coincida con `FRONTEND_ORIGIN`.

---

## Estructura del proyecto

```
backend/
  app/
    main.py                 FastAPI, CORS con credenciales, routers bajo /api/v1
    core/                   config, database, security, deps, unit_of_work, base_repository
    modules/
      auth/                 router, service, schemas (usa el modelo Usuario)
      usuarios/             models, schemas, repository, unit_of_work, service, router
      categorias/           ídem
      productos/            ídem
      pedidos/              ídem (RN-01 a RN-06, máquina de estados, resumen)
    db/seed.py              admin, categorías y productos (idempotente)
  requirements.txt          dependencias con versiones fijadas
frontend/
  src/
    shared/                 api (axiosInstance, handleApiError, queryClient), ui, components, layout
    features/               auth, categorias, productos, usuarios, pedidos (pages, components, hooks, api, types)
    store/                  authStore y cartStore (Zustand + persist)
    routes/                 AppRouter y ProtectedRoute
```

Cada módulo del backend sigue la cadena **Router → Service → Unit of Work → Repository → Model**. El commit ocurre
solo en el `__exit__` del Unit of Work; ningún Service ni Router llama a `session.commit()`.

## Funcionalidades

**Cliente (`user`):** registro e inicio de sesión; catálogo paginado en el servidor con búsqueda, filtro por categoría,
skeleton y estado vacío; carrito persistido en el navegador; checkout con dirección, forma de pago (efectivo o
transferencia) y notas; «Mis pedidos» con detalle y cancelación en estado `PENDIENTE`.

**Administrador (`admin`):** resumen con indicadores; ABM de categorías y productos (incluido stock y disponibilidad);
gestión de pedidos con filtro por estado y cambio de estado según la máquina de estados; activación y desactivación
de usuarios.

**Reglas de negocio:** el pedido se crea en una sola transacción (si algo falla no se guarda nada, tampoco el
descuento de stock); las líneas copian nombre y precio del producto y el total no cambia después; cancelar restituye
el stock en la misma transacción; transiciones `PENDIENTE → EN_PREPARACION | CANCELADO` y
`EN_PREPARACION → ENTREGADO | CANCELADO`.

## Imágenes de los productos

Las fotos de `frontend/public/productos/` se usan solo con fines académicos e ilustrativos para este trabajo
práctico; algunas muestran marcas registradas y sus derechos pertenecen a sus autores. En una aplicación real no se
usarían imágenes sin licencia: se usarían fotos propias del negocio, imágenes con licencia libre (por ejemplo CC0) o
material autorizado por las marcas, subidas a un servicio de almacenamiento de archivos (como Amazon S3 o Cloudinary),
y en `imagen_url` se guardaría la URL resultante.
