import { useId } from 'react'
import type { InputHTMLAttributes, ReactNode, SelectHTMLAttributes, TextareaHTMLAttributes } from 'react'

const CONTROL =
  'block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-200'

interface CampoProps {
  label: string
  error?: string
  id: string
  children: ReactNode
}

function Campo({ label, error, id, children }: CampoProps) {
  return (
    <div className="space-y-1">
      <label htmlFor={id} className="block text-sm font-medium text-slate-700">
        {label}
      </label>
      {children}
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  )
}

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string
  error?: string
}

export function Input({ label, error, className = '', ...props }: InputProps) {
  const id = useId()
  return (
    <Campo label={label} error={error} id={id}>
      <input id={id} aria-invalid={Boolean(error)} className={`${CONTROL} ${className}`} {...props} />
    </Campo>
  )
}

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label: string
  error?: string
}

export function Select({ label, error, className = '', children, ...props }: SelectProps) {
  const id = useId()
  return (
    <Campo label={label} error={error} id={id}>
      <select id={id} aria-invalid={Boolean(error)} className={`${CONTROL} ${className}`} {...props}>
        {children}
      </select>
    </Campo>
  )
}

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string
  error?: string
}

export function Textarea({ label, error, className = '', ...props }: TextareaProps) {
  const id = useId()
  return (
    <Campo label={label} error={error} id={id}>
      <textarea id={id} aria-invalid={Boolean(error)} rows={3} className={`${CONTROL} ${className}`} {...props} />
    </Campo>
  )
}
