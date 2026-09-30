import { Router } from 'express';
import { db } from '../db.js';
import { generateReminders } from '../services/reminderEngine.js';

const router = Router();

router.get('/', async (req, res) => {
  try {
    const reminders = await generateReminders();
    res.json(reminders);
  } catch (err) {
    console.error('Error generando recordatorios:', err);
    res.status(500).json({ error: 'Error al generar recordatorios' });
  }
});

router.post('/mark-sent', async (req, res) => {
  const { keyId, tenantId, period, type, channel, customMessage } = req.body;
  if (!keyId || !tenantId || !period || !type) {
    return res.status(400).json({ error: 'Faltan parámetros requeridos (keyId, tenantId, period, type)' });
  }

  try {
    const now = new Date().toISOString();
    const existing = await db.queryOne('SELECT * FROM reminders_log WHERE key_id = ?', [keyId]);

    if (existing) {
      await db.execute(`
        UPDATE reminders_log 
        SET sent_at = ?, channel = ?, custom_message = COALESCE(?, custom_message)
        WHERE key_id = ?
      `, [now, channel || 'whatsapp', customMessage || null, keyId]);
    } else {
      const id = 'rem_' + Date.now();
      await db.execute(`
        INSERT INTO reminders_log (id, key_id, tenant_id, period, reminder_type, sent_at, channel, custom_message)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `, [id, keyId, tenantId, period, type, now, channel || 'whatsapp', customMessage || '']);
    }

    res.json({ message: 'Recordatorio marcado como enviado', sentAt: now });
  } catch (err) {
    res.status(500).json({ error: 'Error actualizando recordatorio' });
  }
});

router.post('/mark-unsent', async (req, res) => {
  const { keyId } = req.body;
  if (!keyId) return res.status(400).json({ error: 'keyId es requerido' });

  try {
    await db.execute('DELETE FROM reminders_log WHERE key_id = ?', [keyId]);
    res.json({ message: 'Recordatorio desmarcado' });
  } catch (err) {
    res.status(500).json({ error: 'Error al desmarcar recordatorio' });
  }
});

router.post('/save-custom', async (req, res) => {
  const { keyId, tenantId, period, type, customMessage } = req.body;
  if (!keyId || !customMessage) {
    return res.status(400).json({ error: 'keyId y customMessage son requeridos' });
  }

  try {
    const existing = await db.queryOne('SELECT * FROM reminders_log WHERE key_id = ?', [keyId]);
    if (existing) {
      await db.execute('UPDATE reminders_log SET custom_message = ? WHERE key_id = ?', [customMessage, keyId]);
    } else {
      const id = 'rem_' + Date.now();
      await db.execute(`
        INSERT INTO reminders_log (id, key_id, tenant_id, period, reminder_type, sent_at, channel, custom_message)
        VALUES (?, ?, ?, ?, ?, '', 'draft', ?)
      `, [id, keyId, tenantId, period, type, customMessage]);
    }

    res.json({ message: 'Mensaje personalizado guardado correctamente' });
  } catch (err) {
    res.status(500).json({ error: 'Error guardando mensaje' });
  }
});

export default router;
