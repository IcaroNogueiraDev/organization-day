import type { FormEvent, ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, LoaderCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export function DecorativeArt({ welcome = false }: { welcome?: boolean }) {
  return welcome ? (
    <div className="welcome-art" aria-hidden="true">
      <span className="shape welcome-orb-dark" />
      <span className="shape welcome-orb-light" />
      <span className="shape welcome-orb-mid" />
      <span className="shape welcome-orb-small" />
      <span className="shape welcome-wave" />
    </div>
  ) : (
    <div className="blue-header-art" aria-hidden="true">
      <span className="shape header-orb-dark" />
      <span className="shape header-orb-light" />
      <span className="shape header-orb-small" />
      <span className="shape header-glow" />
    </div>
  )
}

/** Tela de carregamento da sessão (ao abrir o app já logado). */
export function SessionLoading({ title = 'Entrando na sua conta', text = 'Estamos preparando suas tarefas…' }: { title?: string; text?: string }) {
  return (
    <section className="login-loading" role="status" aria-live="polite">
      <LoaderCircle className="login-loading-spinner" aria-hidden="true" />
      <h1>{title}</h1>
      <p>{text}</p>
    </section>
  )
}

export function AuthField({
  id,
  name,
  label,
  type = 'text',
  placeholder,
  autoComplete,
  minLength,
  defaultValue,
}: {
  id: string
  name: string
  label: string
  type?: string
  placeholder: string
  autoComplete?: string
  minLength?: number
  defaultValue?: string
}) {
  return (
    <>
      <label className="field-label" htmlFor={id}>{label}</label>
      <Input
        className="text-input"
        id={id}
        name={name}
        type={type}
        placeholder={placeholder}
        autoComplete={autoComplete}
        minLength={minLength}
        defaultValue={defaultValue}
        required
      />
    </>
  )
}

/** Moldura das telas de formulário: cabeçalho azul, botão voltar e cartão branco. */
export function AuthFormShell({
  id,
  title,
  subtitle,
  backTo,
  error,
  info,
  loading,
  submitLabel,
  onSubmit,
  children,
  footer,
}: {
  id: string
  title: string
  subtitle: string
  backTo: string
  error?: string | null
  info?: string | null
  loading: boolean
  submitLabel: string
  onSubmit: (form: FormData) => void
  children: ReactNode
  footer?: ReactNode
}) {
  const navigate = useNavigate()
  const titleId = `${id}-title`

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    onSubmit(new FormData(event.currentTarget))
  }

  return (
    <main className="auth-app" aria-label="Acesso à conta">
      <section className={`auth-screen screen-form screen-${id} is-visible`} aria-labelledby={titleId}>
        <DecorativeArt />
        <Button className="back-button" variant="back" aria-label="Voltar" onClick={() => navigate(backTo)}>
          <ArrowLeft aria-hidden="true" />
        </Button>
        <div className="form-surface">
          <form className="auth-form" id={`${id}-form`} onSubmit={handleSubmit}>
            <header className="form-heading">
              <h1 id={titleId}>{title}</h1>
              <p>{subtitle}</p>
            </header>
            {error && <div className="form-alert form-alert-error" role="alert">{error}</div>}
            {info && <div className="form-alert form-alert-info" role="status">{info}</div>}
            {children}
            <Button className="submit-button" variant="submit" type="submit" disabled={loading}>
              {loading ? <LoaderCircle className="spin" aria-label="Carregando" /> : submitLabel}
            </Button>
            {footer && <p className="switch-prompt">{footer}</p>}
          </form>
        </div>
      </section>
    </main>
  )
}
