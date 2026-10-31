/** Respuesta de los listados paginados de la API: { total, items }. */
export interface Paginado<T> {
  total: number
  items: T[]
}
