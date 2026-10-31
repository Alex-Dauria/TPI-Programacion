import { Link } from 'react-router-dom'

import { Card } from '../../../shared/ui/Card'

export default function UnauthorizedPage() {
  return (
    <Card className="mx-auto max-w-md text-center">
      <p className="text-5xl" aria-hidden="true">
        🔒
      </p>
      <h1 className="mt-3 text-xl font-bold text-slate-900">Sin permiso</h1>
      <p className="mt-2 text-slate-600">No tenés permisos para ver esta página.</p>
      <Link to="/" className="mt-4 inline-block font-medium text-green-700 hover:underline">
        Volver al inicio
      </Link>
    </Card>
  )
}
