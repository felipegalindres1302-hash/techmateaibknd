import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import mongoose from 'mongoose';
import config from './config/env.js';
import errorHandler from './middleware/errorHandler.js';
import { apiLimiter } from './middleware/rateLimiter.js';

// Route imports
import authRoutes from './routes/auth.routes.js';
import lessonRoutes from './routes/lesson.routes.js';
import exerciseRoutes from './routes/exercise.routes.js';
import progressRoutes from './routes/progress.routes.js';
import achievementRoutes from './routes/achievement.routes.js';
import adminRoutes from './routes/admin.routes.js';
import settingsRoutes from './routes/settings.routes.js';

const app = express();

// Render y otros proxies
app.set('trust proxy', 1);
app.disable('x-powered-by');

// Security headers
app.use(helmet());

// CORS
const allowedOrigins = new Set(config.corsOrigins);

if (!config.isProduction) {
  [
    'http://localhost:5173',
    'http://127.0.0.1:5173',
    'http://localhost:5174',
    'http://127.0.0.1:5174',
    'http://localhost:4173',
    'http://127.0.0.1:4173',
  ].forEach((origin) => allowedOrigins.add(origin));
}

app.use(
  cors({
    origin: (origin, callback) => {
      // Permitir peticiones sin origen (curl, Postman, health checks)
      if (!origin) return callback(null, true);

      const normalizedOrigin = origin.trim().replace(/\/+$/, '');

      if (allowedOrigins.has(normalizedOrigin)) {
        return callback(null, true);
      }

      // Origen no autorizado: se omiten las cabeceras CORS
      return callback(null, false);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    maxAge: 86400,
    optionsSuccessStatus: 204,
  })
);

// Body parsers con límite de tamaño
app.use(express.json({ limit: '200kb' }));
app.use(express.urlencoded({ extended: true, limit: '200kb' }));

// Logging
if (config.nodeEnv !== 'test') {
  app.use(morgan(config.isProduction ? 'combined' : 'dev'));
}

// Health check (sin rate limit)
const dbStates = [
  'disconnected',
  'connected',
  'connecting',
  'disconnecting',
];

app.get('/api/health', (req, res) => {
  const database = dbStates[mongoose.connection.readyState] || 'unknown';
  const isHealthy = mongoose.connection.readyState === 1;

  res.status(isHealthy ? 200 : 503).json({
    success: isHealthy,
    data: {
      status: isHealthy ? 'ok' : 'degraded',
      database,
      environment: config.nodeEnv,
      uptime: Math.round(process.uptime()),
      version: '1.0.0',
      timestamp: new Date().toISOString(),
    },
  });
});

// Welcome route
app.get('/', (req, res) => {
  res.json({
    message: '🤖 TechMate AI API - Tutor Virtual Inglés-Español para Niños',
    status: 'online',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      lessons: '/api/lessons',
      exercises: '/api/exercises',
      progress: '/api/progress',
      achievements: '/api/achievements',
      settings: '/api/settings',
      admin: '/api/admin',
      health: '/api/health',
    },
  });
});

// Rate limit general para la API
app.use('/api', apiLimiter);

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/lessons', lessonRoutes);
app.use('/api/exercises', exerciseRoutes);
app.use('/api/progress', progressRoutes);
app.use('/api/achievements', achievementRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/admin', adminRoutes);

// 404 Route
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `Ruta no encontrada: ${req.originalUrl}`,
  });
});

// Global Error Handler
app.use(errorHandler);

export default app;
