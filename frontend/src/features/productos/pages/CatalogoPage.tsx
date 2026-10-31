import { useState } from 'react'
import type { FormEvent } from 'react'

import { EstadoError } from '../../../shared/components/EstadoError'
import { EstadoVacio } from '../../../shared/components/EstadoVacio'
import { Paginacion } from '../../../shared/components/Paginacion'
import { Skeleton } from '../../../shared/components/Skeleton'
import { Button } from '../../../shared/ui/Button'
import { useCategorias } from '../../categorias/hooks/useCategorias'
import { ProductoCard } from '../components/ProductoCard'
import { useProductos } from '../hooks/useProductos'

const LIMIT = 8

export default function CatalogoPage() {
  const [pagina, setPagina] = useState(0)
  const [textoBusqueda, setTextoBusqueda] = useState('')
  const [search, setSearch] = useState('')
  const [categoriaId, setCategoriaId] = useState<number | undefined>(undefined)

  const categorias = useCategorias()
  // Paginación en el servidor: skip = página × limit.
  const productos = useProductos({
    skip: pagina * LIMIT,
    limit: LIMIT,
    search: search || undefined,
    categoria_id: categoriaId,
  })

  const totalPaginas = productos.data ? Math.ceil(productos.data.total / LIMIT) : 0

  const buscar = (evento: FormEvent) => {
    evento.preventDefault()
    setSearch(textoBusqueda.trim())
    setPagina(0)
  }

  const limpiarFiltros = () => {
    setTextoBusqueda('')
    setSearch('')
    setCategoriaId(undefined)
    setPagina(0)
  }

  return (
    <section className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Catálogo</h1>
        <p className="text-slate-500">Elegí tus comidas favoritas y armá tu pedido.</p>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <form onSubmit={buscar} className="flex flex-1 gap-2" role="search">
          <input
            type="search"
            value={textoBusqueda}
            onChange={(e) => setTextoBusqueda(e.target.value)}
            placeholder="Buscar por nombre…"
            aria-label="Buscar productos por nombre"
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
          />
          <Button type="submit">Buscar</Button>
        </form>
        <select
          value={categoriaId ?? ''}
          onChange={(e) => {
            setCategoriaId(e.target.value ? Number(e.target.value) : undefined)
            setPagina(0)
          }}
          aria-label="Filtrar por categoría"
          className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
        >
          <option value="">Todas las categorías</option>
          {categorias.data?.map((c) => (
            <option key={c.id} value={c.id}>
              {c.nombre}
            </option>
          ))}
        </select>
      </div>

      {productos.isPending ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4" aria-busy="true" aria-label="Cargando productos">
          {Array.from({ length: LIMIT }, (_, i) => (
            <Skeleton key={i} className="h-72" />
          ))}
        </div>
      ) : productos.isError ? (
        <EstadoError error={productos.error} onReintentar={() => void productos.refetch()} />
      ) : productos.data.items.length === 0 ? (
        <EstadoVacio mensaje="No encontramos productos con esos filtros.">
          {(search || categoriaId !== undefined) && (
            <Button variante="secondary" onClick={limpiarFiltros}>
              Limpiar filtros
            </Button>
          )}
        </EstadoVacio>
      ) : (
        <>
          <div className={`grid gap-4 sm:grid-cols-2 lg:grid-cols-4 ${productos.isPlaceholderData ? 'opacity-60' : ''}`}>
            {productos.data.items.map((producto) => (
              <ProductoCard key={producto.id} producto={producto} />
            ))}
          </div>
          <Paginacion pagina={pagina} totalPaginas={totalPaginas} onCambiar={setPagina} />
        </>
      )}
    </section>
  )
}
