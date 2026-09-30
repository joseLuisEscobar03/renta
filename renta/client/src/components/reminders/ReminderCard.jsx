import React from 'react';
import Badge from '../common/Badge';
import {
  Send,
  Mail,
  Edit2,
  Check,
  RotateCcw,
  Clock
} from 'lucide-react';
import { formatMoney, getInitials, formatDate } from '../../utils/formatters';
import { useApp } from '../../context/AppContext';

export default function ReminderCard({ reminder, onEdit, onToggleSent }) {
  const { showToast } = useApp();

  const typeLabels = {
    soon: 'Vence pronto',
    due: 'Vence hoy',
    late: 'Pago atrasado',
    multi: 'Deuda acumulada'
  };

  const isSent = reminder.isSent;
  const isLate = reminder.type === 'late' || reminder.type === 'multi';
  const isDue = reminder.type === 'due';

  const borderClass = isSent
    ? 'border-l-4 border-l-brand-green'
    : isLate
    ? 'border-l-4 border-l-brand-red'
    : 'border-l-4 border-l-brand-amber';

  const avatarBg = isLate
    ? 'bg-brand-red-light text-brand-red'
    : isDue
    ? 'bg-brand-amber-light text-brand-amber'
    : 'bg-brand-green-light text-brand-green-dark';

  const handleWA = () => {
    if (!reminder.cleanPhone) {
      showToast('Este inquilino no tiene un número de WhatsApp registrado', 'error');
      return;
    }
    window.open(reminder.waUrl, '_blank');
    if (!isSent) {
      onToggleSent(reminder, true, 'whatsapp');
    }
  };

  const handleEmail = () => {
    if (!reminder.email) {
      showToast('Este inquilino no tiene un correo electrónico registrado', 'error');
      return;
    }
    window.open(reminder.mailtoUrl, '_blank');
    if (!isSent) {
      onToggleSent(reminder, true, 'email');
    }
  };

  return (
    <div className={`bg-brand-surface border border-brand-border rounded-card p-5 shadow-card transition-all ${borderClass}`}>
      {/* Cabecera de la tarjeta */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className={`w-9 h-9 rounded-full flex items-center justify-center font-mono font-medium text-xs flex-shrink-0 ${avatarBg}`}>
            {getInitials(reminder.tenantName)}
          </div>
          <div>
            <h3 className="font-medium text-sm text-brand-text leading-tight">{reminder.tenantName}</h3>
            <span className="text-[11px] text-brand-text3 block mt-0.5">
              {reminder.propertyName} · {formatMoney(reminder.rent)}/mes
              {reminder.daysLate > 0 && ` · ${reminder.daysLate} día(s) de mora`}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant={isLate ? 'red' : isDue ? 'amber' : 'blue'}>
            {typeLabels[reminder.type] || reminder.type}
          </Badge>
          {isSent && (
            <Badge variant="green" className="gap-1">
              <Check className="w-3 h-3" />
              <span>Enviado</span>
            </Badge>
          )}
        </div>
      </div>

      {/* Contenido del mensaje formateado */}
      <div className="bg-brand-surface2 rounded-lg p-3 text-xs leading-relaxed text-brand-text border border-brand-border font-sans whitespace-pre-wrap">
        {reminder.message}
      </div>

      {/* Marca de tiempo si ya fue enviado */}
      {isSent && reminder.sentAt && (
        <div className="flex items-center gap-1.5 text-[11px] text-brand-text3 mt-2 font-mono">
          <Clock className="w-3.5 h-3.5" />
          <span>Enviado el {formatDate(reminder.sentAt.split('T')[0])}</span>
        </div>
      )}

      {/* Barra de Acciones */}
      <div className="flex flex-wrap items-center gap-2 mt-4 pt-3 border-t border-brand-border">
        {/* WhatsApp */}
        <button
          onClick={handleWA}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-brand-wa hover:bg-brand-wa-hover text-white text-xs font-medium transition-colors cursor-pointer"
        >
          <Send className="w-3.5 h-3.5" />
          <span>WhatsApp</span>
        </button>

        {/* Correo */}
        <button
          onClick={handleEmail}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-blue-200 bg-brand-blue-light text-brand-blue hover:bg-blue-100 text-xs font-medium transition-colors cursor-pointer"
        >
          <Mail className="w-3.5 h-3.5" />
          <span>Correo</span>
        </button>

        {/* Editar */}
        <button
          onClick={() => onEdit(reminder)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-brand-border bg-brand-surface hover:bg-brand-surface2 text-brand-text text-xs font-medium transition-colors cursor-pointer"
        >
          <Edit2 className="w-3.5 h-3.5 text-brand-text2" />
          <span>Editar</span>
        </button>

        {/* Toggle Marcar/Desmarcar */}
        <div className="ml-auto">
          {!isSent ? (
            <button
              onClick={() => onToggleSent(reminder, true)}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-brand-green hover:bg-brand-green-light text-xs font-medium transition-colors cursor-pointer"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Marcar enviado</span>
            </button>
          ) : (
            <button
              onClick={() => onToggleSent(reminder, false)}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-brand-text3 hover:text-brand-text hover:bg-brand-surface2 text-xs font-medium transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Desmarcar</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
