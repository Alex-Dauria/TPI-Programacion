import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import {
  cambiarEstadoPedido,
  cancelarPedido,
  crearPedido,
  getPedido,
  getPedidos,
  getResumenPedidos,
} from '../api/pedidos'
import type { EstadoPedido, PedidoFiltros } from '../types/pedido'

const PEDIDOS_KEY = ['pedidos'] as const
const RESUMEN_KEY = ['pedidos-resumen'] as const

export function usePedidos(filtros: PedidoFiltros) {
  return useQuery({
    queryKey: [...PEDIDOS_KEY, filtros],
    queryFn: () => getPedidos(filtros),
    placeholderData: keepPreviousData,
  })
}

export function usePedido(id: number | null) {
  return useQuery({
    queryKey: ['pedido', id],
    queryFn: () => getPedido(id ?? 0),
    enabled: id !== null,
  })
}

export function useResumenPedidos() {
  return useQuery({ queryKey: RESUMEN_KEY, queryFn: getResumenPedidos })
}

/** Crear, cancelar o cambiar el estado de un pedido modifica pedidos, stock de productos y resumen. */
function useInvalidarPedidos() {
  const queryClient = useQueryClient()
  return () => {
    void queryClient.invalidateQueries({ queryKey: PEDIDOS_KEY })
    void queryClient.invalidateQueries({ queryKey: ['pedido'] })
    void queryClient.invalidateQueries({ queryKey: RESUMEN_KEY })
    void queryClient.invalidateQueries({ queryKey: ['productos'] })
  }
}

export function useCrearPedido() {
  const invalidar = useInvalidarPedidos()
  return useMutation({ mutationFn: crearPedido, onSuccess: invalidar })
}

export function useCambiarEstadoPedido() {
  const invalidar = useInvalidarPedidos()
  return useMutation({
    mutationFn: ({ id, estado }: { id: number; estado: EstadoPedido }) => cambiarEstadoPedido(id, estado),
    onSuccess: invalidar,
  })
}

export function useCancelarPedido() {
  const invalidar = useInvalidarPedidos()
  return useMutation({ mutationFn: cancelarPedido, onSuccess: invalidar })
}
