import Lesson from '../models/Lesson.js';
import Exercise from '../models/Exercise.js';
import Achievement from '../models/Achievement.js';
import User from '../models/User.js';
import Progress from '../models/Progress.js';
import UserAchievement from '../models/UserAchievement.js';

/**
 * @desc    Get administration dashboard statistics
 * @route   GET /api/admin/stats
 * @access  Private/Admin
 */
export const getAdminStats = async (req, res, next) => {
  try {
    const [
      lessonsTotal,
      lessonsActive,
      exercisesTotal,
      exercisesActive,
      achievementsTotal,
      achievementsActive,
      usersTotal,
      parents,
      children,
      admins,
      progressTotal,
      progressCompleted,
      earnedAchievements,
    ] = await Promise.all([
      Lesson.countDocuments(),
      Lesson.countDocuments({ isActive: true }),
      Exercise.countDocuments(),
      Exercise.countDocuments({ isActive: true }),
      Achievement.countDocuments(),
      Achievement.countDocuments({ isActive: true }),
      User.countDocuments(),
      User.countDocuments({ role: 'parent' }),
      User.countDocuments({ role: 'child' }),
      User.countDocuments({ role: 'admin' }),
      Progress.countDocuments(),
      Progress.countDocuments({ completed: true }),
      UserAchievement.countDocuments(),
    ]);

    res.json({
      success: true,
      data: {
        stats: {
          lessons: { total: lessonsTotal, active: lessonsActive },
          exercises: { total: exercisesTotal, active: exercisesActive },
          achievements: { total: achievementsTotal, active: achievementsActive },
          users: { total: usersTotal, parents, children, admins },
          progress: {
            total: progressTotal,
            completed: progressCompleted,
          },
          earnedAchievements,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};
