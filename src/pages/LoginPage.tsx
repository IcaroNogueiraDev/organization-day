import { useState } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { AuthField, AuthFormShell, SessionLoading } from '@/components/auth/AuthShell'
import { useAuth } from '@/hooks/useAuth'
import { authErrorMessage } from '@/lib/authErrors'

export function LoginPage() {
  const { user, loading: sessionLoading, signIn, signInWithGoogle } = useAuth()
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  if (sessionLoading) return <main className="auth-app"><SessionLoading /></main>
  if (user) return <Navigate to="/agenda" replace />

  async function handleSubmit(form: FormData) {
    setError(null)
    setLoading(true)
    try {
      // o Navigate acima leva para /agenda quando o AuthContext receber a sessão
      await signIn(String(form.get('email')).trim(), String(form.get('password')))
    } catch (err) {
      setError(authErrorMessage(err, 'Não foi possível entrar.'))
      setLoading(false)
    }
  }

  async function handleGoogle() {
    setError(null)
    try {
      // abre a tela do Google; ao voltar, o app cai direto na agenda
      await signInWithGoogle()
    } catch (err) {
      setError(authErrorMessage(err, 'Não foi possível entrar com o Google.'))
    }
  }

  return (
    <AuthFormShell
      id="login"
      title="Boas-vindas de volta"
      subtitle="Entre para continuar no seu planejador."
      backTo="/"
      error={error}
      loading={loading}
      submitLabel="Entrar"
      onSubmit={handleSubmit}
      onGoogle={handleGoogle}
      footer={<>Ainda não tem uma conta? <Link className="text-link" to="/cadastro">Criar conta</Link></>}
    >
      <AuthField id="login-email" name="email" label="E-mail" type="email" placeholder="Digite seu e-mail" autoComplete="email" />
      <AuthField id="login-password" name="password" label="Senha" type="password" placeholder="Digite sua senha" autoComplete="current-password" />
      <div className="form-options" style={{ justifyContent: 'flex-end' }}>
        <Link className="text-link" to="/esqueci-senha">Esqueceu a senha?</Link>
      </div>
    </AuthFormShell>
  )
}
