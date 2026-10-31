import { useForm } from '@tanstack/react-form'
import { useState } from 'react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'

import { handleApiError } from '../../../shared/api/handleApiError'
import { Button } from '../../../shared/ui/Button'
import { Card } from '../../../shared/ui/Card'
import { Input } from '../../../shared/ui/Input'
import { primerError } from '../../../shared/utils/formato'
import { useAuthStore } from '../../../store/authStore'

export default function LoginPage() {
  const login = useAuthStore((s) => s.login)
  const usuario = useAuthStore((s) => s.usuario)
  const cargando = useAuthStore((s) => s.cargando)
  const navigate = useNavigate()
  const location = useLocation()
  const destino = (location.state as { from?: string } | null)?.from ?? '/'
  const [error, setError] = useState<string | null>(null)

  const form = useForm({
    defaultValues: { username: '', password: '' },
    onSubmit: async ({ value }) => {
      setError(null)
      try {
        await login(value.username.trim(), value.password)
        navigate(destino, { replace: true })
      } catch (e) {
        setError(handleApiError(e))
      }
    },
  })

  if (!cargando && usuario) return <Navigate to={destino} replace />

  return (
    <div className="mx-auto max-w-sm">
      <Card>
        <h1 className="mb-6 text-2xl font-bold text-slate-900">Iniciar sesión</h1>
        <form
          className="space-y-4"
          noValidate
          onSubmit={(e) => {
            e.preventDefault()
            void form.handleSubmit()
          }}
        >
          <form.Field
            name="username"
            validators={{ onChange: ({ value }) => (value.trim() ? undefined : 'Ingresá tu usuario') }}
          >
            {(field) => (
              <Input
                label="Usuario"
                autoComplete="username"
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
                error={primerError(field.state.meta.errors)}
              />
            )}
          </form.Field>
          <form.Field name="password" validators={{ onChange: ({ value }) => (value ? undefined : 'Ingresá tu contraseña') }}>
            {(field) => (
              <Input
                label="Contraseña"
                type="password"
                autoComplete="current-password"
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
                error={primerError(field.state.meta.errors)}
              />
            )}
          </form.Field>

          {error && <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}

          <form.Subscribe selector={(s) => [s.canSubmit, s.isSubmitting] as const}>
            {([canSubmit, isSubmitting]) => (
              <Button type="submit" className="w-full" disabled={!canSubmit || isSubmitting}>
                {isSubmitting ? 'Ingresando…' : 'Ingresar'}
              </Button>
            )}
          </form.Subscribe>
        </form>
        <p className="mt-4 text-center text-sm text-slate-600">
          ¿No tenés cuenta?{' '}
          <Link to="/register" className="font-medium text-green-700 hover:underline">
            Registrate
          </Link>
        </p>
      </Card>
    </div>
  )
}
