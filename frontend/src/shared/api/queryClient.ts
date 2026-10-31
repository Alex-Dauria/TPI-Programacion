import { QueryClient } from '@tanstack/react-query'
import axios from 'axios'

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      refetchOnWindowFocus: false,
      // Los errores 4xx no se reintentan: repetir la petición daría el mismo resultado.
      retry: (intentos, error) => {
        const status = axios.isAxiosError(error) ? error.response?.status : undefined
        return intentos < 1 && (status === undefined || status >= 500)
      },
    },
  },
})
