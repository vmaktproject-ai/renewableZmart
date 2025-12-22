import { Response } from 'express';
import { AppDataSource } from '../config/database';
import { Store } from '../models/Store';
import { Product } from '../models/Product';
import { AuthRequest } from '../middleware/auth';

const storeRepository = AppDataSource.getRepository(Store);
const productRepository = AppDataSource.getRepository(Product);

export const getAllStores = async (req: AuthRequest, res: Response) => {
  try {
    const { country, category, search } = req.query;

    const queryBuilder = storeRepository.createQueryBuilder('store')
      .leftJoinAndSelect('store.owner', 'owner')
      .where('store.isActive = :isActive', { isActive: true });

    if (country) {
      queryBuilder.andWhere('store.country = :country', { country });
    }

    if (category) {
      queryBuilder.andWhere(':category = ANY(store.categories)', { category });
    }

    if (search) {
      queryBuilder.andWhere('(store.name ILIKE :search OR store.description ILIKE :search)', {
        search: `%${search}%`,
      });
    }

    const stores = await queryBuilder.getMany();

    // Add product count to each store
    const storesWithCount = await Promise.all(
      stores.map(async (store) => {
        const productCount = await productRepository.count({
          where: { storeId: store.id }
        });
        return {
          ...store,
          totalProducts: productCount
        };
      })
    );

    res.json(storesWithCount);
  } catch (error) {
    console.error('Get stores error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const getStoreById = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const store = await storeRepository.findOne({
      where: { id },
      relations: ['owner', 'products'],
    });

    if (!store) {
      return res.status(404).json({ message: 'Store not found' });
    }

    res.json(store);
  } catch (error) {
    console.error('Get store error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const getStoreBySlug = async (req: AuthRequest, res: Response) => {
  try {
    const { slug } = req.params;
    const store = await storeRepository.findOne({
      where: { slug },
      relations: ['owner'],
    });

    if (!store) {
      return res.status(404).json({ message: 'Store not found' });
    }

    // Fetch all products for vendor's own store page (including pending)
    const allProducts = await productRepository.find({
      where: { 
        storeId: store.id
      },
      order: { createdAt: 'DESC' }
    });

    // Add products to store object
    const storeWithProducts = {
      ...store,
      products: allProducts
    };

    res.json(storeWithProducts);
  } catch (error) {
    console.error('Get store error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const getMyStore = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    const store = await storeRepository.findOne({
      where: { ownerId: userId },
      relations: ['products'],
    });

    if (!store) {
      return res.status(404).json({ message: 'Store not found' });
    }

    res.json(store);
  } catch (error) {
    console.error('Get my store error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const createStore = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;

    // Check if user already has a store
    const existingStore = await storeRepository.findOne({ where: { ownerId: userId } });
    if (existingStore) {
      return res.status(409).json({ message: 'User already has a store' });
    }

    // Generate unique slug
    const baseSlug = req.body.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    let slug = baseSlug;
    let counter = 1;
    while (await storeRepository.findOne({ where: { slug } })) {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    const store = storeRepository.create({
      ...req.body,
      slug,
      ownerId: userId,
    });

    const savedStore = await storeRepository.save(store);
    res.status(201).json(savedStore);
  } catch (error) {
    console.error('Create store error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const updateStore = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user?.userId;

    const store = await storeRepository.findOne({ where: { id } });

    if (!store) {
      return res.status(404).json({ message: 'Store not found' });
    }

    if (store.ownerId !== userId) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    // Validate phone number if provided
    if (req.body.phone) {
      const { validatePhoneNumber } = require('../utils/phoneValidation');
      const phoneValidation = validatePhoneNumber(req.body.phone, req.body.country || store.country);
      if (!phoneValidation.isValid) {
        return res.status(400).json({ message: phoneValidation.error || 'Invalid phone number' });
      }
    }

    // Validate email if provided
    if (req.body.email) {
      const { validateEmail } = require('../utils/emailValidation');
      const emailValidation = validateEmail(req.body.email);
      if (!emailValidation.isValid) {
        return res.status(400).json({ message: emailValidation.error || 'Invalid email address' });
      }
    }

    // Handle file uploads
    const files = req.files as { [fieldname: string]: Express.Multer.File[] };
    const updateData: any = { ...req.body };

    if (files?.logo && files.logo.length > 0) {
      updateData.logo = `/uploads/${files.logo[0].filename}`;
    }

    if (files?.banner && files.banner.length > 0) {
      updateData.banner = `/uploads/${files.banner[0].filename}`;
    }

    await storeRepository.update(id, updateData);
    const updatedStore = await storeRepository.findOne({ where: { id } });

    res.json(updatedStore);
  } catch (error) {
    console.error('Update store error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const removeStoreImage = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { imageType } = req.body; // 'logo' or 'banner'
    const userId = req.user?.userId;

    const store = await storeRepository.findOne({ where: { id } });

    if (!store) {
      return res.status(404).json({ message: 'Store not found' });
    }

    if (store.ownerId !== userId) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    if (imageType !== 'logo' && imageType !== 'banner') {
      return res.status(400).json({ message: 'Invalid image type. Must be "logo" or "banner"' });
    }

    // Update the store to remove the image
    const updateData: any = {};
    updateData[imageType] = null;

    await storeRepository.update(id, updateData);
    const updatedStore = await storeRepository.findOne({ where: { id } });

    res.json({ message: `${imageType} removed successfully`, store: updatedStore });
  } catch (error) {
    console.error('Remove store image error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const deleteStore = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user?.userId;

    const store = await storeRepository.findOne({ where: { id } });

    if (!store) {
      return res.status(404).json({ message: 'Store not found' });
    }

    if (store.ownerId !== userId) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    await storeRepository.delete(id);
    res.json({ message: 'Store deleted successfully' });
  } catch (error) {
    console.error('Delete store error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
