import React, { useState, useEffect } from 'react';
import Modal from '../common/Modal';
import { api } from '../../services/api';
import { useApp } from '../../context/AppContext';

export default function PaymentModal({ isOpen, onClose, initialTenantId = '', onSuccess }) {
  const { showToast, refreshRemindersCount } = useApp();
  const [tenants, setTenants] = useState([]);
  const [tenantId, setTenantId] = useState(initialTenantId);
  const [period, setPeriod] = useState(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
  });
  const [amount, setAmount] = useState('');
  const [paymentDate, setPaymentDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      api.tenants.getAll().then(data => {
        setTenants(data);
        if (initialTenantId) {
          setTenantId(initialTenantId);
          const found = data.find(t => t.id === initialTenantId);
          if (found) setAmount(found.rent);
        } else if (data.length > 0) {
          setTenantId(data[0].id);
          setAmount(data[0].rent);
        }
      }).catch(err => console.error('Error cargando inquilinos:', err));
    }
  }, [isOpen, initialTenantId]);

  const handleTenantChange = (e) => {
    const tid = e.target.value;
    setTenantId(tid);
    const found = tenants.find(t => t.id === tid);
    if (found) setAmount(found.rent);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!tenantId || !period || !amount || !paymentDate) {
      showToast('Por favor completa todos los campos requeridos', 'error');
      return;
    }

    try {
      setLoading(true);
      await api.payments.create({
        tenant_id: tenantId,
        period,
        amount: Number(amount),
        payment_date: paymentDate,
        note
      });

      showToast('Pago registrado correctamente');
      refreshRemindersCount();
      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      showToast(err.message || 'Error registrando pago', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Registrar pago de alquiler"
      footer={
        <>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium rounded-lg border border-brand-border bg-brand-surface hover:bg-brand-surface2 text-brand-text transition-colors cursor-pointer"
          >
            Cancelar
          </button>
          <button
            type="submit"
            form="payment-form"
            disabled={loading}
            className="px-4 py-2 text-sm font-medium rounded-lg bg-brand-green hover:bg-brand-green-dark text-white transition-colors cursor-pointer disabled:opacity-50"
          >
            {loading ? 'Guardando...' : 'Registrar pago'}
          </button>
        </>
      }
    >
      <form id="payment-form" onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-[11px] font-medium text-brand-text2 uppercase tracking-wider mb-1.5">
            Inquilino *
          </label>
          <select
            value={tenantId}
            onChange={handleTenantChange}
            className="w-full px-3 py-2 border border-brand-border rounded-lg bg-brand-surface text-brand-text text-sm focus:outline-none focus:border-brand-green focus:ring-1 focus:ring-brand-green"
          >
            {tenants.map(t => (
              <option key={t.id} value={t.id}>
                {t.name} — {t.property_name || 'Sin asignar'} (${t.rent}/mes)
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-[11px] font-medium text-brand-text2 uppercase tracking-wider mb-1.5">
              Período (Mes) *
            </label>
            <input
              type="month"
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
              required
              className="w-full px-3 py-2 border border-brand-border rounded-lg bg-brand-surface text-brand-text text-sm focus:outline-none focus:border-brand-green focus:ring-1 focus:ring-brand-green font-mono"
            />
          </div>

          <div>
            <label className="block text-[11px] font-medium text-brand-text2 uppercase tracking-wider mb-1.5">
              Monto Pagado (USD) *
            </label>
            <input
              type="number"
              min="0"
              step="any"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="350"
              required
              className="w-full px-3 py-2 border border-brand-border rounded-lg bg-brand-surface text-brand-text text-sm focus:outline-none focus:border-brand-green focus:ring-1 focus:ring-brand-green font-mono"
            />
          </div>
        </div>

        <div>
          <label className="block text-[11px] font-medium text-brand-text2 uppercase tracking-wider mb-1.5">
            Fecha de pago *
          </label>
          <input
            type="date"
            value={paymentDate}
            onChange={(e) => setPaymentDate(e.target.value)}
            required
            className="w-full px-3 py-2 border border-brand-border rounded-lg bg-brand-surface text-brand-text text-sm focus:outline-none focus:border-brand-green focus:ring-1 focus:ring-brand-green font-mono"
          />
        </div>

        <div>
          <label className="block text-[11px] font-medium text-brand-text2 uppercase tracking-wider mb-1.5">
            Notas o comprobante (opcional)
          </label>
          <input
            type="text"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Ej: Transferencia bancaria, depósito en efectivo, abono parcial..."
            className="w-full px-3 py-2 border border-brand-border rounded-lg bg-brand-surface text-brand-text text-sm focus:outline-none focus:border-brand-green focus:ring-1 focus:ring-brand-green"
          />
        </div>
      </form>
    </Modal>
  );
}
