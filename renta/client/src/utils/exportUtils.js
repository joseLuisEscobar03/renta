export function exportPaymentsToExcel(payments) {
  if (!payments || payments.length === 0) {
    alert('No hay datos para exportar');
    return;
  }

  const headers = [
    'Inquilino',
    'Propiedad',
    'Período',
    'Renta ($)',
    'Pagado ($)',
    'Saldo Pendiente ($)',
    'Estado'
  ];

  const rows = payments.map(p => [
    `"${(p.tenantName || '').replace(/"/g, '""')}"`,
    `"${(p.propertyName || '').replace(/"/g, '""')}"`,
    `"${p.period || ''}"`,
    p.rent || 0,
    p.paid || 0,
    p.balance || 0,
    `"${p.status === 'paid' ? 'Pagado' : p.status === 'late' ? 'Atrasado' : 'Pendiente'}"`
  ]);

  // UTF-8 BOM (\uFEFF) para que Excel reconozca tildes y caracteres en español automáticamente
  const csvContent = '\uFEFF' + [
    headers.join(';'),
    ...rows.map(r => r.join(';'))
  ].join('\r\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  const dateStr = new Date().toISOString().split('T')[0];
  
  link.setAttribute('href', url);
  link.setAttribute('download', `reporte_pagos_rentafacil_${dateStr}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
