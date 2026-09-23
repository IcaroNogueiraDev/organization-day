import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { supabase } from "../lib/supabaseClient";
import { AuthContext } from "./authContextValue";
import type { AuthContextValue } from "../types";

interface AuthProviderProps {
  children: ReactNode;
}

/**
 * Prove o estado de autenticação (user, loading) e as ações
 * signIn / signUp / signOut para a árvore de componentes.
 */
export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<AuthContextValue["user"]>(null);
  const [loading, setLoading] = useState(true);

  // Deps [] de propósito: roda só no mount. O listener onAuthStateChange
  // cuida de login/logout/refresh. Deps com [user, loading] criavam um
  // loop infinito de re-render (setUser com objeto novo → effect de novo).
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null);
      },
    );

    return () => listener.subscription.unsubscribe();
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
  }, []);

  const signUp = useCallback(async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });
    if (error) throw error;
    return data.session !== null;
  }, []);

  const signOut = useCallback(async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  }, []);

  const values: AuthContextValue = useMemo(
    () => ({ user, loading, signIn, signUp, signOut }),
    [user, loading, signIn, signUp, signOut],
  );

  return <AuthContext.Provider value={values}>{children}</AuthContext.Provider>;
}
