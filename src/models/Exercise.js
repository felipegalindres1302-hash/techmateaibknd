import mongoose from 'mongoose';

const exerciseSchema = new mongoose.Schema(
  {
    lessonId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Lesson',
      required: [true, 'La lección es obligatoria'],
    },
    type: {
      type: String,
      enum: {
        values: [
          'fill-blank',
          'translate',
          'order-words',
          'dictation',
          'listen-select',
          'listen-repeat',
          'song',
          'story',
          'phonics',
          'mini-story',
        ],
        message: 'Tipo de ejercicio no válido',
      },
      required: [true, 'El tipo de ejercicio es obligatorio'],
    },
    instruction: {
      type: String,
      required: [true, 'La instrucción en inglés es obligatoria'],
    },
    instructionEs: {
      type: String,
      required: [true, 'La instrucción en español es obligatoria'],
    },
    explanation: {
      type: String,
      default: '',
    },
    explanationEs: {
      type: String,
      default: '',
    },
    content: {
      type: mongoose.Schema.Types.Mixed,
      required: [true, 'El contenido es obligatorio'],
    },
    media: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },
    correctAnswer: {
      type: mongoose.Schema.Types.Mixed,
      required: [true, 'La respuesta correcta es obligatoria'],
    },
    hints: {
      type: [String],
      default: [],
    },
    points: {
      type: Number,
      default: 10,
    },
    order: {
      type: Number,
      required: [true, 'El orden es obligatorio'],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: true },
  }
);

const Exercise = mongoose.model('Exercise', exerciseSchema);

export default Exercise;
