import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { config } from './config.js';
import { initDatabase, db } from './db.js';
import authRoutes from './routes/auth.js';
import propertiesRoutes from './routes/properties.js';
import tenantsRoutes from './routes/tenants.js';
import paymentsRoutes from './routes/payments.js';
import remindersRoutes from './routes/reminders.js';
import settingsRoutes from './routes/settings.js';
import statsRoutes from './routes/stats.js';
import { authenticateToken } from './middleware/auth.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// 1. Cabeceras de seguridad con Helmet
app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false
}));

// 2. CORS configurable
app.use(cors({
  origin: config.corsOrigin === '*' ? true : config.corsOrigin,
  credentials: true
}));

app.use(express.json());

// 3. Inicializar base de datos (PostgreSQL o SQLite)
try {
  await initDatabase();
} catch (err) {
  console.error('Error crítico inicializando base de datos:', err);
}

// 4. Rutas API
app.use('/api/auth', authRoutes);
app.use('/api/properties', authenticateToken, propertiesRoutes);
app.use('/api/tenants', authenticateToken, tenantsRoutes);
app.use('/api/payments', authenticateToken, paymentsRoutes);
app.use('/api/reminders', authenticateToken, remindersRoutes);
app.use('/api/settings', authenticateToken, settingsRoutes);
app.use('/api/stats', authenticateToken, statsRoutes);

// 5. Monitoreo y Health Check
app.get(['/health', '/api/health'], async (req, res) => {
  try {
    const dbCheck = await db.ping();
    res.json({
      status: 'ok',
      service: 'Gestor de Rentas API',
      database: dbCheck,
      uptime: Math.floor(process.uptime()),
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    res.status(503).json({
      status: 'error',
      message: 'Base de datos no responde',
      error: err.message
    });
  }
});

// 6. Servir frontend compilado en producción (Single-Service)
const clientDistPath = path.resolve(__dirname, '../../client/dist');
app.use(express.static(clientDistPath));

app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api')) return next();
  res.sendFile(path.join(clientDistPath, 'index.html'), (err) => {
    if (err) {
      res.status(200).send('RentaFácil API en línea. Ejecuta "npm run build" para generar el frontend.');
    }
  });
});

// 7. Manejo centralizado de errores
app.use((err, req, res, next) => {
  console.error('Error no capturado:', err);
  res.status(500).json({ error: err.message || 'Error interno del servidor' });
});

app.listen(config.port, () => {
  console.log(`🚀 Servidor Gestor de Rentas listo en el puerto ${config.port} (${config.nodeEnv})`);
  console.log(`💾 Motor de base de datos activo: ${db.isPostgres ? 'PostgreSQL (Cloud)' : 'SQLite (Local)'}`);
});
