import { useState } from 'react'
import type { ColumnDef } from '@tanstack/react-table'

import { handleApiError } from '../../../shared/api/handleApiError'
import { DataTable } from '../../../shared/components/DataTable'
import { EstadoError } from '../../../shared/components/EstadoError'
import { SkeletonLista } from '../../../shared/components/Skeleton'
import { Button } from '../../../shared/ui/Button'
import { Modal } from '../../../shared/ui/Modal'
import { formatPrecio } from '../../../shared/utils/formato'
import { useCategorias } from '../../categorias/hooks/useCategorias'
import { ProductoForm } from '../components/ProductoForm'
import { StockForm } from '../components/StockForm'
import { useActualizarProducto, useActualizarStock, useCrearProducto, useEliminarProducto, useProductos } from '../hooks/useProductos'
import type { Producto, ProductoCreate, ProductoStockUpdate } from '../types/producto'

type Dialogo = { tipo: 'crear' } | { tipo: 'editar'; producto: Producto } | { tipo: 'stock'; producto: Producto } | null

export default function AdminProductosPage() {
  // El panel pide limit=100 y pagina del lado del cliente con TanStack Table.
  const productos = useProductos({ skip: 0, limit: 100 })
  const categorias = useCategorias()
  const crear = useCrearProducto()
  const actualizar = useActualizarProducto()
  const actualizarStock = useActualizarStock()
  const eliminar = useEliminarProducto()
  const [dialogo, setDialogo] = useState<Dialogo>(null)

  const cerrar = () => {
    setDialogo(null)
    crear.reset()
    actualizar.reset()
    actualizarStock.reset()
  }

  const guardar = (datos: ProductoCreate) => {
    if (dialogo?.tipo === 'editar') {
      actualizar.mutate({ id: dialogo.producto.id, datos }, { onSuccess: cerrar })
    } else {
      crear.mutate(datos, { onSuccess: cerrar })
    }
  }

  const guardarStock = (datos: ProductoStockUpdate) => {
    if (dialogo?.tipo === 'stock') actualizarStock.mutate({ id: dialogo.producto.id, datos }, { onSuccess: cerrar })
  }

  const borrar = (producto: Producto) => {
    if (window.confirm(`¿Dar de baja «${producto.nombre}»?`)) {
      eliminar.mutate(producto.id, { onError: (e) => window.alert(handleApiError(e)) })
    }
  }

  const columnas: ColumnDef<Producto>[] = [
    { accessorKey: 'nombre', header: 'Nombre' },
    { id: 'categoria', accessorFn: (p) => p.categoria.nombre, header: 'Categoría' },
    { accessorKey: 'precio_base', header: 'Precio', cell: ({ row }) => formatPrecio(row.original.precio_base) },
    { accessorKey: 'stock', header: 'Stock' },
    {
      accessorKey: 'disponible',
      header: 'Disponible',
      cell: ({ row }) =>
        row.original.disponible ? <span className="text-green-700">Sí</span> : <span className="text-red-600">No</span>,
    },
    {
      id: 'acciones',
      header: 'Acciones',
      enableSorting: false,
      cell: ({ row }) => (
        <div className="flex flex-wrap gap-1">
          <Button chico variante="secondary" onClick={() => setDialogo({ tipo: 'editar', producto: row.original })}>
            Editar
          </Button>
          <Button chico variante="secondary" onClick={() => setDialogo({ tipo: 'stock', producto: row.original })}>
            Stock
          </Button>
          <Button chico variante="danger" onClick={() => borrar(row.original)}>
            Eliminar
          </Button>
        </div>
      ),
    },
  ]

  const errorForm = crear.error ?? actualizar.error
  return (
    <section className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900">Productos</h1>
        <Button onClick={() => setDialogo({ tipo: 'crear' })}>+ Nuevo producto</Button>
      </div>

      {productos.isPending ? (
        <SkeletonLista />
      ) : productos.isError ? (
        <EstadoError error={productos.error} onReintentar={() => void productos.refetch()} />
      ) : (
        <DataTable data={productos.data.items} columns={columnas} />
      )}

      <Modal
        abierto={dialogo?.tipo === 'crear' || dialogo?.tipo === 'editar'}
        titulo={dialogo?.tipo === 'editar' ? 'Editar producto' : 'Nuevo producto'}
        onCerrar={cerrar}
      >
        {(dialogo?.tipo === 'crear' || dialogo?.tipo === 'editar') && (
          <ProductoForm
            key={dialogo.tipo === 'editar' ? dialogo.producto.id : 'nuevo'}
            inicial={dialogo.tipo === 'editar' ? dialogo.producto : undefined}
            categorias={categorias.data ?? []}
            enviando={crear.isPending || actualizar.isPending}
            error={errorForm ? handleApiError(errorForm) : null}
            onSubmit={guardar}
            onCancelar={cerrar}
          />
        )}
      </Modal>

      <Modal abierto={dialogo?.tipo === 'stock'} titulo="Stock y disponibilidad" onCerrar={cerrar}>
        {dialogo?.tipo === 'stock' && (
          <>
            <p className="mb-4 text-sm text-slate-600">{dialogo.producto.nombre}</p>
            <StockForm
              producto={dialogo.producto}
              enviando={actualizarStock.isPending}
              error={actualizarStock.error ? handleApiError(actualizarStock.error) : null}
              onSubmit={guardarStock}
              onCancelar={cerrar}
            />
          </>
        )}
      </Modal>
    </section>
  )
}
