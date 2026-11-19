import Achievement from '../models/Achievement.js';
import UserAchievement from '../models/UserAchievement.js';
import {
  pickAllowedFields,
  validateAchievementPayload,
} from '../services/content.service.js';

const ACHIEVEMENT_FIELDS = [
  'name',
  'nameEs',
  'description',
  'descriptionEs',
  'icon',
  'category',
  'condition',
  'threshold',
  'rewardPoints',
  'isActive',
];

/**
 * @desc    List all achievements for administration
 * @route   GET /api/admin/achievements
 * @access  Private/Admin
 */
export const getAdminAchievements = async (req, res, next) => {
  try {
    const achievements = await Achievement.find().sort({
      category: 1,
      threshold: 1,
      createdAt: 1,
    });

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
 * @desc    Create an achievement
 * @route   POST /api/admin/achievements
 * @access  Private/Admin
 */
export const createAchievement = async (req, res, next) => {
  try {
    const payload = pickAllowedFields(req.body, ACHIEVEMENT_FIELDS);
    const errors = validateAchievementPayload(payload);

    if (errors.length) {
      return res.status(400).json({
        success: false,
        message: 'Error de validación.',
        errors,
      });
    }

    const achievement = await Achievement.create(payload);

    res.status(201).json({
      success: true,
      data: { achievement },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update an achievement
 * @route   PATCH /api/admin/achievements/:id
 * @access  Private/Admin
 */
export const updateAchievement = async (req, res, next) => {
  try {
    const achievement = await Achievement.findById(req.params.id);

    if (!achievement) {
      return res.status(404).json({
        success: false,
        message: 'Logro no encontrado.',
      });
    }

    const updates = pickAllowedFields(req.body, ACHIEVEMENT_FIELDS);
    const candidate = { ...achievement.toObject(), ...updates };
    const errors = validateAchievementPayload(candidate);

    if (errors.length) {
      return res.status(400).json({
        success: false,
        message: 'Error de validación.',
        errors,
      });
    }

    achievement.set(updates);
    await achievement.save();

    res.json({
      success: true,
      data: { achievement },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete an achievement and earned records
 * @route   DELETE /api/admin/achievements/:id
 * @access  Private/Admin
 */
export const deleteAchievement = async (req, res, next) => {
  try {
    const achievement = await Achievement.findById(req.params.id);

    if (!achievement) {
      return res.status(404).json({
        success: false,
        message: 'Logro no encontrado.',
      });
    }

    const earned = await UserAchievement.deleteMany({
      achievementId: achievement._id,
    });
    await Achievement.findByIdAndDelete(achievement._id);

    res.json({
      success: true,
      data: {
        deletedAchievement: achievement._id,
        deletedEarnedRecords: earned.deletedCount || 0,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Publish or unpublish an achievement
 * @route   PATCH /api/admin/achievements/:id/publish
 * @access  Private/Admin
 */
export const publishAchievement = async (req, res, next) => {
  try {
    const achievement = await Achievement.findById(req.params.id);

    if (!achievement) {
      return res.status(404).json({
        success: false,
        message: 'Logro no encontrado.',
      });
    }

    const isActive =
      typeof req.body.isActive === 'boolean'
        ? req.body.isActive
        : !achievement.isActive;

    achievement.isActive = isActive;
    await achievement.save();

    res.json({
      success: true,
      data: { achievement },
    });
  } catch (error) {
    next(error);
  }
};
