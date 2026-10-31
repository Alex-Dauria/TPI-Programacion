import { Link, useNavigate } from 'react-router-dom'

import { handleApiError } from '../../../shared/api/handleApiError'
import { EstadoVacio } from '../../../shared/components/EstadoVacio'
import { Card } from '../../../shared/ui/Card'
import { formatPrecio } from '../../../shared/utils/formato'
import { useCartStore } from '../../../store/cartStore'
import { CheckoutForm } from '../components/CheckoutForm'
import type { DatosCheckout } from '../components/CheckoutForm'
import { useCrearPedido } from '../hooks/usePedidos'

export default function CheckoutPage() {
  const items = useCartStore((s) => s.items)
  const total = useCartStore((s) => s.total)
  const vaciar = useCartStore((s) => s.vaciar)
  const crearPedido = useCrearPedido()
  const navigate = useNavigate()

  if (items.length === 0) {
    return (
      <EstadoVacio mensaje="No hay productos en el carrito para confirmar.">
        <Link to="/" className="font-medium text-orange-600 hover:underline">
          Ir al catálogo
        </Link>
      </EstadoVacio>
    )
  }

  const confirmar = (datos: DatosCheckout) => {
    crearPedido.mutate(
      { ...datos, items: items.map((i) => ({ producto_id: i.producto_id, cantidad: i.cantidad })) },
      {
        onSuccess: () => {
          vaciar()
          navigate('/mis-pedidos')
        },
      },
    )
  }

  return (
    <section className="grid gap-6 md:grid-cols-2">
      <Card>
        <h1 className="mb-4 text-2xl font-bold text-slate-900">Confirmar pedido</h1>
        <CheckoutForm
          enviando={crearPedido.isPending}
          error={crearPedido.error ? handleApiError(crearPedido.error) : null}
          onSubmit={confirmar}
        />
      </Card>
      <Card>
        <h2 className="mb-4 text-lg font-semibold text-slate-900">Resumen</h2>
        <ul className="divide-y divide-slate-100 text-sm">
          {items.map((item) => (
            <li key={item.producto_id} className="flex justify-between py-2">
              <span>
                {item.cantidad} × {item.nombre}
              </span>
              <span>{formatPrecio(item.precio_unitario * item.cantidad)}</span>
            </li>
          ))}
        </ul>
        <p className="mt-4 flex justify-between border-t pt-4 text-lg font-bold">
          <span>Total</span>
          <span>{formatPrecio(total())}</span>
        </p>
        <p className="mt-2 text-xs text-slate-500">El pago se coordina al recibir el pedido (efectivo) o por transferencia.</p>
      </Card>
    </section>
  )
}
