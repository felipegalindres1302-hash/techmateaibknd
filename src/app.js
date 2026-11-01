import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import errorHandler from './middleware/errorHandler.js';

// Route imports
import authRoutes from './routes/auth.routes.js';
import lessonRoutes from './routes/lesson.routes.js';
import exerciseRoutes from './routes/exercise.routes.js';
import progressRoutes from './routes/progress.routes.js';
import achievementRoutes from './routes/achievement.routes.js';

const app = express();

// Middlewares
app.use(cors({
  origin: ['http://localhost:5173', 'http://127.0.0.1:5173'],
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

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
    },
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/lessons', lessonRoutes);
app.use('/api/exercises', exerciseRoutes);
app.use('/api/progress', progressRoutes);
app.use('/api/achievements', achievementRoutes);

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

