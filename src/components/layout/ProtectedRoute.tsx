import { Navigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import type { ReactNode } from "react";

interface ProtectedRouteProps {
    children: ReactNode
}

/** Bloqueia a rota até a sessão carregar; redireciona para /login se não houver user. */
export function ProtectedRoute({ children }: ProtectedRouteProps) {
    const { user, loading } = useAuth();

    if (loading) {
        return (
            <div className="min-h-screen bg-base-200 flex items-center justify-center">
                <span className="loading loading-spinner loading-lg text-primary" />
            </div>
        );
    }

    if (!user) {
        return <Navigate to="/login" replace />
    }

    return <>{children}</>
}
