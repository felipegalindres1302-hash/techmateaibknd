import { EXERCISE_TYPES } from '../services/content.service.js';
import {
  getAppSettings,
  getPublicSettingsPayload,
  updateAppSettings,
} from '../services/settings.service.js';

const FEATURE_FLAGS = ['aiChat', 'microphone', 'weeklyReports'];
const LEGAL_FIELDS = ['privacyPolicy', 'terms', 'supportEmail'];

const hasOwn = (source, key) =>
  Object.prototype.hasOwnProperty.call(source, key);

const isPlainObject = (value) =>
  Boolean(value) && typeof value === 'object' && !Array.isArray(value);

const isNonEmptyString = (value) =>
  typeof value === 'string' && value.trim().length > 0;

const isNumber = (value) => typeof value === 'number' && Number.isFinite(value);

/**
 * @desc    Get full application settings
 * @route   GET /api/admin/settings
 * @access  Private/Admin
 */
export const getAdminSettings = async (req, res, next) => {
  try {
    const settings = await getAppSettings();

    res.json({
      success: true,
      data: { settings: settings.toObject({ flattenMaps: true }) },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update application settings
 * @route   PATCH /api/admin/settings
 * @access  Private/Admin
 */
export const updateAdminSettings = async (req, res, next) => {
  try {
    const body = req.body || {};
    const updates = {};
    const errors = [];

    if (hasOwn(body, 'levels')) {
      if (!Array.isArray(body.levels) || body.levels.length === 0) {
        errors.push('Los niveles deben ser una lista no vacía.');
      } else {
        const levels = [];
        const keys = new Set();
        const minPointsSet = new Set();

        body.levels.forEach((level, index) => {
          if (!isPlainObject(level)) {
            errors.push(`El nivel ${index + 1} debe ser un objeto.`);
            return;
          }

          if (!isNonEmptyString(level.key)) {
            errors.push(`El nivel ${index + 1} necesita una clave.`);
          } else if (keys.has(level.key.trim())) {
            errors.push(`La clave de nivel "${level.key}" está duplicada.`);
          } else {
            keys.add(level.key.trim());
          }

          if (!isNonEmptyString(level.label)) {
            errors.push(`El nivel ${index + 1} necesita una etiqueta.`);
          }

          if (!isNumber(level.minPoints) || level.minPoints < 0) {
            errors.push(
              `El nivel ${index + 1} necesita puntos mínimos válidos.`
            );
          } else if (minPointsSet.has(level.minPoints)) {
            errors.push(
              `Los puntos mínimos ${level.minPoints} están duplicados.`
            );
          } else {
            minPointsSet.add(level.minPoints);
          }

          if (level.emoji != null && typeof level.emoji !== 'string') {
            errors.push(`El emoji del nivel ${index + 1} debe ser un texto.`);
          }

          levels.push({
            key: typeof level.key === 'string' ? level.key.trim() : '',
            label: typeof level.label === 'string' ? level.label.trim() : '',
            minPoints: isNumber(level.minPoints) ? level.minPoints : 0,
            emoji: typeof level.emoji === 'string' ? level.emoji : '⭐',
          });
        });

        updates.levels = levels.sort((a, b) => a.minPoints - b.minPoints);
      }
    }

    if (hasOwn(body, 'pointsByExerciseType')) {
      if (!isPlainObject(body.pointsByExerciseType)) {
        errors.push('Los puntos por tipo de ejercicio deben ser un objeto.');
      } else {
        const points = {};

        Object.entries(body.pointsByExerciseType).forEach(([type, value]) => {
          if (!EXERCISE_TYPES.includes(type)) {
            errors.push(`Tipo de ejercicio no válido: ${type}.`);
            return;
          }

          if (!isNumber(value) || value < 0) {
            errors.push(`Los puntos de "${type}" deben ser un número positivo.`);
            return;
          }

          points[type] = value;
        });

        updates.pointsByExerciseType = points;
      }
    }

    if (hasOwn(body, 'dailyGoals')) {
      if (
        !Array.isArray(body.dailyGoals) ||
        body.dailyGoals.length === 0 ||
        !body.dailyGoals.every(
          (goal) => isNumber(goal) && goal > 0
        )
      ) {
        errors.push('Las metas diarias deben ser una lista de números positivos.');
      } else {
        updates.dailyGoals = body.dailyGoals;
      }
    }

    if (hasOwn(body, 'avatarCharacters')) {
      if (
        !Array.isArray(body.avatarCharacters) ||
        body.avatarCharacters.length === 0 ||
        !body.avatarCharacters.every(isNonEmptyString)
      ) {
        errors.push('Los personajes de avatar deben ser una lista de textos.');
      } else {
        updates.avatarCharacters = body.avatarCharacters;
      }
    }

    if (hasOwn(body, 'avatarColors')) {
      if (
        !Array.isArray(body.avatarColors) ||
        body.avatarColors.length === 0 ||
        !body.avatarColors.every(isNonEmptyString)
      ) {
        errors.push('Los colores de avatar deben ser una lista de textos.');
      } else {
        updates.avatarColors = body.avatarColors;
      }
    }

    if (hasOwn(body, 'featureFlags')) {
      if (!isPlainObject(body.featureFlags)) {
        errors.push('Las funcionalidades deben ser un objeto.');
      } else {
        const flags = {};

        Object.entries(body.featureFlags).forEach(([key, value]) => {
          if (!FEATURE_FLAGS.includes(key)) {
            errors.push(`Funcionalidad no válida: ${key}.`);
            return;
          }

          if (typeof value !== 'boolean') {
            errors.push(`La funcionalidad "${key}" debe ser verdadera o falsa.`);
            return;
          }

          flags[key] = value;
        });

        updates.featureFlags = flags;
      }
    }

    if (hasOwn(body, 'legal')) {
      if (!isPlainObject(body.legal)) {
        errors.push('La información legal debe ser un objeto.');
      } else {
        const legal = {};

        Object.entries(body.legal).forEach(([key, value]) => {
          if (!LEGAL_FIELDS.includes(key)) {
            errors.push(`Campo legal no válido: ${key}.`);
            return;
          }

          if (typeof value !== 'string') {
            errors.push(`El campo legal "${key}" debe ser un texto.`);
            return;
          }

          legal[key] = value;
        });

        updates.legal = legal;
      }
    }

    if (errors.length) {
      return res.status(400).json({
        success: false,
        message: 'Error de validación.',
        errors,
      });
    }

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No se enviaron cambios para guardar.',
      });
    }

    const settings = await updateAppSettings(updates);

    res.json({
      success: true,
      data: { settings: settings.toObject({ flattenMaps: true }) },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get public application settings
 * @route   GET /api/settings
 * @access  Public
 */
export const getPublicSettings = async (req, res, next) => {
  try {
    const settings = await getAppSettings();

    res.json({
      success: true,
      data: { settings: getPublicSettingsPayload(settings) },
    });
  } catch (error) {
    next(error);
  }
};
