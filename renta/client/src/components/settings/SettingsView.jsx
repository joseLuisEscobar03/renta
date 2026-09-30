import React, { useState, useEffect } from 'react';
import { Clock, MessageSquare, Check, Sparkles } from 'lucide-react';
import { api } from '../../services/api';
import { useApp } from '../../context/AppContext';

export default function SettingsView() {
  const { setCurPage, setSettings: setGlobalSettings, showToast, refreshRemindersCount } = useApp();
  
  const [businessName, setBusinessName] = useState('');
  const [tone, setTone] = useState('amigable');
  const [on3days, setOn3days] = useState(true);
  const [onDue, setOnDue] = useState(true);
  const [onLate, setOnLate] = useState(true);
  const [onMulti, setOnMulti] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api.settings.get().then((data) => {
      setBusinessName(data.business_name || '');
      setTone(data.tone || 'amigable');
      setOn3days(Boolean(data.on_3days));
      setOnDue(Boolean(data.on_due));
      setOnLate(Boolean(data.on_late));
      setOnMulti(Boolean(data.on_multi));
    }).catch(console.error);
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      const payload = {
        business_name: businessName.trim() || 'Mi Negocio',
        tone,
        on_3days: on3days,
        on_due: onDue,
        on_late: onLate,
        on_multi: onMulti
      };

      const updated = await api.settings.update(payload);
      setGlobalSettings(updated);
      showToast('Configuración guardada correctamente');
      refreshRemindersCount();
      setCurPage('reminders');
    } catch (err) {
      showToast(err.message || 'Error guardando configuración', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto space-y-6">
      <form onSubmit={handleSave} className="space-y-6">
        {/* Reglas de Momento de Envío */}
        <div className="bg-brand-surface border border-brand-border rounded-card overflow-hidden shadow-card">
          <div className="px-5 py-3.5 border-b border-brand-border flex items-center gap-2">
            <Clock className="w-4 h-4 text-brand-green" />
            <h2 className="font-medium text-sm text-brand-text">Cuándo generar recordatorios</h2>
          </div>

          <div className="p-5 space-y-4 divide-y divide-brand-border">
            <div className="flex items-center justify-between pt-2 first:pt-0">
              <div>
                <span className="font-medium text-xs text-brand-text block">3 días antes del vencimiento</span>
                <span className="text-[11px] text-brand-text3">Aviso preventivo para pago puntual</span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={on3days}
                  onChange={(e) => setOn3days(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-brand-border peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-brand-green"></div>
              </label>
            </div>

            <div className="flex items-center justify-between pt-3">
              <div>
                <span className="font-medium text-xs text-brand-text block">El día que toca pagar</span>
                <span className="text-[11px] text-brand-text3">Aviso el mismo día de corte de cuota</span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={onDue}
                  onChange={(e) => setOnDue(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-brand-border peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-brand-green"></div>
              </label>
            </div>

            <div className="flex items-center justify-between pt-3">
              <div>
                <span className="font-medium text-xs text-brand-text block">Cuando el pago está atrasado</span>
                <span className="text-[11px] text-brand-text3">Aviso de mora con conteo de días transcurridos</span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={onLate}
                  onChange={(e) => setOnLate(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-brand-border peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-brand-green"></div>
              </label>
            </div>

            <div className="flex items-center justify-between pt-3">
              <div>
                <span className="font-medium text-xs text-brand-text block">Deuda de 2 o más meses</span>
                <span className="text-[11px] text-brand-text3">Aviso especial prioritario de deuda acumulada</span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={onMulti}
                  onChange={(e) => setOnMulti(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-brand-border peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-brand-green"></div>
              </label>
            </div>
          </div>
        </div>

        {/* Tono y Personalización de Firma */}
        <div className="bg-brand-surface border border-brand-border rounded-card overflow-hidden shadow-card">
          <div className="px-5 py-3.5 border-b border-brand-border flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-brand-green" />
            <h2 className="font-medium text-sm text-brand-text">Estilo del mensaje y firma</h2>
          </div>

          <div className="p-5 space-y-4">
            <div>
              <label className="block text-[11px] font-medium text-brand-text2 uppercase tracking-wider mb-1.5">
                Tono de comunicación
              </label>
              <select
                value={tone}
                onChange={(e) => setTone(e.target.value)}
                className="w-full px-3 py-2 border border-brand-border rounded-lg bg-brand-surface text-brand-text text-xs focus:outline-none focus:border-brand-green focus:ring-1 focus:ring-brand-green"
              >
                <option value="amigable">Amigable y cordial (con emojis y saludo cercano)</option>
                <option value="formal">Formal y profesional (tratamiento respetuoso de usted)</option>
                <option value="firme">Firme y directo (enfoque contractual puntual)</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-medium text-brand-text2 uppercase tracking-wider mb-1.5">
                Nombre de tu negocio o propietario (aparece al pie del mensaje)
              </label>
              <input
                type="text"
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                placeholder="Ej: Propiedades García, Inmobiliaria Central..."
                className="w-full px-3 py-2 border border-brand-border rounded-lg bg-brand-surface text-brand-text text-xs focus:outline-none focus:border-brand-green focus:ring-1 focus:ring-brand-green"
              />
            </div>
          </div>
        </div>

        {/* Botones de acción */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={() => setCurPage('reminders')}
            className="px-4 py-2 text-xs font-medium rounded-lg border border-brand-border bg-brand-surface hover:bg-brand-surface2 text-brand-text transition-colors cursor-pointer"
          >
            Cancelar
          </button>

          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-medium rounded-lg bg-brand-green hover:bg-brand-green-dark text-white transition-colors cursor-pointer disabled:opacity-50"
          >
            <Check className="w-4 h-4" />
            <span>{saving ? 'Guardando...' : 'Guardar configuración'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
