from .models import Categoria
from .schemas import CategoriaCreate, CategoriaRead, CategoriaUpdate
from .unit_of_work import CategoriaUnitOfWork


class CategoriaNoEncontrada(Exception):
    pass


class NombreDuplicado(Exception):
    pass


class CategoriaService:
    def __init__(self, uow: CategoriaUnitOfWork) -> None:
        self.uow = uow

    def listar(self) -> list[CategoriaRead]:
        with self.uow as uow:
            return [CategoriaRead.model_validate(c) for c in uow.categorias.list_activas()]

    def obtener(self, categoria_id: int) -> CategoriaRead:
        with self.uow as uow:
            return CategoriaRead.model_validate(self._activa(uow, categoria_id))

    def crear(self, data: CategoriaCreate) -> CategoriaRead:
        with self.uow as uow:
            if uow.categorias.get_by_nombre(data.nombre) is not None:
                raise NombreDuplicado("Ya existe una categoría con ese nombre")
            categoria = Categoria.model_validate(data)
            categoria.nombre = data.nombre.strip()
            uow.categorias.add(categoria)
            return CategoriaRead.model_validate(categoria)

    def actualizar(self, categoria_id: int, data: CategoriaUpdate) -> CategoriaRead:
        with self.uow as uow:
            categoria = self._activa(uow, categoria_id)
            cambios = data.model_dump(exclude_unset=True)
            nombre = cambios.get("nombre")
            if nombre is None:
                cambios.pop("nombre", None)  # el nombre es obligatorio: un null no lo borra
            else:
                cambios["nombre"] = nombre.strip()
                existente = uow.categorias.get_by_nombre(nombre)
                # Choca solo con OTRA categoría: renombrar "Pizzas" a "PIZZAS" está permitido.
                if existente is not None and existente.id != categoria.id:
                    raise NombreDuplicado("Ya existe una categoría con ese nombre")
            categoria.sqlmodel_update(cambios)
            uow.session.add(categoria)
            return CategoriaRead.model_validate(categoria)

    def eliminar(self, categoria_id: int) -> None:
        """Baja lógica: activo = false."""
        with self.uow as uow:
            categoria = self._activa(uow, categoria_id)
            categoria.activo = False
            uow.session.add(categoria)

    @staticmethod
    def _activa(uow: CategoriaUnitOfWork, categoria_id: int) -> Categoria:
        """Una categoría dada de baja se trata como inexistente."""
        categoria = uow.categorias.get_by_id(categoria_id)
        if categoria is None or not categoria.activo:
            raise CategoriaNoEncontrada("Categoría no encontrada")
        return categoria
