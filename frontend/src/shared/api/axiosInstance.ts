import axios from 'axios'

import { useAuthStore } from '../../store/authStore'

/**
 * Cliente HTTP único. `withCredentials: true` hace que el navegador adjunte la cookie HttpOnly
 * `access_token` en cada petición: el frontend nunca lee ni guarda el token.
 */
export const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? 'http://localhost:8000/api/v1',
  withCredentials: true,
})

// En estas rutas un 401 es una respuesta esperada (credenciales incorrectas o sin sesión), no una sesión vencida.
const RUTAS_CON_401_ESPERADO = ['/auth/token', '/auth/me']
const CUENTA_DESACTIVADA = 'Cuenta de usuario desactivada'

axiosInstance.interceptors.response.use(
  (response) => response,
  (error: unknown) => {
    if (axios.isAxiosError<{ detail?: unknown }>(error) && error.response) {
      const { status, data } = error.response
      const url = error.config?.url ?? ''
      const sesionVencida = status === 401 && !RUTAS_CON_401_ESPERADO.some((ruta) => url.startsWith(ruta))
      const cuentaDesactivada = status === 400 && data?.detail === CUENTA_DESACTIVADA
      if (sesionVencida || cuentaDesactivada) {
        // Al quedar sin usuario, ProtectedRoute redirige a /login.
        useAuthStore.getState().limpiarSesion()
      }
    }
    return Promise.reject(error)
  },
)
