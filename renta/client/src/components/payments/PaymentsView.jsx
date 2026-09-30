import React, { useState, useEffect } from 'react';
import Badge from '../common/Badge';
import {
  CreditCard,
  Plus,
  Receipt,
  Trash2,
  Download
} from 'lucide-react';
import { api } from '../../services/api';
import { formatMoney, formatPeriod, formatDate, getInitials } from '../../utils/formatters';
import { exportPaymentsToExcel } from '../../utils/exportUtils';
import { useApp } from '../../context/AppContext';

export default function PaymentsView() {
  const { openGlobalPayModal, showToast } = useApp();
  const [filter, setFilter] = useState('all'); // all, paid, pending, late
  const [viewMode, setViewMode] = useState('ledger'); // ledger, transactions
  const [ledgerRows, setLedgerRows] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      setLoading(true);
      if (viewMode === 'ledger') {
        const data = await api.payments.getLedger(filter);
        setLedgerRows(data);
      } else {
        const data = await api.payments.getTransactions();
        setTransactions(data);
      }
    } catch (err) {
      console.error('Error cargando pagos:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [filter, viewMode]);

  const handleDeleteTransaction = async (id) => {
    if (!window.confirm('¿Estás seguro de eliminar este recibo de pago? Se recalculará la deuda.')) {
      return;
    }

    try {
      await api.payments.delete(id);
      showToast('Pago eliminado correctamente');
      fetchData();
    } catch (err) {
      showToast(err.message || 'Error al eliminar pago', 'error');
    }
  };

  return (
    <div className="space-y-5 max-w-7xl mx-auto">
      {/* Controles superiores: Pestañas de estado, modo de vista y botón nuevo pago */}
      <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3">
        {/* Toggle Ledger vs Recibos y Filtros */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Selector de modo */}
          <div className="flex bg-brand-surface2 p-1 rounded-lg border border-brand-border">
            <button
              onClick={() => setViewMode('ledger')}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all cursor-pointer ${
                viewMode === 'ledger'
                  ? 'bg-brand-surface text-brand-text shadow-sm'
                  : 'text-brand-text2 hover:text-brand-text'
              }`}
            >
              Control por período
            </button>
            <button
              onClick={() => setViewMode('transactions')}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all cursor-pointer ${
                viewMode === 'transactions'
                  ? 'bg-brand-surface text-brand-text shadow-sm'
                  : 'text-brand-text2 hover:text-brand-text'
              }`}
            >
              Historial de recibos
            </button>
          </div>

          {/* Filtros de estado (solo en modo ledger) */}
          {viewMode === 'ledger' && (
            <div className="flex bg-brand-surface2 p-1 rounded-lg border border-brand-border">
              {[
                { id: 'all', label: 'Todos' },
                { id: 'paid', label: 'Pagados' },
                { id: 'pending', label: 'Pendientes' },
                { id: 'late', label: 'Atrasados' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setFilter(tab.id)}
                  className={`px-2.5 py-1.5 rounded-md text-xs font-medium transition-all cursor-pointer ${
                    filter === tab.id
                      ? 'bg-brand-surface text-brand-text shadow-sm'
                      : 'text-brand-text2 hover:text-brand-text'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Acciones de pago y exportación */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => exportPaymentsToExcel(ledgerRows)}
            title="Descargar reporte en formato Excel"
            className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg border border-brand-border bg-brand-surface hover:bg-brand-surface2 text-brand-text text-xs font-medium transition-colors cursor-pointer"
          >
            <Download className="w-4 h-4 text-brand-green" />
            <span>Exportar Excel</span>
          </button>

          <button
            onClick={() => openGlobalPayModal()}
            className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-lg bg-brand-green hover:bg-brand-green-dark text-white text-xs font-medium transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Registrar pago</span>
          </button>
        </div>
      </div>

      {/* Contenedor de Tabla */}
      <div className="bg-brand-surface border border-brand-border rounded-card overflow-hidden shadow-card">
        {loading ? (
          <div className="text-center py-16 text-brand-text3 text-sm">
            Cargando registros contables...
          </div>
        ) : viewMode === 'ledger' ? (
          ledgerRows.length === 0 ? (
            <div className="text-center py-16 text-brand-text3 p-8">
              <CreditCard className="w-12 h-12 mx-auto text-brand-text3 mb-3 opacity-60" />
              <p className="text-sm font-medium">Sin registros contables en este filtro</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-brand-surface2 text-brand-text3 text-[11px] uppercase tracking-wider border-b border-brand-border">
                    <th className="py-3 px-4 font-medium">Inquilino</th>
                    <th className="py-3 px-4 font-medium">Propiedad</th>
                    <th className="py-3 px-4 font-medium">Período</th>
                    <th className="py-3 px-4 font-medium">Monto (Pagado / Renta)</th>
                    <th className="py-3 px-4 font-medium">Estado</th>
                    <th className="py-3 px-4 font-medium text-right">Acción</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-brand-border">
                  {ledgerRows.map((r) => {
                    const isPaid = r.status === 'paid';
                    const isLate = r.status === 'late';

                    const avatarBg = isPaid
                      ? 'bg-brand-green-light text-brand-green-dark'
                      : isLate
                      ? 'bg-brand-red-light text-brand-red'
                      : 'bg-brand-amber-light text-brand-amber';

                    return (
                      <tr key={r.id} className="hover:bg-brand-surface2/60 transition-colors">
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2.5">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-mono font-medium text-xs flex-shrink-0 ${avatarBg}`}>
                              {getInitials(r.tenantName)}
                            </div>
                            <span className="font-medium text-brand-text text-xs">{r.tenantName}</span>
                          </div>
                        </td>

                        <td className="py-3 px-4 text-brand-text2 font-medium">
                          {r.propertyName}
                        </td>

                        <td className="py-3 px-4 font-medium text-brand-text">
                          {formatPeriod(r.period)}
                        </td>

                        <td className="py-3 px-4 font-mono font-medium">
                          <span className={isPaid ? 'text-brand-green' : isLate ? 'text-brand-red' : 'text-brand-amber'}>
                            {formatMoney(r.paid)}
                          </span>{' '}
                          <span className="text-brand-text3">/ {formatMoney(r.rent)}</span>
                        </td>

                        <td className="py-3 px-4">
                          {isPaid ? (
                            <Badge variant="green">Pagado</Badge>
                          ) : isLate ? (
                            <Badge variant="red">Atrasado</Badge>
                          ) : (
                            <Badge variant="amber">Pendiente</Badge>
                          )}
                        </td>

                        <td className="py-3 px-4 text-right">
                          {!isPaid && (
                            <button
                              onClick={() => openGlobalPayModal(r.tenantId)}
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-brand-green hover:bg-brand-green-dark text-white text-[11px] font-medium transition-colors cursor-pointer"
                            >
                              <Plus className="w-3 h-3" />
                              <span>Pagar</span>
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )
        ) : (
          /* Modo Transacciones (Recibos individuales) */
          transactions.length === 0 ? (
            <div className="text-center py-16 text-brand-text3 p-8">
              <Receipt className="w-12 h-12 mx-auto text-brand-text3 mb-3 opacity-60" />
              <p className="text-sm font-medium">Sin recibos de pagos registrados</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-brand-surface2 text-brand-text3 text-[11px] uppercase tracking-wider border-b border-brand-border">
                    <th className="py-3 px-4 font-medium">Fecha</th>
                    <th className="py-3 px-4 font-medium">Inquilino</th>
                    <th className="py-3 px-4 font-medium">Propiedad</th>
                    <th className="py-3 px-4 font-medium">Período cubierto</th>
                    <th className="py-3 px-4 font-medium">Monto</th>
                    <th className="py-3 px-4 font-medium">Nota / Comprobante</th>
                    <th className="py-3 px-4 font-medium text-right"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-brand-border">
                  {transactions.map((tx) => (
                    <tr key={tx.id} className="hover:bg-brand-surface2/60 transition-colors">
                      <td className="py-3 px-4 font-mono text-brand-text2">
                        {formatDate(tx.payment_date)}
                      </td>

                      <td className="py-3 px-4 font-medium text-brand-text">
                        {tx.tenant_name}
                      </td>

                      <td className="py-3 px-4 text-brand-text2">
                        {tx.property_name || '—'}
                      </td>

                      <td className="py-3 px-4 font-medium text-brand-text">
                        {formatPeriod(tx.period)}
                      </td>

                      <td className="py-3 px-4 font-mono font-medium text-brand-green text-sm">
                        {formatMoney(tx.amount)}
                      </td>

                      <td className="py-3 px-4 text-brand-text2 italic max-w-xs truncate">
                        {tx.note || '—'}
                      </td>

                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => handleDeleteTransaction(tx.id)}
                          title="Eliminar recibo"
                          className="p-1 rounded text-brand-text3 hover:text-brand-red hover:bg-brand-red-light transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        )}
      </div>
    </div>
  );
}
