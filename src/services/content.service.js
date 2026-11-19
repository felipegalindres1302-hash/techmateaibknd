export const EXERCISE_TYPES = [
  'fill-blank',
  'translate',
  'order-words',
  'dictation',
  'listen-select',
  'listen-repeat',
  'song',
  'story',
  'phonics',
  'mini-story',
];

export const LESSON_CATEGORIES = ['writing', 'listening'];
export const LESSON_DIFFICULTIES = ['beginner', 'intermediate', 'advanced'];
export const ACHIEVEMENT_CATEGORIES = [
  'writing',
  'listening',
  'streak',
  'general',
];
export const ACHIEVEMENT_CONDITIONS = [
  'exercises_completed',
  'writing_completed',
  'listening_completed',
  'streak_days',
  'total_points',
  'perfect_scores',
];

const hasOwn = (source, key) =>
  Object.prototype.hasOwnProperty.call(source, key);

const isPlainObject = (value) =>
  Boolean(value) && typeof value === 'object' && !Array.isArray(value);

const isNonEmptyString = (value) =>
  typeof value === 'string' && value.trim().length > 0;

const isStringArray = (value, { allowEmpty = true } = {}) =>
  Array.isArray(value) &&
  (allowEmpty || value.length > 0) &&
  value.every((item) => typeof item === 'string');

const isNumber = (value) => typeof value === 'number' && Number.isFinite(value);

const checkRequiredString = (errors, payload, field, label, required) => {
  if (!hasOwn(payload, field)) {
    if (required) errors.push(`${label} es obligatorio`);
    return;
  }

  if (!isNonEmptyString(payload[field])) {
    errors.push(`${label} debe ser un texto no vacío`);
  }
};

const checkEnum = (errors, payload, field, label, values, required) => {
  if (!hasOwn(payload, field)) {
    if (required) errors.push(`${label} es obligatorio`);
    return;
  }

  if (!values.includes(payload[field])) {
    errors.push(`${label} debe ser uno de: ${values.join(', ')}`);
  }
};

const checkNumber = (
  errors,
  payload,
  field,
  label,
  { required = false, min } = {}
) => {
  if (!hasOwn(payload, field)) {
    if (required) errors.push(`${label} es obligatorio`);
    return;
  }

  if (!isNumber(payload[field])) {
    errors.push(`${label} debe ser un número`);
    return;
  }

  if (typeof min === 'number' && payload[field] < min) {
    errors.push(`${label} no puede ser menor que ${min}`);
  }
};

const checkStringArray = (
  errors,
  payload,
  field,
  label,
  { required = false, allowEmpty = true } = {}
) => {
  if (!hasOwn(payload, field)) {
    if (required) errors.push(`${label} es obligatorio`);
    return;
  }

  if (!isStringArray(payload[field], { allowEmpty })) {
    errors.push(
      allowEmpty
        ? `${label} debe ser una lista de textos`
        : `${label} debe ser una lista de textos no vacía`
    );
  }
};

const checkBoolean = (errors, payload, field, label) => {
  if (hasOwn(payload, field) && typeof payload[field] !== 'boolean') {
    errors.push(`${label} debe ser verdadero o falso`);
  }
};

const checkOptionalString = (errors, payload, field, label) => {
  if (hasOwn(payload, field) && typeof payload[field] !== 'string') {
    errors.push(`${label} debe ser un texto`);
  }
};

export const validateLessonPayload = (payload) => {
  const errors = [];

  checkRequiredString(errors, payload, 'title', 'El título en inglés', true);
  checkRequiredString(errors, payload, 'titleEs', 'El título en español', true);
  checkRequiredString(errors, payload, 'description', 'La descripción', true);
  checkRequiredString(
    errors,
    payload,
    'descriptionEs',
    'La descripción en español',
    true
  );
  checkEnum(
    errors,
    payload,
    'category',
    'La categoría',
    LESSON_CATEGORIES,
    true
  );
  checkEnum(
    errors,
    payload,
    'difficulty',
    'La dificultad',
    LESSON_DIFFICULTIES,
    true
  );

  checkNumber(errors, payload, 'order', 'El orden', { min: 0 });
  checkNumber(errors, payload, 'estimatedMinutes', 'La duración estimada', {
    min: 0,
  });
  checkStringArray(errors, payload, 'objectives', 'Los objetivos');
  checkStringArray(errors, payload, 'tags', 'Las etiquetas');
  checkOptionalString(errors, payload, 'icon', 'El icono');
  checkBoolean(errors, payload, 'isActive', 'El estado activo');

  return errors;
};

