const moneda = new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' })
const fecha = new Intl.DateTimeFormat('es-AR', { dateStyle: 'short', timeStyle: 'short' })

export function formatPrecio(valor: number): string {
  return moneda.format(valor)
}

export function formatFecha(iso: string): string {
  return fecha.format(new Date(iso))
}

/** Primer mensaje de error de un campo de TanStack Form. */
export function primerError(errores: readonly unknown[]): string | undefined {
  return errores.find((e): e is string => typeof e === 'string' && e.length > 0)
}
