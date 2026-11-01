import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import config from '../config/env.js';

/**
 * Generate JWT token for a user
 */
const generateToken = (userId) => {
  return jwt.sign({ id: userId }, config.jwtSecret, {
    expiresIn: config.jwtExpiresIn,
  });
};

/**
 * @desc    Register a new parent account
 * @route   POST /api/auth/register
 * @access  Public
 */
export const register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Ya existe una cuenta con este email.',
      });
    }

    // Create parent user
    const user = await User.create({
      name,
      email,
      password,
      role: 'parent',
    });

    // Generate token
    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      data: {
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          avatar: user.avatar,
          level: user.level,
          totalPoints: user.totalPoints,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Login with email and password
 * @route   POST /api/auth/login
 * @access  Public
 */
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Find user and include password for comparison
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Credenciales inválidas.',
      });
    }

    // Check password
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Credenciales inválidas.',
      });
    }

    // Generate token
    const token = generateToken(user._id);

    res.json({
      success: true,
      data: {
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          avatar: user.avatar,
          level: user.level,
          totalPoints: user.totalPoints,
          currentStreak: user.currentStreak,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Create a child profile (parent only)
 * @route   POST /api/auth/child
 * @access  Private (parent only)
 */
export const createChild = async (req, res, next) => {
  try {
    const { name, avatar } = req.body;

    const child = await User.create({
      name,
      role: 'child',
      parentId: req.user._id,
      avatar: avatar || { character: 'matey', color: '#4FC3F7', accessory: 'none' },
    });

    // Generate token for the child so parent can switch profiles
    const token = generateToken(child._id);

    res.status(201).json({
      success: true,
      data: {
        token,
        user: {
          id: child._id,
          name: child.name,
          role: child.role,
          parentId: child.parentId,
          avatar: child.avatar,
          level: child.level,
          totalPoints: child.totalPoints,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get current authenticated user profile
 * @route   GET /api/auth/me
 * @access  Private
 */
export const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).populate('children', 'name avatar level totalPoints currentStreak');

    res.json({
      success: true,
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          avatar: user.avatar,
          level: user.level,
          totalPoints: user.totalPoints,
          currentStreak: user.currentStreak,
          lastActiveDate: user.lastActiveDate,
          children: user.children || [],
          createdAt: user.createdAt,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};
