import { Link } from 'react-router-dom'

import { EstadoVacio } from '../../../shared/components/EstadoVacio'
import { Button } from '../../../shared/ui/Button'
import { Card } from '../../../shared/ui/Card'
import { formatPrecio } from '../../../shared/utils/formato'
import { useCartStore } from '../../../store/cartStore'

export default function CarritoPage() {
  const items = useCartStore((s) => s.items)
  const total = useCartStore((s) => s.total)
  const quitar = useCartStore((s) => s.quitar)
  const cambiarCantidad = useCartStore((s) => s.cambiarCantidad)
  const vaciar = useCartStore((s) => s.vaciar)

  if (items.length === 0) {
    return (
      <EstadoVacio mensaje="Tu carrito está vacío.">
        <Link to="/" className="font-medium text-orange-600 hover:underline">
          Ir al catálogo
        </Link>
      </EstadoVacio>
    )
  }

  return (
    <section className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-900">Carrito</h1>
      <Card className="divide-y divide-slate-100 p-0">
        {items.map((item) => (
          <div key={item.producto_id} className="flex flex-wrap items-center gap-4 px-5 py-4">
            <div className="min-w-40 flex-1">
              <p className="font-medium text-slate-900">{item.nombre}</p>
              <p className="text-sm text-slate-500">{formatPrecio(item.precio_unitario)} c/u</p>
            </div>
            <div className="flex items-center gap-2">
              <Button chico variante="secondary" onClick={() => cambiarCantidad(item.producto_id, item.cantidad - 1)} aria-label="Restar uno">
                −
              </Button>
              <input
                type="number"
                min={1}
                value={item.cantidad}
                onChange={(e) => {
                  const cantidad = e.target.valueAsNumber
                  if (Number.isInteger(cantidad) && cantidad >= 1) cambiarCantidad(item.producto_id, cantidad)
                }}
                aria-label={`Cantidad de ${item.nombre}`}
                className="w-16 rounded-lg border border-slate-300 px-2 py-1 text-center text-sm"
              />
              <Button chico variante="secondary" onClick={() => cambiarCantidad(item.producto_id, item.cantidad + 1)} aria-label="Sumar uno">
                +
              </Button>
            </div>
            <p className="w-28 text-right font-semibold">{formatPrecio(item.precio_unitario * item.cantidad)}</p>
            <Button chico variante="ghost" onClick={() => quitar(item.producto_id)}>
              Quitar
            </Button>
          </div>
        ))}
      </Card>

      <div className="flex flex-wrap items-center justify-between gap-4">
        <Button variante="secondary" onClick={vaciar}>
          Vaciar carrito
        </Button>
        <div className="flex items-center gap-4">
          <p className="text-lg">
            Total: <span className="font-bold">{formatPrecio(total())}</span>
          </p>
          <Link
            to="/checkout"
            className="rounded-lg bg-orange-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-orange-700"
          >
            Continuar con el pedido
          </Link>
        </div>
      </div>
    </section>
  )
}
