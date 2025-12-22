import { Router } from 'express';
import { 
  submitInstallmentApplication, 
  getMyApplications, 
  getAllApplications,
  approveApplication,
  rejectApplication,
  initializeInstallmentPayment
} from '../controllers/installmentController';
import { authMiddleware, adminMiddleware } from '../middleware/auth';

const router = Router();

// Customer routes
router.post('/apply', authMiddleware, submitInstallmentApplication);
router.get('/my-applications', authMiddleware, getMyApplications);
router.post('/initialize-payment', authMiddleware, initializeInstallmentPayment);

// Admin routes
router.get('/all', authMiddleware, adminMiddleware, getAllApplications);
router.put('/:id/approve', authMiddleware, adminMiddleware, approveApplication);
router.put('/:id/reject', authMiddleware, adminMiddleware, rejectApplication);

export default router;
