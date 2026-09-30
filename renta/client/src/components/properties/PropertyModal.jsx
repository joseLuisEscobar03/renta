import React, { useState, useEffect } from 'react';
import Modal from '../common/Modal';
import { api } from '../../services/api';
import { useApp } from '../../context/AppContext';

export default function PropertyModal({ isOpen, onClose, property = null, onSuccess }) {
  const { showToast } = useApp();
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [type, setType] = useState('Apartamento');
  const [rent, setRent] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (property) {
      setName(property.name || '');
      setAddress(property.address || '');
      setType(property.type || 'Apartamento');
      setRent(property.rent || '');
      setNotes(property.notes || '');
    } else {
      setName('');
      setAddress('');
      setType('Apartamento');
      setRent('');
      setNotes('');
    }
  }, [property, isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim() || !address.trim()) {
      showToast('El nombre y la dirección son obligatorios', 'error');
      return;
    }

    try {
      setLoading(true);
      const payload = {
        name: name.trim(),
        address: address.trim(),
        type,
        rent: Number(rent) || 0,
        notes: notes.trim()
      };

      if (property?.id) {
        await api.properties.update(property.id, payload);
        showToast('Propiedad actualizada correctamente');
      } else {
        await api.properties.create(payload);
        showToast('Propiedad agregada correctamente');
      }

      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      showToast(err.message || 'Error guardando propiedad', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={property ? 'Editar propiedad' : 'Agregar propiedad'}
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
            form="property-form"
            disabled={loading}
            className="px-4 py-2 text-sm font-medium rounded-lg bg-brand-green hover:bg-brand-green-dark text-white transition-colors cursor-pointer disabled:opacity-50"
          >
            {loading ? 'Guardando...' : property ? 'Guardar cambios' : 'Guardar propiedad'}
          </button>
        </>
      }
    >
      <form id="property-form" onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-[11px] font-medium text-brand-text2 uppercase tracking-wider mb-1.5">
            Nombre de la propiedad *
          </label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ej: Apartamento 2B, Residencial Las Rosas..."
            className="w-full px-3 py-2 border border-brand-border rounded-lg bg-brand-surface text-brand-text text-sm focus:outline-none focus:border-brand-green focus:ring-1 focus:ring-brand-green"
          />
        </div>

        <div>
          <label className="block text-[11px] font-medium text-brand-text2 uppercase tracking-wider mb-1.5">
            Dirección completa *
          </label>
          <input
            type="text"
            required
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="Calle, colonia, municipio, departamento..."
            className="w-full px-3 py-2 border border-brand-border rounded-lg bg-brand-surface text-brand-text text-sm focus:outline-none focus:border-brand-green focus:ring-1 focus:ring-brand-green"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-[11px] font-medium text-brand-text2 uppercase tracking-wider mb-1.5">
              Tipo de inmueble
            </label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="w-full px-3 py-2 border border-brand-border rounded-lg bg-brand-surface text-brand-text text-sm focus:outline-none focus:border-brand-green focus:ring-1 focus:ring-brand-green"
            >
              <option value="Apartamento">Apartamento</option>
              <option value="Casa">Casa</option>
              <option value="Habitación">Habitación</option>
              <option value="Local comercial">Local comercial</option>
              <option value="Bodega">Bodega</option>
              <option value="Terreno">Terreno</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-medium text-brand-text2 uppercase tracking-wider mb-1.5">
              Renta base (USD)
            </label>
            <input
              type="number"
              min="0"
              value={rent}
              onChange={(e) => setRent(e.target.value)}
              placeholder="380"
              className="w-full px-3 py-2 border border-brand-border rounded-lg bg-brand-surface text-brand-text text-sm focus:outline-none focus:border-brand-green focus:ring-1 focus:ring-brand-green font-mono"
            />
          </div>
        </div>

        <div>
          <label className="block text-[11px] font-medium text-brand-text2 uppercase tracking-wider mb-1.5">
            Notas y características
          </label>
          <textarea
            rows="3"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Servicios incluidos (agua, luz, vigilancia), condiciones particulares..."
            className="w-full px-3 py-2 border border-brand-border rounded-lg bg-brand-surface text-brand-text text-sm focus:outline-none focus:border-brand-green focus:ring-1 focus:ring-brand-green"
          />
        </div>
      </form>
    </Modal>
  );
}
