import { Router } from 'express';
import { initializePayment, verifyPayment } from '../controllers/paymentController';
import { authMiddleware } from '../middleware/auth';

const router = Router();

router.post('/initialize', authMiddleware, initializePayment);
router.get('/verify/:reference', verifyPayment);

export default router;
