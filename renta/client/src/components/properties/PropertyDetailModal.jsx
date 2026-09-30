import React from 'react';
import Modal from '../common/Modal';
import Badge from '../common/Badge';
import {
  Building2,
  Home,
  Store,
  Box,
  MapPin,
  CreditCard,
  FileText,
  Trash2,
  Edit,
  Users
} from 'lucide-react';
import { formatMoney, getInitials } from '../../utils/formatters';
import { api } from '../../services/api';
import { useApp } from '../../context/AppContext';

export default function PropertyDetailModal({ isOpen, onClose, property, onEdit, onDeleteSuccess }) {
  const { showToast } = useApp();
  if (!property) return null;

  const typeIcons = {
    Apartamento: Building2,
    Casa: Home,
    'Local comercial': Store,
    Bodega: Box,
    Habitación: Home,
    Terreno: MapPin
  };

  const Icon = typeIcons[property.type] || Building2;
  const isOccupied = property.tenants && property.tenants.length > 0;

  const handleDelete = async () => {
    if (isOccupied) {
      showToast('Esta propiedad tiene inquilinos asignados. Reasígnalos primero.', 'error');
      return;
    }

    if (!window.confirm(`¿Estás seguro de eliminar la propiedad "${property.name}"?`)) {
      return;
    }

    try {
      await api.properties.delete(property.id);
      showToast('Propiedad eliminada correctamente');
      if (onDeleteSuccess) onDeleteSuccess();
      onClose();
    } catch (err) {
      showToast(err.message || 'Error al eliminar propiedad', 'error');
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={property.name}
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
                onEdit(property);
              }}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-medium rounded-lg border border-brand-border bg-brand-surface hover:bg-brand-surface2 text-brand-text transition-colors cursor-pointer"
            >
              <Edit className="w-3.5 h-3.5" />
              <span>Editar</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-1.5 text-xs font-medium rounded-lg bg-brand-green hover:bg-brand-green-dark text-white transition-colors cursor-pointer"
            >
              Cerrar
            </button>
          </div>
        </div>
      }
    >
      <div className="space-y-4">
        {/* Cabecera con icono grande */}
        <div className="flex items-center gap-3.5 pb-4 border-b border-brand-border">
          <div className="w-12 h-12 rounded-xl bg-brand-green-light text-brand-green-dark flex items-center justify-center flex-shrink-0">
            <Icon className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-semibold text-base text-brand-text">{property.name}</h3>
            <span className="text-xs text-brand-text3">{property.type}</span>
            <div className="mt-1">
              <Badge variant={isOccupied ? 'green' : 'gray'}>
                {isOccupied ? 'Ocupada' : 'Disponible'}
              </Badge>
            </div>
          </div>
        </div>

        {/* Ficha de detalles */}
        <div className="space-y-2.5 text-xs">
          <div className="flex justify-between py-1.5 border-b border-brand-border">
            <span className="text-brand-text2 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-brand-text3" /> Dirección
            </span>
            <span className="font-medium text-brand-text text-right max-w-[65%]">
              {property.address}
            </span>
          </div>

          <div className="flex justify-between py-1.5 border-b border-brand-border">
            <span className="text-brand-text2 flex items-center gap-1.5">
              <CreditCard className="w-3.5 h-3.5 text-brand-text3" /> Renta base mensual
            </span>
            <span className="font-mono font-medium text-brand-green text-sm">
              {formatMoney(property.rent)}/mes
            </span>
          </div>

          {property.notes && (
            <div className="py-2 border-b border-brand-border">
              <span className="text-brand-text2 flex items-center gap-1.5 mb-1">
                <FileText className="w-3.5 h-3.5 text-brand-text3" /> Notas y condiciones
              </span>
              <p className="text-brand-text leading-relaxed bg-brand-surface2 p-2.5 rounded-lg border border-brand-border">
                {property.notes}
              </p>
            </div>
          )}
        </div>

        {/* Inquilinos asignados */}
        {isOccupied && (
          <div className="pt-2">
            <span className="text-[11px] font-medium text-brand-text3 uppercase tracking-wider block mb-2">
              Inquilinos asignados
            </span>
            <div className="space-y-2">
              {property.tenants.map((t) => (
                <div
                  key={t.id}
                  className="flex items-center justify-between p-2.5 rounded-lg bg-brand-surface2 border border-brand-border"
                >
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-brand-green-light text-brand-green-dark font-mono text-[11px] font-medium flex items-center justify-center">
                      {getInitials(t.name)}
                    </div>
                    <span className="font-medium text-xs text-brand-text">{t.name}</span>
                  </div>
                  <span className="font-mono text-xs font-medium text-brand-green">
                    {formatMoney(t.rent)}/mes
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}
