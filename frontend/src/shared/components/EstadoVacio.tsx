import type { ReactNode } from 'react'

interface EstadoVacioProps {
  mensaje: string
  children?: ReactNode
}

export function EstadoVacio({ mensaje, children }: EstadoVacioProps) {
  return (
    <div className="rounded-2xl border-2 border-dashed border-slate-300 bg-white px-6 py-12 text-center">
      <p className="text-4xl" aria-hidden="true">
        🍽️
      </p>
      <p className="mt-2 text-slate-600">{mensaje}</p>
      {children && <div className="mt-4">{children}</div>}
    </div>
  )
}
