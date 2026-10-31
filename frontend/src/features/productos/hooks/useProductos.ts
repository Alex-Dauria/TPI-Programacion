import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { createProducto, deleteProducto, getProductos, updateProducto, updateStock } from '../api/productos'
import type { ProductoFiltros, ProductoStockUpdate, ProductoUpdate } from '../types/producto'

const PRODUCTOS_KEY = ['productos'] as const

export function useProductos(filtros: ProductoFiltros) {
  return useQuery({
    queryKey: [...PRODUCTOS_KEY, filtros],
    queryFn: ({ signal }) => getProductos(filtros, signal),
    placeholderData: keepPreviousData,
  })
}

function useInvalidarProductos() {
  const queryClient = useQueryClient()
  return () => queryClient.invalidateQueries({ queryKey: PRODUCTOS_KEY })
}

export function useCrearProducto() {
  const invalidar = useInvalidarProductos()
  return useMutation({ mutationFn: createProducto, onSuccess: invalidar })
}

export function useActualizarProducto() {
  const invalidar = useInvalidarProductos()
  return useMutation({
    mutationFn: ({ id, datos }: { id: number; datos: ProductoUpdate }) => updateProducto(id, datos),
    onSuccess: invalidar,
  })
}

export function useActualizarStock() {
  const invalidar = useInvalidarProductos()
  return useMutation({
    mutationFn: ({ id, datos }: { id: number; datos: ProductoStockUpdate }) => updateStock(id, datos),
    onSuccess: invalidar,
  })
}

export function useEliminarProducto() {
  const invalidar = useInvalidarProductos()
  return useMutation({ mutationFn: deleteProducto, onSuccess: invalidar })
}
