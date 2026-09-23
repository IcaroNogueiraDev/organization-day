import { useState } from "react";
import { useAuth } from "../../hooks/useAuth";

/** Formulário de cadastro: cria a conta; navega só se o Supabase retornar sessão. */
export function SignUpForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const { signUp } = useAuth();

  async function handleSignUp(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setInfo(null);
    setLoading(true);

    try {
      const hasSession = await signUp(email, password);
      if (hasSession) {
        // conta ativada sem confirmação por email → já pode usar o app
        window.location.assign("/");
      } else {
        setInfo(
          "Conta criada! Verifique seu email para confirmar e depois faça login.",
        );
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao fazer cadastro");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="card bg-base-100 shadow-sm w-full max-w-sm">
      <div className="card-body">
        <h2 className="card-title">Crie uma conta</h2>

        <p className="text-sm opacity-70">Preencha os campos abaixo e crie seu cadastro</p>

        <form onSubmit={handleSignUp} className="flex flex-col gap-2">
          {error && (
            <div role="alert" className="alert alert-error py-2 text-sm">
              <span>{error}</span>
            </div>
          )}
          {info && (
            <div role="alert" className="alert alert-info py-2 text-sm">
              <span>{info}</span>
            </div>
          )}

          <label className="form-control w-full">
            <div className="label py-1">
              <span className="label-text">Email</span>
            </div>
            <input
              type="email"
              className="input input-bordered w-full"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
          </label>

          <label className="form-control w-full">
            <div className="label py-1">
              <span className="label-text">Senha</span>
            </div>
            <input
              type="password"
              className="input input-bordered w-full"
              placeholder="Senha (mín. 6 caracteres)"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              autoComplete="new-password"
            />
          </label>

          <button type="submit" className="btn btn-neutral mt-4" disabled={loading}>
            {loading ? (
              <span className="loading loading-spinner loading-sm" />
            ) : (
              "Cadastrar"
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