const validateExerciseContent = (errors, content, type) => {
  if (!isPlainObject(content)) {
    errors.push('El contenido debe ser un objeto');
    return;
  }

  switch (type) {
    case 'fill-blank':
      checkOptionalString(errors, content, 'sentence', 'La oración');
      if (!isNonEmptyString(content.sentence)) {
        errors.push('La oración del ejercicio es obligatoria');
      }
      if (hasOwn(content, 'options') && !isStringArray(content.options)) {
        errors.push('Las opciones deben ser una lista de textos');
      }
      break;
    case 'translate':
      if (!isNonEmptyString(content.phrase)) {
        errors.push('La frase a traducir es obligatoria');
      }
      break;
    case 'order-words':
      if (!isStringArray(content.words, { allowEmpty: false })) {
        errors.push('Las palabras deben ser una lista de textos no vacía');
      }
      break;
    case 'dictation':
      if (!isNonEmptyString(content.audioText)) {
        errors.push('El texto de audio es obligatorio');
      }
      break;
    case 'listen-select':
      if (!isNonEmptyString(content.audioText)) {
        errors.push('El texto de audio es obligatorio');
      }
      if (!isStringArray(content.options, { allowEmpty: false })) {
        errors.push('Las opciones deben ser una lista de textos no vacía');
      }
      break;
    case 'listen-repeat':
      if (!isNonEmptyString(content.audioText)) {
        errors.push('El texto de audio es obligatorio');
      }
      break;
    case 'phonics': {
      const hasContent = ['text', 'audioText', 'word', 'letter'].some((key) =>
        isNonEmptyString(content[key])
      );
      if (!hasContent) {
        errors.push('El contenido de fonética necesita text, audioText, word o letter');
      }
      break;
    }
    case 'song':
    case 'story':
    case 'mini-story': {
      const hasContent = ['text', 'audioText', 'lyrics'].some((key) =>
        isNonEmptyString(content[key])
      );
      if (!hasContent) {
        errors.push('El contenido necesita text, audioText o lyrics');
      }
      break;
    }
    default:
      break;
  }
};

const checkCorrectAnswer = (errors, payload, required) => {
  if (!hasOwn(payload, 'correctAnswer')) {
    if (required) errors.push('La respuesta correcta es obligatoria');
    return;
  }

  const value = payload.correctAnswer;
  const valid =
    isNonEmptyString(value) ||
    isNumber(value) ||
    isStringArray(value, { allowEmpty: false });

  if (!valid) {
    errors.push('La respuesta correcta debe ser un texto, número o lista de textos');
  }
};

export const validateExercisePayload = (payload) => {
  const errors = [];
  const type = payload.type;

  checkEnum(errors, payload, 'type', 'El tipo de ejercicio', EXERCISE_TYPES, true);
  checkRequiredString(
    errors,
    payload,
    'instruction',
    'La instrucción',
    true
  );
  checkRequiredString(
    errors,
    payload,
    'instructionEs',
    'La instrucción en español',
    true
  );

  if (!hasOwn(payload, 'content')) {
    errors.push('El contenido es obligatorio');
  } else {
    validateExerciseContent(errors, payload.content, type);
  }

  checkCorrectAnswer(errors, payload, true);
  checkStringArray(errors, payload, 'hints', 'Las pistas');
  checkNumber(errors, payload, 'points', 'Los puntos', { min: 0 });
  checkNumber(errors, payload, 'order', 'El orden', { min: 0 });
  checkBoolean(errors, payload, 'isActive', 'El estado activo');
  checkOptionalString(errors, payload, 'explanation', 'La explicación');
  checkOptionalString(
    errors,
    payload,
    'explanationEs',
    'La explicación en español'
  );

  if (hasOwn(payload, 'media') && payload.media !== null && !isPlainObject(payload.media)) {
    errors.push('Los medios deben ser un objeto o nulo');
  }

  return errors;
};

export const validateAchievementPayload = (payload) => {
  const errors = [];

  checkRequiredString(errors, payload, 'name', 'El nombre en inglés', true);
  checkRequiredString(errors, payload, 'nameEs', 'El nombre en español', true);
  checkRequiredString(errors, payload, 'description', 'La descripción', true);
  checkRequiredString(
    errors,
    payload,
    'descriptionEs',
    'La descripción en español',
    true
  );
  checkEnum(
    errors,
    payload,
    'category',
    'La categoría',
    ACHIEVEMENT_CATEGORIES,
    true
  );
  checkEnum(
    errors,
    payload,
    'condition',
    'La condición',
    ACHIEVEMENT_CONDITIONS,
    true
  );
  checkNumber(errors, payload, 'threshold', 'El umbral', {
    required: true,
    min: 0,
  });
  checkNumber(errors, payload, 'rewardPoints', 'Los puntos de recompensa', {
    min: 0,
  });
  checkOptionalString(errors, payload, 'icon', 'El icono');
  checkBoolean(errors, payload, 'isActive', 'El estado activo');

  return errors;
};

export const pickAllowedFields = (source, allowedFields) =>
  allowedFields.reduce((result, field) => {
    if (hasOwn(source, field)) {
      result[field] = source[field];
    }
    return result;
  }, {});
