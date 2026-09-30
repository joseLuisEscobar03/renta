import React, { useState } from 'react';
import { useApp } from './context/AppContext';
import Sidebar from './components/layout/Sidebar';
import Topbar from './components/layout/Topbar';
import LoginView from './components/auth/LoginView';
import DashboardView from './components/dashboard/DashboardView';
import PropertiesView from './components/properties/PropertiesView';
import TenantsView from './components/tenants/TenantsView';
import PaymentsView from './components/payments/PaymentsView';
import RemindersView from './components/reminders/RemindersView';
import SettingsView from './components/settings/SettingsView';
import PaymentModal from './components/payments/PaymentModal';

export default function App() {
  const {
    user,
    curPage,
    isGlobalPayModalOpen,
    globalPayModalTenantId,
    closeGlobalPayModal
  } = useApp();

  const [isTenantModalOpen, setIsTenantModalOpen] = useState(false);
  const [isPropertyModalOpen, setIsPropertyModalOpen] = useState(false);

  if (!user) {
    return <LoginView />;
  }

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-brand-bg text-brand-text">
      {/* Icon Rail / Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Topbar />

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          {curPage === 'dashboard' && (
            <DashboardView
              onOpenTenantModal={() => setIsTenantModalOpen(true)}
              onOpenPropModal={() => setIsPropertyModalOpen(true)}
            />
          )}

          {curPage === 'tenants' && (
            <TenantsView
              isModalOpen={isTenantModalOpen}
              setIsModalOpen={setIsTenantModalOpen}
            />
          )}

          {curPage === 'properties' && (
            <PropertiesView
              isModalOpen={isPropertyModalOpen}
              setIsModalOpen={setIsPropertyModalOpen}
            />
          )}

          {curPage === 'payments' && <PaymentsView />}

          {curPage === 'reminders' && <RemindersView />}

          {curPage === 'settings' && <SettingsView />}
        </main>
      </div>

      {/* Modal Global de Pago */}
      <PaymentModal
        isOpen={isGlobalPayModalOpen}
        onClose={closeGlobalPayModal}
        initialTenantId={globalPayModalTenantId}
        onSuccess={() => {
          // Si el usuario está en pagos o dashboard, se actualizará automáticamente
        }}
      />
    </div>
  );
}
