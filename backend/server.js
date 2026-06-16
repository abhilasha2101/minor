/**
 * Veritas AI — Production Backend Server
 * 
 * Bootstraps Express with modular architecture:
 * - Database initialization (SQLite)
 * - CORS configuration
 * - Route mounting (auth, verify, profile, community)
 * - Health check endpoint
 * - Graceful shutdown handling
 */

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Config
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '.env') });

// Database
import { initializeSchema, closeDatabase } from './src/config/database.js';

// Routes
import authRoutes from './src/routes/authRoutes.js';
import verifyRoutes from './src/routes/verifyRoutes.js';
import profileRoutes from './src/routes/profileRoutes.js';
import communityRoutes from './src/routes/communityRoutes.js';

// Initialize
const app = express();

// ──────────────────────────────────────────────
// Middleware
// ──────────────────────────────────────────────
app.use(cors({
  origin: process.env.FRONTEND_URL
    ? process.env.FRONTEND_URL.split(',').map(url => url.trim())
    : [
        'http://localhost:5173',
        'http://127.0.0.1:5173',
        'https://veritasai-mu.vercel.app',
        'https://veritasai-abhilasha2101s-projects.vercel.app'
      ],
  credentials: true
}));

app.use(express.json({ limit: '10mb' }));

// Request logging (structured JSON logs)
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    if (req.path !== '/api/health') { // Don't log health checks
      console.log(JSON.stringify({
        level: 'info',
        method: req.method,
        path: req.path,
        status: res.statusCode,
        duration: `${Date.now() - start}ms`,
        timestamp: new Date().toISOString()
      }));
    }
  });
  next();
});

// ──────────────────────────────────────────────
// Database Initialization
// ──────────────────────────────────────────────
try {
  initializeSchema();
} catch (err) {
  console.error('[FATAL] Database initialization failed:', err.message);
  process.exit(1);
}

// ──────────────────────────────────────────────
// Health Check
// ──────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: Math.floor(process.uptime()),
    architecture: 'N-tier (Controllers → Services → Repositories → SQLite)',
    features: [
      'text-verification',
      'image-ocr-verification',
      'user-auth',
      'claim-history',
      'bookmarks',
      'community-board',
      'upvotes',
      'feedback-logging'
    ]
  });
});

// ──────────────────────────────────────────────
// API Routes
// ──────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/verify', verifyRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/community', communityRoutes);

// ──────────────────────────────────────────────
// 404 Handler
// ──────────────────────────────────────────────
app.use('/api/{*path}', (req, res) => {
  res.status(404).json({
    error: { message: `Route not found: ${req.method} ${req.originalUrl}` }
  });
});

// ──────────────────────────────────────────────
// Global Error Handler
// ──────────────────────────────────────────────
app.use((err, req, res, _next) => {
  console.error(JSON.stringify({
    level: 'error',
    message: 'Unhandled server error',
    error: err.message,
    stack: process.env.NODE_ENV !== 'production' ? err.stack : undefined,
    timestamp: new Date().toISOString()
  }));

  res.status(500).json({
    error: { message: 'Internal server error.' }
  });
});

// ──────────────────────────────────────────────
// Server Start
// ──────────────────────────────────────────────
const PORT = process.env.PORT || 3001;
const HOST = process.env.NODE_ENV === 'production' ? '0.0.0.0' : (process.env.HOST || '0.0.0.0');
const server = app.listen(PORT, HOST, () => {
  console.log(`\n🛡️  Veritas AI Production Server`);
  console.log(`   Architecture: N-tier (Controller → Service → Repository → SQLite)`);
  console.log(`   Host: ${HOST}`);
  console.log(`   Port: ${PORT}`);
  console.log(`   Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`   Database: veritas.db (SQLite + WAL mode)`);
  console.log(`   Routes: /api/auth, /api/verify, /api/profile, /api/community`);
  console.log(`   Health: http://${HOST === '0.0.0.0' ? 'localhost' : HOST}:${PORT}/api/health\n`);
});

// ──────────────────────────────────────────────
// Graceful Shutdown
// ──────────────────────────────────────────────
function shutdown(signal) {
  console.log(`\n[${signal}] Shutting down gracefully...`);
  server.close(() => {
    closeDatabase();
    console.log('[Server] Closed.');
    process.exit(0);
  });
}

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));
