import { Router } from 'express';
import { body } from 'express-validator';
import { register, login, refreshToken, logout } from '../controllers/authController';

const router = Router();

// Validation middleware
const registerValidation = [
  body('email').isEmail().normalizeEmail().withMessage('Valid email required'),
  body('password').isLength({ min: 8, max: 128 }).withMessage('Password must be 8-128 characters'),
  body('firstName').trim().isLength({ min: 1, max: 50 }).withMessage('First name required (max 50 chars)'),
  body('lastName').trim().isLength({ min: 1, max: 50 }).withMessage('Last name required (max 50 chars)'),
  body('phoneNumber').optional().trim().isLength({ max: 20 }),
];

const loginValidation = [
  body('email').isEmail().normalizeEmail().withMessage('Valid email required'),
  body('password').notEmpty().withMessage('Password required'),
];

router.post('/register', registerValidation, register);
router.post('/login', loginValidation, login);
router.post('/refresh', refreshToken);
router.post('/logout', logout);

export default router;
