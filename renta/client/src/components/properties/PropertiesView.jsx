import React, { useState, useEffect } from 'react';
import Badge from '../common/Badge';
import PropertyModal from './PropertyModal';
import PropertyDetailModal from './PropertyDetailModal';
import {
  Building2,
  Home,
  Store,
  Box,
  MapPin,
  Plus,
  Search,
  Building
} from 'lucide-react';
import { api } from '../../services/api';
import { formatMoney } from '../../utils/formatters';

export default function PropertiesView({ isModalOpen, setIsModalOpen }) {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [editingProperty, setEditingProperty] = useState(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  const fetchProperties = async () => {
    try {
      setLoading(true);
      const data = await api.properties.getAll();
      setProperties(data);
    } catch (err) {
      console.error('Error cargando propiedades:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProperties();
  }, []);

  const typeIcons = {
    Apartamento: Building2,
    Casa: Home,
    'Local comercial': Store,
    Bodega: Box,
    Habitación: Home,
    Terreno: MapPin
  };

  const filtered = properties.filter((p) => {
    const q = search.toLowerCase();
    return p.name.toLowerCase().includes(q) || p.address.toLowerCase().includes(q) || p.type.toLowerCase().includes(q);
  });

  const handleCardClick = (p) => {
    setSelectedProperty(p);
    setIsDetailOpen(true);
  };

  const handleEditClick = (p) => {
    setEditingProperty(p);
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-5 max-w-7xl mx-auto">
      {/* Barra de Búsqueda y Botón */}
      <div className="flex flex-col sm:flex-row gap-3 justify-between items-stretch sm:items-center">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-brand-text3" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por nombre, dirección o tipo..."
            className="w-full pl-9 pr-3 py-2 border border-brand-border rounded-lg bg-brand-surface text-brand-text text-xs focus:outline-none focus:border-brand-green focus:ring-1 focus:ring-brand-green"
          />
        </div>

        <button
          onClick={() => {
            setEditingProperty(null);
            setIsModalOpen(true);
          }}
          className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-lg bg-brand-green hover:bg-brand-green-dark text-white text-xs font-medium transition-colors cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Agregar propiedad</span>
        </button>
      </div>

      {/* Grid de Propiedades */}
      {loading ? (
        <div className="text-center py-16 text-brand-text3 text-sm">
          Cargando propiedades...
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-brand-text3 bg-brand-surface border border-brand-border rounded-card p-8">
          <Building className="w-12 h-12 mx-auto text-brand-text3 mb-3 opacity-60" />
          <p className="text-sm font-medium">No se encontraron propiedades</p>
          <p className="text-xs text-brand-text3 mt-1">
            {search ? 'Intenta con otro término de búsqueda' : 'Comienza registrando tu primer inmueble'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filtered.map((p) => {
            const Icon = typeIcons[p.type] || Building2;
            const isOccupied = p.isOccupied;

            return (
              <div
                key={p.id}
                onClick={() => handleCardClick(p)}
                className="bg-brand-surface border border-brand-border hover:border-brand-green rounded-card p-4 shadow-card hover:shadow-md transition-all cursor-pointer flex flex-col justify-between"
              >
                <div>
                  <div className="w-10 h-10 rounded-xl bg-brand-green-light text-brand-green-dark flex items-center justify-center mb-3">
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="font-medium text-sm text-brand-text line-clamp-1">{p.name}</h3>
                  <p className="text-[11px] text-brand-text3 mt-0.5 line-clamp-1">{p.address}</p>
                </div>

                <div className="mt-4 pt-3 border-t border-brand-border">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-sm font-medium text-brand-green">
                      {formatMoney(p.rent)}/mes
                    </span>
                    <Badge variant={isOccupied ? 'green' : 'gray'}>
                      {isOccupied ? 'Ocupada' : 'Disponible'}
                    </Badge>
                  </div>

                  {isOccupied && (
                    <div className="text-[11px] text-brand-text3 mt-2 line-clamp-1">
                      {p.tenants.map((t) => t.name).join(', ')}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modales */}
      <PropertyModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        property={editingProperty}
        onSuccess={fetchProperties}
      />

      <PropertyDetailModal
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        property={selectedProperty}
        onEdit={handleEditClick}
        onDeleteSuccess={fetchProperties}
      />
    </div>
  );
}
