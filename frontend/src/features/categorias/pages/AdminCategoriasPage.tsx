import { useState } from 'react'
import type { ColumnDef } from '@tanstack/react-table'

import { handleApiError } from '../../../shared/api/handleApiError'
import { DataTable } from '../../../shared/components/DataTable'
import { EstadoError } from '../../../shared/components/EstadoError'
import { SkeletonLista } from '../../../shared/components/Skeleton'
import { Button } from '../../../shared/ui/Button'
import { Modal } from '../../../shared/ui/Modal'
import { CategoriaForm } from '../components/CategoriaForm'
import { useActualizarCategoria, useCategorias, useCrearCategoria, useEliminarCategoria } from '../hooks/useCategorias'
import type { Categoria, CategoriaCreate } from '../types/categoria'

type Dialogo = { tipo: 'crear' } | { tipo: 'editar'; categoria: Categoria } | null

export default function AdminCategoriasPage() {
  const categorias = useCategorias()
  const crear = useCrearCategoria()
  const actualizar = useActualizarCategoria()
  const eliminar = useEliminarCategoria()
  const [dialogo, setDialogo] = useState<Dialogo>(null)

  const cerrar = () => {
    setDialogo(null)
    crear.reset()
    actualizar.reset()
  }

  const guardar = (datos: CategoriaCreate) => {
    if (dialogo?.tipo === 'editar') {
      actualizar.mutate({ id: dialogo.categoria.id, datos }, { onSuccess: cerrar })
    } else {
      crear.mutate(datos, { onSuccess: cerrar })
    }
  }

  const borrar = (categoria: Categoria) => {
    if (window.confirm(`¿Dar de baja la categoría «${categoria.nombre}»? Sus productos no se ocultan automáticamente.`)) {
      eliminar.mutate(categoria.id, { onError: (e) => window.alert(handleApiError(e)) })
    }
  }

  const columnas: ColumnDef<Categoria>[] = [
    { accessorKey: 'id', header: 'ID' },
    { accessorKey: 'nombre', header: 'Nombre' },
    { accessorKey: 'descripcion', header: 'Descripción', cell: ({ row }) => row.original.descripcion ?? '—' },
    {
      id: 'acciones',
      header: 'Acciones',
      enableSorting: false,
      cell: ({ row }) => (
        <div className="flex gap-1">
          <Button chico variante="secondary" onClick={() => setDialogo({ tipo: 'editar', categoria: row.original })}>
            Editar
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
        <h1 className="text-2xl font-bold text-slate-900">Categorías</h1>
        <Button onClick={() => setDialogo({ tipo: 'crear' })}>+ Nueva categoría</Button>
      </div>

      {categorias.isPending ? (
        <SkeletonLista />
      ) : categorias.isError ? (
        <EstadoError error={categorias.error} onReintentar={() => void categorias.refetch()} />
      ) : (
        <DataTable data={categorias.data} columns={columnas} />
      )}

      <Modal abierto={dialogo !== null} titulo={dialogo?.tipo === 'editar' ? 'Editar categoría' : 'Nueva categoría'} onCerrar={cerrar}>
        {dialogo && (
          <CategoriaForm
            key={dialogo.tipo === 'editar' ? dialogo.categoria.id : 'nueva'}
            inicial={dialogo.tipo === 'editar' ? dialogo.categoria : undefined}
            enviando={crear.isPending || actualizar.isPending}
            error={errorForm ? handleApiError(errorForm) : null}
            onSubmit={guardar}
            onCancelar={cerrar}
          />
        )}
      </Modal>
    </section>
  )
}
