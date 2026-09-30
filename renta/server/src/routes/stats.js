import { Router } from 'express';
import { getDashboardStats } from '../services/financeService.js';

const router = Router();

router.get('/dashboard', async (req, res) => {
  try {
    const stats = await getDashboardStats();
    res.json(stats);
  } catch (err) {
    console.error('Error calculando estadísticas:', err);
    res.status(500).json({ error: 'Error calculando estadísticas del dashboard' });
  }
});

export default router;
