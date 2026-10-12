import { useState } from 'react'
import { Link } from 'react-router-dom'
import { AuthField, AuthFormShell } from '@/components/auth/AuthShell'
import { useAuth } from '@/hooks/useAuth'
import { authErrorMessage } from '@/lib/authErrors'

/** Pede o e-mail e envia o link de redefinição de senha. */
export function ForgotPasswordPage() {
  const { resetPassword } = useAuth()
  const [error, setError] = useState<string | null>(null)
  const [info, setInfo] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(form: FormData) {
    setError(null)
    setInfo(null)
    setLoading(true)
    try {
      await resetPassword(String(form.get('email')).trim())
      setInfo('Se esse e-mail tiver uma conta, enviamos um link para criar uma nova senha.')
    } catch (err) {
      setError(authErrorMessage(err, 'Não foi possível enviar o e-mail.'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthFormShell
      id="forgot"
      title="Recuperar senha"
      subtitle="Informe seu e-mail para receber o link."
      backTo="/entrar"
      error={error}
      info={info}
      loading={loading}
      submitLabel="Enviar link"
      onSubmit={handleSubmit}
      footer={<>Lembrou a senha? <Link className="text-link" to="/entrar">Entrar</Link></>}
    >
      <AuthField id="forgot-email" name="email" label="E-mail" type="email" placeholder="Digite seu e-mail" autoComplete="email" />
    </AuthFormShell>
  )
}
