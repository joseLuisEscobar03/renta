import React, { useState } from 'react';
import { Building, Lock, Mail, ArrowRight } from 'lucide-react';
import { api } from '../../services/api';
import { useApp } from '../../context/AppContext';

export default function LoginView() {
  const { login, showToast } = useApp();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      setLoading(true);
      const data = await api.auth.login(email, password);
      login(data.user, data.token);
    } catch (err) {
      setError(err.message || 'Correo o contraseña incorrectos');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen w-screen flex items-center justify-center bg-brand-bg px-4 select-none">
      <div className="w-full max-w-sm bg-brand-surface rounded-card p-8 border border-brand-border shadow-modal">
        {/* Logo y Encabezado */}
        <div className="flex flex-col items-center text-center mb-6">
          <div className="w-12 h-12 bg-brand-green rounded-2xl flex items-center justify-center text-white mb-3 shadow-md">
            <Building className="w-6 h-6" />
          </div>
          <h1 className="text-xl font-semibold text-brand-text">RentaFácil</h1>
          <p className="text-xs text-brand-text3 mt-1">Gestión integral de propiedades y cobranzas</p>
        </div>

        {/* Mensaje de error */}
        {error && (
          <div className="mb-4 p-3 rounded-lg bg-brand-red-light border border-red-200 text-brand-red text-xs text-center">
            {error}
          </div>
        )}

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[11px] font-medium text-brand-text2 uppercase tracking-wider mb-1.5">
              Correo electrónico
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-brand-text3 absolute left-3 top-2.5" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tu@correo.com"
                className="w-full pl-9 pr-3 py-2 border border-brand-border rounded-lg bg-brand-surface text-brand-text text-sm focus:outline-none focus:border-brand-green focus:ring-1 focus:ring-brand-green"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-medium text-brand-text2 uppercase tracking-wider mb-1.5">
              Contraseña
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-brand-text3 absolute left-3 top-2.5" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-9 pr-3 py-2 border border-brand-border rounded-lg bg-brand-surface text-brand-text text-sm focus:outline-none focus:border-brand-green focus:ring-1 focus:ring-brand-green"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 px-4 rounded-lg bg-brand-green hover:bg-brand-green-dark text-white text-sm font-medium transition-colors cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50 mt-2"
          >
            <span>{loading ? 'Iniciando sesión...' : 'Iniciar sesión'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

      </div>
    </div>
  );
}
