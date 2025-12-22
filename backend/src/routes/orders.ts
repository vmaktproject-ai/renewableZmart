import { Router } from 'express';
import { createOrder, getMyOrders, getOrderById, updateOrderStatus, getOrderTracking } from '../controllers/orderController';
import { authMiddleware } from '../middleware/auth';

const router = Router();

router.post('/', authMiddleware, createOrder);
router.get('/my-orders', authMiddleware, getMyOrders);
router.get('/:id', authMiddleware, getOrderById);
router.get('/:id/tracking', getOrderTracking); // Public route for tracking
router.put('/:id/status', authMiddleware, updateOrderStatus);

export default router;
