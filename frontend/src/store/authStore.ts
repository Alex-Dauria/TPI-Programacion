import { create } from 'zustand'
import { persist } from 'zustand/middleware'

import { getMe, login as loginApi, logout as logoutApi } from '../features/auth/api/auth'
import type { Usuario } from '../features/usuarios/types/usuario'
import { queryClient } from '../shared/api/queryClient'

/** Datos del usuario que se guardan en el cliente. El token NO: viaja en una cookie HttpOnly. */
export type UsuarioSesion = Pick<Usuario, 'id' | 'username' | 'full_name' | 'email' | 'role'>

interface AuthState {
  usuario: UsuarioSesion | null
  /** true mientras checkSession confirma la sesión con el backend. */
  cargando: boolean
  login: (username: string, password: string) => Promise<void>
  logout: () => Promise<void>
  checkSession: () => Promise<void>
  /** Descarta la sesión sin llamar al backend (lo usa el interceptor de Axios). */
  limpiarSesion: () => void
}

function aSesion({ id, username, full_name, email, role }: Usuario): UsuarioSesion {
  return { id, username, full_name, email, role }
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      usuario: null,
      cargando: true,

      login: async (username, password) => {
        await loginApi(username, password)
        const usuario = await getMe()
        queryClient.clear()
        set({ usuario: aSesion(usuario), cargando: false })
      },

      logout: async () => {
        try {
          await logoutApi()
        } finally {
          get().limpiarSesion()
        }
      },

      checkSession: async () => {
        try {
          const usuario = await getMe()
          set({ usuario: aSesion(usuario), cargando: false })
        } catch {
          get().limpiarSesion()
        }
      },

      limpiarSesion: () => {
        queryClient.clear()
        set({ usuario: null, cargando: false })
      },
    }),
    {
      name: 'foodstore-auth',
      // Solo se persiste el usuario: nunca el token ni el indicador de carga.
      partialize: (estado) => ({ usuario: estado.usuario }),
    },
  ),
)
