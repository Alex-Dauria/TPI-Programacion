import { axiosInstance } from '../../../shared/api/axiosInstance'
import type { Usuario } from '../../usuarios/types/usuario'
import type { MessageResponse, RegisterData } from '../types/auth'

/** Login con formulario OAuth2: el backend responde con la cookie HttpOnly; el cuerpo no trae el token. */
export async function login(username: string, password: string): Promise<MessageResponse> {
  const form = new URLSearchParams({ username, password })
  const { data } = await axiosInstance.post<MessageResponse>('/auth/token', form)
  return data
}

export async function logout(): Promise<MessageResponse> {
  const { data } = await axiosInstance.post<MessageResponse>('/auth/logout')
  return data
}

export async function getMe(): Promise<Usuario> {
  const { data } = await axiosInstance.get<Usuario>('/auth/me')
  return data
}

export async function register(datos: RegisterData): Promise<Usuario> {
  const { data } = await axiosInstance.post<Usuario>('/auth/register', datos)
  return data
}
