import { useState } from 'react'

import { Button } from '../../../shared/ui/Button'
import { formatPrecio } from '../../../shared/utils/formato'
import { useCartStore } from '../../../store/cartStore'
import type { Producto } from '../types/producto'

export function ProductoCard({ producto }: { producto: Producto }) {
  const agregar = useCartStore((s) => s.agregar)
  const enCarrito = useCartStore((s) => s.items.find((i) => i.producto_id === producto.id)?.cantidad ?? 0)
  const [imagenRota, setImagenRota] = useState(false)

  const sinStock = producto.stock === 0
  const vendible = producto.disponible && !sinStock
  const alcanzoStock = enCarrito >= producto.stock

  return (
    <article className="flex flex-col overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-200">
      {producto.imagen_url && !imagenRota ? (
        <img
          src={producto.imagen_url}
          alt={producto.nombre}
          loading="lazy"
          onError={() => setImagenRota(true)}
          className="h-40 w-full object-cover"
        />
      ) : (
        <div className="flex h-40 items-center justify-center bg-orange-50 text-5xl" aria-hidden="true">
          🍽️
        </div>
      )}
      <div className="flex flex-1 flex-col p-4">
        <p className="text-xs font-medium uppercase tracking-wide text-orange-600">{producto.categoria.nombre}</p>
        <h3 className="mt-1 font-semibold text-slate-900">{producto.nombre}</h3>
        {producto.descripcion && <p className="mt-1 line-clamp-2 text-sm text-slate-500">{producto.descripcion}</p>}
        <div className="mt-auto flex items-end justify-between pt-4">
          <div>
            <p className="text-lg font-bold text-slate-900">{formatPrecio(producto.precio_base)}</p>
            <p className={`text-xs ${vendible ? 'text-slate-500' : 'text-red-600'}`}>
              {!producto.disponible ? 'No disponible' : sinStock ? 'Sin stock' : `Stock: ${producto.stock}`}
            </p>
          </div>
          <Button
            chico
            disabled={!vendible || alcanzoStock}
            onClick={() => agregar({ producto_id: producto.id, nombre: producto.nombre, precio_unitario: producto.precio_base })}
            title={alcanzoStock && vendible ? 'Ya agregaste todo el stock disponible' : undefined}
          >
            Agregar al carrito{enCarrito > 0 && ` (${enCarrito})`}
          </Button>
        </div>
      </div>
    </article>
  )
}
