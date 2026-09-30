import { Router } from 'express';
import { db } from '../db.js';
import { getTenantFinancialStatus } from '../services/financeService.js';

const router = Router();

router.get('/', async (req, res) => {
  try {
    const tenants = await db.query(`
      SELECT t.*, p.name as property_name, p.address as property_address
      FROM tenants t
      LEFT JOIN properties p ON t.property_id = p.id
      ORDER BY t.name ASC
    `);

    const enriched = await Promise.all(
      tenants.map(async (t) => {
        const fin = await getTenantFinancialStatus(t.id);
        return {
          ...t,
          rent: Number(t.rent),
          deposit: Number(t.deposit || 0),
          payment_day: Number(t.payment_day || 1),
          financial: fin
        };
      })
    );

    res.json(enriched);
  } catch (err) {
    console.error('Error listando inquilinos:', err);
    res.status(500).json({ error: 'Error al consultar inquilinos' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const tenant = await db.queryOne(`
      SELECT t.*, p.name as property_name, p.address as property_address, p.type as property_type
      FROM tenants t
      LEFT JOIN properties p ON t.property_id = p.id
      WHERE t.id = ?
    `, [req.params.id]);

    if (!tenant) return res.status(404).json({ error: 'Inquilino no encontrado' });

    const fin = await getTenantFinancialStatus(tenant.id);
    const payments = await db.query(`
      SELECT * FROM payments WHERE tenant_id = ? ORDER BY payment_date DESC, period DESC
    `, [tenant.id]);

    res.json({
      ...tenant,
      rent: Number(tenant.rent),
      deposit: Number(tenant.deposit || 0),
      payment_day: Number(tenant.payment_day || 1),
      financial: fin,
      payments
    });
  } catch (err) {
    res.status(500).json({ error: 'Error consultando inquilino' });
  }
});

router.post('/', async (req, res) => {
  const {
    name, dui, phone, email, country, city,
    property_id, rent, start_date, payment_day, deposit, notes
  } = req.body;

  if (!name || !phone || !rent || !start_date) {
    return res.status(400).json({
      error: 'Nombre, teléfono WhatsApp, renta mensual y fecha de inicio son requeridos.'
    });
  }

  try {
    const id = 'ten_' + Date.now();
    await db.execute(`
      INSERT INTO tenants (
        id, name, dui, phone, email, country, city,
        property_id, rent, start_date, payment_day, deposit, notes, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'active')
    `, [
      id,
      name.trim(),
      dui ? dui.trim() : '',
      phone.trim(),
      email ? email.trim() : '',
      country ? country.trim() : 'El Salvador',
      city ? city.trim() : 'San Salvador',
      property_id || null,
      Number(rent),
      start_date,
      Number(payment_day) || 1,
      Number(deposit) || 0,
      notes ? notes.trim() : ''
    ]);

    const created = await db.queryOne('SELECT * FROM tenants WHERE id = ?', [id]);
    res.status(201).json({
      ...created,
      rent: Number(created.rent),
      deposit: Number(created.deposit || 0)
    });
  } catch (err) {
    res.status(500).json({ error: 'Error al registrar inquilino' });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const existing = await db.queryOne('SELECT * FROM tenants WHERE id = ?', [req.params.id]);
    if (!existing) return res.status(404).json({ error: 'Inquilino no encontrado' });

    const {
      name, dui, phone, email, country, city,
      property_id, rent, start_date, payment_day, deposit, notes, status
    } = req.body;

    await db.execute(`
      UPDATE tenants SET
        name = ?, dui = ?, phone = ?, email = ?, country = ?, city = ?,
        property_id = ?, rent = ?, start_date = ?, payment_day = ?, deposit = ?,
        notes = ?, status = ?
      WHERE id = ?
    `, [
      name !== undefined ? name.trim() : existing.name,
      dui !== undefined ? dui.trim() : existing.dui,
      phone !== undefined ? phone.trim() : existing.phone,
      email !== undefined ? email.trim() : existing.email,
      country !== undefined ? country.trim() : existing.country,
      city !== undefined ? city.trim() : existing.city,
      property_id !== undefined ? property_id : existing.property_id,
      rent !== undefined ? Number(rent) : existing.rent,
      start_date !== undefined ? start_date : existing.start_date,
      payment_day !== undefined ? Number(payment_day) : existing.payment_day,
      deposit !== undefined ? Number(deposit) : existing.deposit,
      notes !== undefined ? notes.trim() : existing.notes,
      status !== undefined ? status : existing.status,
      req.params.id
    ]);

    const updated = await db.queryOne('SELECT * FROM tenants WHERE id = ?', [req.params.id]);
    res.json({
      ...updated,
      rent: Number(updated.rent),
      deposit: Number(updated.deposit || 0)
    });
  } catch (err) {
    res.status(500).json({ error: 'Error al actualizar inquilino' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const result = await db.execute('DELETE FROM tenants WHERE id = ?', [req.params.id]);
    if (result.changes === 0) return res.status(404).json({ error: 'Inquilino no encontrado' });
    res.json({ message: 'Inquilino eliminado correctamente.' });
  } catch (err) {
    res.status(500).json({ error: 'Error al eliminar inquilino' });
  }
});

export default router;
