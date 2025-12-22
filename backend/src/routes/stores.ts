import { Router } from 'express';
import { getAllStores, getStoreById, getStoreBySlug, getMyStore, createStore, updateStore, deleteStore, removeStoreImage } from '../controllers/storeController';
import { authMiddleware } from '../middleware/auth';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

const router = Router();

// Configure multer for store file uploads
const uploadDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (extname && mimetype) {
      cb(null, true);
    } else {
      cb(new Error('Only images are allowed'));
    }
  }
});

router.get('/', getAllStores);
router.get('/my-store', authMiddleware, getMyStore);
router.get('/slug/:slug', getStoreBySlug);
router.get('/:id', getStoreById);
router.post('/', authMiddleware, createStore);
router.patch('/:id/remove-image', authMiddleware, removeStoreImage);
router.patch('/:id', authMiddleware, upload.fields([{ name: 'logo', maxCount: 1 }, { name: 'banner', maxCount: 1 }]), updateStore);
router.put('/:id', authMiddleware, updateStore);
router.delete('/:id', authMiddleware, deleteStore);

export default router;
