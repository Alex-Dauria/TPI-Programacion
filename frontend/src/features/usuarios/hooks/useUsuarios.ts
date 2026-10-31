import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { activarUsuario, desactivarUsuario, getUsuarios } from '../api/usuarios'

const USUARIOS_KEY = ['usuarios'] as const

export function useUsuarios() {
  return useQuery({ queryKey: USUARIOS_KEY, queryFn: getUsuarios })
}

export function useActivarUsuario() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: activarUsuario,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: USUARIOS_KEY }),
  })
}

export function useDesactivarUsuario() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: desactivarUsuario,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: USUARIOS_KEY }),
  })
}
