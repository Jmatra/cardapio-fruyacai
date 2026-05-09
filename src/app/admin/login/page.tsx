"use client";

import { useState } from "react";
import { useAdminAuth } from "@/hooks/useAdminAuth";

export default function AdminLoginPage() {
  const { login, loading, error, clearError } = useAdminAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    await login(email, password);
  };

  return (
    <div className="min-h-screen bg-surface flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="inline-block bg-brand-900/50 border border-brand-700 rounded-2xl p-4 mb-4">
            <span className="text-3xl">🍇</span>
          </div>
          <h1 className="font-display text-2xl font-bold text-white">
            FRUYAÇAÍ
          </h1>
          <p className="text-white/40 text-sm mt-1">Painel Administrativo</p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-surface-card border border-surface-border rounded-2xl p-6 space-y-4"
        >
          {error && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3 text-red-400 text-sm">
              {error}
            </div>
          )}

          <div className="space-y-1">
            <label className="text-white/60 text-xs font-medium">E-mail</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoFocus
              placeholder="admin@fruyacai.com.br"
              className="w-full bg-surface-subtle border border-surface-border rounded-xl px-4 py-3 text-white placeholder:text-white/20 focus:outline-none focus:border-brand-500 transition-colors"
            />
          </div>

          <div className="space-y-1">
            <label className="text-white/60 text-xs font-medium">Senha</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="••••••••"
              className="w-full bg-surface-subtle border border-surface-border rounded-xl px-4 py-3 text-white placeholder:text-white/20 focus:outline-none focus:border-brand-500 transition-colors"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-brand-600 hover:bg-brand-500 disabled:opacity-50 text-white font-semibold transition-colors mt-2"
          >
            {loading ? "Entrando..." : "Entrar"}
          </button>
        </form>
      </div>
    </div>
  );
}
