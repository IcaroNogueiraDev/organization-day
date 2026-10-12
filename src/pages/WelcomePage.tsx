import { Navigate, useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { DecorativeArt, SessionLoading } from '@/components/auth/AuthShell'
import { useAuth } from '@/hooks/useAuth'

/** Tela inicial para quem não está logado. Quem já tem sessão vai direto para a agenda. */
export function WelcomePage() {
  const { user, loading } = useAuth()
  const navigate = useNavigate()

  if (loading) return <main className="auth-app"><SessionLoading /></main>
  if (user) return <Navigate to="/agenda" replace />

  return (
    <main className="auth-app" aria-label="Acesso à conta">
      <section className="auth-screen screen-welcome is-visible" aria-labelledby="welcome-title">
        <DecorativeArt welcome />
        <div className="welcome-copy">
          <p className="eyebrow">SEU DIA, EM BOA ORDEM</p>
          <h1 id="welcome-title">Organization Day</h1>
          <p>Entre ou crie sua conta para organizar as tarefas da sua semana.</p>
        </div>
        <div className="welcome-actions" aria-label="Escolha uma opção de acesso">
          <Button variant="welcomeLogin" onClick={() => navigate('/entrar')}>Entrar</Button>
          <Button variant="welcomeSignup" onClick={() => navigate('/cadastro')}>Criar conta</Button>
        </div>
      </section>
    </main>
  )
}
