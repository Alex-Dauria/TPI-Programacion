import { handleApiError } from '../api/handleApiError'
import { Button } from '../ui/Button'

interface EstadoErrorProps {
  error: unknown
  onReintentar?: () => void
}

export function EstadoError({ error, onReintentar }: EstadoErrorProps) {
  return (
    <div className="rounded-2xl bg-red-50 px-6 py-8 text-center ring-1 ring-red-200" role="alert">
      <p className="font-medium text-red-700">{handleApiError(error)}</p>
      {onReintentar && (
        <Button variante="secondary" className="mt-4" onClick={onReintentar}>
          Reintentar
        </Button>
      )}
    </div>
  )
}
