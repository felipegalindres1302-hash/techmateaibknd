import Achievement from '../models/Achievement.js';
import UserAchievement from '../models/UserAchievement.js';

/**
 * @desc    Get all available achievements
 * @route   GET /api/achievements
 * @access  Public
 */
export const getAchievements = async (req, res, next) => {
  try {
    const achievements = await Achievement.find({ isActive: true });
    res.json({
      success: true,
      data: {
        count: achievements.length,
        achievements,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get achievements earned by the authenticated user
 * @route   GET /api/achievements/mine
 * @access  Private
 */
export const getMyAchievements = async (req, res, next) => {
  try {
    const userId = req.user._id;

    // Get all user unlocked achievements
    const earned = await UserAchievement.find({ userId })
      .populate('achievementId')
      .sort({ earnedAt: -1 });

    const allAchievements = await Achievement.find({ isActive: true });

    // Map which ones are unlocked
    const earnedIds = new Set(earned.map((ua) => ua.achievementId?._id?.toString()));

    const result = allAchievements.map((ach) => {
      const isEarned = earnedIds.has(ach._id.toString());
      const earnedRecord = earned.find(
        (ua) => ua.achievementId?._id?.toString() === ach._id.toString()
      );

      return {
        _id: ach._id,
        name: ach.name,
        nameEs: ach.nameEs,
        description: ach.description,
        descriptionEs: ach.descriptionEs,
        icon: ach.icon,
        category: ach.category,
        rewardPoints: ach.rewardPoints,
        unlocked: isEarned,
        earnedAt: earnedRecord ? earnedRecord.earnedAt : null,
      };
    });

    res.json({
      success: true,
      data: {
        totalEarned: earned.length,
        totalAvailable: allAchievements.length,
        achievements: result,
      },
    });
  } catch (error) {
    next(error);
  }
};

