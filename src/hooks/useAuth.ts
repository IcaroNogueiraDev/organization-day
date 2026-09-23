import { useContext } from "react";
import { AuthContext } from "../contexts/authContextValue";
import type { AuthContextValue } from '../types'

/**
 * Consumidor do AuthContext. Lança erro se usado fora de <AuthProvider>.
 */
export function useAuth(): AuthContextValue {
    const context = useContext(AuthContext);

    if (context === null) {
        throw new Error("useAuth precisa ser usado dentro de <AuthProvider>");
    }

    return context;
}