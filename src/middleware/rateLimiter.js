import rateLimit from 'express-rate-limit';

const rateLimitHandler = (req, res) => {
  res.status(429).json({
    success: false,
    message:
      'Demasiadas solicitudes. Espera un momento e inténtalo de nuevo.',
  });
};

const skipOptions = (req) => req.method === 'OPTIONS';

/**
 * Límite general para toda la API.
 */
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 1000,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  handler: rateLimitHandler,
  skip: skipOptions,
});

/**
 * Límite estricto para login/registro.
 * Solo cuenta los intentos fallidos.
 */
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  skipSuccessfulRequests: true,
  handler: rateLimitHandler,
  skip: skipOptions,
});

/**
 * Límite para el envío de respuestas de ejercicios.
 */
export const submitLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 120,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  handler: rateLimitHandler,
  skip: skipOptions,
});
