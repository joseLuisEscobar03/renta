import React from 'react';
import { LogOut } from 'lucide-react';
import { useApp } from '../../context/AppContext';

const PAGE_META = {
  dashboard: { title: 'Panel principal', sub: 'Resumen de tus propiedades' },
  tenants: { title: 'Inquilinos', sub: 'Gestiona tus arrendatarios y contratos' },
  properties: { title: 'Propiedades', sub: 'Tus inmuebles en alquiler' },
  payments: { title: 'Pagos', sub: 'Historial de cobros, períodos y deudas' },
  reminders: { title: 'Recordatorios', sub: 'Avisos de cobro por WhatsApp y correo' },
  settings: { title: 'Configuración', sub: 'Personaliza tus recordatorios y firma de cobranza' }
};

export default function Topbar({ actions }) {
  const { curPage, user, logout, settings } = useApp();
  const meta = PAGE_META[curPage] || { title: 'RentaFácil', sub: '' };

  return (
    <header className="h-14 border-b border-brand-border bg-brand-surface px-6 flex items-center justify-between shadow-card z-10">
      <div>
        <h1 className="text-base font-medium text-brand-text leading-tight">
          {meta.title}
        </h1>
        <p className="text-[11px] text-brand-text3 mt-0.5">
          {meta.sub}
        </p>
      </div>

      <div className="flex items-center gap-3">
        {/* Acciones específicas de cada pantalla */}
        {actions && (
          <div className="flex items-center gap-2">
            {actions}
          </div>
        )}

        {/* Separador */}
        <div className="h-5 w-px bg-brand-border mx-1" />

        {/* Identidad del negocio */}
        <div className="hidden sm:flex flex-col text-right">
          <span className="text-xs font-medium text-brand-text leading-tight">
            {settings.business_name || user?.business_name || 'RentaFácil'}
          </span>
          <span className="text-[10px] text-brand-text3">
            {user?.email || 'admin@rentafacil.com'}
          </span>
        </div>

        {/* Botón cerrar sesión */}
        <button
          onClick={logout}
          title="Cerrar sesión"
          className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-red-200 bg-white text-brand-red text-xs font-medium hover:bg-brand-red-light transition-colors cursor-pointer"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Cerrar sesión</span>
        </button>
      </div>
    </header>
  );
}
