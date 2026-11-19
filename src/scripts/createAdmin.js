import mongoose from 'mongoose';
import config from '../config/env.js';
import User from '../models/User.js';

const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
const password = process.env.ADMIN_PASSWORD;
const name = process.env.ADMIN_NAME?.trim() || 'Administrador';

const fail = (message) => {
  console.error(`❌ ${message}`);
  process.exit(1);
};

if (!email) fail('Define ADMIN_EMAIL para crear el administrador.');
if (!password) fail('Define ADMIN_PASSWORD para crear el administrador.');
if (password.length < 8) {
  fail('ADMIN_PASSWORD debe tener al menos 8 caracteres.');
}

const run = async () => {
  try {
    await mongoose.connect(config.mongodbUri);
    console.log('📦 Conectado a MongoDB');

    let user = await User.findOne({ email }).select('+password');

    if (user) {
      user.role = 'admin';
      user.name = user.name || name;
      user.password = password;
      await user.save();
      console.log(`✅ Usuario existente actualizado como admin: ${email}`);
    } else {
      await User.create({
        name,
        email,
        password,
        role: 'admin',
      });
      console.log(`✅ Administrador creado: ${email}`);
    }

    console.log(
      '⚠️  Elimina ADMIN_PASSWORD del entorno después de crear el administrador.'
    );
  } catch (error) {
    console.error(`❌ Error creando el administrador: ${error.message}`);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
};

run();
