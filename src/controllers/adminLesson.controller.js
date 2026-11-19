import Lesson from '../models/Lesson.js';
import Exercise from '../models/Exercise.js';
import Progress from '../models/Progress.js';
import {
  pickAllowedFields,
  validateLessonPayload,
} from '../services/content.service.js';

const LESSON_FIELDS = [
  'title',
  'titleEs',
  'description',
  'descriptionEs',
  'objectives',
  'estimatedMinutes',
  'tags',
  'category',
  'difficulty',
  'order',
  'icon',
  'isActive',
];

const parseBoolean = (value) => {
  if (value === 'true') return true;
  if (value === 'false') return false;
  return undefined;
};

const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/**
 * @desc    List all lessons for administration
 * @route   GET /api/admin/lessons
 * @access  Private/Admin
 */
export const getAdminLessons = async (req, res, next) => {
  try {
    const { category, difficulty, isActive, search } = req.query;
    const filter = {};

    if (category) filter.category = category;
    if (difficulty) filter.difficulty = difficulty;

    const active = parseBoolean(isActive);
    if (typeof active === 'boolean') filter.isActive = active;

    if (search && search.trim()) {
      const regex = new RegExp(escapeRegex(search.trim()), 'i');
      filter.$or = [
        { title: regex },
        { titleEs: regex },
        { description: regex },
        { descriptionEs: regex },
      ];
    }

    const lessons = await Lesson.find(filter).sort({ order: 1, createdAt: 1 });
    const lessonIds = lessons.map((lesson) => lesson._id);

    const counts = lessonIds.length
      ? await Exercise.aggregate([
          { $match: { lessonId: { $in: lessonIds } } },
          {
            $group: {
              _id: '$lessonId',
              total: { $sum: 1 },
              active: { $sum: { $cond: ['$isActive', 1, 0] } },
            },
          },
        ])
      : [];

    const countMap = new Map(
      counts.map((item) => [item._id.toString(), item])
    );

    const data = lessons.map((lesson) => {
      const plain = lesson.toObject();
      const count = countMap.get(lesson._id.toString());

      return {
        ...plain,
        exerciseCount: count?.total || 0,
        activeExerciseCount: count?.active || 0,
      };
    });

    res.json({
      success: true,
      data: {
        count: data.length,
        lessons: data,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get a single lesson for administration
 * @route   GET /api/admin/lessons/:id
 * @access  Private/Admin
 */
export const getAdminLesson = async (req, res, next) => {
  try {
    const lesson = await Lesson.findById(req.params.id);

    if (!lesson) {
      return res.status(404).json({
        success: false,
        message: 'Lección no encontrada.',
      });
    }

    const [exerciseCount, activeExerciseCount] = await Promise.all([
      Exercise.countDocuments({ lessonId: lesson._id }),
      Exercise.countDocuments({ lessonId: lesson._id, isActive: true }),
    ]);

    res.json({
      success: true,
      data: {
        lesson: lesson.toObject(),
        exerciseCount,
        activeExerciseCount,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Create a lesson
 * @route   POST /api/admin/lessons
 * @access  Private/Admin
 */
export const createLesson = async (req, res, next) => {
  try {
    const payload = pickAllowedFields(req.body, LESSON_FIELDS);

    if (!Object.prototype.hasOwnProperty.call(payload, 'order')) {
      const lastLesson = await Lesson.findOne()
        .sort({ order: -1 })
        .select('order')
        .lean();
      payload.order = lastLesson?.order != null ? lastLesson.order + 1 : 1;
    }

    const errors = validateLessonPayload(payload);
    if (errors.length) {
      return res.status(400).json({
        success: false,
        message: 'Error de validación.',
        errors,
      });
    }

    const lesson = await Lesson.create(payload);

    res.status(201).json({
      success: true,
      data: { lesson },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update a lesson
 * @route   PATCH /api/admin/lessons/:id
 * @access  Private/Admin
 */
export const updateLesson = async (req, res, next) => {
  try {
    const lesson = await Lesson.findById(req.params.id);

    if (!lesson) {
      return res.status(404).json({
        success: false,
        message: 'Lección no encontrada.',
      });
    }

    const updates = pickAllowedFields(req.body, LESSON_FIELDS);
    const candidate = { ...lesson.toObject(), ...updates };
    const errors = validateLessonPayload(candidate);

    if (errors.length) {
      return res.status(400).json({
        success: false,
        message: 'Error de validación.',
        errors,
      });
    }

    lesson.set(updates);
    await lesson.save();

    res.json({
      success: true,
      data: { lesson },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete a lesson and its exercises/progress
 * @route   DELETE /api/admin/lessons/:id
 * @access  Private/Admin
 */
export const deleteLesson = async (req, res, next) => {
  try {
    const lesson = await Lesson.findById(req.params.id);

    if (!lesson) {
      return res.status(404).json({
        success: false,
        message: 'Lección no encontrada.',
      });
    }

    const exercises = await Exercise.find({ lessonId: lesson._id })
      .select('_id')
      .lean();
    const exerciseIds = exercises.map((exercise) => exercise._id);

    await Progress.deleteMany({ exerciseId: { $in: exerciseIds } });
    await Exercise.deleteMany({ lessonId: lesson._id });
    await Lesson.findByIdAndDelete(lesson._id);

    res.json({
      success: true,
      data: {
        deletedLesson: lesson._id,
        deletedExercises: exerciseIds.length,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Publish or unpublish a lesson
 * @route   PATCH /api/admin/lessons/:id/publish
 * @access  Private/Admin
 */
export const publishLesson = async (req, res, next) => {
  try {
    const lesson = await Lesson.findById(req.params.id);

    if (!lesson) {
      return res.status(404).json({
        success: false,
        message: 'Lección no encontrada.',
      });
    }

    const isActive =
      typeof req.body.isActive === 'boolean'
        ? req.body.isActive
        : !lesson.isActive;

    lesson.isActive = isActive;
    await lesson.save();

    res.json({
      success: true,
      data: { lesson },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Reorder lessons
 * @route   PATCH /api/admin/lessons/reorder
 * @access  Private/Admin
 */
export const reorderLessons = async (req, res, next) => {
  try {
    const { lessons } = req.body;

    if (!Array.isArray(lessons) || lessons.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Debes enviar una lista de lecciones con su nuevo orden.',
      });
    }

    const ids = lessons.map((item) => item?.id);
    const valid = lessons.every(
      (item) =>
        item &&
        item.id &&
        typeof item.order === 'number' &&
        item.order >= 0
    );

    if (!valid || new Set(ids).size !== ids.length) {
      return res.status(400).json({
        success: false,
        message: 'Cada lección necesita un id único y un orden numérico.',
      });
    }

    const existing = await Lesson.countDocuments({ _id: { $in: ids } });
    if (existing !== ids.length) {
      return res.status(400).json({
        success: false,
        message: 'Alguna de las lecciones no existe.',
      });
    }

    await Lesson.bulkWrite(
      lessons.map((item) => ({
        updateOne: {
          filter: { _id: item.id },
          update: { $set: { order: item.order } },
        },
      }))
    );

    res.json({
      success: true,
      data: { updated: lessons.length },
    });
  } catch (error) {
    next(error);
  }
};
