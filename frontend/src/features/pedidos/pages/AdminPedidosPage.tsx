import { useState } from 'react'

import { handleApiError } from '../../../shared/api/handleApiError'
import { EstadoError } from '../../../shared/components/EstadoError'
import { EstadoVacio } from '../../../shared/components/EstadoVacio'
import { Paginacion } from '../../../shared/components/Paginacion'
import { SkeletonLista } from '../../../shared/components/Skeleton'
import { Modal } from '../../../shared/ui/Modal'
import { PedidoDetalle } from '../components/PedidoDetalle'
import { PedidosTabla } from '../components/PedidosTabla'
import { useCambiarEstadoPedido, usePedidos } from '../hooks/usePedidos'
import { ESTADOS } from '../types/pedido'
import type { EstadoPedido, Pedido } from '../types/pedido'

const LIMIT = 10

export default function AdminPedidosPage() {
  const [pagina, setPagina] = useState(0)
  const [estado, setEstado] = useState<EstadoPedido | undefined>(undefined)
  const [detalleId, setDetalleId] = useState<number | null>(null)
  const pedidos = usePedidos({ skip: pagina * LIMIT, limit: LIMIT, estado })
  const cambiarEstado = useCambiarEstadoPedido()

  const onCambiarEstado = (pedido: Pedido, destino: EstadoPedido) => {
    if (destino === 'CANCELADO' && !window.confirm(`¿Cancelar el pedido #${pedido.id}? El stock se restituye.`)) return
    cambiarEstado.mutate({ id: pedido.id, estado: destino })
  }

  return (
    <section className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold text-slate-900">Pedidos</h1>
        <select
          value={estado ?? ''}
          onChange={(e) => {
            const valor = ESTADOS.find((s) => s === e.target.value)
            setEstado(valor)
            setPagina(0)
          }}
          aria-label="Filtrar por estado"
          className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
        >
          <option value="">Todos los estados</option>
          {ESTADOS.map((s) => (
            <option key={s} value={s}>
              {s.replace('_', ' ')}
            </option>
          ))}
        </select>
      </div>

      {cambiarEstado.error && (
        <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{handleApiError(cambiarEstado.error)}</p>
      )}

      {pedidos.isPending ? (
        <SkeletonLista />
      ) : pedidos.isError ? (
        <EstadoError error={pedidos.error} onReintentar={() => void pedidos.refetch()} />
      ) : pedidos.data.items.length === 0 ? (
        <EstadoVacio mensaje="No hay pedidos para mostrar." />
      ) : (
        <>
          <PedidosTabla
            pedidos={pedidos.data.items}
            procesando={cambiarEstado.isPending}
            onVer={setDetalleId}
            onCambiarEstado={onCambiarEstado}
          />
          <Paginacion pagina={pagina} totalPaginas={Math.ceil(pedidos.data.total / LIMIT)} onCambiar={setPagina} />
        </>
      )}

      <Modal abierto={detalleId !== null} titulo={`Pedido #${detalleId ?? ''}`} onCerrar={() => setDetalleId(null)}>
        {detalleId !== null && <PedidoDetalle pedidoId={detalleId} />}
      </Modal>
    </section>
  )
}
