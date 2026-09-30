import { Router } from 'express';
import { db } from '../db.js';

const router = Router();

router.get('/', async (req, res) => {
  try {
    let settings = await db.queryOne('SELECT * FROM settings LIMIT 1');
    if (!settings) {
      settings = {
        id: 's1',
        business_name: 'Mi negocio',
        tone: 'amigable',
        on_3days: 1,
        on_due: 1,
        on_late: 1,
        on_multi: 1
      };
    }
    res.json({
      ...settings,
      on_3days: Boolean(settings.on_3days),
      on_due: Boolean(settings.on_due),
      on_late: Boolean(settings.on_late),
      on_multi: Boolean(settings.on_multi)
    });
  } catch (err) {
    res.status(500).json({ error: 'Error consultando configuración' });
  }
});

router.put('/', async (req, res) => {
  const { business_name, tone, on_3days, on_due, on_late, on_multi } = req.body;

  try {
    const current = await db.queryOne('SELECT * FROM settings LIMIT 1');
    if (!current) {
      await db.execute(`
        INSERT INTO settings (id, business_name, tone, on_3days, on_due, on_late, on_multi)
        VALUES ('s1', ?, ?, ?, ?, ?, ?)
      `, [
        business_name || 'Mi Negocio',
        tone || 'amigable',
        on_3days ? 1 : 0,
        on_due ? 1 : 0,
        on_late ? 1 : 0,
        on_multi ? 1 : 0
      ]);
    } else {
      await db.execute(`
        UPDATE settings SET
          business_name = ?,
          tone = ?,
          on_3days = ?,
          on_due = ?,
          on_late = ?,
          on_multi = ?
        WHERE id = ?
      `, [
        business_name !== undefined ? business_name.trim() : current.business_name,
        tone || current.tone,
        on_3days !== undefined ? (on_3days ? 1 : 0) : current.on_3days,
        on_due !== undefined ? (on_due ? 1 : 0) : current.on_due,
        on_late !== undefined ? (on_late ? 1 : 0) : current.on_late,
        on_multi !== undefined ? (on_multi ? 1 : 0) : current.on_multi,
        current.id
      ]);
    }

    const updated = await db.queryOne('SELECT * FROM settings LIMIT 1');
    res.json({
      ...updated,
      on_3days: Boolean(updated.on_3days),
      on_due: Boolean(updated.on_due),
      on_late: Boolean(updated.on_late),
      on_multi: Boolean(updated.on_multi)
    });
  } catch (err) {
    res.status(500).json({ error: 'Error guardando configuración' });
  }
});

export default router;
