export const formatMoney = (n) => {
  if (n === null || n === undefined || isNaN(n)) return '$0';
  return '$' + Number(n).toLocaleString('es-SV', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
};

export const formatPeriod = (period) => {
  if (!period || typeof period !== 'string' || !period.includes('-')) return period || '';
  const [y, m] = period.split('-').map(Number);
  const monthNames = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
  return `${monthNames[m - 1] || m} ${y}`;
};

export const getInitials = (name) => {
  if (!name) return '??';
  return name
    .trim()
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map(w => w[0].toUpperCase())
    .join('');
};

export const formatDate = (dateStr) => {
  if (!dateStr) return '—';
  try {
    const parts = dateStr.split('-');
    if (parts.length === 3) {
      const d = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
      return d.toLocaleDateString('es-SV', { day: '2-digit', month: 'short', year: 'numeric' });
    }
    return dateStr;
  } catch {
    return dateStr;
  }
};
