import type { Paginado } from '../../../shared/types/paginado'

export type EstadoPedido = 'PENDIENTE' | 'EN_PREPARACION' | 'ENTREGADO' | 'CANCELADO'
export type FormaPago = 'EFECTIVO' | 'TRANSFERENCIA'

export const ESTADOS: EstadoPedido[] = ['PENDIENTE', 'EN_PREPARACION', 'ENTREGADO', 'CANCELADO']

/** Máquina de estados (RN-02), igual que en el backend: los botones solo ofrecen transiciones válidas. */
export const TRANSICIONES: Record<EstadoPedido, EstadoPedido[]> = {
  PENDIENTE: ['EN_PREPARACION', 'CANCELADO'],
  EN_PREPARACION: ['ENTREGADO', 'CANCELADO'],
  ENTREGADO: [],
  CANCELADO: [],
}

export interface DetallePedido {
  producto_id: number
  nombre_producto: string
  precio_unitario: number
  cantidad: number
  subtotal: number
}

export interface Pedido {
  id: number
  usuario_id: number
  estado: EstadoPedido
  forma_pago: FormaPago
  direccion_entrega: string
  notas: string | null
  total: number
  created_at: string
  updated_at: string
  items: DetallePedido[]
}

export type PedidosPaginados = Paginado<Pedido>

export interface ItemPedidoCreate {
  producto_id: number
  cantidad: number
}

export interface PedidoCreate {
  items: ItemPedidoCreate[]
  forma_pago: FormaPago
  direccion_entrega: string
  notas: string | null
}

export interface CambioEstado {
  estado: EstadoPedido
}

export interface ResumenPedidos {
  pendientes: number
  en_preparacion: number
  entregados: number
  cancelados: number
  pedidos_hoy: number
  ingresos_entregados: number
}

export interface PedidoFiltros {
  skip: number
  limit: number
  estado?: EstadoPedido
}
