import type { ButtonHTMLAttributes } from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const buttonVariants = cva('ui-button', {
  variants: {
    variant: {
      default: 'ui-button-default',
      welcomeLogin: 'welcome-action welcome-login',
      welcomeSignup: 'welcome-action welcome-signup',
      back: 'back-button',
      submit: 'submit-button',
      social: 'social-button',
      inline: 'inline-switch',
      icon: 'icon-button',
      secondary: 'dialog-secondary',
      close: 'dialog-close',
    },
  },
  defaultVariants: { variant: 'default' },
})

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & VariantProps<typeof buttonVariants>

export function Button({ className, variant, type = 'button', ...props }: ButtonProps) {
  return <button className={cn(buttonVariants({ variant }), className)} type={type} {...props} />
}
