import { Router } from 'express';
import { db } from '../db.js';
import { getTenantMonths } from '../services/financeService.js';

const router = Router();

router.get('/ledger', async (req, res) => {
  const { filter } = req.query;

  try {
    const tenants = await db.query(`
      SELECT t.*, p.name as property_name
      FROM tenants t
      LEFT JOIN properties p ON t.property_id = p.id
      WHERE t.status = 'active'
      ORDER BY t.name ASC
    `);

    const allPayments = await db.query('SELECT * FROM payments');
    const now = new Date();
    const ledgerRows = [];

    for (const tenant of tenants) {
      const periods = getTenantMonths(tenant);
      for (const period of periods) {
        const paymentsForPeriod = allPayments.filter(
          p => p.tenant_id === tenant.id && p.period === period
        );
        const paid = paymentsForPeriod.reduce((acc, p) => acc + Number(p.amount), 0);
        const rent = Number(tenant.rent);

        const [year, month] = period.split('-').map(Number);
        const payDeadline = new Date(year, month - 1, tenant.payment_day || 1);
        
        const isLate = now > payDeadline && paid < rent;
        const status = paid >= rent ? 'paid' : isLate ? 'late' : 'pending';

        ledgerRows.push({
          id: `${tenant.id}_${period}`,
          tenantId: tenant.id,
          tenantName: tenant.name,
          propertyName: tenant.property_name || 'Sin asignar',
          period,
          rent,
          paid,
          balance: Math.max(0, rent - paid),
          status,
          transactions: paymentsForPeriod
        });
      }
    }

    ledgerRows.sort((a, b) => b.period.localeCompare(a.period));

    const filtered = (!filter || filter === 'all')
      ? ledgerRows
      : ledgerRows.filter(r => r.status === filter);

    res.json(filtered);
  } catch (err) {
    console.error('Error calculando libro contable:', err);
    res.status(500).json({ error: 'Error al consultar pagos' });
  }
});

router.get('/', async (req, res) => {
  try {
    const payments = await db.query(`
      SELECT p.*, t.name as tenant_name, pr.name as property_name
      FROM payments p
      JOIN tenants t ON p.tenant_id = t.id
      LEFT JOIN properties pr ON t.property_id = pr.id
      ORDER BY p.payment_date DESC, p.created_at DESC
    `);
    res.json(payments.map(p => ({ ...p, amount: Number(p.amount) })));
  } catch (err) {
    res.status(500).json({ error: 'Error al consultar transacciones' });
  }
});

router.post('/', async (req, res) => {
  const { tenant_id, period, amount, payment_date, note } = req.body;

  if (!tenant_id || !period || !amount || !payment_date) {
    return res.status(400).json({
      error: 'Inquilino, período (YYYY-MM), monto y fecha de pago son obligatorios.'
    });
  }

  try {
    const id = 'pay_' + Date.now();
    await db.execute(
      'INSERT INTO payments (id, tenant_id, period, amount, payment_date, note) VALUES (?, ?, ?, ?, ?, ?)',
      [id, tenant_id, period.trim(), Number(amount), payment_date.trim(), note ? note.trim() : '']
    );

    const created = await db.queryOne(`
      SELECT p.*, t.name as tenant_name, pr.name as property_name
      FROM payments p
      JOIN tenants t ON p.tenant_id = t.id
      LEFT JOIN properties pr ON t.property_id = pr.id
      WHERE p.id = ?
    `, [id]);

    res.status(201).json({ ...created, amount: Number(created.amount) });
  } catch (err) {
    res.status(500).json({ error: 'Error al registrar pago' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const result = await db.execute('DELETE FROM payments WHERE id = ?', [req.params.id]);
    if (result.changes === 0) return res.status(404).json({ error: 'Pago no encontrado' });
    res.json({ message: 'Pago eliminado correctamente' });
  } catch (err) {
    res.status(500).json({ error: 'Error al eliminar pago' });
  }
});

export default router;
