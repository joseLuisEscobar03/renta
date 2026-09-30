import { db } from '../db.js';

export function getTenantMonths(tenant) {
  if (!tenant || !tenant.start_date) return [];
  const out = [];
  const parts = tenant.start_date.split('-');
  const sy = parseInt(parts[0], 10);
  const sm = parseInt(parts[1], 10);
  const now = new Date();
  
  let cur = new Date(sy, sm - 1, 1);
  const end = new Date(now.getFullYear(), now.getMonth(), 1);

  // Limitar a máximo 24 meses hacia atrás para consistencia
  while (cur <= end) {
    const y = cur.getFullYear();
    const m = String(cur.getMonth() + 1).padStart(2, '0');
    out.push(`${y}-${m}`);
    cur.setMonth(cur.getMonth() + 1);
  }
  return out;
}

export function getCurrentPeriod() {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  return `${y}-${m}`;
}

export async function getTenantFinancialStatus(tenantId) {
  const tenant = await db.queryOne('SELECT * FROM tenants WHERE id = ?', [tenantId]);
  if (!tenant) return { status: 'unknown', debt: 0, history: [] };

  const periods = getTenantMonths(tenant);
  const payments = await db.query('SELECT * FROM payments WHERE tenant_id = ?', [tenantId]);
  
  let totalDebt = 0;
  const history = periods.map(period => {
    const periodPayments = payments.filter(p => p.period === period);
    const paid = periodPayments.reduce((acc, p) => acc + Number(p.amount), 0);
    const rent = Number(tenant.rent);
    const balance = rent - paid;
    if (balance > 0) {
      totalDebt += balance;
    }
    
    let state = 'unpaid';
    if (paid >= rent) state = 'ok';
    else if (paid > 0) state = 'partial';

    return {
      period,
      rent,
      paid,
      balance: Math.max(0, balance),
      state
    };
  });

  const now = new Date();
  const currentPayDate = new Date(now.getFullYear(), now.getMonth(), tenant.payment_day || 1);
  const daysLate = (now > currentPayDate && totalDebt > 0) ? Math.floor((now - currentPayDate) / (1000 * 60 * 60 * 24)) : 0;

  let status = 'ok';
  if (totalDebt >= Number(tenant.rent) * 2) {
    status = 'late'; // mora crítica 2+ meses
  } else if (totalDebt > 0) {
    status = 'partial'; // pendiente o abono parcial
  }

  // Próximo pago
  const nextPay = new Date(now.getFullYear(), now.getMonth(), tenant.payment_day || 1);
  if (nextPay < now && status === 'ok') {
    nextPay.setMonth(nextPay.getMonth() + 1);
  }

  return {
    tenantId,
    rent: Number(tenant.rent),
    totalDebt,
    status,
    daysLate,
    nextPaymentDate: nextPay.toISOString().split('T')[0],
    history: history.slice(-6).reverse(),
    allPeriods: history
  };
}

export async function getDashboardStats() {
  const tenants = await db.query(`
    SELECT t.*, p.name as property_name 
    FROM tenants t 
    LEFT JOIN properties p ON t.property_id = p.id 
    WHERE t.status = 'active'
  `);

  const properties = await db.query('SELECT * FROM properties');
  const currentPeriod = getCurrentPeriod();

  const currentMonthPayments = await db.query(
    'SELECT * FROM payments WHERE period = ?',
    [currentPeriod]
  );

  const totalMonthlyRent = tenants.reduce((acc, t) => acc + Number(t.rent), 0);
  const collectedThisMonth = currentMonthPayments.reduce((acc, p) => acc + Number(p.amount), 0);
  const collectedPct = totalMonthlyRent > 0 ? Math.round((collectedThisMonth / totalMonthlyRent) * 100) : 0;

  let totalAccumulatedDebt = 0;
  const debtors = [];
  const pendingThisMonth = [];

  for (const tenant of tenants) {
    const fin = await getTenantFinancialStatus(tenant.id);
    totalAccumulatedDebt += fin.totalDebt;

    if (fin.totalDebt > 0) {
      debtors.push({
        id: tenant.id,
        name: tenant.name,
        propertyName: tenant.property_name || 'Sin asignar',
        phone: tenant.phone,
        email: tenant.email,
        rent: Number(tenant.rent),
        debt: fin.totalDebt,
        status: fin.status,
        daysLate: fin.daysLate
      });
    }

    // Pendientes este mes específico
    const monthPaid = currentMonthPayments
      .filter(p => p.tenant_id === tenant.id)
      .reduce((acc, p) => acc + Number(p.amount), 0);

    const rent = Number(tenant.rent);
    if (monthPaid < rent) {
      const remaining = rent - monthPaid;
      const pct = Math.round((monthPaid / rent) * 100);
      pendingThisMonth.push({
        id: tenant.id,
        name: tenant.name,
        propertyName: tenant.property_name || 'Sin asignar',
        rent,
        paid: monthPaid,
        remaining,
        percentage: pct,
        status: fin.status
      });
    }
  }

  // Ordenar deudores por mayor deuda primero
  debtors.sort((a, b) => b.debt - a.debt);

  const occupiedPropertyIds = new Set(tenants.map(t => t.property_id).filter(Boolean));
  const occupiedCount = properties.filter(p => occupiedPropertyIds.has(p.id)).length;

  return {
    totalMonthlyRent,
    collectedThisMonth,
    collectedPercentage: collectedPct,
    totalAccumulatedDebt,
    totalProperties: properties.length,
    occupiedProperties: occupiedCount,
    currentPeriod,
    pendingThisMonth,
    debtors
  };
}
