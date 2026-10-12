import { useState } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { AuthField, AuthFormShell, SessionLoading } from '@/components/auth/AuthShell'
import { Checkbox } from '@/components/ui/checkbox'
import { useAuth } from '@/hooks/useAuth'
import { authErrorMessage } from '@/lib/authErrors'

export function SignUpPage() {
  const { user, loading: sessionLoading, signUp } = useAuth()
  const [error, setError] = useState<string | null>(null)
  const [info, setInfo] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  if (sessionLoading) return <main className="auth-app"><SessionLoading /></main>
  if (user) return <Navigate to="/agenda" replace />

  async function handleSubmit(form: FormData) {
    setError(null)
    setInfo(null)
    setLoading(true)
    try {
      const hasSession = await signUp(
        String(form.get('email')).trim(),
        String(form.get('password')),
        String(form.get('name')).trim(),
      )
      // com sessão, o Navigate acima leva para /agenda; sem sessão, falta confirmar o e-mail
      if (!hasSession) {
        setInfo('Conta criada! Confirme seu e-mail pelo link que enviamos e depois entre.')
      }
    } catch (err) {
      setError(authErrorMessage(err, 'Não foi possível criar a conta.'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthFormShell
      id="signup"
      title="Criar conta"
      subtitle="Crie sua conta e comece a se organizar."
      backTo="/"
      error={error}
      info={info}
      loading={loading}
      submitLabel="Criar conta"
      onSubmit={handleSubmit}
      footer={<>Já tem uma conta? <Link className="text-link" to="/entrar">Entrar</Link></>}
    >
      <AuthField id="signup-name" name="name" label="Nome completo" placeholder="Digite seu nome completo" autoComplete="name" />
      <AuthField id="signup-email" name="email" label="E-mail" type="email" placeholder="Digite seu e-mail" autoComplete="email" />
      <AuthField id="signup-password" name="password" label="Senha" type="password" placeholder="Mínimo de 6 caracteres" autoComplete="new-password" minLength={6} />
      <Checkbox
        className="terms-option"
        name="terms"
        required
        label="Concordo com o uso dos meus dados para o funcionamento do app"
      />
    </AuthFormShell>
  )
}
