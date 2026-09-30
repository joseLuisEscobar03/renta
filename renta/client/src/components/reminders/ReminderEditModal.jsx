import React, { useState, useEffect } from 'react';
import Modal from '../common/Modal';
import Badge from '../common/Badge';
import { Phone, Mail, Send } from 'lucide-react';
import { formatMoney, getInitials } from '../../utils/formatters';
import { api } from '../../services/api';
import { useApp } from '../../context/AppContext';

export default function ReminderEditModal({ isOpen, onClose, reminder, onSendSuccess }) {
  const { showToast, refreshRemindersCount } = useApp();
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (reminder) {
      setPhone(reminder.phone || '');
      setEmail(reminder.email || '');
      setMessage(reminder.message || '');
    }
  }, [reminder, isOpen]);

  if (!reminder) return null;

  const typeLabels = {
    soon: 'Vence pronto',
    due: 'Vence hoy',
    late: 'Pago atrasado',
    multi: 'Deuda acumulada'
  };

  const handleSendWA = async () => {
    const cleanPhone = phone.replace(/\D/g, '');
    if (!cleanPhone) {
      showToast('Ingresa un número de WhatsApp válido', 'error');
      return;
    }

    try {
      setSaving(true);
      await api.reminders.saveCustom({
        keyId: reminder.keyId,
        tenantId: reminder.tenantId,
        period: reminder.period,
        type: reminder.type,
        customMessage: message
      });

      await api.reminders.markSent({
        keyId: reminder.keyId,
        tenantId: reminder.tenantId,
        period: reminder.period,
        type: reminder.type,
        channel: 'whatsapp',
        customMessage: message
      });

      const url = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
      window.open(url, '_blank');

      showToast('Mensaje de WhatsApp abierto y marcado como enviado');
      refreshRemindersCount();
      if (onSendSuccess) onSendSuccess();
      onClose();
    } catch (err) {
      showToast(err.message || 'Error al procesar envío', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleSendEmail = async () => {
    if (!email) {
      showToast('Ingresa un correo electrónico válido', 'error');
      return;
    }

    try {
      setSaving(true);
      await api.reminders.saveCustom({
        keyId: reminder.keyId,
        tenantId: reminder.tenantId,
        period: reminder.period,
        type: reminder.type,
        customMessage: message
      });

      await api.reminders.markSent({
        keyId: reminder.keyId,
        tenantId: reminder.tenantId,
        period: reminder.period,
        type: reminder.type,
        channel: 'email',
        customMessage: message
      });

      const sub = encodeURIComponent('Recordatorio de pago de alquiler');
      const body = encodeURIComponent(message);
      window.open(`mailto:${email}?subject=${sub}&body=${body}`, '_blank');

      showToast('Correo preparado y marcado como enviado');
      refreshRemindersCount();
      if (onSendSuccess) onSendSuccess();
      onClose();
    } catch (err) {
      showToast(err.message || 'Error al procesar envío', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Editar y enviar recordatorio"
      maxWidth="max-w-xl"
      footer={
        <div className="flex items-center justify-between w-full">
          <button
            type="button"
            onClick={onClose}
            className="px-3.5 py-2 text-xs font-medium rounded-lg border border-brand-border bg-brand-surface hover:bg-brand-surface2 text-brand-text transition-colors cursor-pointer"
          >
            Cancelar
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={saving}
              onClick={handleSendEmail}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg border border-blue-200 bg-brand-blue-light text-brand-blue hover:bg-blue-100 transition-colors cursor-pointer"
            >
              <Mail className="w-3.5 h-3.5" />
              <span>Enviar correo</span>
            </button>

            <button
              type="button"
              disabled={saving}
              onClick={handleSendWA}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium rounded-lg bg-brand-wa hover:bg-brand-wa-hover text-white transition-colors cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Enviar WhatsApp</span>
            </button>
          </div>
        </div>
      }
    >
      <div className="space-y-4">
        {/* Cabecera del Inquilino */}
        <div className="flex items-center gap-3 p-3 rounded-lg bg-brand-surface2 border border-brand-border">
          <div className="w-10 h-10 rounded-full bg-brand-green-light text-brand-green-dark font-mono font-medium text-xs flex items-center justify-center flex-shrink-0">
            {getInitials(reminder.tenantName)}
          </div>
          <div className="flex-1">
            <span className="font-medium text-xs text-brand-text block">{reminder.tenantName}</span>
            <span className="text-[11px] text-brand-text3">
              {reminder.propertyName} · {formatMoney(reminder.rent)}/mes
            </span>
          </div>
          <Badge variant={reminder.type === 'late' || reminder.type === 'multi' ? 'red' : 'amber'}>
            {typeLabels[reminder.type] || reminder.type}
          </Badge>
        </div>

        {/* Canales de envío */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-[11px] font-medium text-brand-text2 uppercase tracking-wider mb-1">
              WhatsApp (formato internacional)
            </label>
            <input
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="50371234567"
              className="w-full px-3 py-2 border border-brand-border rounded-lg bg-brand-surface text-brand-text text-xs focus:outline-none focus:border-brand-green focus:ring-1 focus:ring-brand-green font-mono"
            />
          </div>

          <div>
            <label className="block text-[11px] font-medium text-brand-text2 uppercase tracking-wider mb-1">
              Correo electrónico
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="inquilino@email.com"
              className="w-full px-3 py-2 border border-brand-border rounded-lg bg-brand-surface text-brand-text text-xs focus:outline-none focus:border-brand-green focus:ring-1 focus:ring-brand-green"
            />
          </div>
        </div>

        {/* Mensaje editable */}
        <div>
          <label className="block text-[11px] font-medium text-brand-text2 uppercase tracking-wider mb-1">
            Mensaje de cobranza (editable)
          </label>
          <textarea
            rows="6"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="w-full p-3 border border-brand-border rounded-lg bg-brand-surface text-brand-text text-xs leading-relaxed font-mono focus:outline-none focus:border-brand-green focus:ring-1 focus:ring-brand-green"
          />
          <p className="text-[10px] text-brand-text3 mt-1">
            Puedes personalizar este texto antes del envío. Los cambios se guardarán automáticamente para este inquilino.
          </p>
        </div>
      </div>
    </Modal>
  );
}
