import { useState } from 'react'
import { Link } from 'react-router-dom'

import { handleApiError } from '../../../shared/api/handleApiError'
import { EstadoError } from '../../../shared/components/EstadoError'
import { EstadoVacio } from '../../../shared/components/EstadoVacio'
import { Paginacion } from '../../../shared/components/Paginacion'
import { SkeletonLista } from '../../../shared/components/Skeleton'
import { BadgeEstado } from '../../../shared/ui/BadgeEstado'
import { Button } from '../../../shared/ui/Button'
import { Card } from '../../../shared/ui/Card'
import { Modal } from '../../../shared/ui/Modal'
import { formatFecha, formatPrecio } from '../../../shared/utils/formato'
import { useAuthStore } from '../../../store/authStore'
import { PedidoDetalle } from '../components/PedidoDetalle'
import { useCancelarPedido, usePedidos } from '../hooks/usePedidos'
import type { Pedido } from '../types/pedido'

const LIMIT = 10

export default function MisPedidosPage() {
  const usuario = useAuthStore((s) => s.usuario)
  const [pagina, setPagina] = useState(0)
  const [detalleId, setDetalleId] = useState<number | null>(null)
  const pedidos = usePedidos({ skip: pagina * LIMIT, limit: LIMIT })
  const cancelar = useCancelarPedido()

  const confirmarCancelacion = (pedido: Pedido) => {
    if (window.confirm(`¿Cancelar el pedido #${pedido.id}? El stock se restituye.`)) {
      cancelar.mutate(pedido.id)
    }
  }

  return (
    <section className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-900">Mis pedidos</h1>
      {cancelar.error && <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{handleApiError(cancelar.error)}</p>}

      {pedidos.isPending ? (
        <SkeletonLista />
      ) : pedidos.isError ? (
        <EstadoError error={pedidos.error} onReintentar={() => void pedidos.refetch()} />
      ) : pedidos.data.items.length === 0 ? (
        <EstadoVacio mensaje="Todavía no hiciste ningún pedido.">
          <Link to="/" className="font-medium text-green-700 hover:underline">
            Ir al catálogo
          </Link>
        </EstadoVacio>
      ) : (
        <>
          <div className="space-y-3">
            {pedidos.data.items.map((pedido) => (
              <Card key={pedido.id} className="flex flex-wrap items-center gap-4">
                <div className="flex-1">
                  <p className="font-semibold text-slate-900">
                    Pedido #{pedido.id} <BadgeEstado estado={pedido.estado} />
                  </p>
                  <p className="text-sm text-slate-500">
                    {formatFecha(pedido.created_at)} · {pedido.items.length} producto(s) · {pedido.direccion_entrega}
                  </p>
                </div>
                <p className="text-lg font-bold">{formatPrecio(pedido.total)}</p>
                <div className="flex gap-2">
                  <Button chico variante="secondary" onClick={() => setDetalleId(pedido.id)}>
                    Ver detalle
                  </Button>
                  {/* RN-04: el dueño cancela solo en PENDIENTE. */}
                  {pedido.estado === 'PENDIENTE' && pedido.usuario_id === usuario?.id && (
                    <Button chico variante="danger" disabled={cancelar.isPending} onClick={() => confirmarCancelacion(pedido)}>
                      Cancelar
                    </Button>
                  )}
                </div>
              </Card>
            ))}
          </div>
          <Paginacion pagina={pagina} totalPaginas={Math.ceil(pedidos.data.total / LIMIT)} onCambiar={setPagina} />
        </>
      )}

      <Modal abierto={detalleId !== null} titulo={`Pedido #${detalleId ?? ''}`} onCerrar={() => setDetalleId(null)}>
        {detalleId !== null && <PedidoDetalle pedidoId={detalleId} />}
      </Modal>
    </section>
  )
}
