import { useForm } from '@tanstack/react-form'

import { Button } from '../../../shared/ui/Button'
import { Input, Select, Textarea } from '../../../shared/ui/Input'
import { primerError } from '../../../shared/utils/formato'
import type { Categoria } from '../../categorias/types/categoria'
import type { Producto, ProductoCreate } from '../types/producto'

interface ProductoFormProps {
  inicial?: Producto
  categorias: Categoria[]
  enviando: boolean
  error: string | null
  onSubmit: (datos: ProductoCreate) => void
  onCancelar: () => void
}

export function ProductoForm({ inicial, categorias, enviando, error, onSubmit, onCancelar }: ProductoFormProps) {
  const form = useForm({
    defaultValues: {
      nombre: inicial?.nombre ?? '',
      descripcion: inicial?.descripcion ?? '',
      precio_base: inicial?.precio_base ?? 0,
      imagen_url: inicial?.imagen_url ?? '',
      stock: inicial?.stock ?? 0,
      disponible: inicial?.disponible ?? true,
      categoria_id: inicial?.categoria_id ?? 0,
    },
    onSubmit: ({ value }) =>
      onSubmit({
        ...value,
        nombre: value.nombre.trim(),
        descripcion: value.descripcion.trim() || null,
        imagen_url: value.imagen_url.trim() || null,
      }),
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
        name="nombre"
        validators={{
          onChange: ({ value }) => (!value.trim() ? 'El nombre es obligatorio' : value.length > 150 ? 'Máximo 150 caracteres' : undefined),
        }}
      >
        {(field) => (
          <Input
            label="Nombre"
            value={field.state.value}
            onBlur={field.handleBlur}
            onChange={(e) => field.handleChange(e.target.value)}
            error={primerError(field.state.meta.errors)}
          />
        )}
      </form.Field>

      <form.Field name="descripcion">
        {(field) => (
          <Textarea label="Descripción" value={field.state.value} onChange={(e) => field.handleChange(e.target.value)} />
        )}
      </form.Field>

      <form.Field
        name="categoria_id"
        validators={{ onChange: ({ value }) => (value > 0 ? undefined : 'Elegí una categoría') }}
      >
        {(field) => (
          <Select
            label="Categoría"
            value={field.state.value}
            onBlur={field.handleBlur}
            onChange={(e) => field.handleChange(Number(e.target.value))}
            error={primerError(field.state.meta.errors)}
          >
            <option value={0}>Seleccionar…</option>
            {categorias.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nombre}
              </option>
            ))}
          </Select>
        )}
      </form.Field>

      <div className="grid grid-cols-2 gap-4">
        <form.Field
          name="precio_base"
          validators={{ onChange: ({ value }) => (Number.isNaN(value) || value < 0 ? 'Debe ser ≥ 0' : undefined) }}
        >
          {(field) => (
            <Input
              label="Precio"
              type="number"
              min={0}
              step="0.01"
              value={Number.isNaN(field.state.value) ? '' : field.state.value}
              onBlur={field.handleBlur}
              onChange={(e) => field.handleChange(e.target.valueAsNumber)}
              error={primerError(field.state.meta.errors)}
            />
          )}
        </form.Field>
        <form.Field
          name="stock"
          validators={{
            onChange: ({ value }) => (Number.isInteger(value) && value >= 0 ? undefined : 'Entero ≥ 0'),
          }}
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
      </div>

      <form.Field name="imagen_url">
        {(field) => (
          <Input
            label="URL de la imagen"
            type="url"
            placeholder="https://…"
            value={field.state.value}
            onChange={(e) => field.handleChange(e.target.value)}
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
              {enviando ? 'Guardando…' : 'Guardar'}
            </Button>
          )}
        </form.Subscribe>
      </div>
    </form>
  )
}
