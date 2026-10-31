import type { ColumnDef } from '@tanstack/react-table'

import { handleApiError } from '../../../shared/api/handleApiError'
import { DataTable } from '../../../shared/components/DataTable'
import { EstadoError } from '../../../shared/components/EstadoError'
import { SkeletonLista } from '../../../shared/components/Skeleton'
import { Button } from '../../../shared/ui/Button'
import { useAuthStore } from '../../../store/authStore'
import { useActivarUsuario, useDesactivarUsuario, useUsuarios } from '../hooks/useUsuarios'
import type { Usuario } from '../types/usuario'

export default function AdminUsuariosPage() {
  const sesion = useAuthStore((s) => s.usuario)
  const usuarios = useUsuarios()
  const activar = useActivarUsuario()
  const desactivar = useDesactivarUsuario()
  const error = activar.error ?? desactivar.error

  const columnas: ColumnDef<Usuario>[] = [
    { accessorKey: 'username', header: 'Username' },
    { accessorKey: 'full_name', header: 'Nombre' },
    { accessorKey: 'email', header: 'Email' },
    {
      accessorKey: 'role',
      header: 'Rol',
      cell: ({ row }) => <span className="text-xs font-semibold uppercase text-slate-500">{row.original.role}</span>,
    },
    {
      accessorKey: 'disabled',
      header: 'Estado',
      cell: ({ row }) =>
        row.original.disabled ? (
          <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs font-semibold text-red-700">Desactivado</span>
        ) : (
          <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-semibold text-green-700">Activo</span>
        ),
    },
    {
      id: 'acciones',
      header: 'Acciones',
      enableSorting: false,
      cell: ({ row }) => {
        const usuario = row.original
        if (usuario.disabled) {
          return (
            <Button chico variante="secondary" disabled={activar.isPending} onClick={() => activar.mutate(usuario.id)}>
              Activar
            </Button>
          )
        }
        // El botón Desactivar no se muestra en la fila del usuario de la sesión.
        if (usuario.id === sesion?.id) return <span className="text-xs text-slate-400">(vos)</span>
        return (
          <Button chico variante="danger" disabled={desactivar.isPending} onClick={() => desactivar.mutate(usuario.id)}>
            Desactivar
          </Button>
        )
      },
    },
  ]

  return (
    <section className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-900">Usuarios</h1>
      {error && <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{handleApiError(error)}</p>}
      {usuarios.isPending ? (
        <SkeletonLista />
      ) : usuarios.isError ? (
        <EstadoError error={usuarios.error} onReintentar={() => void usuarios.refetch()} />
      ) : (
        <DataTable data={usuarios.data} columns={columnas} />
      )}
    </section>
  )
}
