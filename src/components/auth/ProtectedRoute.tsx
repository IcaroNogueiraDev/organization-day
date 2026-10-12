import type { ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { SessionLoading } from '@/components/auth/AuthShell'

/** Bloqueia a rota até a sessão carregar; sem usuário, volta para a tela inicial. */
export function ProtectedRoute({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth()

  if (loading) return <main className="auth-app"><SessionLoading /></main>
  if (!user) return <Navigate to="/" replace />

  return <>{children}</>
}
