/**
 * Calculate score based on exercise type and answer comparison
 * @param {string} exerciseType - Type of exercise
 * @param {*} userAnswer - The user's submitted answer
 * @param {*} correctAnswer - The correct answer
 * @returns {number} Score between 0-100
 */
export const calculateScore = (exerciseType, userAnswer, correctAnswer) => {
  if (!userAnswer) return 0;

  const normalize = (str) =>
    String(str).toLowerCase().trim().replace(/\s+/g, ' ');

  switch (exerciseType) {
    case 'fill-blank':
    case 'listen-select':
    case 'listen-repeat':
    case 'phonics': {
      // Exact match (case-insensitive)
      return normalize(userAnswer) === normalize(correctAnswer) ? 100 : 0;
    }

    case 'translate':
    case 'dictation': {
      const normalizedUser = normalize(userAnswer);
      const normalizedCorrect = normalize(correctAnswer);

      if (normalizedUser === normalizedCorrect) return 100;

      // Partial credit: calculate similarity using Levenshtein-like approach
      const similarity = calculateSimilarity(normalizedUser, normalizedCorrect);

      if (similarity >= 0.9) return 90;
      if (similarity >= 0.75) return 75;
      if (similarity >= 0.5) return 50;
      if (similarity >= 0.3) return 25;
      return 0;
    }

    case 'order-words': {
      const userStr = normalize(
        Array.isArray(userAnswer) ? userAnswer.join(' ') : userAnswer
      );
      const correctStr = normalize(
        Array.isArray(correctAnswer) ? correctAnswer.join(' ') : correctAnswer
      );

      if (userStr === correctStr) return 100;

      // Partial credit: check word overlap
      const userWords = userStr.split(' ');
      const correctWords = correctStr.split(' ');
      let correctPositions = 0;
      for (let i = 0; i < Math.min(userWords.length, correctWords.length); i++) {
        if (userWords[i] === correctWords[i]) correctPositions++;
      }
      const ratio = correctPositions / correctWords.length;
      return Math.round(ratio * 100);
    }

    case 'song':
    case 'story':
    case 'mini-story': {
      // For these types, check if the answer matches
      if (Array.isArray(correctAnswer)) {
        const normalizedUser = normalize(userAnswer);
        return correctAnswer.some((ans) => normalize(ans) === normalizedUser)
          ? 100
          : 0;
      }
      return normalize(userAnswer) === normalize(correctAnswer) ? 100 : 0;
    }

    default:
      return normalize(userAnswer) === normalize(correctAnswer) ? 100 : 0;
  }
};

/**
 * Calculate string similarity (0-1)
 */
const calculateSimilarity = (str1, str2) => {
  if (str1 === str2) return 1;
  if (!str1.length || !str2.length) return 0;

  const longer = str1.length > str2.length ? str1 : str2;
  const shorter = str1.length > str2.length ? str2 : str1;

  const longerLength = longer.length;
  if (longerLength === 0) return 1.0;

  const distance = levenshteinDistance(longer, shorter);
  return (longerLength - distance) / longerLength;
};

/**
 * Levenshtein distance between two strings
 */
const levenshteinDistance = (s1, s2) => {
  const costs = [];
  for (let i = 0; i <= s1.length; i++) {
    let lastValue = i;
    for (let j = 0; j <= s2.length; j++) {
      if (i === 0) {
        costs[j] = j;
      } else if (j > 0) {
        let newValue = costs[j - 1];
        if (s1.charAt(i - 1) !== s2.charAt(j - 1)) {
          newValue = Math.min(Math.min(newValue, lastValue), costs[j]) + 1;
        }
        costs[j - 1] = lastValue;
        lastValue = newValue;
      }
    }
    if (i > 0) costs[s2.length] = lastValue;
  }
  return costs[s2.length];
};

/**
 * Get an encouraging message from Matey based on the result
 * @param {boolean} isCorrect - Whether the answer was correct
 * @param {number} score - Score achieved (0-100)
 * @param {number} attempts - Number of attempts on this exercise
 * @returns {string} Encouraging message in Spanish
 */
export const getMateyMessage = (isCorrect, score, attempts) => {
  if (isCorrect && score === 100) {
    const perfectMessages = [
      '🌟 ¡Perfecto! ¡Eres increíble! ¡Matey está muy orgulloso de ti!',
      '🎉 ¡Excelente trabajo! ¡Lo hiciste perfecto! ¡Sigue así, campeón!',
      '🏆 ¡WOW! ¡Respuesta perfecta! ¡Eres una estrella del inglés!',
      '✨ ¡Genial! ¡No te equivocaste en nada! ¡Matey te da cinco! ✋',
      '🚀 ¡Increíble! ¡Respuesta perfecta! ¡Estás volando alto!',
    ];
    return perfectMessages[Math.floor(Math.random() * perfectMessages.length)];
  }

  if (isCorrect && score >= 75) {
    const goodMessages = [
      '👏 ¡Muy bien! ¡Casi perfecto! ¡Sigue practicando!',
      '😊 ¡Buen trabajo! ¡Estás muy cerca de la perfección!',
      '💪 ¡Bien hecho! ¡Un poquito más y será perfecto!',
    ];
    return goodMessages[Math.floor(Math.random() * goodMessages.length)];
  }

  if (isCorrect && score >= 50) {
    const okMessages = [
      '🤔 ¡Vas por buen camino! ¡Intenta mejorar un poquito más!',
      '📚 ¡Buen intento! ¡Revisa los detalles y serás imparable!',
      '💡 ¡No está mal! ¡Con un poco más de práctica lo dominarás!',
    ];
    return okMessages[Math.floor(Math.random() * okMessages.length)];
  }

  // Incorrect answer
  if (attempts <= 1) {
    const firstTryMessages = [
      '😊 ¡No te preocupes! ¡Todos aprendemos de los errores! ¡Inténtalo de nuevo!',
      '💪 ¡Ánimo! ¡Cada error te hace más fuerte! ¡Vuelve a intentarlo!',
      '🌈 ¡No pasa nada! ¡Matey cree en ti! ¡Prueba otra vez!',
    ];
    return firstTryMessages[Math.floor(Math.random() * firstTryMessages.length)];
  }

  if (attempts <= 3) {
    const retryMessages = [
      '🤗 ¡Sigue intentando! ¡La práctica hace al maestro! Revisa las pistas.',
      '📖 ¡No te rindas! Lee bien la pregunta e inténtalo una vez más.',
      '🌟 ¡Tú puedes! ¡Matey sabe que lo lograrás! Fíjate en las pistas.',
    ];
    return retryMessages[Math.floor(Math.random() * retryMessages.length)];
  }

  return '💝 ¡No te desanimes! ¡Aprender es un proceso! Mira la respuesta correcta y sigue adelante. ¡Matey está contigo!';
};
