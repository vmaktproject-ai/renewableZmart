import { Router } from 'express';
import { AppDataSource } from '../config/database';
import { User } from '../models/User';
import { authenticate, AuthRequest } from '../middleware/auth';
import multer from 'multer';
import path from 'path';

const router = Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

// Get user profile
router.get('/profile', authenticate, async (req: AuthRequest, res) => {
  try {
    const user = req.user as any;
    const userRepo = AppDataSource.getRepository(User);
    const profile = await userRepo.findOne({ where: { id: user.id } });

    if (!profile) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      id: profile.id,
      email: profile.email,
      firstName: profile.firstName,
      lastName: profile.lastName,
      phone: profile.phone,
      country: profile.country,
      city: profile.city,
      businessName: profile.businessName,
      certifications: profile.certifications,
      yearsOfExperience: profile.yearsOfExperience,
      serviceAreas: profile.serviceAreas,
      profilePhoto: profile.profilePhoto,
      bio: profile.bio,
      specialties: profile.specialties ? profile.specialties.split(',') : []
    });
  } catch (error) {
    console.error('Error fetching profile:', error);
    res.status(500).json({ message: 'Failed to fetch profile' });
  }
});

// Update user profile
router.put('/profile', authenticate, async (req: AuthRequest, res) => {
  try {
    const user = req.user as any;
    const userRepo = AppDataSource.getRepository(User);
    
    const profile = await userRepo.findOne({ where: { id: user.id } });
    if (!profile) {
      return res.status(404).json({ message: 'User not found' });
    }

    const { businessName, certifications, yearsOfExperience, serviceAreas, bio, specialties, phone, country } = req.body;

    // Validate phone number if provided
    if (phone) {
      const { validatePhoneNumber } = require('../utils/phoneValidation');
      const phoneValidation = validatePhoneNumber(phone, country || profile.country || 'Nigeria');
      if (!phoneValidation.isValid) {
        return res.status(400).json({ message: phoneValidation.error || 'Invalid phone number' });
      }
    }

    if (businessName) profile.businessName = businessName;
    if (certifications) profile.certifications = certifications;
    if (yearsOfExperience) profile.yearsOfExperience = yearsOfExperience;
    if (serviceAreas) profile.serviceAreas = serviceAreas;
    if (bio) profile.bio = bio;
    if (phone) profile.phone = phone;
    if (specialties) profile.specialties = Array.isArray(specialties) ? specialties.join(',') : specialties;

    await userRepo.save(profile);

    res.json({ message: 'Profile updated successfully', profile });
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ message: 'Failed to update profile' });
  }
});

// Upload profile photo
router.post('/profile-photo', authenticate, upload.single('profilePhoto'), async (req: AuthRequest, res) => {
  try {
    const user = req.user as any;
    const userRepo = AppDataSource.getRepository(User);

    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const profile = await userRepo.findOne({ where: { id: user.id } });
    if (!profile) {
      return res.status(404).json({ message: 'User not found' });
    }

    profile.profilePhoto = `/uploads/${req.file.filename}`;
    await userRepo.save(profile);

    res.json({ message: 'Profile photo updated', profilePhoto: profile.profilePhoto });
  } catch (error) {
    console.error('Error uploading photo:', error);
    res.status(500).json({ message: 'Failed to upload photo' });
  }
});

// Delete own account
router.delete('/me', authenticate, async (req: AuthRequest, res) => {
  try {
    const user = req.user as any;
    const userRepo = AppDataSource.getRepository(User);

    const profile = await userRepo.findOne({ where: { id: user.userId } });
    if (!profile) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Delete user and all related data (cascading deletes handled by database)
    await userRepo.remove(profile);

    res.json({ message: 'Account deleted successfully' });
  } catch (error) {
    console.error('Error deleting account:', error);
    res.status(500).json({ message: 'Failed to delete account' });
  }
});

export default router;
