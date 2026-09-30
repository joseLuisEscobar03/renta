import { DatabaseSync } from 'node:sqlite';
import pg from 'pg';
import bcrypt from 'bcryptjs';
import { config } from './config.js';

const { Pool } = pg;

export const isPostgres = Boolean(config.databaseUrl && (config.databaseUrl.startsWith('postgres://') || config.databaseUrl.startsWith('postgresql://')));

let sqliteDb = null;
let pgPool = null;

if (isPostgres) {
  console.log('🐘 Configurando conexión a PostgreSQL gestionado (Neon / Supabase)...');
  pgPool = new Pool({
    connectionString: config.databaseUrl,
    ssl: {
      rejectUnauthorized: false
    },
    max: 10,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 10000
  });
} else {
  console.log(`📁 Usando base de datos SQLite local en: ${config.databasePath}`);
  sqliteDb = new DatabaseSync(config.databasePath);
}

// Convertir consultas con '?' al formato PostgreSQL '$1, $2'
function adaptSql(sql) {
  if (!isPostgres) return sql;
  let index = 1;
  return sql.replace(/\?/g, () => `$${index++}`);
}

export const db = {
  isPostgres,

  async ping() {
    if (isPostgres) {
      const res = await pgPool.query('SELECT 1 as alive');
      return { ok: Boolean(res.rows[0]?.alive), engine: 'postgresql' };
    } else {
      const res = sqliteDb.prepare('SELECT 1 as alive').get();
      return { ok: Boolean(res.alive), engine: 'sqlite' };
    }
  },

  async query(sql, params = []) {
    if (isPostgres) {
      const pgSql = adaptSql(sql);
      const res = await pgPool.query(pgSql, params);
      return res.rows;
    } else {
      const stmt = sqliteDb.prepare(sql);
      return stmt.all(...params);
    }
  },

  async queryOne(sql, params = []) {
    if (isPostgres) {
      const pgSql = adaptSql(sql);
      const res = await pgPool.query(pgSql, params);
      return res.rows[0] || null;
    } else {
      const stmt = sqliteDb.prepare(sql);
      return stmt.get(...params) || null;
    }
  },

  async execute(sql, params = []) {
    if (isPostgres) {
      const pgSql = adaptSql(sql);
      const res = await pgPool.query(pgSql, params);
      return { changes: res.rowCount, lastId: null };
    } else {
      const stmt = sqliteDb.prepare(sql);
      const res = stmt.run(...params);
      return { changes: res.changes, lastId: res.lastInsertRowid };
    }
  },

  async execRaw(sql) {
    if (isPostgres) {
      return await pgPool.query(sql);
    } else {
      return sqliteDb.exec(sql);
    }
  }
};

