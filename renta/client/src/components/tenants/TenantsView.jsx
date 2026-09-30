import React, { useState, useEffect } from 'react';
import Badge from '../common/Badge';
import TenantModal from './TenantModal';
import TenantDetailModal from './TenantDetailModal';
import {
  Users,
  Plus,
  Search,
  Eye,
  Edit,
  DollarSign
} from 'lucide-react';
import { api } from '../../services/api';
import { formatMoney, formatDate, getInitials } from '../../utils/formatters';
import { useApp } from '../../context/AppContext';

export default function TenantsView({ isModalOpen, setIsModalOpen }) {
  const { openGlobalPayModal } = useApp();
  const [tenants, setTenants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedTenant, setSelectedTenant] = useState(null);
  const [editingTenant, setEditingTenant] = useState(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  const fetchTenants = async () => {
    try {
      setLoading(true);
      const data = await api.tenants.getAll();
      setTenants(data);
    } catch (err) {
      console.error('Error cargando inquilinos:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTenants();
  }, []);

  const filtered = tenants.filter((t) => {
    const q = search.toLowerCase();
    return (
      t.name.toLowerCase().includes(q) ||
      (t.property_name && t.property_name.toLowerCase().includes(q)) ||
      (t.city && t.city.toLowerCase().includes(q)) ||
      (t.phone && t.phone.includes(q))
    );
  });

  const handleViewDetail = (t) => {
    setSelectedTenant(t);
    setIsDetailOpen(true);
  };

  const handleEdit = (t) => {
    setEditingTenant(t);
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-5 max-w-7xl mx-auto">
      {/* Barra superior de búsqueda y botón */}
      <div className="flex flex-col sm:flex-row gap-3 justify-between items-stretch sm:items-center">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-brand-text3" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por nombre, propiedad, ciudad o teléfono..."
            className="w-full pl-9 pr-3 py-2 border border-brand-border rounded-lg bg-brand-surface text-brand-text text-xs focus:outline-none focus:border-brand-green focus:ring-1 focus:ring-brand-green"
          />
        </div>

        <button
          onClick={() => {
            setEditingTenant(null);
            setIsModalOpen(true);
          }}
          className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-lg bg-brand-green hover:bg-brand-green-dark text-white text-xs font-medium transition-colors cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Agregar inquilino</span>
        </button>
      </div>

      {/* Tabla de Inquilinos */}
      <div className="bg-brand-surface border border-brand-border rounded-card overflow-hidden shadow-card">
        {loading ? (
          <div className="text-center py-16 text-brand-text3 text-sm">
            Cargando inquilinos...
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 text-brand-text3 p-8">
            <Users className="w-12 h-12 mx-auto text-brand-text3 mb-3 opacity-60" />
            <p className="text-sm font-medium">No se encontraron inquilinos</p>
            <p className="text-xs text-brand-text3 mt-1">
              {search ? 'Intenta con otro término de búsqueda' : 'Registra tu primer contrato de arrendamiento'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-brand-surface2 text-brand-text3 text-[11px] uppercase tracking-wider border-b border-brand-border">
                  <th className="py-3 px-4 font-medium">Inquilino</th>
                  <th className="py-3 px-4 font-medium">Propiedad</th>
                  <th className="py-3 px-4 font-medium">Renta</th>
                  <th className="py-3 px-4 font-medium">Próx. pago</th>
                  <th className="py-3 px-4 font-medium">Estado</th>
                  <th className="py-3 px-4 font-medium text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-border">
                {filtered.map((t) => {
                  const fin = t.financial || { status: 'ok', totalDebt: 0 };
                  const isOk = fin.status === 'ok';
                  const isLate = fin.status === 'late';

                  const avatarBg = isOk
                    ? 'bg-brand-green-light text-brand-green-dark'
                    : isLate
                    ? 'bg-brand-red-light text-brand-red'
                    : 'bg-brand-amber-light text-brand-amber';

                  return (
                    <tr key={t.id} className="hover:bg-brand-surface2/60 transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2.5">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center font-mono font-medium text-xs flex-shrink-0 ${avatarBg}`}>
                            {getInitials(t.name)}
                          </div>
                          <div>
                            <span className="font-medium text-brand-text block text-xs">{t.name}</span>
                            <span className="text-[10px] text-brand-text3">{t.country} · {t.city}</span>
                          </div>
                        </div>
                      </td>

                      <td className="py-3 px-4 text-brand-text2 font-medium">
                        {t.property_name || '—'}
                      </td>

                      <td className="py-3 px-4 font-mono font-medium text-brand-text">
                        {formatMoney(t.rent)}
                      </td>

                      <td className="py-3 px-4 text-brand-text2 font-mono">
                        {formatDate(fin.nextPaymentDate)}
                      </td>

                      <td className="py-3 px-4">
                        {isOk ? (
                          <Badge variant="green">Al día</Badge>
                        ) : isLate ? (
                          <Badge variant="red">− {formatMoney(fin.totalDebt)}</Badge>
                        ) : (
                          <Badge variant="amber">− {formatMoney(fin.totalDebt)}</Badge>
                        )}
                      </td>

                      <td className="py-3 px-4 text-right">
                        <div className="inline-flex items-center gap-1">
                          <button
                            onClick={() => handleViewDetail(t)}
                            title="Ver detalles"
                            className="p-1.5 rounded-lg text-brand-text2 hover:bg-brand-border transition-colors cursor-pointer"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleEdit(t)}
                            title="Editar contrato"
                            className="p-1.5 rounded-lg text-brand-text2 hover:bg-brand-border transition-colors cursor-pointer"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => openGlobalPayModal(t.id)}
                            title="Registrar pago"
                            className="p-1.5 rounded-lg text-brand-green hover:bg-brand-green-light transition-colors cursor-pointer"
                          >
                            <DollarSign className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modales */}
      <TenantModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        tenant={editingTenant}
        onSuccess={fetchTenants}
      />

      <TenantDetailModal
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        tenant={selectedTenant}
        onEdit={handleEdit}
        onOpenPay={openGlobalPayModal}
        onDeleteSuccess={fetchTenants}
      />
    </div>
  );
}
