import Lesson from '../models/Lesson.js';
import Exercise from '../models/Exercise.js';
import Progress from '../models/Progress.js';
import {
  pickAllowedFields,
  validateExercisePayload,
} from '../services/content.service.js';

const EXERCISE_FIELDS = [
  'type',
  'instruction',
  'instructionEs',
  'explanation',
  'explanationEs',
  'content',
  'media',
  'correctAnswer',
  'hints',
  'points',
  'order',
  'isActive',
];

/**
 * @desc    List all exercises of a lesson for administration
 * @route   GET /api/admin/lessons/:lessonId/exercises
 * @access  Private/Admin
 */
export const getAdminLessonExercises = async (req, res, next) => {
  try {
    const lesson = await Lesson.findById(req.params.lessonId);

    if (!lesson) {
      return res.status(404).json({
        success: false,
        message: 'Lección no encontrada.',
      });
    }

    const exercises = await Exercise.find({ lessonId: lesson._id }).sort({
      order: 1,
      createdAt: 1,
    });

    res.json({
      success: true,
      data: {
        lesson,
        count: exercises.length,
        exercises,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Create an exercise inside a lesson
 * @route   POST /api/admin/lessons/:lessonId/exercises
 * @access  Private/Admin
 */
export const createExercise = async (req, res, next) => {
  try {
    const lesson = await Lesson.findById(req.params.lessonId);

    if (!lesson) {
      return res.status(404).json({
        success: false,
        message: 'Lección no encontrada.',
      });
    }

    const payload = pickAllowedFields(req.body, EXERCISE_FIELDS);

    if (!Object.prototype.hasOwnProperty.call(payload, 'order')) {
      const lastExercise = await Exercise.findOne({ lessonId: lesson._id })
        .sort({ order: -1 })
        .select('order')
        .lean();
      payload.order =
        lastExercise?.order != null ? lastExercise.order + 1 : 1;
    }

    const candidate = { ...payload, lessonId: lesson._id };
    const errors = validateExercisePayload(candidate);

    if (errors.length) {
      return res.status(400).json({
        success: false,
        message: 'Error de validación.',
        errors,
      });
    }

    const exercise = await Exercise.create(candidate);

    res.status(201).json({
      success: true,
      data: { exercise },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update an exercise
 * @route   PATCH /api/admin/exercises/:id
 * @access  Private/Admin
 */
export const updateExercise = async (req, res, next) => {
  try {
    const exercise = await Exercise.findById(req.params.id);

    if (!exercise) {
      return res.status(404).json({
        success: false,
        message: 'Ejercicio no encontrado.',
      });
    }

    const updates = pickAllowedFields(req.body, EXERCISE_FIELDS);
    const candidate = { ...exercise.toObject(), ...updates };
    const errors = validateExercisePayload(candidate);

    if (errors.length) {
      return res.status(400).json({
        success: false,
        message: 'Error de validación.',
        errors,
      });
    }

    exercise.set(updates);
    await exercise.save();

    res.json({
      success: true,
      data: { exercise },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete an exercise and its progress
 * @route   DELETE /api/admin/exercises/:id
 * @access  Private/Admin
 */
export const deleteExercise = async (req, res, next) => {
  try {
    const exercise = await Exercise.findById(req.params.id);

    if (!exercise) {
      return res.status(404).json({
        success: false,
        message: 'Ejercicio no encontrado.',
      });
    }

    await Progress.deleteMany({ exerciseId: exercise._id });
    await Exercise.findByIdAndDelete(exercise._id);

    res.json({
      success: true,
      data: { deletedExercise: exercise._id },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Publish or unpublish an exercise
 * @route   PATCH /api/admin/exercises/:id/publish
 * @access  Private/Admin
 */
export const publishExercise = async (req, res, next) => {
  try {
    const exercise = await Exercise.findById(req.params.id);

    if (!exercise) {
      return res.status(404).json({
        success: false,
        message: 'Ejercicio no encontrado.',
      });
    }

    const isActive =
      typeof req.body.isActive === 'boolean'
        ? req.body.isActive
        : !exercise.isActive;

    exercise.isActive = isActive;
    await exercise.save();

    res.json({
      success: true,
      data: { exercise },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Reorder exercises inside a lesson
 * @route   PATCH /api/admin/lessons/:lessonId/exercises/reorder
 * @access  Private/Admin
 */
export const reorderExercises = async (req, res, next) => {
  try {
    const lesson = await Lesson.findById(req.params.lessonId);

    if (!lesson) {
      return res.status(404).json({
        success: false,
        message: 'Lección no encontrada.',
      });
    }

    const { exercises } = req.body;

    if (!Array.isArray(exercises) || exercises.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Debes enviar una lista de ejercicios con su nuevo orden.',
      });
    }

    const ids = exercises.map((item) => item?.id);
    const valid = exercises.every(
      (item) =>
        item &&
        item.id &&
        typeof item.order === 'number' &&
        item.order >= 0
    );

    if (!valid || new Set(ids).size !== ids.length) {
      return res.status(400).json({
        success: false,
        message: 'Cada ejercicio necesita un id único y un orden numérico.',
      });
    }

    const existing = await Exercise.countDocuments({
      _id: { $in: ids },
      lessonId: lesson._id,
    });

    if (existing !== ids.length) {
      return res.status(400).json({
        success: false,
        message: 'Algún ejercicio no existe o no pertenece a esta lección.',
      });
    }

    await Exercise.bulkWrite(
      exercises.map((item) => ({
        updateOne: {
          filter: { _id: item.id },
          update: { $set: { order: item.order } },
        },
      }))
    );

    res.json({
      success: true,
      data: { updated: exercises.length },
    });
  } catch (error) {
    next(error);
  }
};
