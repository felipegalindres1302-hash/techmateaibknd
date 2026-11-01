import Exercise from '../models/Exercise.js';
import Progress from '../models/Progress.js';
import { calculateScore, getMateyMessage } from '../services/progress.service.js';
import {
  updateUserPoints,
  checkAndAwardAchievements,
} from '../services/gamification.service.js';

/**
 * @desc    Submit an answer for an exercise
 * @route   POST /api/exercises/:id/submit
 * @access  Private
 */
export const submitAnswer = async (req, res, next) => {
  try {
    const userAnswer = req.body.userAnswer ?? req.body.answer;
    const { timeSpent } = req.body;
    const exerciseId = req.params.id;
    const userId = req.user._id;

    // Find the exercise
    const exercise = await Exercise.findById(exerciseId);
    if (!exercise) {
      return res.status(404).json({
        success: false,
        message: 'Ejercicio no encontrado.',
      });
    }

    // Calculate score
    const score = calculateScore(
      exercise.type,
      userAnswer,
      exercise.correctAnswer
    );
    const isCorrect = score >= 50;

    // Find or create progress record
    let progress = await Progress.findOne({ userId, exerciseId });

    if (progress) {
      // Update existing progress
      progress.attempts += 1;
      progress.score = score;
      if (score > progress.bestScore) {
        progress.bestScore = score;
      }
      if (timeSpent) {
        progress.timeSpent += timeSpent;
      }
      if (isCorrect && !progress.completed) {
        progress.completed = true;
        progress.completedAt = new Date();
      }
    } else {
      // Create new progress
      progress = new Progress({
        userId,
        lessonId: exercise.lessonId,
        exerciseId,
        completed: isCorrect,
        score,
        attempts: 1,
        bestScore: score,
        timeSpent: timeSpent || 0,
        completedAt: isCorrect ? new Date() : null,
      });
    }

    await progress.save();

    // Award points if correct (first time or better score)
    let pointsAwarded = 0;
    let userStats = null;
    let newAchievements = [];

    if (isCorrect) {
      // Points based on score percentage of exercise points
      pointsAwarded = Math.round((score / 100) * exercise.points);

      // Only award if this is first completion or better score
      if (progress.attempts === 1 || score >= progress.bestScore) {
        userStats = await updateUserPoints(userId, pointsAwarded);
        newAchievements = await checkAndAwardAchievements(userId);
      }
    }

    // Get encouraging message from Matey
    const mateyMessage = getMateyMessage(isCorrect, score, progress.attempts);

    const response = {
      success: true,
      data: {
        correct: isCorrect,
        score,
        bestScore: progress.bestScore,
        attempts: progress.attempts,
        pointsAwarded,
        mateyMessage,
      },
    };

    // Include correct answer if wrong (to help learning)
    if (!isCorrect) {
      response.data.correctAnswer = exercise.correctAnswer;
    }

    // Include user stats if updated
    if (userStats) {
      response.data.userStats = userStats;
    }

    // Include newly earned achievements
    if (newAchievements.length > 0) {
      response.data.newAchievements = newAchievements;
    }

    res.json(response);
  } catch (error) {
    next(error);
  }
};
