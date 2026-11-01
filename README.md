# 🤖 TechMate AI — Backend API

Backend REST para **TechMate AI**, la plataforma de tutor virtual bilingüe Inglés-Español para niños de 6 a 12 años guiada por el robot "Matey".

## 🚀 Tecnologías

- **Node.js** + **Express**
- **MongoDB** con **Mongoose**
- **JWT** (JSON Web Tokens) & **bcryptjs** para autenticación segura
- **express-validator** para validación de datos
- **Morgan** para logging de peticiones

## 📋 Requisitos Previos

- Node.js v18+
- MongoDB instalado localmente (`mongodb://localhost:27017`) o un cluster de MongoDB Atlas.

## 🛠️ Instalación y Configuración

1. Instalar dependencias:
   ```bash
   npm install
   ```

2. Configurar variables de entorno (`.env`):
   ```env
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/techmateai
   JWT_SECRET=techmateai_jwt_secret_key_2024_super_seguro
   JWT_EXPIRES_IN=7d
   NODE_ENV=development
   ```

3. Cargar datos iniciales (Seeds: lecciones, ejercicios y logros):
   ```bash
   npm run seed
   ```

4. Iniciar servidor en desarrollo:
   ```bash
   npm run dev
   ```
   O en producción:
   ```bash
   npm start
   ```

## 📚 Endpoints Principales

### Autenticación (`/api/auth`)
- `POST /api/auth/register` - Registrar padre/tutor
- `POST /api/auth/login` - Iniciar sesión
- `POST /api/auth/child` - Crear perfil de estudiante (requiere token de padre)
- `GET /api/auth/me` - Perfil de usuario autenticado

### Lecciones (`/api/lessons`)
- `GET /api/lessons` - Listar lecciones (filtros: `?category=writing|listening&difficulty=beginner|intermediate|advanced`)
- `GET /api/lessons/:id` - Detalle de una lección
- `GET /api/lessons/:id/exercises` - Ejercicios activos de una lección (requiere token)

### Ejercicios y Evaluación (`/api/exercises`)
- `POST /api/exercises/:id/submit` - Enviar respuesta, calificar y recibir feedback de Matey + puntos + logros

### Progreso y Racha (`/api/progress`)
- `GET /api/progress/summary` - Resumen de avance general y por categoría
- `GET /api/progress/streak` - Días de racha consecutiva
- `GET /api/progress/lesson/:lessonId` - Avance de ejercicios en una lección específica

### Logros (`/api/achievements`)
- `GET /api/achievements` - Lista de todas las medallas
- `GET /api/achievements/mine` - Medallas desbloqueadas por el usuario

