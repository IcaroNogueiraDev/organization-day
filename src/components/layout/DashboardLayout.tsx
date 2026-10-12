import type { ReactNode } from "react";
import { useAuth } from "../../hooks/useAuth";
import { NotificationButton } from "../user/NotificationButton";

interface DashboardLayoutProps {
  children: ReactNode;
}

/**
 * Layout base do dashboard autenticado: navbar com usuário + sair,
 * main centralizado e responsivo. Envolve as rotas protegidas.
 */
export function DashboardLayout({ children }: DashboardLayoutProps) {
  const { user, signOut } = useAuth();

  async function handleSignOut() {
    try {
      await signOut();
    } catch {
      // logout falhou; o listener de auth ainda reflete o estado real
      console.error("Falha ao sair da conta");
    }
  }

  return (
    <div className="min-h-screen bg-base-200 flex flex-col">
      <div className="navbar bg-base-100 shadow-sm sticky top-0 z-30">
        <div className="navbar-start">
          <span className="btn btn-ghost text-lg font-bold normal-case">
            Organization Day
          </span>
        </div>

        <div className="navbar-end gap-2">
          <span className="hidden sm:inline text-sm opacity-70 max-w-40 truncate">
            {user?.email}
          </span>
          <button className="btn btn-sm btn-outline" onClick={handleSignOut}>
            Sair
          </button>
        </div>
      </div>

      <main className="flex-1 w-full max-w-5xl mx-auto px-4 py-6 md:px-8">
        {children}
      </main>

      <div className="navbar-end gap-2">
        <span className="hidden sm:inline ...">{user?.email}</span>
        <NotificationButton />
        <button className="btn btn-sm btn-outline" onClick={handleSignOut}>
          Sair
        </button>
      </div>

      <footer className="footer footer-center p-4 text-xs opacity-60">
        <p>Organization Day — organize sua semana</p>
      </footer>
    </div>
  );
}
