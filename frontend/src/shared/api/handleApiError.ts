import axios from 'axios'

interface ValidationIssue {
  loc: (string | number)[]
  msg: string
}

/** Convierte el `detail` de la API (texto o lista de errores de validación) en un mensaje para la pantalla. */
export function handleApiError(error: unknown): string {
  if (axios.isAxiosError<{ detail?: string | ValidationIssue[] }>(error)) {
    if (!error.response) return 'No se pudo conectar con el servidor. Verificá que el backend esté en ejecución.'
    const detail = error.response.data?.detail
    if (typeof detail === 'string') return detail
    if (Array.isArray(detail)) {
      return detail.map((issue) => `${String(issue.loc[issue.loc.length - 1])}: ${issue.msg}`).join(' · ')
    }
    return `Error ${error.response.status} al comunicarse con el servidor`
  }
  if (error instanceof Error) return error.message
  return 'Ocurrió un error inesperado'
}
