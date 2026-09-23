import { useAuth } from "../../hooks/useAuth";

/** Exibe o email do usuário logado (placeholder para perfil completo). */
export function UserProfile() {
    const { user } = useAuth();

    if (!user) return null;

    return (
        <div className="avatar placeholder">
            <div className="bg-neutral text-neutral-content rounded-full w-10">
                <span className="text-sm">{user.email?.charAt(0).toUpperCase() ?? "?"}</span>
            </div>
        </div>
    );
}
