// src/modules/auth/components/Login.jsx
import { useState } from "react";
import { Eye, EyeOff, AlertCircle } from "lucide-react";
import { login } from "../services/auth.service";
import "../../../index.css"; // Ensure styles are applied if not globally

export default function Login({ onLoginExitoso }) {
  const [usuario, setUsuario] = useState("");
  const [contrasena, setContrasena] = useState("");
  const [error, setError] = useState("");
  const [showPass, setShowPass] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();

    const resultado = login(usuario.trim(), contrasena.trim());

    if (!resultado.ok) {
      setError(resultado.error);
      return;
    }

    setError("");
    onLoginExitoso(usuario.trim());
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-dark-900 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-primary/20 rounded-full blur-[100px]" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] bg-secondary/20 rounded-full blur-[100px]" />

      <div className="card w-full max-w-md relative z-10 animate-fade-in-up">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Bienvenido</h1>
          <p className="text-gray-400">Inicia sesión para continuar</p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-200 px-4 py-3 rounded-xl mb-6 flex items-center gap-2">
            <AlertCircle size={20} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-300 ml-1">Usuario</label>
            <input
              type="text"
              placeholder="Ingresa tu usuario"
              className="input-field"
              value={usuario}
              onChange={(e) => setUsuario(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-300 ml-1">Contraseña</label>
            <div className="relative">
              <input
                type={showPass ? "text" : "password"}
                placeholder="Ingresa tu contraseña"
                className="input-field pr-12"
                value={contrasena}
                onChange={(e) => setContrasena(e.target.value)}
              />
              <button
                type="button"
                onClick={() => setShowPass(!showPass)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                tabIndex={-1}
              >
                {showPass ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="btn-primary w-full mt-4"
          >
            Entrar
          </button>
        </form>
      </div>
    </div>
  );
}
