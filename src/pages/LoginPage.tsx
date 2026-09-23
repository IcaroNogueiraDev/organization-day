import { useState } from "react";
import { LoginForm } from "../components/auth/LoginForm";
import { SignUpForm } from "../components/auth/SignUpForm";

/** Tela de acesso: alterna entre login e cadastro. */
export function LoginPage() {
  // 0 = login, 1 = registro
  const [pageIdx, setPageIdx] = useState(0);

  return (
    <div className="min-h-screen bg-base-200 flex items-center justify-center px-4">
      <div className="flex flex-col gap-4 w-full max-w-sm">
        <div className="text-center mb-2">
          <h1 className="text-2xl font-bold">Organization Day</h1>
          <p className="text-sm opacity-70">Organize suas tarefas da semana</p>
        </div>

        <div role="tablist" className="tabs tabs-boxed bg-base-100">
          <button
            role="tab"
            aria-selected={pageIdx === 0}
            className={`tab ${pageIdx === 0 ? "tab-active" : ""}`}
            onClick={() => setPageIdx(0)}
          >
            Entrar
          </button>
          <button
            role="tab"
            aria-selected={pageIdx === 1}
            className={`tab ${pageIdx === 1 ? "tab-active" : ""}`}
            onClick={() => setPageIdx(1)}
          >
            Cadastrar
          </button>
        </div>

        {pageIdx === 0 ? <LoginForm /> : <SignUpForm />}
      </div>
    </div>
  );
}
