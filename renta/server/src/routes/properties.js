import { Router } from 'express';
import { db } from '../db.js';

const router = Router();

router.get('/', async (req, res) => {
  try {
    const properties = await db.query('SELECT * FROM properties ORDER BY name ASC');
    const tenants = await db.query("SELECT id, name, property_id, rent FROM tenants WHERE status = 'active'");

    const propertiesWithTenants = properties.map(p => {
      const assigned = tenants.filter(t => t.property_id === p.id);
      return {
        ...p,
        rent: Number(p.rent),
        tenants: assigned,
        isOccupied: assigned.length > 0
      };
    });

    res.json(propertiesWithTenants);
  } catch (err) {
    console.error('Error obteniendo propiedades:', err);
    res.status(500).json({ error: 'Error al consultar propiedades' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const property = await db.queryOne('SELECT * FROM properties WHERE id = ?', [req.params.id]);
    if (!property) return res.status(404).json({ error: 'Propiedad no encontrada' });

    const assigned = await db.query("SELECT * FROM tenants WHERE property_id = ? AND status = 'active'", [req.params.id]);
    res.json({
      ...property,
      rent: Number(property.rent),
      tenants: assigned,
      isOccupied: assigned.length > 0
    });
  } catch (err) {
    res.status(500).json({ error: 'Error al consultar propiedad' });
  }
});

router.post('/', async (req, res) => {
  const { name, address, type, rent, notes } = req.body;
  if (!name || !address) {
    return res.status(400).json({ error: 'El nombre y la dirección son obligatorios' });
  }

  try {
    const id = 'prop_' + Date.now();
    await db.execute(
      'INSERT INTO properties (id, name, address, type, rent, notes) VALUES (?, ?, ?, ?, ?, ?)',
      [id, name.trim(), address.trim(), type || 'Apartamento', Number(rent) || 0, notes ? notes.trim() : '']
    );

    const created = await db.queryOne('SELECT * FROM properties WHERE id = ?', [id]);
    res.status(201).json({ ...created, rent: Number(created.rent) });
  } catch (err) {
    res.status(500).json({ error: 'Error al registrar propiedad' });
  }
});

router.put('/:id', async (req, res) => {
  const { name, address, type, rent, notes } = req.body;
  try {
    const existing = await db.queryOne('SELECT * FROM properties WHERE id = ?', [req.params.id]);
    if (!existing) return res.status(404).json({ error: 'Propiedad no encontrada' });

    await db.execute(
      'UPDATE properties SET name = ?, address = ?, type = ?, rent = ?, notes = ? WHERE id = ?',
      [
        name ? name.trim() : existing.name,
        address ? address.trim() : existing.address,
        type || existing.type,
        rent !== undefined ? Number(rent) : existing.rent,
        notes !== undefined ? notes.trim() : existing.notes,
        req.params.id
      ]
    );

    const updated = await db.queryOne('SELECT * FROM properties WHERE id = ?', [req.params.id]);
    res.json({ ...updated, rent: Number(updated.rent) });
  } catch (err) {
    res.status(500).json({ error: 'Error al actualizar propiedad' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const assigned = await db.queryOne(
      "SELECT COUNT(*) as count FROM tenants WHERE property_id = ? AND status = 'active'",
      [req.params.id]
    );
    const count = Number(assigned.count || assigned[Object.keys(assigned)[0]] || 0);

    if (count > 0) {
      return res.status(400).json({
        error: 'No se puede eliminar la propiedad porque tiene inquilinos activos asignados. Reasígnalos primero.'
      });
    }

    const result = await db.execute('DELETE FROM properties WHERE id = ?', [req.params.id]);
    if (result.changes === 0) return res.status(404).json({ error: 'Propiedad no encontrada' });
    res.json({ message: 'Propiedad eliminada correctamente' });
  } catch (err) {
    res.status(500).json({ error: 'Error al eliminar propiedad' });
  }
});

export default router;
