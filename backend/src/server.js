import 'dotenv/config';
import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import morgan from 'morgan';
import pool from './db.js';
import studentsRouter from './routes/students.js';

const app = express();
const port = Number(process.env.PORT || 3001);
const allowedOrigins = String(process.env.CORS_ORIGIN || process.env.ALLOWED_ORIGINS || '')
  .split(',')
  .map((origin) => origin.trim().replace(/\/$/, ''))
  .filter(Boolean);

app.use(helmet());
app.use(cors({
  origin(origin, callback) {
    const normalizedOrigin = origin?.replace(/\/$/, '');
    const isAllowed = !origin
      || allowedOrigins.length === 0
      || allowedOrigins.includes(normalizedOrigin);
    callback(null, isAllowed);
  },
}));
app.use(express.json({ limit: '1mb' }));
app.use(morgan('combined'));

app.get('/api/health', async (_req, res, next) => {
  try {
    await pool.query('SELECT 1');
    res.json({ status: 'ok', database: 'connected' });
  } catch (error) {
    next(error);
  }
});

app.use('/api/students', studentsRouter);

app.use((_req, res) => {
  res.status(404).json({ message: 'ไม่พบ API ที่เรียกใช้' });
});

app.use((error, _req, res, _next) => {
  console.error(error);
  res.status(500).json({ message: 'เกิดข้อผิดพลาดภายในระบบ' });
});

const server = app.listen(port, '0.0.0.0', () => {
  console.log(`Backend listening on port ${port}`);
});

async function shutdown(signal) {
  console.log(`${signal} received, shutting down gracefully`);
  server.close(async () => {
    await pool.end();
    process.exit(0);
  });
}

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
