import mongoose from 'mongoose';

export const DEFAULT_LEVELS = [
  { key: 'explorer', label: 'Explorador', minPoints: 0, emoji: '🌱' },
  { key: 'adventurer', label: 'Aventurero', minPoints: 100, emoji: '🌿' },
  { key: 'discoverer', label: 'Descubridor', minPoints: 300, emoji: '🌳' },
  { key: 'conqueror', label: 'Conquistador', minPoints: 600, emoji: '⭐' },
  { key: 'master', label: 'Maestro', minPoints: 1000, emoji: '🏆' },
  { key: 'legend', label: 'Leyenda', minPoints: 1500, emoji: '👑' },
  { key: 'genius', label: 'Genio', minPoints: 2500, emoji: '🚀' },
];

export const DEFAULT_POINTS_BY_EXERCISE_TYPE = {
  'fill-blank': 10,
  translate: 15,
  'order-words': 15,
  dictation: 20,
  'listen-select': 10,
  'listen-repeat': 15,
  song: 20,
  story: 20,
  phonics: 10,
  'mini-story': 20,
};

export const DEFAULT_SETTINGS = {
  levels: DEFAULT_LEVELS,
  pointsByExerciseType: DEFAULT_POINTS_BY_EXERCISE_TYPE,
  dailyGoals: [5, 10, 15],
  avatarCharacters: ['matey', 'robot', 'star', 'rocket'],
  avatarColors: ['#4FC3F7', '#F59E0B', '#10B981', '#EF4444', '#8B5CF6'],
  featureFlags: {
    aiChat: false,
    microphone: false,
    weeklyReports: false,
  },
  legal: {
    privacyPolicy: '',
    terms: '',
    supportEmail: '',
  },
};

const levelSchema = new mongoose.Schema(
  {
    key: {
      type: String,
      required: true,
      trim: true,
    },
    label: {
      type: String,
      required: true,
      trim: true,
    },
    minPoints: {
      type: Number,
      required: true,
      min: 0,
    },
    emoji: {
      type: String,
      default: '⭐',
    },
  },
  { _id: false }
);

const appSettingSchema = new mongoose.Schema(
  {
    key: {
      type: String,
      unique: true,
      default: 'global',
    },
    levels: {
      type: [levelSchema],
      default: () => DEFAULT_LEVELS.map((level) => ({ ...level })),
    },
    pointsByExerciseType: {
      type: Map,
      of: Number,
      default: () => ({ ...DEFAULT_POINTS_BY_EXERCISE_TYPE }),
    },
    dailyGoals: {
      type: [Number],
      default: () => [...DEFAULT_SETTINGS.dailyGoals],
    },
    avatarCharacters: {
      type: [String],
      default: () => [...DEFAULT_SETTINGS.avatarCharacters],
    },
    avatarColors: {
      type: [String],
      default: () => [...DEFAULT_SETTINGS.avatarColors],
    },
    featureFlags: {
      aiChat: { type: Boolean, default: false },
      microphone: { type: Boolean, default: false },
      weeklyReports: { type: Boolean, default: false },
    },
    legal: {
      privacyPolicy: { type: String, default: '' },
      terms: { type: String, default: '' },
      supportEmail: { type: String, default: '' },
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: true },
  }
);

const AppSetting = mongoose.model('AppSetting', appSettingSchema);

export default AppSetting;
