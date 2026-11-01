import Lesson from '../models/Lesson.js';
import Exercise from '../models/Exercise.js';

/**
 * @desc    Get all active lessons with optional filters
 * @route   GET /api/lessons
 * @access  Public
 */
export const getLessons = async (req, res, next) => {
  try {
    const { category, difficulty } = req.query;

    const filter = { isActive: true };
    if (category) filter.category = category;
    if (difficulty) filter.difficulty = difficulty;

    const lessons = await Lesson.find(filter).sort({ order: 1 });

    res.json({
      success: true,
      data: {
        count: lessons.length,
        lessons,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get single lesson by ID
 * @route   GET /api/lessons/:id
 * @access  Public
 */
export const getLessonById = async (req, res, next) => {
  try {
    const lesson = await Lesson.findById(req.params.id);

    if (!lesson) {
      return res.status(404).json({
        success: false,
        message: 'Lección no encontrada.',
      });
    }

    res.json({
      success: true,
      data: { lesson },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all exercises for a lesson
 * @route   GET /api/lessons/:id/exercises
 * @access  Private
 */
export const getLessonExercises = async (req, res, next) => {
  try {
    const lesson = await Lesson.findById(req.params.id);

    if (!lesson) {
      return res.status(404).json({
        success: false,
        message: 'Lección no encontrada.',
      });
    }

    const exercises = await Exercise.find({
      lessonId: req.params.id,
      isActive: true,
    }).sort({ order: 1 });

    res.json({
      success: true,
      data: {
        lesson: {
          id: lesson._id,
          title: lesson.title,
          titleEs: lesson.titleEs,
        },
        count: exercises.length,
        exercises,
      },
    });
  } catch (error) {
    next(error);
  }
};
