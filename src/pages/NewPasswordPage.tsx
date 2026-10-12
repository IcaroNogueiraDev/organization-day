import { useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { AuthField, AuthFormShell, SessionLoading } from '@/components/auth/AuthShell'
import { useAuth } from '@/hooks/useAuth'
import { authErrorMessage } from '@/lib/authErrors'

/** Destino do link do e-mail de recuperação: o Supabase já abre uma sessão, aqui só se troca a senha. */
export function NewPasswordPage() {
  const { user, loading: sessionLoading, updatePassword } = useAuth()
  const navigate = useNavigate()
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  if (sessionLoading) return <main className="auth-app"><SessionLoading title="Validando o link" text="Só um instante…" /></main>
  if (!user) return <Navigate to="/esqueci-senha" replace />

  async function handleSubmit(form: FormData) {
    const password = String(form.get('password'))
    if (password !== String(form.get('confirm'))) {
      setError('As senhas não são iguais.')
      return
    }
    setError(null)
    setLoading(true)
    try {
      await updatePassword(password)
      navigate('/agenda', { replace: true })
    } catch (err) {
      setError(authErrorMessage(err, 'Não foi possível alterar a senha.'))
      setLoading(false)
    }
  }

  return (
    <AuthFormShell
      id="newpass"
      title="Nova senha"
      subtitle="Escolha uma senha nova para sua conta."
      backTo="/agenda"
      error={error}
      loading={loading}
      submitLabel="Salvar nova senha"
      onSubmit={handleSubmit}
      footer={<Link className="text-link" to="/agenda">Voltar para a agenda</Link>}
    >
      <AuthField id="newpass-password" name="password" label="Nova senha" type="password" placeholder="Mínimo de 6 caracteres" autoComplete="new-password" minLength={6} />
      <AuthField id="newpass-confirm" name="confirm" label="Confirmar senha" type="password" placeholder="Repita a nova senha" autoComplete="new-password" minLength={6} />
    </AuthFormShell>
  )
}
