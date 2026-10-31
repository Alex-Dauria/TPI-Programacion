export type Rol = 'user' | 'admin'

/** UserPublic del backend: nunca incluye la contraseña ni el token. */
export interface Usuario {
  id: number
  username: string
  full_name: string
  email: string
  role: Rol
  disabled: boolean
  created_at: string
}
