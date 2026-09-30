import React from 'react';
import Modal from '../common/Modal';
import Badge from '../common/Badge';
import {
  Phone,
  Mail,
  MapPin,
  Building,
  CreditCard,
  Calendar,
  ShieldCheck,
  FileText,
  Trash2,
  Edit,
  Plus
} from 'lucide-react';
import { formatMoney, formatPeriod, getInitials } from '../../utils/formatters';
import { api } from '../../services/api';
import { useApp } from '../../context/AppContext';

export default function TenantDetailModal({
  isOpen,
  onClose,
  tenant,
  onEdit,
  onOpenPay,
  onDeleteSuccess
}) {
  const { showToast, refreshRemindersCount } = useApp();
  if (!tenant) return null;

  const fin = tenant.financial || { status: 'ok', totalDebt: 0, history: [] };
  const isOk = fin.status === 'ok';
  const isLate = fin.status === 'late';

  const avatarColorClasses = isOk
    ? 'bg-brand-green-light text-brand-green-dark'
    : isLate
    ? 'bg-brand-red-light text-brand-red'
    : 'bg-brand-amber-light text-brand-amber';

  const statusBadgeVariant = isOk ? 'green' : isLate ? 'red' : 'amber';
  const statusLabel = isOk ? 'Al día' : isLate ? 'Atrasado' : 'Deuda parcial';

  const handleDelete = async () => {
    if (!window.confirm(`¿Estás seguro de eliminar al inquilino "${tenant.name}" y su historial de pagos?`)) {
      return;
    }

    try {
      await api.tenants.delete(tenant.id);
      showToast('Inquilino y pagos eliminados correctamente');
      refreshRemindersCount();
      if (onDeleteSuccess) onDeleteSuccess();
      onClose();
    } catch (err) {
      showToast(err.message || 'Error eliminando inquilino', 'error');
    }
  };

  const cleanPhone = (tenant.phone || '').replace(/\D/g, '');

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={tenant.name}
      maxWidth="max-w-xl"
      footer={
        <div className="flex items-center justify-between w-full">
          <button
            type="button"
            onClick={handleDelete}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg text-brand-red bg-white border border-red-200 hover:bg-brand-red-light transition-colors cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Eliminar</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                onClose();
                onEdit(tenant);
              }}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-medium rounded-lg border border-brand-border bg-brand-surface hover:bg-brand-surface2 text-brand-text transition-colors cursor-pointer"
            >
              <Edit className="w-3.5 h-3.5" />
              <span>Editar</span>
            </button>
            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenPay(tenant.id);
              }}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-medium rounded-lg bg-brand-green hover:bg-brand-green-dark text-white transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Registrar pago</span>
            </button>
          </div>
        </div>
      }
    >
      <div className="space-y-4">
        {/* Header con Avatar, Estado y Deuda */}
        <div className="flex items-center gap-4 pb-4 border-b border-brand-border">
          <div className={`w-14 h-14 rounded-full flex items-center justify-center font-mono font-medium text-lg flex-shrink-0 ${avatarColorClasses}`}>
            {getInitials(tenant.name)}
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-base text-brand-text leading-tight">{tenant.name}</h3>
            <span className="text-xs text-brand-text3 block mt-0.5">
              {tenant.dui ? `DUI: ${tenant.dui}` : 'Sin DUI registrado'}
            </span>
            <div className="flex items-center gap-2 mt-2">
              <Badge variant={statusBadgeVariant}>{statusLabel}</Badge>
              {fin.totalDebt > 0 && (
                <span className="font-mono text-xs font-semibold text-brand-red">
                  − {formatMoney(fin.totalDebt)}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Ficha de datos de contacto y contrato */}
        <div className="space-y-2 text-xs">
          <div className="flex items-center justify-between py-1.5 border-b border-brand-border">
            <span className="text-brand-text2 flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5 text-brand-text3" /> WhatsApp
            </span>
            <a
              href={`https://wa.me/${cleanPhone}`}
              target="_blank"
              rel="noopener noreferrer"
              className="font-mono font-medium text-brand-wa hover:underline"
            >
              +{tenant.phone}
            </a>
          </div>

          <div className="flex items-center justify-between py-1.5 border-b border-brand-border">
            <span className="text-brand-text2 flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-brand-text3" /> Correo
            </span>
            <span className="font-medium text-brand-text">{tenant.email || '—'}</span>
          </div>

          <div className="flex items-center justify-between py-1.5 border-b border-brand-border">
            <span className="text-brand-text2 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-brand-text3" /> Ubicación
            </span>
            <span className="font-medium text-brand-text">{tenant.country} · {tenant.city}</span>
          </div>

          <div className="flex items-center justify-between py-1.5 border-b border-brand-border">
            <span className="text-brand-text2 flex items-center gap-1.5">
              <Building className="w-3.5 h-3.5 text-brand-text3" /> Propiedad
            </span>
            <span className="font-medium text-brand-text">{tenant.property_name || 'Sin asignar'}</span>
          </div>

          <div className="flex items-center justify-between py-1.5 border-b border-brand-border">
            <span className="text-brand-text2 flex items-center gap-1.5">
              <CreditCard className="w-3.5 h-3.5 text-brand-text3" /> Renta mensual pactada
            </span>
            <span className="font-mono font-medium text-brand-green text-sm">{formatMoney(tenant.rent)}</span>
          </div>

          <div className="flex items-center justify-between py-1.5 border-b border-brand-border">
            <span className="text-brand-text2 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-brand-text3" /> Día de corte
            </span>
            <span className="font-medium text-brand-text">Día {tenant.payment_day} de cada mes</span>
          </div>

          <div className="flex items-center justify-between py-1.5 border-b border-brand-border">
            <span className="text-brand-text2 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-brand-text3" /> Depósito en garantía
            </span>
            <span className="font-mono font-medium text-brand-text">{formatMoney(tenant.deposit || 0)}</span>
          </div>

          {tenant.notes && (
            <div className="py-2 border-b border-brand-border">
              <span className="text-brand-text2 flex items-center gap-1.5 mb-1">
                <FileText className="w-3.5 h-3.5 text-brand-text3" /> Notas
              </span>
              <p className="text-brand-text bg-brand-surface2 p-2.5 rounded-lg border border-brand-border">
                {tenant.notes}
              </p>
            </div>
          )}
        </div>

        {/* Historial de los últimos 6 meses */}
        <div className="pt-2">
          <span className="text-[11px] font-medium text-brand-text3 uppercase tracking-wider block mb-2">
            Historial de pagos (últimos 6 meses)
          </span>
          <div className="bg-brand-surface2 rounded-lg border border-brand-border overflow-hidden">
            {fin.history && fin.history.length > 0 ? (
              <div className="divide-y divide-brand-border">
                {fin.history.map((h) => (
                  <div key={h.period} className="flex items-center justify-between px-3 py-2 text-xs">
                    <span className="font-medium text-brand-text">{formatPeriod(h.period)}</span>
                    <div className="flex items-center gap-2 font-mono">
                      <span
                        className={
                          h.state === 'ok'
                            ? 'text-brand-green font-medium'
                            : h.state === 'partial'
                            ? 'text-brand-amber font-medium'
                            : 'text-brand-red font-medium'
                        }
                      >
                        {formatMoney(h.paid)} / {formatMoney(h.rent)}
                      </span>
                      <span>{h.state === 'ok' ? '✅' : h.state === 'partial' ? '⚠️' : '❌'}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-4 text-center text-brand-text3 text-xs">
                Sin pagos registrados aún en este contrato
              </div>
            )}
          </div>
        </div>
      </div>
    </Modal>
  );
}
