import User from '../models/User.js';
import Achievement from '../models/Achievement.js';
import UserAchievement from '../models/UserAchievement.js';
import Progress from '../models/Progress.js';
import Exercise from '../models/Exercise.js';

/**
 * Calculate user level based on total points
 * @param {number} totalPoints
 * @returns {string} level string
 */
export const calculateLevel = (totalPoints) => {
  if (totalPoints >= 1000) return 'master';
  if (totalPoints >= 600) return 'champion';
  if (totalPoints >= 300) return 'adventurer';
  if (totalPoints >= 100) return 'explorer';
  return 'beginner';
};

/**
 * Add points to a user, recalculate level, and update streak
 * @param {string} userId
 * @param {number} pointsToAdd
 * @returns {Object} Updated user data
 */
export const updateUserPoints = async (userId, pointsToAdd) => {
  const user = await User.findById(userId);
  if (!user) throw new Error('Usuario no encontrado');

  // Add points
  user.totalPoints += pointsToAdd;

  // Recalculate level
  user.level = calculateLevel(user.totalPoints);

  // Update streak
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  if (user.lastActiveDate) {
    const lastActive = new Date(user.lastActiveDate);
    const lastActiveDay = new Date(
      lastActive.getFullYear(),
      lastActive.getMonth(),
      lastActive.getDate()
    );

    const diffTime = today.getTime() - lastActiveDay.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) {
      // Consecutive day: increment streak
      user.currentStreak += 1;
    } else if (diffDays > 1) {
      // Streak broken: reset to 1
      user.currentStreak = 1;
    }
    // If diffDays === 0, same day - do not change streak
  } else {
    // First activity ever
    user.currentStreak = 1;
  }

  user.lastActiveDate = now;
  await user.save();

  return {
    totalPoints: user.totalPoints,
    level: user.level,
    currentStreak: user.currentStreak,
  };
};

/**
 * Check all achievement conditions and award any newly earned ones
 * @param {string} userId
 * @returns {Array} Array of newly earned achievements
 */
export const checkAndAwardAchievements = async (userId) => {
  const user = await User.findById(userId);
  if (!user) return [];

  // Get all active achievements
  const allAchievements = await Achievement.find({ isActive: true });

  // Get already earned achievement IDs
  const earnedAchievements = await UserAchievement.find({ userId }).select(
    'achievementId'
  );
  const earnedIds = new Set(
    earnedAchievements.map((ea) => ea.achievementId.toString())
  );

  // Get user stats for condition checks
  const totalCompleted = await Progress.countDocuments({
    userId,
    completed: true,
  });

  const writingCompleted = await getCompletedByCategory(userId, 'writing');
  const listeningCompleted = await getCompletedByCategory(userId, 'listening');

  const perfectScores = await Progress.countDocuments({
    userId,
    completed: true,
    bestScore: 100,
  });

  const newlyEarned = [];

  for (const achievement of allAchievements) {
    // Skip already earned
    if (earnedIds.has(achievement._id.toString())) continue;

    let earned = false;

    switch (achievement.condition) {
      case 'exercises_completed':
        earned = totalCompleted >= achievement.threshold;
        break;
      case 'writing_completed':
        earned = writingCompleted >= achievement.threshold;
        break;
      case 'listening_completed':
        earned = listeningCompleted >= achievement.threshold;
        break;
      case 'streak_days':
        earned = user.currentStreak >= achievement.threshold;
        break;
      case 'total_points':
        earned = user.totalPoints >= achievement.threshold;
        break;
      case 'perfect_scores':
        earned = perfectScores >= achievement.threshold;
        break;
      default:
        break;
    }

    if (earned) {
      await UserAchievement.create({
        userId,
        achievementId: achievement._id,
      });

      // Award bonus points for earning achievement
      user.totalPoints += achievement.rewardPoints;
      user.level = calculateLevel(user.totalPoints);

      newlyEarned.push({
        name: achievement.name,
        nameEs: achievement.nameEs,
        description: achievement.description,
        descriptionEs: achievement.descriptionEs,
        icon: achievement.icon,
        rewardPoints: achievement.rewardPoints,
      });
    }
  }

  if (newlyEarned.length > 0) {
    await user.save();
  }

  return newlyEarned;
};

/**
 * Helper: count completed exercises by lesson category
 */
const getCompletedByCategory = async (userId, category) => {
  // Get lesson IDs for the given category
  const { default: Lesson } = await import('../models/Lesson.js');
  const lessons = await Lesson.find({ category }).select('_id');
  const lessonIds = lessons.map((l) => l._id);

  return Progress.countDocuments({
    userId,
    lessonId: { $in: lessonIds },
    completed: true,
  });
};
