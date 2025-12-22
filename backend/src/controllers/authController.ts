import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import { AppDataSource } from '../config/database';
import { User, UserRole } from '../models/User';
import { Store } from '../models/Store';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { emailService } from '../services/emailService';
import { validatePhoneNumber } from '../utils/phoneValidation';
import { validateEmail } from '../utils/emailValidation';
import { validateCompanyRegistration } from '../utils/companyValidation';

const userRepository = AppDataSource.getRepository(User);
const storeRepository = AppDataSource.getRepository(Store);

export const register = async (req: Request, res: Response) => {
  try {
    // Check validation errors from express-validator
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password, firstName, lastName, phone, country, city, accountType, businessName, businessRegNumber, certifications, yearsOfExperience, serviceAreas } = req.body;

    // Comprehensive email validation
    const emailValidation = validateEmail(email);
    if (!emailValidation.isValid) {
      return res.status(400).json({ 
        message: emailValidation.error,
        suggestion: emailValidation.suggestion 
      });
    }

    // Phone number validation
    if (phone) {
      const phoneValidation = validatePhoneNumber(phone, country || 'Nigeria');
      if (!phoneValidation.isValid) {
        return res.status(400).json({ message: phoneValidation.error || 'Invalid phone number' });
      }
    }

    // Password strength validation
    if (password.length < 8) {
      return res.status(400).json({ message: 'Password must be at least 8 characters' });
    }

    // Check if user exists (case-insensitive) - No email can be used more than once
    const existingUser = await userRepository
      .createQueryBuilder('user')
      .where('LOWER(user.email) = LOWER(:email)', { email })
      .getOne();
    
    if (existingUser) {
      return res.status(409).json({ 
        message: 'This email is already registered. Please use a different email or login to your existing account.' 
      });
    }

    // Validate business registration number for vendors
    if (accountType === 'vendor' && businessRegNumber) {
      const regValidation = validateCompanyRegistration(businessRegNumber, country || 'Nigeria');
      if (!regValidation.isValid) {
        return res.status(400).json({ 
          message: regValidation.error,
          suggestion: regValidation.suggestion 
        });
      }

      // Check if business registration number already exists
      const existingBusiness = await userRepository
        .createQueryBuilder('user')
        .where('UPPER(user.businessRegNumber) = UPPER(:businessRegNumber)', { 
          businessRegNumber: regValidation.normalizedValue 
        })
        .getOne();
      
      if (existingBusiness) {
        return res.status(409).json({ 
          message: 'This business registration number is already registered. Each business can only be registered once.' 
        });
      }
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Determine role
    let role = UserRole.CUSTOMER;
    if (accountType === 'vendor') role = UserRole.VENDOR;
    if (accountType === 'installer') role = UserRole.INSTALLER;

    // Normalize business registration number if provided
    let normalizedRegNumber = businessRegNumber;
    if (accountType === 'vendor' && businessRegNumber) {
      const regValidation = validateCompanyRegistration(businessRegNumber, country || 'Nigeria');
      if (regValidation.normalizedValue) {
        normalizedRegNumber = regValidation.normalizedValue;
      }
    }

    // Create user
    const user = userRepository.create({
      email,
      password: hashedPassword,
      firstName,
      lastName,
      phone,
      country,
      city,
      role,
      businessName,
      businessRegNumber: normalizedRegNumber,
      certifications,
      yearsOfExperience,
      serviceAreas,
    });

    const savedUser = await userRepository.save(user);

    // Auto-create store for vendors
    if (role === UserRole.VENDOR && businessName) {
      try {
        const slug = businessName.toLowerCase().replace(/[^a-z0-9]+/g, '-');
        const store = storeRepository.create({
          name: businessName,
          description: `Official store for ${businessName}`,
          ownerId: savedUser.id,
          slug,
          country: savedUser.country,
          city: savedUser.city,
        });
        await storeRepository.save(store);
      } catch (error) {
        console.error('Failed to create store:', error);
      }
    }

    // Send emails (don't block registration if emails fail)
    emailService.sendWelcomeEmail(savedUser.email, savedUser.firstName, accountType || 'customer').catch(err => 
      console.error('Failed to send welcome email:', err)
    );
    emailService.sendAdminRegistrationNotification({
      firstName: savedUser.firstName,
      lastName: savedUser.lastName,
      email: savedUser.email,
      phone: savedUser.phone,
      country: savedUser.country,
      city: savedUser.city,
      accountType: accountType || 'customer',
      businessName: savedUser.businessName,
    }).catch(err => 
      console.error('Failed to send admin notification:', err)
    );

    // Generate tokens
    const jwtSecret = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production';
    const jwtRefreshSecret = process.env.JWT_REFRESH_SECRET || 'your-super-secret-refresh-key-change-in-production';

    const accessToken = jwt.sign(
      { email: savedUser.email, sub: savedUser.id, role: savedUser.role },
      jwtSecret,
      { expiresIn: '30d' }
    );

    const refreshToken = jwt.sign(
      { email: savedUser.email, sub: savedUser.id, role: savedUser.role },
      jwtRefreshSecret,
      { expiresIn: '90d' }
    );

    res.status(201).json({
      user: {
        id: savedUser.id,
        email: savedUser.email,
        firstName: savedUser.firstName,
        lastName: savedUser.lastName,
        role: savedUser.role,
        adminLevel: savedUser.adminLevel, // Include admin level for frontend
        country: savedUser.country,
        city: savedUser.city,
      },
      accessToken,
      refreshToken,
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    // Case-insensitive email search for admin logins
    const user = await userRepository
      .createQueryBuilder('user')
      .where('LOWER(user.email) = LOWER(:email)', { email })
      .getOne();
    
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Send login notifications (don't block login if emails fail)
    emailService.sendLoginNotification(user.email, user.firstName, {
      city: user.city,
      country: user.country,
    }).catch(err => 
      console.error('Failed to send login notification:', err)
    );
    emailService.sendAdminLoginNotification({
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      city: user.city,
      country: user.country,
    }).catch(err => 
      console.error('Failed to send admin login notification:', err)
    );

    const jwtSecret = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production';
    const jwtRefreshSecret = process.env.JWT_REFRESH_SECRET || 'your-super-secret-refresh-key-change-in-production';

    const accessToken = jwt.sign(
      { email: user.email, sub: user.id, role: user.role },
      jwtSecret,
      { expiresIn: '30d' }
    );

    const refreshToken = jwt.sign(
      { email: user.email, sub: user.id, role: user.role },
      jwtRefreshSecret,
      { expiresIn: '90d' }
    );

    res.json({
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        adminLevel: user.adminLevel, // Include admin level for frontend
        country: user.country,
        city: user.city,
      },
      accessToken,
      refreshToken,
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const refreshToken = async (req: Request, res: Response) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(401).json({ message: 'Refresh token required' });
    }

    const jwtRefreshSecret = process.env.JWT_REFRESH_SECRET || 'your-super-secret-refresh-key-change-in-production';
    const jwtSecret = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production';

    const decoded = jwt.verify(refreshToken, jwtRefreshSecret) as any;

    const user = await userRepository.findOne({ where: { id: decoded.sub } });
    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }

    const accessToken = jwt.sign(
      { email: user.email, sub: user.id, role: user.role },
      jwtSecret,
      { expiresIn: '30d' }
    );

    res.json({ accessToken });
  } catch (error) {
    res.status(401).json({ message: 'Invalid refresh token' });
  }
};

export const logout = async (req: Request, res: Response) => {
  res.json({ message: 'Logged out successfully' });
};
