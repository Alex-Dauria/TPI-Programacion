import type { ColumnDef } from '@tanstack/react-table'

import { DataTable } from '../../../shared/components/DataTable'
import { BadgeEstado } from '../../../shared/ui/BadgeEstado'
import { Button } from '../../../shared/ui/Button'
import { formatFecha, formatPrecio } from '../../../shared/utils/formato'
import { TRANSICIONES } from '../types/pedido'
import type { EstadoPedido, Pedido } from '../types/pedido'

const ETIQUETA_ACCION: Record<EstadoPedido, string> = {
  PENDIENTE: 'Pendiente',
  EN_PREPARACION: 'Preparar',
  ENTREGADO: 'Entregar',
  CANCELADO: 'Cancelar',
}

interface PedidosTablaProps {
  pedidos: Pedido[]
  procesando: boolean
  onVer: (id: number) => void
  onCambiarEstado: (pedido: Pedido, estado: EstadoPedido) => void
}

/** Tabla de pedidos del panel: los botones solo ofrecen las transiciones válidas de la máquina de estados. */
export function PedidosTabla({ pedidos, procesando, onVer, onCambiarEstado }: PedidosTablaProps) {
  const columnas: ColumnDef<Pedido>[] = [
    { accessorKey: 'id', header: '#' },
    { accessorKey: 'usuario_id', header: 'Usuario' },
    { accessorKey: 'created_at', header: 'Fecha', cell: ({ row }) => formatFecha(row.original.created_at) },
    { accessorKey: 'forma_pago', header: 'Pago' },
    { accessorKey: 'total', header: 'Total', cell: ({ row }) => formatPrecio(row.original.total) },
    { accessorKey: 'estado', header: 'Estado', cell: ({ row }) => <BadgeEstado estado={row.original.estado} /> },
    {
      id: 'acciones',
      header: 'Acciones',
      enableSorting: false,
      cell: ({ row }) => (
        <div className="flex flex-wrap gap-1">
          <Button chico variante="ghost" onClick={() => onVer(row.original.id)}>
            Ver
          </Button>
          {TRANSICIONES[row.original.estado].map((destino) => (
            <Button
              key={destino}
              chico
              variante={destino === 'CANCELADO' ? 'danger' : 'primary'}
              disabled={procesando}
              onClick={() => onCambiarEstado(row.original, destino)}
            >
              {ETIQUETA_ACCION[destino]}
            </Button>
          ))}
        </div>
      ),
    },
  ]

  return <DataTable data={pedidos} columns={columnas} paginacionCliente={false} />
}
