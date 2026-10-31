/** UserCreate del backend (POST /auth/register). */
export interface RegisterData {
  username: string
  full_name: string
  email: string
  password: string
}

export interface MessageResponse {
  message: string
}
