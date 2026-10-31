import { useForm } from '@tanstack/react-form'

import { Button } from '../../../shared/ui/Button'
import { Input, Textarea } from '../../../shared/ui/Input'
import { primerError } from '../../../shared/utils/formato'
import type { Categoria, CategoriaCreate } from '../types/categoria'

interface CategoriaFormProps {
  inicial?: Categoria
  enviando: boolean
  error: string | null
  onSubmit: (datos: CategoriaCreate) => void
  onCancelar: () => void
}

export function CategoriaForm({ inicial, enviando, error, onSubmit, onCancelar }: CategoriaFormProps) {
  const form = useForm({
    defaultValues: { nombre: inicial?.nombre ?? '', descripcion: inicial?.descripcion ?? '' },
    onSubmit: ({ value }) => onSubmit({ nombre: value.nombre.trim(), descripcion: value.descripcion.trim() || null }),
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
          onChange: ({ value }) => {
            const largo = value.trim().length
            return largo < 2 || largo > 100 ? 'El nombre debe tener entre 2 y 100 caracteres' : undefined
          },
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
