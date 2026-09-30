import React, { useState, useEffect } from 'react';
import ReminderCard from './ReminderCard';
import ReminderEditModal from './ReminderEditModal';
import {
  Send,
  RefreshCw,
  Settings,
  Inbox
} from 'lucide-react';
import { api } from '../../services/api';
import { useApp } from '../../context/AppContext';

export default function RemindersView() {
  const { setCurPage, refreshRemindersCount, showToast } = useApp();
  const [reminders, setReminders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, unsent, sent
  const [editingReminder, setEditingReminder] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const fetchReminders = async () => {
    try {
      setLoading(true);
      const data = await api.reminders.getAll();
      setReminders(data);
      refreshRemindersCount();
    } catch (err) {
      console.error('Error cargando recordatorios:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReminders();
  }, []);

  const handleToggleSent = async (reminder, willMarkSent, channel = 'whatsapp') => {
    try {
      if (willMarkSent) {
        await api.reminders.markSent({
          keyId: reminder.keyId,
          tenantId: reminder.tenantId,
          period: reminder.period,
          type: reminder.type,
          channel
        });
        showToast('Recordatorio marcado como enviado');
      } else {
        await api.reminders.markUnsent({
          keyId: reminder.keyId
        });
        showToast('Recordatorio desmarcado');
      }
      fetchReminders();
    } catch (err) {
      showToast(err.message || 'Error al actualizar estado', 'error');
    }
  };

  const handleEdit = (reminder) => {
    setEditingReminder(reminder);
    setIsEditModalOpen(true);
  };

  const filtered = reminders.filter((r) => {
    if (filter === 'sent') return r.isSent;
    if (filter === 'unsent') return !r.isSent;
    return true;
  });

  const totalCount = reminders.length;
  const sentCount = reminders.filter((r) => r.isSent).length;
  const unsentCount = reminders.filter((r) => !r.isSent).length;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Controles superiores y métricas de recordatorios */}
      <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3">
        {/* Resumen numérico */}
        <div className="grid grid-cols-3 gap-3 w-full sm:w-auto">
          <div className="bg-brand-surface border border-brand-border rounded-lg px-4 py-2 text-center">
            <span className="text-[10px] uppercase text-brand-text3 font-medium block">Total</span>
            <span className="text-base font-mono font-medium text-brand-text">{totalCount}</span>
          </div>
          <div className="bg-brand-surface border border-brand-border rounded-lg px-4 py-2 text-center">
            <span className="text-[10px] uppercase text-brand-text3 font-medium block">Enviados</span>
            <span className="text-base font-mono font-medium text-brand-green">{sentCount}</span>
          </div>
          <div className="bg-brand-surface border border-brand-border rounded-lg px-4 py-2 text-center">
            <span className="text-[10px] uppercase text-brand-text3 font-medium block">Sin enviar</span>
            <span className={`text-base font-mono font-medium ${unsentCount > 0 ? 'text-brand-red' : 'text-brand-text'}`}>
              {unsentCount}
            </span>
          </div>
        </div>

        {/* Acciones */}
        <div className="flex items-center gap-2 justify-end">
          <button
            onClick={() => setCurPage('settings')}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-brand-border bg-brand-surface hover:bg-brand-surface2 text-brand-text text-xs font-medium transition-colors cursor-pointer"
          >
            <Settings className="w-4 h-4 text-brand-text3" />
            <span>Configurar</span>
          </button>

          <button
            onClick={fetchReminders}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-brand-green hover:bg-brand-green-dark text-white text-xs font-medium transition-colors cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Actualizar</span>
          </button>
        </div>
      </div>

      {/* Pestañas de Filtro */}
      <div className="flex bg-brand-surface2 p-1 rounded-lg border border-brand-border w-fit">
        {[
          { id: 'all', label: `Todos (${totalCount})` },
          { id: 'unsent', label: `Sin enviar (${unsentCount})` },
          { id: 'sent', label: `Enviados (${sentCount})` }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setFilter(tab.id)}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all cursor-pointer ${
              filter === tab.id
                ? 'bg-brand-surface text-brand-text shadow-sm'
                : 'text-brand-text2 hover:text-brand-text'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Lista de Tarjetas */}
      {loading ? (
        <div className="text-center py-16 text-brand-text3 text-sm">
          Calculando recordatorios para el mes en curso...
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-brand-text3 bg-brand-surface border border-brand-border rounded-card p-8">
          <Inbox className="w-12 h-12 mx-auto text-brand-text3 mb-3 opacity-60" />
          <p className="text-sm font-medium">No hay recordatorios en esta sección</p>
          <p className="text-xs text-brand-text3 mt-1">
            {filter === 'unsent'
              ? '¡Excelente! Todos los recordatorios han sido enviados.'
              : 'Verifica los criterios y fechas de vencimiento en Configuración.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map((reminder) => (
            <ReminderCard
              key={reminder.keyId}
              reminder={reminder}
              onEdit={handleEdit}
              onToggleSent={handleToggleSent}
            />
          ))}
        </div>
      )}

      {/* Modal de Edición y Envío */}
      <ReminderEditModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        reminder={editingReminder}
        onSendSuccess={fetchReminders}
      />
    </div>
  );
}
