import { useForm } from '@tanstack/react-form'
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

import { handleApiError } from '../../../shared/api/handleApiError'
import { Button } from '../../../shared/ui/Button'
import { Card } from '../../../shared/ui/Card'
import { Input } from '../../../shared/ui/Input'
import { primerError } from '../../../shared/utils/formato'
import { useAuthStore } from '../../../store/authStore'
import { register } from '../api/auth'

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export default function RegisterPage() {
  const login = useAuthStore((s) => s.login)
  const navigate = useNavigate()
  const [error, setError] = useState<string | null>(null)

  const form = useForm({
    defaultValues: { username: '', full_name: '', email: '', password: '' },
    onSubmit: async ({ value }) => {
      setError(null)
      try {
        const datos = { ...value, username: value.username.trim(), full_name: value.full_name.trim(), email: value.email.trim() }
        await register(datos)
        // Tras registrarse, inicia sesión directamente.
        await login(datos.username, datos.password)
        navigate('/', { replace: true })
      } catch (e) {
        setError(handleApiError(e))
      }
    },
  })

  return (
    <div className="mx-auto max-w-sm">
      <Card>
        <h1 className="mb-6 text-2xl font-bold text-slate-900">Crear cuenta</h1>
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
            validators={{
              onChange: ({ value }) => {
                const v = value.trim()
                if (v.length < 3) return 'Mínimo 3 caracteres'
                if (v.length > 50) return 'Máximo 50 caracteres'
                return undefined
              },
            }}
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
          <form.Field
            name="full_name"
            validators={{ onChange: ({ value }) => (value.trim() ? undefined : 'Ingresá tu nombre completo') }}
          >
            {(field) => (
              <Input
                label="Nombre completo"
                autoComplete="name"
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
                error={primerError(field.state.meta.errors)}
              />
            )}
          </form.Field>
          <form.Field
            name="email"
            validators={{ onChange: ({ value }) => (EMAIL_REGEX.test(value.trim()) ? undefined : 'Email inválido') }}
          >
            {(field) => (
              <Input
                label="Email"
                type="email"
                autoComplete="email"
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
                error={primerError(field.state.meta.errors)}
              />
            )}
          </form.Field>
          <form.Field
            name="password"
            validators={{
              onChange: ({ value }) => {
                if (value.length < 8) return 'Mínimo 8 caracteres'
                if (value.length > 72) return 'Máximo 72 caracteres'
                return undefined
              },
            }}
          >
            {(field) => (
              <Input
                label="Contraseña"
                type="password"
                autoComplete="new-password"
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
                {isSubmitting ? 'Creando cuenta…' : 'Registrarme'}
              </Button>
            )}
          </form.Subscribe>
        </form>
        <p className="mt-4 text-center text-sm text-slate-600">
          ¿Ya tenés cuenta?{' '}
          <Link to="/login" className="font-medium text-orange-600 hover:underline">
            Iniciá sesión
          </Link>
        </p>
      </Card>
    </div>
  )
}
