import type { ButtonHTMLAttributes } from 'react'

type Variante = 'primary' | 'secondary' | 'danger' | 'ghost'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variante?: Variante
  chico?: boolean
}

const ESTILOS: Record<Variante, string> = {
  primary: 'bg-green-700 text-white hover:bg-green-800',
  secondary: 'bg-white text-slate-700 ring-1 ring-slate-300 hover:bg-slate-100',
  danger: 'bg-red-600 text-white hover:bg-red-700',
  ghost: 'text-slate-600 hover:bg-slate-100',
}

export function Button({ variante = 'primary', chico = false, className = '', type = 'button', ...props }: ButtonProps) {
  const tamano = chico ? 'px-2.5 py-1 text-xs' : 'px-4 py-2 text-sm'
  return (
    <button
      type={type}
      className={`inline-flex items-center justify-center gap-1 rounded-lg font-medium transition disabled:cursor-not-allowed disabled:opacity-50 ${tamano} ${ESTILOS[variante]} ${className}`}
      {...props}
    />
  )
}
