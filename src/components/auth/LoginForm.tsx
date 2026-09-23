import { useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { useState } from "react";

/** Formulário de login: envia credenciais e navega para o dashboard. */
export function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const { signIn } = useAuth();
  const navigate = useNavigate();

  async function handleSignIn(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await signIn(email, password);
      navigate("/");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao fazer login");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="card bg-base-100 shadow-sm w-full max-w-sm">
      <div className="card-body">
        <h2 className="card-title">Entre em sua conta</h2>

        <p className="text-sm opacity-70">Preencha os campos abaixo e faça login</p>
        <form onSubmit={handleSignIn} className="flex flex-col gap-2">
          {error && (
            <div role="alert" className="alert alert-error py-2 text-sm">
              <span>{error}</span>
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
              placeholder="Senha"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
            />
          </label>

          <button type="submit" className="btn btn-neutral mt-4" disabled={loading}>
            {loading ? (
              <span className="loading loading-spinner loading-sm" />
            ) : (
              "Entrar"
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
