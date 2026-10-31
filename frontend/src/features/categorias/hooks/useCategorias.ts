import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { createCategoria, deleteCategoria, getCategorias, updateCategoria } from '../api/categorias'
import type { CategoriaUpdate } from '../types/categoria'

const CATEGORIAS_KEY = ['categorias'] as const

export function useCategorias() {
  return useQuery({ queryKey: CATEGORIAS_KEY, queryFn: getCategorias })
}

export function useCrearCategoria() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: createCategoria,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: CATEGORIAS_KEY }),
  })
}

export function useActualizarCategoria() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, datos }: { id: number; datos: CategoriaUpdate }) => updateCategoria(id, datos),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: CATEGORIAS_KEY })
      // Los productos muestran el nombre de su categoría.
      void queryClient.invalidateQueries({ queryKey: ['productos'] })
    },
  })
}

export function useEliminarCategoria() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: deleteCategoria,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: CATEGORIAS_KEY }),
  })
}
