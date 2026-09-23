import { createContext } from "react";
import type { AuthContextValue } from "../types";

/**
 * Contexto de auth em arquivo separado do provider para não
 * quebrar o Fast Refresh (só-export-components do lint).
 */
export const AuthContext = createContext<AuthContextValue | null>(null);
