import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import rateLimit from 'express-rate-limit';
import { db } from '../db.js';
import { config } from '../config.js';
import { authenticateToken } from '../middleware/auth.js';

const router = Router();

// Limitador de intentos para prevenir ataques de fuerza bruta en el login
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 10, // máximo 10 intentos por IP
  message: { error: 'Demasiados intentos fallidos de inicio de sesión. Por favor espera 15 minutos.' },
  standardHeaders: true,
  legacyHeaders: false
});

router.post('/login', loginLimiter, async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Correo y contraseña son requeridos' });
  }

  try {
    const user = await db.queryOne('SELECT * FROM users WHERE LOWER(email) = ?', [email.trim().toLowerCase()]);
    if (!user) {
      return res.status(401).json({ error: 'Credenciales inválidas. Verifica tu correo y contraseña.' });
    }

    // Validación segura de contraseña con bcrypt
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(401).json({ error: 'Credenciales inválidas. Verifica tu correo y contraseña.' });
    }

    const settings = await db.queryOne('SELECT * FROM settings WHERE user_id = ?', [user.id]) || {
      business_name: user.business_name || 'Mi Negocio'
    };

    // Firmar token JWT con expiración de 7 días
    const token = jwt.sign(
      {
        id: user.id,
        name: user.name,
        email: user.email,
        businessName: settings.business_name
      },
      config.jwtSecret,
      { expiresIn: '7d' }
    );

    res.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        business_name: settings.business_name
      },
      token
    });
  } catch (err) {
    console.error('Error en login:', err);
    res.status(500).json({ error: 'Error procesando autenticación' });
  }
});

router.get('/me', authenticateToken, async (req, res) => {
  try {
    const user = await db.queryOne('SELECT id, name, email, business_name FROM users WHERE id = ?', [req.user.id]);
    if (!user) return res.status(404).json({ error: 'Usuario no encontrado' });
    
    const settings = await db.queryOne('SELECT * FROM settings WHERE user_id = ?', [user.id]);
    res.json({ user, settings });
  } catch (err) {
    res.status(500).json({ error: 'Error consultando perfil' });
  }
});

export default router;
