import type { Paginado } from '../../../shared/types/paginado'
import type { Categoria } from '../../categorias/types/categoria'

export interface Producto {
  id: number
  nombre: string
  descripcion: string | null
  precio_base: number
  imagen_url: string | null
  stock: number
  disponible: boolean
  activo: boolean
  categoria_id: number
  categoria: Categoria
}

export interface ProductoCreate {
  nombre: string
  descripcion: string | null
  precio_base: number
  imagen_url: string | null
  stock: number
  disponible: boolean
  categoria_id: number
}

export type ProductoUpdate = Partial<ProductoCreate>

export interface ProductoStockUpdate {
  stock: number
  disponible: boolean
}

export type ProductosPaginados = Paginado<Producto>

export interface ProductoFiltros {
  skip: number
  limit: number
  search?: string
  categoria_id?: number
  disponible?: boolean
}
