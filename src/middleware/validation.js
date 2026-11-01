import { body, validationResult } from 'express-validator';

/**
 * Validation rules for parent registration
 */
export const registerRules = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('El nombre es obligatorio')
    .isLength({ max: 50 })
    .withMessage('El nombre no puede tener más de 50 caracteres'),
  body('email')
    .trim()
    .notEmpty()
    .withMessage('El email es obligatorio')
    .isEmail()
    .withMessage('Por favor ingresa un email válido')
    .normalizeEmail(),
  body('password')
    .notEmpty()
    .withMessage('La contraseña es obligatoria')
    .isLength({ min: 6 })
    .withMessage('La contraseña debe tener al menos 6 caracteres'),
];

/**
 * Validation rules for login
 */
export const loginRules = [
  body('email')
    .trim()
    .notEmpty()
    .withMessage('El email es obligatorio')
    .isEmail()
    .withMessage('Por favor ingresa un email válido')
    .normalizeEmail(),
  body('password')
    .notEmpty()
    .withMessage('La contraseña es obligatoria'),
];

/**
 * Validation rules for creating a child profile
 */
export const createChildRules = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('El nombre del niño es obligatorio')
    .isLength({ max: 50 })
    .withMessage('El nombre no puede tener más de 50 caracteres'),
  body('avatar.character')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('El personaje del avatar no puede estar vacío'),
  body('avatar.color')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('El color del avatar no puede estar vacío'),
  body('avatar.accessory')
    .optional()
    .trim(),
];

/**
 * Middleware to check for validation errors
 */
export const validate = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const extractedErrors = errors.array().map((err) => err.msg);
    return res.status(400).json({
      success: false,
      message: 'Error de validación',
      errors: extractedErrors,
    });
  }

  next();
};
