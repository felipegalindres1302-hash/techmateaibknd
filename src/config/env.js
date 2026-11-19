import dotenv from 'dotenv';

dotenv.config();

const nodeEnv = process.env.NODE_ENV || 'development';
const isProduction = nodeEnv === 'production';

const normalizeOrigin = (origin) => origin.trim().replace(/\/+$/, '');

const corsOrigins = [
  ...(process.env.CORS_ORIGINS || '').split(','),
  process.env.CLIENT_URL,
  process.env.FRONTEND_URL,
]
  .filter(Boolean)
  .map(normalizeOrigin)
  .filter(Boolean);

const uniqueCorsOrigins = [...new Set(corsOrigins)];

const frontendUrl = [
  process.env.CLIENT_URL,
  process.env.FRONTEND_URL,
  uniqueCorsOrigins[0],
  'http://localhost:5173',
]
  .filter(Boolean)
  .map(normalizeOrigin)[0];

const config = {
  port: Number(process.env.PORT) || 5000,
  mongodbUri: process.env.MONGODB_URI || 'mongodb://localhost:27017/techmateai',
  jwtSecret: process.env.JWT_SECRET || 'default_secret_key',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  nodeEnv,
  isProduction,
  frontendUrl,
  corsOrigins: uniqueCorsOrigins,
};

const missingCritical = [];
if (!process.env.MONGODB_URI) missingCritical.push('MONGODB_URI');
if (!process.env.JWT_SECRET) missingCritical.push('JWT_SECRET');

if (isProduction) {
  const missing = [...missingCritical];
  if (uniqueCorsOrigins.length === 0) {
    missing.push('CLIENT_URL, FRONTEND_URL o CORS_ORIGINS');
  }

  if (missing.length > 0) {
    throw new Error(
      `Faltan variables de entorno obligatorias en producción: ${missing.join(', ')}`
    );
  }

  if (
    config.jwtSecret === 'default_secret_key' ||
    config.jwtSecret.length < 32
  ) {
    throw new Error(
      'JWT_SECRET debe ser una cadena aleatoria de al menos 32 caracteres en producción.'
    );
  }

  if (
    config.mongodbUri.includes('localhost') ||
    config.mongodbUri.includes('127.0.0.1')
  ) {
    throw new Error('MONGODB_URI no puede apuntar a localhost en producción.');
  }

  if (
    uniqueCorsOrigins.some(
      (origin) =>
        origin.includes('localhost') || origin.includes('127.0.0.1')
    )
  ) {
    throw new Error(
      'CLIENT_URL/FRONTEND_URL/CORS_ORIGINS no puede apuntar a localhost en producción.'
    );
  }
} else if (missingCritical.length > 0) {
  console.warn(
    `⚠️  Variables de entorno faltantes: ${missingCritical.join(', ')}. Usando valores de desarrollo.`
  );
}

export default config;
