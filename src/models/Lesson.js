import mongoose from 'mongoose';

const lessonSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'El título en inglés es obligatorio'],
      trim: true,
    },
    titleEs: {
      type: String,
      required: [true, 'El título en español es obligatorio'],
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
    objectives: {
      type: [String],
      default: [],
    },
    estimatedMinutes: {
      type: Number,
      default: 10,
      min: [0, 'La duración estimada no puede ser negativa'],
    },
    tags: {
      type: [String],
      default: [],
    },
    category: {
      type: String,
      enum: {
        values: ['writing', 'listening'],
        message: 'La categoría debe ser writing o listening',
      },
      required: [true, 'La categoría es obligatoria'],
    },
    difficulty: {
      type: String,
      enum: {
        values: ['beginner', 'intermediate', 'advanced'],
        message: 'La dificultad debe ser beginner, intermediate o advanced',
      },
      required: [true, 'La dificultad es obligatoria'],
    },
    order: {
      type: Number,
      required: [true, 'El orden es obligatorio'],
    },
    icon: {
      type: String,
      default: '📚',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' },
  }
);

const Lesson = mongoose.model('Lesson', lessonSchema);

export default Lesson;
