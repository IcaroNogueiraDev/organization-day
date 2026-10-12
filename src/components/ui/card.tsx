import type { HTMLAttributes } from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const cardVariants = cva('task-card', {
  variants: {
    variant: {
      default: '',
      featured: 'task-card-featured',
    },
  },
  defaultVariants: { variant: 'default' },
})

export type CardProps = HTMLAttributes<HTMLElement> & VariantProps<typeof cardVariants>

export function Card({ className, variant, ...props }: CardProps) {
  return <article className={cn(cardVariants({ variant }), className)} {...props} />
}
