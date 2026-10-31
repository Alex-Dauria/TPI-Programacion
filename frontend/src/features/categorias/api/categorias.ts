import { axiosInstance } from '../../../shared/api/axiosInstance'
import type { Categoria, CategoriaCreate, CategoriaUpdate } from '../types/categoria'

export async function getCategorias(): Promise<Categoria[]> {
  const { data } = await axiosInstance.get<Categoria[]>('/categorias')
  return data
}

export async function createCategoria(datos: CategoriaCreate): Promise<Categoria> {
  const { data } = await axiosInstance.post<Categoria>('/categorias', datos)
  return data
}

export async function updateCategoria(id: number, datos: CategoriaUpdate): Promise<Categoria> {
  const { data } = await axiosInstance.put<Categoria>(`/categorias/${id}`, datos)
  return data
}

export async function deleteCategoria(id: number): Promise<void> {
  await axiosInstance.delete(`/categorias/${id}`)
}
