import AppSetting, { DEFAULT_SETTINGS } from '../models/AppSetting.js';

export const getAppSettings = async () => {
  let settings = await AppSetting.findOne({ key: 'global' });

  if (!settings) {
    settings = await AppSetting.create({
      key: 'global',
      ...DEFAULT_SETTINGS,
      levels: DEFAULT_SETTINGS.levels.map((level) => ({ ...level })),
      pointsByExerciseType: { ...DEFAULT_SETTINGS.pointsByExerciseType },
      dailyGoals: [...DEFAULT_SETTINGS.dailyGoals],
      avatarCharacters: [...DEFAULT_SETTINGS.avatarCharacters],
      avatarColors: [...DEFAULT_SETTINGS.avatarColors],
      featureFlags: { ...DEFAULT_SETTINGS.featureFlags },
      legal: { ...DEFAULT_SETTINGS.legal },
    });
  }

  return settings;
};

export const updateAppSettings = async (updates) => {
  const settings = await getAppSettings();

  if (updates.levels) {
    settings.levels = updates.levels.map((level) => ({ ...level }));
  }

  if (updates.pointsByExerciseType) {
    settings.pointsByExerciseType = new Map(
      Object.entries(updates.pointsByExerciseType)
    );
  }

  if (updates.dailyGoals) {
    settings.dailyGoals = [...updates.dailyGoals];
  }

  if (updates.avatarCharacters) {
    settings.avatarCharacters = [...updates.avatarCharacters];
  }

  if (updates.avatarColors) {
    settings.avatarColors = [...updates.avatarColors];
  }

  if (updates.featureFlags) {
    settings.featureFlags = {
      ...settings.featureFlags,
      ...updates.featureFlags,
    };
  }

  if (updates.legal) {
    settings.legal = {
      ...settings.legal,
      ...updates.legal,
    };
  }

  await settings.save();
  return settings;
};

export const getPublicSettingsPayload = (settings) => {
  const plain = settings.toObject
    ? settings.toObject({ flattenMaps: true })
    : settings;

  return {
    levels: plain.levels,
    pointsByExerciseType: plain.pointsByExerciseType,
    dailyGoals: plain.dailyGoals,
    avatarCharacters: plain.avatarCharacters,
    avatarColors: plain.avatarColors,
    featureFlags: plain.featureFlags,
    supportEmail: plain.legal?.supportEmail || '',
  };
};
