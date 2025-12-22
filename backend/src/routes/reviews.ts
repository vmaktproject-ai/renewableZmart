import { Router } from 'express';
import { AppDataSource } from '../config/database';
import { Review } from '../models/Review';
import { User } from '../models/User';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = Router();

// Get reviews for a product
router.get('/products/:id', async (req, res) => {
  try {
    const reviewRepo = AppDataSource.getRepository(Review);
    const reviews = await reviewRepo.find({
      where: { reviewType: 'product', targetId: req.params.id },
      order: { createdAt: 'DESC' }
    });

    res.json(reviews.map(review => ({
      id: review.id,
      userName: review.userName,
      rating: review.rating,
      comment: review.comment,
      date: review.createdAt
    })));
  } catch (error) {
    console.error('Error fetching reviews:', error);
    res.status(500).json({ message: 'Failed to fetch reviews' });
  }
});

// Add review for a product
router.post('/products/:id', authenticate, async (req: AuthRequest, res) => {
  try {
    const { rating, comment } = req.body;
    const authUser = req.user as any;

    if (!rating || !comment) {
      return res.status(400).json({ message: 'Rating and comment are required' });
    }

    // Get user details from database
    const userRepo = AppDataSource.getRepository(User);
    const user = await userRepo.findOne({ where: { id: authUser.userId } });
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const reviewRepo = AppDataSource.getRepository(Review);
    const review = reviewRepo.create({
      rating,
      comment,
      reviewType: 'product',
      targetId: req.params.id,
      userId: user.id,
      userName: `${user.firstName} ${user.lastName}`
    });

    await reviewRepo.save(review);

    res.status(201).json({
      id: review.id,
      userName: review.userName,
      rating: review.rating,
      comment: review.comment,
      date: review.createdAt
    });
  } catch (error) {
    console.error('Error creating review:', error);
    res.status(500).json({ message: 'Failed to create review' });
  }
});

// Get reviews for a store
router.get('/stores/:slug', async (req, res) => {
  try {
    const reviewRepo = AppDataSource.getRepository(Review);
    const reviews = await reviewRepo.find({
      where: { reviewType: 'store', targetId: req.params.slug },
      order: { createdAt: 'DESC' }
    });

    res.json(reviews.map(review => ({
      id: review.id,
      userName: review.userName,
      rating: review.rating,
      comment: review.comment,
      date: review.createdAt
    })));
  } catch (error) {
    console.error('Error fetching store reviews:', error);
    res.status(500).json({ message: 'Failed to fetch reviews' });
  }
});

// Add review for a store
router.post('/stores/:slug', authenticate, async (req: AuthRequest, res) => {
  try {
    const { rating, comment } = req.body;
    const authUser = req.user as any;

    if (!rating || !comment) {
      return res.status(400).json({ message: 'Rating and comment are required' });
    }

    // Get user details from database
    const userRepo = AppDataSource.getRepository(User);
    const user = await userRepo.findOne({ where: { id: authUser.userId } });
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const reviewRepo = AppDataSource.getRepository(Review);
    const review = reviewRepo.create({
      rating,
      comment,
      reviewType: 'store',
      targetId: req.params.slug,
      userId: user.id,
      userName: `${user.firstName} ${user.lastName}`
    });

    await reviewRepo.save(review);

    res.status(201).json({
      id: review.id,
      userName: review.userName,
      rating: review.rating,
      comment: review.comment,
      date: review.createdAt
    });
  } catch (error) {
    console.error('Error creating store review:', error);
    res.status(500).json({ message: 'Failed to create review' });
  }
});

export default router;
