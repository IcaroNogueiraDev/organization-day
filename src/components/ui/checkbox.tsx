import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

export function Checkbox({
  name,
  label,
  required = false,
  className,
}: {
  name: string
  label: ReactNode
  required?: boolean
  className?: string
}) {
  return (
    <label className={cn('check-option', className)}>
      <input className="ui-checkbox" type="checkbox" name={name} required={required} />
      <span>{label}</span>
    </label>
  )
}
