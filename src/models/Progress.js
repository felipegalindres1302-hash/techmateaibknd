import mongoose from 'mongoose';

const progressSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'El usuario es obligatorio'],
  },
  lessonId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Lesson',
    required: [true, 'La lección es obligatoria'],
  },
  exerciseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Exercise',
    required: [true, 'El ejercicio es obligatorio'],
  },
  completed: {
    type: Boolean,
    default: false,
  },
  score: {
    type: Number,
    min: 0,
    max: 100,
    default: 0,
  },
  attempts: {
    type: Number,
    default: 0,
  },
  bestScore: {
    type: Number,
    default: 0,
  },
  timeSpent: {
    type: Number, // seconds
    default: 0,
  },
  completedAt: {
    type: Date,
    default: null,
  },
});

// Compound unique index: one progress record per user per exercise
progressSchema.index({ userId: 1, exerciseId: 1 }, { unique: true });

const Progress = mongoose.model('Progress', progressSchema);

export default Progress;
