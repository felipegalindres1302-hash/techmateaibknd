import mongoose from 'mongoose';
import config from '../config/env.js';
import Lesson from '../models/Lesson.js';
import Exercise from '../models/Exercise.js';
import Achievement from '../models/Achievement.js';
import Progress from '../models/Progress.js';
import UserAchievement from '../models/UserAchievement.js';

import { lessonsData } from './lessons.seed.js';
import { getExercisesData } from './exercises.seed.js';
import { achievementsData } from './achievements.seed.js';

const runSeeds = async () => {
  try {
    console.log('🔄 Conectando a MongoDB para sembrar datos...');
    await mongoose.connect(config.mongodbUri);
    console.log('✅ Conectado a MongoDB');

    // Clear old data
    console.log('🧹 Limpiando colecciones anteriores...');
    await Lesson.deleteMany({});
    await Exercise.deleteMany({});
    await Achievement.deleteMany({});
    await Progress.deleteMany({});
    await UserAchievement.deleteMany({});
    console.log('✅ Colecciones limpias.');

    // 1. Insert Lessons
    console.log('🌱 Insertando lecciones...');
    const insertedLessons = await Lesson.insertMany(lessonsData);
    console.log(`✅ ${insertedLessons.length} lecciones creadas.`);

    // Map lessons by title for exercise association
    const lessonsMap = new Map();
    insertedLessons.forEach((l) => lessonsMap.set(l.title, l));

    // 2. Insert Exercises
    console.log('🌱 Insertando ejercicios vinculados...');
    const exercisesData = getExercisesData(lessonsMap);
    const insertedExercises = await Exercise.insertMany(exercisesData);
    console.log(`✅ ${insertedExercises.length} ejercicios creados.`);

    // 3. Insert Achievements
    console.log('🌱 Insertando logros...');
    const insertedAchievements = await Achievement.insertMany(achievementsData);
    console.log(`✅ ${insertedAchievements.length} logros creados.`);

    console.log('🎉 ¡Seeds ejecutados exitosamente en TechMate AI!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error ejecutando seeds:', error);
    process.exit(1);
  }
};

runSeeds();
