import React, { useState, useEffect } from 'react';
import StatCard from '../common/StatCard';
import Badge from '../common/Badge';
import {
  DollarSign,
  TrendingUp,
  AlertTriangle,
  Building2,
  UserPlus,
  Building,
  CreditCard,
  Send,
  CheckCircle2,
  PartyPopper
} from 'lucide-react';
import { api } from '../../services/api';
import { formatMoney, getInitials } from '../../utils/formatters';
import { useApp } from '../../context/AppContext';

export default function DashboardView({ onOpenTenantModal, onOpenPropModal }) {
  const { setCurPage, openGlobalPayModal } = useApp();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const data = await api.stats.getDashboard();
      setStats(data);
    } catch (err) {
      console.error('Error cargando estadísticas:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  if (loading || !stats) {
    return (
      <div className="flex items-center justify-center h-64 text-brand-text3 text-sm">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-green mr-3"></div>
        Cargando estadísticas financieras...
      </div>
    );
  }

  const {
    totalMonthlyRent,
    collectedThisMonth,
    collectedPercentage,
    totalAccumulatedDebt,
    totalProperties,
    occupiedProperties,
    pendingThisMonth,
    debtors
  } = stats;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Grid de Métricas Principales */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Renta mensual"
          value={formatMoney(totalMonthlyRent)}
          subtext={`${occupiedProperties} inquilino${occupiedProperties !== 1 ? 's' : ''} activo${occupiedProperties !== 1 ? 's' : ''}`}
          color="green"
          icon={DollarSign}
        />
        <StatCard
          label="Cobrado este mes"
          value={formatMoney(collectedThisMonth)}
          subtext={`${collectedPercentage}% del total mensual`}
          color={collectedPercentage >= 100 ? 'green' : 'neutral'}
          icon={TrendingUp}
        />
        <StatCard
          label="Deuda acumulada"
          value={formatMoney(totalAccumulatedDebt)}
          subtext={`${debtors.length} inquilino${debtors.length !== 1 ? 's' : ''} con saldo`}
          color={totalAccumulatedDebt > 0 ? 'red' : 'green'}
          icon={AlertTriangle}
        />
        <StatCard
          label="Propiedades"
          value={totalProperties}
          subtext={`${occupiedProperties} ocupada${occupiedProperties !== 1 ? 's' : ''} / ${totalProperties - occupiedProperties} libre${totalProperties - occupiedProperties !== 1 ? 's' : ''}`}
          color="neutral"
          icon={Building2}
        />
      </div>

      {/* Tablas Resumen: Pendientes este mes y Deudores Acumulados */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pendientes este mes */}
        <div className="bg-brand-surface border border-brand-border rounded-card overflow-hidden shadow-card">
          <div className="px-5 py-3.5 border-b border-brand-border flex items-center justify-between">
            <span className="font-medium text-sm text-brand-text">Pendientes este mes</span>
            <Badge variant={pendingThisMonth.length > 0 ? 'amber' : 'green'}>
              {pendingThisMonth.length}
            </Badge>
          </div>
          <div className="p-5 space-y-4">
            {pendingThisMonth.length === 0 ? (
              <div className="text-center py-8 text-brand-text3 space-y-2">
                <CheckCircle2 className="w-9 h-9 mx-auto text-brand-green opacity-80" />
                <p className="text-xs">¡Todo pagado este mes! No hay cobros pendientes.</p>
              </div>
            ) : (
              pendingThisMonth.map((t) => (
                <div key={t.id} className="space-y-1.5 pb-3 border-b border-brand-border last:border-b-0 last:pb-0">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-full bg-brand-amber-light text-brand-amber font-mono font-medium flex items-center justify-center text-[11px]">
                        {getInitials(t.name)}
                      </div>
                      <div>
                        <span className="font-medium text-brand-text block">{t.name}</span>
                        <span className="text-[10px] text-brand-text3">{t.propertyName}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="font-mono font-medium text-brand-amber block">
                        {formatMoney(t.remaining)} pendiente
                      </span>
                      <button
                        onClick={() => openGlobalPayModal(t.id)}
                        className="text-[10px] text-brand-green hover:underline cursor-pointer font-medium"
                      >
                        Pagar cuota
                      </button>
                    </div>
                  </div>
                  <div className="h-1.5 w-full bg-brand-surface2 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        t.percentage < 50 ? 'bg-brand-red' : t.percentage < 100 ? 'bg-brand-amber' : 'bg-brand-green'
                      }`}
                      style={{ width: `${t.percentage}%` }}
                    />
                  </div>
                  <div className="text-[10px] text-brand-text3 font-mono flex justify-between">
                    <span>{formatMoney(t.paid)} de {formatMoney(t.rent)}</span>
                    <span>{t.percentage}%</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Deuda acumulada */}
        <div className="bg-brand-surface border border-brand-border rounded-card overflow-hidden shadow-card">
          <div className="px-5 py-3.5 border-b border-brand-border flex items-center justify-between">
            <span className="font-medium text-sm text-brand-text">Con deuda acumulada</span>
            <Badge variant={debtors.length > 0 ? 'red' : 'green'}>
              {debtors.length}
            </Badge>
          </div>
          <div className="p-5 space-y-3">
            {debtors.length === 0 ? (
              <div className="text-center py-8 text-brand-text3 space-y-2">
                <PartyPopper className="w-9 h-9 mx-auto text-brand-green opacity-80" />
                <p className="text-xs">¡Excelente! Sin deudas acumuladas registradas.</p>
              </div>
            ) : (
              debtors.map((d) => (
                <div
                  key={d.id}
                  className="flex items-center justify-between py-2 border-b border-brand-border last:border-b-0"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-brand-red-light text-brand-red font-mono font-medium flex items-center justify-center text-xs">
                      {getInitials(d.name)}
                    </div>
                    <div>
                      <div className="text-xs font-medium text-brand-text">{d.name}</div>
                      <div className="text-[10px] text-brand-text3">{d.propertyName}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-sm font-medium text-brand-red">
                      − {formatMoney(d.debt)}
                    </span>
                    <button
                      onClick={() => openGlobalPayModal(d.id)}
                      className="px-2 py-1 rounded bg-brand-surface2 hover:bg-brand-border text-brand-text text-[11px] font-medium transition-colors cursor-pointer"
                    >
                      Abonar
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Accesos rápidos */}
      <div className="bg-brand-surface border border-brand-border rounded-card p-5 shadow-card">
        <h2 className="text-sm font-medium text-brand-text mb-3">Accesos rápidos</h2>
        <div className="flex flex-wrap gap-2.5">
          <button
            onClick={onOpenTenantModal}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-brand-border bg-brand-surface hover:bg-brand-surface2 text-brand-text text-xs font-medium transition-colors cursor-pointer"
          >
            <UserPlus className="w-4 h-4 text-brand-green" />
            <span>Agregar inquilino</span>
          </button>

          <button
            onClick={onOpenPropModal}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-brand-border bg-brand-surface hover:bg-brand-surface2 text-brand-text text-xs font-medium transition-colors cursor-pointer"
          >
            <Building className="w-4 h-4 text-brand-green" />
            <span>Agregar propiedad</span>
          </button>

          <button
            onClick={() => openGlobalPayModal()}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-brand-border bg-brand-surface hover:bg-brand-surface2 text-brand-text text-xs font-medium transition-colors cursor-pointer"
          >
            <CreditCard className="w-4 h-4 text-brand-green" />
            <span>Registrar pago</span>
          </button>

          <button
            onClick={() => setCurPage('reminders')}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-brand-green hover:bg-brand-green-dark text-white text-xs font-medium transition-colors cursor-pointer ml-auto"
          >
            <Send className="w-4 h-4" />
            <span>Ver recordatorios</span>
          </button>
        </div>
      </div>
    </div>
  );
}
