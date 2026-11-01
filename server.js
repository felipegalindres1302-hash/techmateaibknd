import app from './src/app.js';
import connectDB from './src/config/db.js';
import config from './src/config/env.js';

// Connect to MongoDB
connectDB();

const PORT = config.port;

const server = app.listen(PORT, () => {
  console.log(`🚀 Servidor TechMate AI corriendo en el puerto ${PORT}`);
  console.log(`🤖 Modo: ${config.nodeEnv}`);
  console.log(`🌐 API disponible en http://localhost:${PORT}/api`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error(`❌ Error no controlado: ${err.message}`);
  server.close(() => process.exit(1));
});

