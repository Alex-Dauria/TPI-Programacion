import { useForm } from '@tanstack/react-form'

import { Button } from '../../../shared/ui/Button'
import { Input } from '../../../shared/ui/Input'
import { primerError } from '../../../shared/utils/formato'
import type { Producto, ProductoStockUpdate } from '../types/producto'

interface StockFormProps {
  producto: Producto
  enviando: boolean
  error: string | null
  onSubmit: (datos: ProductoStockUpdate) => void
  onCancelar: () => void
}

/** Cambio de stock y disponibilidad (PATCH /productos/{id}/stock). */
export function StockForm({ producto, enviando, error, onSubmit, onCancelar }: StockFormProps) {
  const form = useForm({
    defaultValues: { stock: producto.stock, disponible: producto.disponible },
    onSubmit: ({ value }) => onSubmit(value),
  })

  return (
    <form
      className="space-y-4"
      noValidate
      onSubmit={(e) => {
        e.preventDefault()
        void form.handleSubmit()
      }}
    >
      <form.Field
        name="stock"
        validators={{ onChange: ({ value }) => (Number.isInteger(value) && value >= 0 ? undefined : 'Entero ≥ 0') }}
      >
        {(field) => (
          <Input
            label="Stock"
            type="number"
            min={0}
            step={1}
            value={Number.isNaN(field.state.value) ? '' : field.state.value}
            onBlur={field.handleBlur}
            onChange={(e) => field.handleChange(e.target.valueAsNumber)}
            error={primerError(field.state.meta.errors)}
          />
        )}
      </form.Field>
      <form.Field name="disponible">
        {(field) => (
          <label className="flex items-center gap-2 text-sm text-slate-700">
            <input type="checkbox" checked={field.state.value} onChange={(e) => field.handleChange(e.target.checked)} />
            Disponible para la venta
          </label>
        )}
      </form.Field>

      {error && <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}

      <div className="flex justify-end gap-2">
        <Button variante="secondary" onClick={onCancelar}>
          Cancelar
        </Button>
        <form.Subscribe selector={(s) => s.canSubmit}>
          {(canSubmit) => (
            <Button type="submit" disabled={!canSubmit || enviando}>
              {enviando ? 'Guardando…' : 'Actualizar stock'}
            </Button>
          )}
        </form.Subscribe>
      </div>
    </form>
  )
}
