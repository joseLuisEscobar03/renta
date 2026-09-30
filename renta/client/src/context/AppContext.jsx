import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { api } from '../services/api';

const AppContext = createContext();

export function AppProvider({ children }) {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('rentafacil_user');
    try { return saved && localStorage.getItem('rentafacil_token') ? JSON.parse(saved) : null; } catch { return null; }
  });

  const [curPage, setCurPage] = useState('dashboard');
  const [settings, setSettings] = useState({
    business_name: '',
    tone: 'amigable',
    on_3days: true,
    on_due: true,
    on_late: true,
    on_multi: true
  });
  
  const [unsentCount, setUnsentCount] = useState(0);
  const [toast, setToast] = useState(null);

  // Global payment modal trigger
  const [globalPayModalTenantId, setGlobalPayModalTenantId] = useState(null);
  const [isGlobalPayModalOpen, setIsGlobalPayModalOpen] = useState(false);

  // Cargar settings y recordatorios iniciales
  const refreshSettings = useCallback(async () => {
    try {
      const data = await api.settings.get();
      setSettings(data);
    } catch (e) {
      console.error('Error cargando configuración:', e);
    }
  }, []);

  const refreshRemindersCount = useCallback(async () => {
    try {
      const rems = await api.reminders.getAll();
      const unsent = rems.filter(r => !r.isSent).length;
      setUnsentCount(unsent);
    } catch (e) {
      console.error('Error cargando contador de recordatorios:', e);
    }
  }, []);

  useEffect(() => {
    if (!user) return;
    refreshSettings();
    refreshRemindersCount();
  }, [user, refreshSettings, refreshRemindersCount]);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  const login = (userData, token) => {
    setUser(userData);
    localStorage.setItem('rentafacil_user', JSON.stringify(userData));
    if (token) {
      localStorage.setItem('rentafacil_token', token);
    }
    showToast(`Bienvenido de vuelta, ${userData.name}`);
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('rentafacil_user');
    localStorage.removeItem('rentafacil_token');
  };

  const openGlobalPayModal = (tenantId = '') => {
    setGlobalPayModalTenantId(tenantId);
    setIsGlobalPayModalOpen(true);
  };

  const closeGlobalPayModal = () => {
    setIsGlobalPayModalOpen(false);
    setGlobalPayModalTenantId(null);
  };

  return (
    <AppContext.Provider
      value={{
        user,
        login,
        logout,
        curPage,
        setCurPage,
        settings,
        setSettings,
        refreshSettings,
        unsentCount,
        refreshRemindersCount,
        toast,
        showToast,
        isGlobalPayModalOpen,
        globalPayModalTenantId,
        openGlobalPayModal,
        closeGlobalPayModal
      }}
    >
      {children}

      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 transition-all duration-300 transform translate-y-0">
          <div
            className={`px-4 py-3 rounded-lg shadow-lg border text-sm font-medium flex items-center gap-2 ${
              toast.type === 'error'
                ? 'bg-brand-red text-white border-brand-red'
                : 'bg-brand-surface text-brand-text border-brand-border'
            }`}
          >
            <span>{toast.message}</span>
          </div>
        </div>
      )}
    </AppContext.Provider>
  );
}

export const useApp = () => useContext(AppContext);
