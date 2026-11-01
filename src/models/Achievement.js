import mongoose from 'mongoose';

const achievementSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'El nombre en inglés es obligatorio'],
    trim: true,
  },
  nameEs: {
    type: String,
    required: [true, 'El nombre en español es obligatorio'],
    trim: true,
  },
  description: {
    type: String,
    required: [true, 'La descripción en inglés es obligatoria'],
  },
  descriptionEs: {
    type: String,
    required: [true, 'La descripción en español es obligatoria'],
  },
  icon: {
    type: String,
    default: '🏆',
  },
  category: {
    type: String,
    enum: {
      values: ['writing', 'listening', 'streak', 'general'],
      message: 'La categoría debe ser writing, listening, streak o general',
    },
    required: [true, 'La categoría es obligatoria'],
  },
  condition: {
    type: String,
    required: [true, 'La condición es obligatoria'],
  },
  threshold: {
    type: Number,
    required: [true, 'El umbral es obligatorio'],
  },
  rewardPoints: {
    type: Number,
    default: 50,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
});

const Achievement = mongoose.model('Achievement', achievementSchema);

export default Achievement;
