import dotenv from 'dotenv';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Cargar .env desde la raíz o desde la carpeta server
dotenv.config({ path: path.resolve(__dirname, '../../.env') });
dotenv.config(); // Fallback si está en server/.env

export const config = {
  port: parseInt(process.env.PORT || '3001', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  jwtSecret: process.env.JWT_SECRET || 'dev_only_secret_not_for_production',
  databaseUrl: process.env.DATABASE_URL || '',
  databasePath: process.env.DATABASE_PATH || path.resolve(__dirname, '../rentafacil.db'),
  corsOrigin: process.env.CORS_ORIGIN || '*',
  adminEmail: (process.env.ADMIN_EMAIL || '').trim().toLowerCase(),
  adminPassword: process.env.ADMIN_PASSWORD || '',
  adminName: (process.env.ADMIN_NAME || 'Administrador').trim(),
  businessName: (process.env.BUSINESS_NAME || 'Mi negocio').trim(),
  isProduction: process.env.NODE_ENV === 'production'
};

// Validaciones de seguridad para producción
if (config.isProduction) {
  const problems = [];
  if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) problems.push('JWT_SECRET debe existir y tener al menos 32 caracteres');
  if (!process.env.ADMIN_PASSWORD || process.env.ADMIN_PASSWORD.length < 8 || process.env.ADMIN_PASSWORD === 'admin123') problems.push('ADMIN_PASSWORD debe existir, tener 8+ caracteres y no ser admin123');
  if (problems.length) {
    console.error('❌ Configuración insegura para producción:\n - ' + problems.join('\n - '));
    process.exit(1);
  }
}
