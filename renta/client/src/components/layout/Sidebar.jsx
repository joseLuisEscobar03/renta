import React from 'react';
import {
  LayoutDashboard,
  Users,
  Building2,
  CreditCard,
  Send,
  Settings,
  Building
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export default function Sidebar() {
  const { curPage, setCurPage, unsentCount } = useApp();

  const navItems = [
    { id: 'dashboard', label: 'Panel principal', icon: LayoutDashboard },
    { id: 'tenants', label: 'Inquilinos', icon: Users },
    { id: 'properties', label: 'Propiedades', icon: Building2 },
    { id: 'payments', label: 'Pagos', icon: CreditCard },
    { id: 'reminders', label: 'Recordatorios', icon: Send, badge: unsentCount > 0 },
  ];

  return (
    <aside className="w-16 bg-brand-surface border-r border-brand-border flex flex-col items-center py-4 gap-1.5 shadow-card select-none z-20">
      {/* Brand Logo */}
      <div
        className="w-9 h-9 bg-brand-green rounded-xl flex items-center justify-center text-white mb-4 cursor-pointer hover:bg-brand-green-dark transition-colors"
        onClick={() => setCurPage('dashboard')}
        title="RentaFácil"
      >
        <Building className="w-5 h-5" />
      </div>

      {/* Main Navigation */}
      <nav className="flex flex-col gap-1 w-full items-center">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = curPage === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setCurPage(item.id)}
              title={item.label}
              className={`relative w-10 h-10 rounded-xl flex items-center justify-center transition-all cursor-pointer ${
                isActive
                  ? 'bg-brand-green-light text-brand-green-dark'
                  : 'text-brand-text3 hover:bg-brand-surface2 hover:text-brand-text'
              }`}
            >
              <Icon className="w-5 h-5" />
              {item.badge && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-brand-red ring-2 ring-brand-surface" />
              )}
            </button>
          );
        })}
      </nav>

      {/* Footer Navigation */}
      <div className="mt-auto flex flex-col items-center gap-2">
        <button
          onClick={() => setCurPage('settings')}
          title="Configuración"
          className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all cursor-pointer ${
            curPage === 'settings'
              ? 'bg-brand-green-light text-brand-green-dark'
              : 'text-brand-text3 hover:bg-brand-surface2 hover:text-brand-text'
          }`}
        >
          <Settings className="w-5 h-5" />
        </button>
      </div>
    </aside>
  );
}
