import { EstadoError } from '../../../shared/components/EstadoError'
import { SkeletonLista } from '../../../shared/components/Skeleton'
import { BadgeEstado } from '../../../shared/ui/BadgeEstado'
import { formatFecha, formatPrecio } from '../../../shared/utils/formato'
import { usePedido } from '../hooks/usePedidos'

/** Detalle de un pedido con sus líneas (GET /pedidos/{id}). */
export function PedidoDetalle({ pedidoId }: { pedidoId: number }) {
  const pedido = usePedido(pedidoId)

  if (pedido.isPending) return <SkeletonLista filas={4} />
  if (pedido.isError) return <EstadoError error={pedido.error} />

  const p = pedido.data
  return (
    <div className="space-y-4 text-sm">
      <dl className="grid grid-cols-2 gap-x-4 gap-y-2">
        <dt className="text-slate-500">Estado</dt>
        <dd>
          <BadgeEstado estado={p.estado} />
        </dd>
        <dt className="text-slate-500">Fecha</dt>
        <dd>{formatFecha(p.created_at)}</dd>
        <dt className="text-slate-500">Última actualización</dt>
        <dd>{formatFecha(p.updated_at)}</dd>
        <dt className="text-slate-500">Forma de pago</dt>
        <dd>{p.forma_pago === 'EFECTIVO' ? 'Efectivo' : 'Transferencia'}</dd>
        <dt className="text-slate-500">Dirección</dt>
        <dd>{p.direccion_entrega}</dd>
        {p.notas && (
          <>
            <dt className="text-slate-500">Notas</dt>
            <dd>{p.notas}</dd>
          </>
        )}
      </dl>

      <table className="w-full text-left">
        <thead className="border-b text-xs uppercase text-slate-500">
          <tr>
            <th className="py-2">Producto</th>
            <th className="py-2 text-right">Cant.</th>
            <th className="py-2 text-right">Precio</th>
            <th className="py-2 text-right">Subtotal</th>
          </tr>
        </thead>
        <tbody>
          {p.items.map((item) => (
            <tr key={item.producto_id} className="border-b border-slate-100">
              <td className="py-2">{item.nombre_producto}</td>
              <td className="py-2 text-right">{item.cantidad}</td>
              <td className="py-2 text-right">{formatPrecio(item.precio_unitario)}</td>
              <td className="py-2 text-right">{formatPrecio(item.subtotal)}</td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr>
            <td colSpan={3} className="py-2 text-right font-semibold">
              Total
            </td>
            <td className="py-2 text-right text-base font-bold">{formatPrecio(p.total)}</td>
          </tr>
        </tfoot>
      </table>
    </div>
  )
}
