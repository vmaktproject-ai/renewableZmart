import { Router } from 'express';
import { AppDataSource } from '../config/database';
import { User } from '../models/User';
import { InstallerProject } from '../models/InstallerProject';
import { Review } from '../models/Review';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = Router();

// Get all installers
router.get('/', async (req, res) => {
  try {
    const userRepo = AppDataSource.getRepository(User);
    const installers = await userRepo.find({
      where: [
        { accountType: 'installer' }
      ]
    });

    res.json(installers.map(installer => ({
      id: installer.id,
      firstName: installer.firstName,
      lastName: installer.lastName,
      email: installer.email,
      phone: installer.phone,
      certifications: installer.certifications,
      yearsOfExperience: installer.yearsOfExperience,
      serviceAreas: installer.serviceAreas,
      country: installer.country,
      city: installer.city,
      businessName: installer.businessName,
      bio: installer.bio,
      profilePhoto: installer.profilePhoto,
      rating: 4.8, // Default, can be calculated from reviews
      completedProjects: 0, // Can be counted from projects
      verified: true
    })));
  } catch (error) {
    console.error('Error fetching installers:', error);
    res.status(500).json({ message: 'Failed to fetch installers' });
  }
});

// Get installer by ID
router.get('/:id', async (req, res) => {
  try {
    const userRepo = AppDataSource.getRepository(User);
    const installer = await userRepo.findOne({
      where: { id: req.params.id }
    });

    if (!installer) {
      return res.status(404).json({ message: 'Installer not found' });
    }

    res.json({
      id: installer.id,
      firstName: installer.firstName,
      lastName: installer.lastName,
      email: installer.email,
      phone: installer.phone,
      certifications: installer.certifications,
      yearsOfExperience: installer.yearsOfExperience,
      serviceAreas: installer.serviceAreas,
      country: installer.country,
      city: installer.city,
      businessName: installer.businessName,
      bio: installer.bio,
      profilePhoto: installer.profilePhoto,
      specialties: installer.specialties ? installer.specialties.split(',') : [],
      rating: 4.8,
      completedProjects: 0,
      verified: true
    });
  } catch (error) {
    console.error('Error fetching installer:', error);
    res.status(500).json({ message: 'Failed to fetch installer' });
  }
});

// Get installer projects
router.get('/:id/projects', async (req, res) => {
  try {
    const projectRepo = AppDataSource.getRepository(InstallerProject);
    const projects = await projectRepo.find({
      where: { installerId: req.params.id },
      order: { completedDate: 'DESC' }
    });

    res.json(projects);
  } catch (error) {
    console.error('Error fetching projects:', error);
    res.status(500).json({ message: 'Failed to fetch projects' });
  }
});

// Add installer project
router.post('/:id/projects', authenticate, async (req: AuthRequest, res) => {
  try {
    const user = req.user as any;
    
    if (user.userId !== req.params.id) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    const { title, description, category, location, completedDate, images } = req.body;

    const projectRepo = AppDataSource.getRepository(InstallerProject);
    const project = projectRepo.create({
      title,
      description,
      category,
      location,
      completedDate,
      images: images || [],
      installerId: user.id
    });

    await projectRepo.save(project);
    res.status(201).json(project);
  } catch (error) {
    console.error('Error creating project:', error);
    res.status(500).json({ message: 'Failed to create project' });
  }
});

// Get installer reviews
router.get('/:id/reviews', async (req, res) => {
  try {
    const reviewRepo = AppDataSource.getRepository(Review);
    const reviews = await reviewRepo.find({
      where: { reviewType: 'installer', targetId: req.params.id },
      order: { createdAt: 'DESC' }
    });

    res.json(reviews.map(review => ({
      id: review.id,
      customerName: review.userName,
      rating: review.rating,
      comment: review.comment,
      date: review.createdAt
    })));
  } catch (error) {
    console.error('Error fetching reviews:', error);
    res.status(500).json({ message: 'Failed to fetch reviews' });
  }
});

// Add installer review
router.post('/:id/reviews', authenticate, async (req: AuthRequest, res) => {
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
      reviewType: 'installer',
      targetId: req.params.id,
      userId: user.id,
      userName: `${user.firstName} ${user.lastName}`
    });

    await reviewRepo.save(review);

    res.status(201).json({
      id: review.id,
      customerName: review.userName,
      rating: review.rating,
      comment: review.comment,
      date: review.createdAt
    });
  } catch (error) {
    console.error('Error creating review:', error);
    res.status(500).json({ message: 'Failed to create review' });
  }
});

// Send contact inquiry
router.post('/:id/contact', async (req, res) => {
  try {
    const { name, email, phone, message, projectType } = req.body;
    
    // In a real app, send email notification to installer
    console.log('Contact inquiry received:', { name, email, phone, message, projectType, installerId: req.params.id });
    
    res.json({ message: 'Inquiry sent successfully' });
  } catch (error) {
    console.error('Error sending inquiry:', error);
    res.status(500).json({ message: 'Failed to send inquiry' });
  }
});

export default router;
