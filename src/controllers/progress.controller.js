import Progress from '../models/Progress.js';
import Lesson from '../models/Lesson.js';
import Exercise from '../models/Exercise.js';
import User from '../models/User.js';

/**
 * @desc    Get progress summary for the current user
 * @route   GET /api/progress/summary
 * @access  Private
 */
export const getProgressSummary = async (req, res, next) => {
  try {
    const userId = req.user._id;

    // Total exercises completed
    const totalCompleted = await Progress.countDocuments({
      userId,
      completed: true,
    });

    // Total exercises available
    const totalExercises = await Exercise.countDocuments({ isActive: true });

    // Get user data for points and level
    const user = await User.findById(userId);

    // Completion percentage per category
    const categories = ['writing', 'listening'];
    const categoryProgress = {};

    for (const category of categories) {
      const lessons = await Lesson.find({ category, isActive: true }).select('_id');
      const lessonIds = lessons.map((l) => l._id);

      const categoryExercises = await Exercise.countDocuments({
        lessonId: { $in: lessonIds },
        isActive: true,
      });

      const categoryCompleted = await Progress.countDocuments({
        userId,
        lessonId: { $in: lessonIds },
        completed: true,
      });

      categoryProgress[category] = {
        total: categoryExercises,
        completed: categoryCompleted,
        percentage:
          categoryExercises > 0
            ? Math.round((categoryCompleted / categoryExercises) * 100)
            : 0,
      };
    }

    res.json({
      success: true,
      data: {
        totalExercises,
        totalCompleted,
        overallPercentage:
          totalExercises > 0
            ? Math.round((totalCompleted / totalExercises) * 100)
            : 0,
        totalPoints: user.totalPoints,
        level: user.level,
        currentStreak: user.currentStreak,
        categoryProgress,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get current streak info
 * @route   GET /api/progress/streak
 * @access  Private
 */
export const getStreak = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);

    res.json({
      success: true,
      data: {
        currentStreak: user.currentStreak,
        lastActiveDate: user.lastActiveDate,
        level: user.level,
        totalPoints: user.totalPoints,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get progress for all exercises in a specific lesson
 * @route   GET /api/progress/lesson/:lessonId
 * @access  Private
 */
export const getLessonProgress = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { lessonId } = req.params;

    // Verify lesson exists
    const lesson = await Lesson.findById(lessonId);
    if (!lesson) {
      return res.status(404).json({
        success: false,
        message: 'Lección no encontrada.',
      });
    }

    // Get all exercises for the lesson
    const exercises = await Exercise.find({
      lessonId,
      isActive: true,
    }).sort({ order: 1 });

    // Get progress for each exercise
    const progressRecords = await Progress.find({
      userId,
      lessonId,
    });

    // Map progress by exerciseId for quick lookup
    const progressMap = new Map();
    progressRecords.forEach((p) => {
      progressMap.set(p.exerciseId.toString(), p);
    });

    // Build exercise progress list
    const exerciseProgress = exercises.map((exercise) => {
      const prog = progressMap.get(exercise._id.toString());
      return {
        exerciseId: exercise._id,
        type: exercise.type,
        instruction: exercise.instruction,
        instructionEs: exercise.instructionEs,
        completed: prog ? prog.completed : false,
        score: prog ? prog.score : 0,
        bestScore: prog ? prog.bestScore : 0,
        attempts: prog ? prog.attempts : 0,
      };
    });

    const completedCount = exerciseProgress.filter((e) => e.completed).length;

    res.json({
      success: true,
      data: {
        lesson: {
          id: lesson._id,
          title: lesson.title,
          titleEs: lesson.titleEs,
          category: lesson.category,
          difficulty: lesson.difficulty,
        },
        totalExercises: exercises.length,
        completedExercises: completedCount,
        percentage:
          exercises.length > 0
            ? Math.round((completedCount / exercises.length) * 100)
            : 0,
        exercises: exerciseProgress,
      },
    });
  } catch (error) {
    next(error);
  }
};
