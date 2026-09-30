import React, { useState, useEffect } from 'react';
import Modal from '../common/Modal';
import { api } from '../../services/api';
import { useApp } from '../../context/AppContext';

export default function TenantModal({ isOpen, onClose, tenant = null, onSuccess }) {
  const { showToast, refreshRemindersCount } = useApp();
  const [properties, setProperties] = useState([]);
  
  const [name, setName] = useState('');
  const [dui, setDui] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [country, setCountry] = useState('El Salvador');
  const [city, setCity] = useState('San Salvador');
  const [propertyId, setPropertyId] = useState('');
  const [rent, setRent] = useState('');
  const [startDate, setStartDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [paymentDay, setPaymentDay] = useState(1);
  const [deposit, setDeposit] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      api.properties.getAll().then((data) => {
        setProperties(data);
        if (!tenant && data.length > 0 && !propertyId) {
          setPropertyId(data[0].id);
          setRent(data[0].rent);
        }
      }).catch(console.error);

      if (tenant) {
        setName(tenant.name || '');
        setDui(tenant.dui || '');
        setPhone(tenant.phone || '');
        setEmail(tenant.email || '');
        setCountry(tenant.country || 'El Salvador');
        setCity(tenant.city || 'San Salvador');
        setPropertyId(tenant.property_id || '');
        setRent(tenant.rent || '');
        setStartDate(tenant.start_date || new Date().toISOString().split('T')[0]);
        setPaymentDay(tenant.payment_day || 1);
        setDeposit(tenant.deposit || '');
        setNotes(tenant.notes || '');
      } else {
        setName('');
        setDui('');
        setPhone('');
        setEmail('');
        setCountry('El Salvador');
        setCity('San Salvador');
        setDeposit('');
        setNotes('');
        setPaymentDay(1);
      }
    }
  }, [tenant, isOpen]);

  const handlePropertyChange = (e) => {
    const pid = e.target.value;
    setPropertyId(pid);
    const found = properties.find((p) => p.id === pid);
    if (found && !tenant) {
      setRent(found.rent);
      setDeposit(found.rent);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim() || !rent || !startDate) {
      showToast('Nombre, teléfono WhatsApp, renta y fecha de inicio son requeridos', 'error');
      return;
    }

    try {
      setLoading(true);
      const payload = {
        name: name.trim(),
        dui: dui.trim(),
        phone: phone.replace(/\D/g, ''),
        email: email.trim(),
        country,
        city: city.trim(),
        property_id: propertyId || null,
        rent: Number(rent),
        start_date: startDate,
        payment_day: Number(paymentDay) || 1,
        deposit: Number(deposit) || 0,
        notes: notes.trim()
      };

      if (tenant?.id) {
        await api.tenants.update(tenant.id, payload);
        showToast('Inquilino actualizado correctamente');
      } else {
        await api.tenants.create(payload);
        showToast('Inquilino registrado correctamente');
      }

      refreshRemindersCount();
      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      showToast(err.message || 'Error guardando inquilino', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={tenant ? 'Editar inquilino' : 'Agregar inquilino'}
      maxWidth="max-w-xl"
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
            form="tenant-form"
            disabled={loading}
            className="px-4 py-2 text-sm font-medium rounded-lg bg-brand-green hover:bg-brand-green-dark text-white transition-colors cursor-pointer disabled:opacity-50"
          >
            {loading ? 'Guardando...' : tenant ? 'Guardar cambios' : 'Guardar inquilino'}
          </button>
        </>
      }
    >
      <form id="tenant-form" onSubmit={handleSubmit} className="space-y-3.5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-[11px] font-medium text-brand-text2 uppercase tracking-wider mb-1">
              Nombre completo *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ej: María García"
              className="w-full px-3 py-2 border border-brand-border rounded-lg bg-brand-surface text-brand-text text-xs focus:outline-none focus:border-brand-green focus:ring-1 focus:ring-brand-green"
            />
          </div>

          <div>
            <label className="block text-[11px] font-medium text-brand-text2 uppercase tracking-wider mb-1">
              DUI / Documento de identidad
            </label>
            <input
              type="text"
              value={dui}
              onChange={(e) => setDui(e.target.value)}
              placeholder="00000000-0"
              className="w-full px-3 py-2 border border-brand-border rounded-lg bg-brand-surface text-brand-text text-xs focus:outline-none focus:border-brand-green focus:ring-1 focus:ring-brand-green font-mono"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-[11px] font-medium text-brand-text2 uppercase tracking-wider mb-1">
              Teléfono WhatsApp * <span className="text-[10px] text-brand-text3">(ej: 50371234567)</span>
            </label>
            <input
              type="text"
              required
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
              placeholder="correo@ejemplo.com"
              className="w-full px-3 py-2 border border-brand-border rounded-lg bg-brand-surface text-brand-text text-xs focus:outline-none focus:border-brand-green focus:ring-1 focus:ring-brand-green"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-[11px] font-medium text-brand-text2 uppercase tracking-wider mb-1">
              País de origen
            </label>
            <select
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              className="w-full px-3 py-2 border border-brand-border rounded-lg bg-brand-surface text-brand-text text-xs focus:outline-none focus:border-brand-green focus:ring-1 focus:ring-brand-green"
            >
              <option>El Salvador</option>
              <option>Guatemala</option>
              <option>Honduras</option>
              <option>Nicaragua</option>
              <option>Costa Rica</option>
              <option>México</option>
              <option>Colombia</option>
              <option>Venezuela</option>
              <option>Estados Unidos</option>
              <option>Otro</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-medium text-brand-text2 uppercase tracking-wider mb-1">
              Ciudad / Municipio
            </label>
            <input
              type="text"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder="San Salvador"
              className="w-full px-3 py-2 border border-brand-border rounded-lg bg-brand-surface text-brand-text text-xs focus:outline-none focus:border-brand-green focus:ring-1 focus:ring-brand-green"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-[11px] font-medium text-brand-text2 uppercase tracking-wider mb-1">
              Propiedad asignada *
            </label>
            <select
              value={propertyId}
              onChange={handlePropertyChange}
              required
              className="w-full px-3 py-2 border border-brand-border rounded-lg bg-brand-surface text-brand-text text-xs focus:outline-none focus:border-brand-green focus:ring-1 focus:ring-brand-green"
            >
              <option value="">Selecciona una propiedad</option>
              {properties.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.type})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-medium text-brand-text2 uppercase tracking-wider mb-1">
              Renta mensual pactada (USD) *
            </label>
            <input
              type="number"
              min="0"
              required
              value={rent}
              onChange={(e) => setRent(e.target.value)}
              placeholder="380"
              className="w-full px-3 py-2 border border-brand-border rounded-lg bg-brand-surface text-brand-text text-xs focus:outline-none focus:border-brand-green focus:ring-1 focus:ring-brand-green font-mono"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-[11px] font-medium text-brand-text2 uppercase tracking-wider mb-1">
              Inicio contrato *
            </label>
            <input
              type="date"
              required
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-3 py-2 border border-brand-border rounded-lg bg-brand-surface text-brand-text text-xs focus:outline-none focus:border-brand-green focus:ring-1 focus:ring-brand-green font-mono"
            />
          </div>

          <div>
            <label className="block text-[11px] font-medium text-brand-text2 uppercase tracking-wider mb-1">
              Día de corte (1 al 28) *
            </label>
            <input
              type="number"
              min="1"
              max="28"
              required
              value={paymentDay}
              onChange={(e) => setPaymentDay(e.target.value)}
              className="w-full px-3 py-2 border border-brand-border rounded-lg bg-brand-surface text-brand-text text-xs focus:outline-none focus:border-brand-green focus:ring-1 focus:ring-brand-green font-mono"
            />
          </div>

          <div>
            <label className="block text-[11px] font-medium text-brand-text2 uppercase tracking-wider mb-1">
              Depósito de garantía (USD)
            </label>
            <input
              type="number"
              min="0"
              value={deposit}
              onChange={(e) => setDeposit(e.target.value)}
              placeholder="380"
              className="w-full px-3 py-2 border border-brand-border rounded-lg bg-brand-surface text-brand-text text-xs focus:outline-none focus:border-brand-green focus:ring-1 focus:ring-brand-green font-mono"
            />
          </div>
        </div>

        <div>
          <label className="block text-[11px] font-medium text-brand-text2 uppercase tracking-wider mb-1">
            Notas del inquilino (referencias, condiciones especiales)
          </label>
          <textarea
            rows="2"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Referencias laborales, fiador, cláusulas particulares..."
            className="w-full px-3 py-2 border border-brand-border rounded-lg bg-brand-surface text-brand-text text-xs focus:outline-none focus:border-brand-green focus:ring-1 focus:ring-brand-green"
          />
        </div>
      </form>
    </Modal>
  );
}