export async function initDatabase() {
  if (isPostgres) {
    // DDL para PostgreSQL
    await db.execRaw(`
      CREATE TABLE IF NOT EXISTS users (
        id VARCHAR(50) PRIMARY KEY,
        name VARCHAR(150) NOT NULL,
        email VARCHAR(150) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        business_name VARCHAR(150),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS settings (
        id VARCHAR(50) PRIMARY KEY,
        user_id VARCHAR(50),
        business_name VARCHAR(150) DEFAULT 'Mi negocio',
        tone VARCHAR(50) DEFAULT 'amigable',
        on_3days INTEGER DEFAULT 1,
        on_due INTEGER DEFAULT 1,
        on_late INTEGER DEFAULT 1,
        on_multi INTEGER DEFAULT 1,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS properties (
        id VARCHAR(50) PRIMARY KEY,
        name VARCHAR(150) NOT NULL,
        address VARCHAR(255) NOT NULL,
        type VARCHAR(50) NOT NULL,
        rent NUMERIC(10,2) NOT NULL DEFAULT 0,
        notes TEXT DEFAULT '',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS tenants (
        id VARCHAR(50) PRIMARY KEY,
        name VARCHAR(150) NOT NULL,
        dui VARCHAR(50) DEFAULT '',
        phone VARCHAR(50) NOT NULL,
        email VARCHAR(150) DEFAULT '',
        country VARCHAR(100) DEFAULT 'El Salvador',
        city VARCHAR(100) DEFAULT 'San Salvador',
        property_id VARCHAR(50) REFERENCES properties(id) ON DELETE SET NULL,
        rent NUMERIC(10,2) NOT NULL,
        start_date VARCHAR(20) NOT NULL,
        payment_day INTEGER NOT NULL DEFAULT 1,
        deposit NUMERIC(10,2) DEFAULT 0,
        notes TEXT DEFAULT '',
        status VARCHAR(20) DEFAULT 'active',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS payments (
        id VARCHAR(50) PRIMARY KEY,
        tenant_id VARCHAR(50) REFERENCES tenants(id) ON DELETE CASCADE,
        period VARCHAR(10) NOT NULL,
        amount NUMERIC(10,2) NOT NULL,
        payment_date VARCHAR(20) NOT NULL,
        note TEXT DEFAULT '',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS reminders_log (
        id VARCHAR(50) PRIMARY KEY,
        key_id VARCHAR(100) UNIQUE NOT NULL,
        tenant_id VARCHAR(50) REFERENCES tenants(id) ON DELETE CASCADE,
        period VARCHAR(10) NOT NULL,
        reminder_type VARCHAR(50) NOT NULL,
        sent_at VARCHAR(50) NOT NULL,
        channel VARCHAR(50) DEFAULT 'whatsapp',
        custom_message TEXT DEFAULT ''
      );
    `);
  } else {
    // DDL para SQLite
    sqliteDb.exec(`
      PRAGMA journal_mode = WAL;
      PRAGMA foreign_keys = ON;

      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        business_name TEXT,
        created_at TEXT DEFAULT (datetime('now'))
      );

      CREATE TABLE IF NOT EXISTS settings (
        id TEXT PRIMARY KEY,
        user_id TEXT,
        business_name TEXT DEFAULT 'Mi negocio',
        tone TEXT DEFAULT 'amigable',
        on_3days INTEGER DEFAULT 1,
        on_due INTEGER DEFAULT 1,
        on_late INTEGER DEFAULT 1,
        on_multi INTEGER DEFAULT 1,
        updated_at TEXT DEFAULT (datetime('now'))
      );

      CREATE TABLE IF NOT EXISTS properties (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        address TEXT NOT NULL,
        type TEXT NOT NULL,
        rent REAL NOT NULL DEFAULT 0,
        notes TEXT DEFAULT '',
        created_at TEXT DEFAULT (datetime('now'))
      );

      CREATE TABLE IF NOT EXISTS tenants (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        dui TEXT DEFAULT '',
        phone TEXT NOT NULL,
        email TEXT DEFAULT '',
        country TEXT DEFAULT 'El Salvador',
        city TEXT DEFAULT 'San Salvador',
        property_id TEXT,
        rent REAL NOT NULL,
        start_date TEXT NOT NULL,
        payment_day INTEGER NOT NULL DEFAULT 1,
        deposit REAL DEFAULT 0,
        notes TEXT DEFAULT '',
        status TEXT DEFAULT 'active',
        created_at TEXT DEFAULT (datetime('now')),
        FOREIGN KEY (property_id) REFERENCES properties(id) ON DELETE SET NULL
      );

      CREATE TABLE IF NOT EXISTS payments (
        id TEXT PRIMARY KEY,
        tenant_id TEXT NOT NULL,
        period TEXT NOT NULL,
        amount REAL NOT NULL,
        payment_date TEXT NOT NULL,
        note TEXT DEFAULT '',
        created_at TEXT DEFAULT (datetime('now')),
        FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE
      );

      CREATE TABLE IF NOT EXISTS reminders_log (
        id TEXT PRIMARY KEY,
        key_id TEXT UNIQUE NOT NULL,
        tenant_id TEXT NOT NULL,
        period TEXT NOT NULL,
        reminder_type TEXT NOT NULL,
        sent_at TEXT NOT NULL,
        channel TEXT DEFAULT 'whatsapp',
        custom_message TEXT DEFAULT '',
        FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE
      );
    `);
  }

  await seedDefaultData();
}

async function seedDefaultData() {
  const userCheck = await db.queryOne('SELECT COUNT(*) as count FROM users');
  const count = Number(userCheck.count || userCheck[Object.keys(userCheck)[0]] || 0);

  if (count === 0) {
    if (!config.adminEmail || config.adminPassword.length < 8) {
      throw new Error('Define ADMIN_EMAIL y ADMIN_PASSWORD (mínimo 8 caracteres) en el archivo .env para crear el usuario inicial.');
    }
    console.log('🌱 Creando usuario administrador inicial (sin datos de ejemplo)...');
    const hashedPassword = await bcrypt.hash(config.adminPassword, 10);

    await db.execute(
      'INSERT INTO users (id, name, email, password, business_name) VALUES (?, ?, ?, ?, ?)',
      ['u1', config.adminName, config.adminEmail, hashedPassword, config.businessName]
    );
    await db.execute(
      'INSERT INTO settings (id, user_id, business_name, tone, on_3days, on_due, on_late, on_multi) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      ['s1', 'u1', config.businessName, 'amigable', 1, 1, 1, 1]
    );
    console.log('✅ Base de datos lista y vacía. Inicia sesión con ' + config.adminEmail);
  }
}
