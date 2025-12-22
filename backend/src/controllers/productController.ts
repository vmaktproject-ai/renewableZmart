import { Request, Response } from 'express';
import { AppDataSource } from '../config/database';
import { Product } from '../models/Product';
import { Store } from '../models/Store';
import { User } from '../models/User';
import { Like } from 'typeorm';
import { AuthRequest } from '../middleware/auth';

const productRepository = AppDataSource.getRepository(Product);
const storeRepository = AppDataSource.getRepository(Store);
const userRepository = AppDataSource.getRepository(User);

export const getAllProducts = async (req: Request, res: Response) => {
  try {
    const { country } = req.query;

    let products;
    if (country) {
      // Only show approved products on landing page
      products = await productRepository.find({
        where: { country: country as string, approvalStatus: 'approved' },
        relations: ['store'],
      });
    } else {
      // Only show approved products on landing page
      products = await productRepository.find({ 
        where: { approvalStatus: 'approved' },
        relations: ['store'] 
      });
    }

    // Transform products to match frontend expected format
    const transformedProducts = products.map(p => ({
      ...p,
      title: p.name, // Add title field for frontend compatibility
    }));

    res.json(transformedProducts);
  } catch (error) {
    console.error('Get products error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const getProductById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const product = await productRepository.findOne({
      where: { id },
      relations: ['store'],
    });

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Transform product to match frontend expected format
    const transformedProduct = {
      ...product,
      title: product.name, // Add title field for frontend compatibility
    };

    res.json(transformedProduct);
  } catch (error) {
    console.error('Get product error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const searchProducts = async (req: Request, res: Response) => {
  try {
    const { q, country } = req.query;

    if (!q) {
      return res.status(400).json({ message: 'Search query required' });
    }

    // Sanitize search query to prevent injection
    const sanitizedQuery = String(q).replace(/[<>"']/g, '').trim();
    
    if (!sanitizedQuery || sanitizedQuery.length < 2) {
      return res.status(400).json({ message: 'Invalid search query' });
    }

    const whereConditions: any[] = [
      { name: Like(`%${sanitizedQuery}%`) },
      { description: Like(`%${sanitizedQuery}%`) },
      { category: Like(`%${sanitizedQuery}%`) },
    ];

    let products;
    if (country) {
      const countryConditions = whereConditions.map(cond => ({ ...cond, country: country as string }));
      products = await productRepository.find({
        where: countryConditions,
        relations: ['store'],
      });
    } else {
      products = await productRepository.find({
        where: whereConditions,
        relations: ['store'],
      });
    }

    // Transform products to match frontend expected format
    const transformedProducts = products.map(p => ({
      ...p,
      title: p.name, // Add title field for frontend compatibility
    }));

    res.json(transformedProducts);
  } catch (error) {
    console.error('Search products error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const createProduct = async (req: AuthRequest, res: Response) => {
  try {
    const { name, description, price, category, stock, storeId, country, city } = req.body;
    const userId = req.user?.userId;
    const files = req.files as { [fieldname: string]: Express.Multer.File[] };

    let finalStoreId = storeId;

    // If no storeId provided, auto-find or create vendor's store
    if (!finalStoreId) {
      let store = await storeRepository.findOne({ where: { ownerId: userId } });
      
      // If vendor doesn't have a store, create one
      if (!store) {
        const user = await userRepository.findOne({ where: { id: userId } });
        const storeName = user?.businessName || `${user?.firstName} ${user?.lastName}'s Store`;
        const slug = storeName.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + Date.now();
        
        store = storeRepository.create({
          name: storeName,
          description: `Official store for ${storeName}`,
          ownerId: userId,
          slug,
          country: country || user?.country || 'Nigeria',
          city: city || user?.city || 'Lagos',
          isActive: true,
          isVerified: false,
          verificationStatus: 'pending'
        });
        
        store = await storeRepository.save(store);
      }
      
      finalStoreId = store.id;
    }

    // Verify that the store belongs to the user
    const store = await storeRepository.findOne({ where: { id: finalStoreId } });
    
    if (!store) {
      return res.status(404).json({ message: 'Store not found' });
    }

    // Check if user owns this store
    if (store.ownerId !== userId) {
      return res.status(403).json({ message: 'You can only add products to your own store' });
    }

    // Get the first uploaded image or use a default
    let imageUrl = '/uploads/default-product.jpg';
    if (files && files.images && files.images.length > 0) {
      imageUrl = `/uploads/${files.images[0].filename}`;
    }

    // Get all uploaded images
    const allImages: string[] = [];
    if (files && files.images) {
      files.images.forEach((file: Express.Multer.File) => {
        allImages.push(`/uploads/${file.filename}`);
      });
    }

    // Get all uploaded videos
    const allVideos: string[] = [];
    if (files && files.videos) {
      files.videos.forEach((file: Express.Multer.File) => {
        allVideos.push(`/uploads/${file.filename}`);
      });
    }

    // Get country and city from request or store
    const finalCountry = country || store.country;
    const finalCity = city || store.city;

    // Generate unique tracking ID
    const trackingId = `PRD-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

    const product = productRepository.create({
      name,
      description,
      price: parseFloat(price),
      image: imageUrl,
      images: allImages.length > 0 ? allImages : undefined,
      videos: allVideos.length > 0 ? allVideos : undefined,
      category,
      stock: parseInt(stock),
      trackingId,
      storeId: finalStoreId,
      country: finalCountry,
      city: finalCity,
      approvalStatus: 'pending', // Requires admin approval to show on landing page
    });

    const savedProduct = await productRepository.save(product);
    res.status(201).json({ 
      ...savedProduct, 
      message: 'Product created successfully! It will appear on the landing page after admin approval.' 
    });
  } catch (error) {
    console.error('Create product error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const updateProduct = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const product = await productRepository.findOne({ where: { id } });

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    await productRepository.update(id, req.body);
    const updatedProduct = await productRepository.findOne({ where: { id } });

    res.json(updatedProduct);
  } catch (error) {
    console.error('Update product error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const deleteProduct = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const product = await productRepository.findOne({ where: { id } });

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    await productRepository.delete(id);
    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Delete product error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const getAllVendorProducts = async (req: Request, res: Response) => {
  try {
    // Get all products from vendors (without approval filter)
    const products = await productRepository.find({
      relations: ['store'],
      order: { createdAt: 'DESC' }
    });

    // Transform products to match frontend expected format
    const transformedProducts = products.map(p => ({
      ...p,
      title: p.name, // Add title field for frontend compatibility
    }));

    res.json(transformedProducts);
  } catch (error) {
    console.error('Get all vendor products error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const getVendorProducts = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;

    // Find vendor's store
    const store = await storeRepository.findOne({ where: { ownerId: userId } });
    
    if (!store) {
      return res.json([]);
    }

    // Get all products from vendor's store
    const products = await productRepository.find({ 
      where: { storeId: store.id },
      relations: ['store'],
      order: { createdAt: 'DESC' }
    });

    res.json(products);
  } catch (error) {
    console.error('Get vendor products error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
