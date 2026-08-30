import mysql from 'mysql2/promise';

function readEnv(primaryName, tidbName, fallback) {
  return process.env[primaryName] || process.env[tidbName] || fallback;
}

function readBoolean(value) {
  return ['1', 'true', 'yes', 'on'].includes(String(value ?? '').toLowerCase());
}

const sslEnabled = readBoolean(
  process.env.DB_SSL
    ?? process.env.TIDB_ENABLE_SSL
    ?? (process.env.TIDB_HOST ? 'true' : 'false'),
);

const pool = mysql.createPool({
  host: readEnv('DB_HOST', 'TIDB_HOST', 'localhost'),
  port: Number(readEnv('DB_PORT', 'TIDB_PORT', 3306)),
  user: readEnv('DB_USER', 'TIDB_USER', 'student_app'),
  password: readEnv('DB_PASSWORD', 'TIDB_PASSWORD', 'student_password'),
  database: readEnv('DB_NAME', 'TIDB_DATABASE', 'university'),
  waitForConnections: true,
  connectionLimit: Number(process.env.DB_CONNECTION_LIMIT || 5),
  maxIdle: Number(process.env.DB_MAX_IDLE || 5),
  idleTimeout: Number(process.env.DB_IDLE_TIMEOUT || 60000),
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0,
  charset: 'UTF8MB4_UNICODE_CI',
  dateStrings: true,
  decimalNumbers: true,
  ssl: sslEnabled
    ? {
        minVersion: 'TLSv1.2',
        rejectUnauthorized: true,
      }
    : undefined,
});

export default pool;
