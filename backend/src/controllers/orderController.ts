import { Response } from 'express';
import { AppDataSource } from '../config/database';
import { Order, OrderStatus, PaymentStatus } from '../models/Order';
import { Product } from '../models/Product';
import { User } from '../models/User';
import { AuthRequest } from '../middleware/auth';
import { emailService } from '../services/emailService';

const orderRepository = AppDataSource.getRepository(Order);
const productRepository = AppDataSource.getRepository(Product);
const userRepository = AppDataSource.getRepository(User);

export const createOrder = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    const { items, shippingAddress } = req.body;

    // Calculate total
    let total = 0;
    for (const item of items) {
      const product = await productRepository.findOne({ where: { id: item.productId } });
      if (product) {
        total += product.price * item.quantity;
        
        // Update stock
        if (product.stock >= item.quantity) {
          product.stock -= item.quantity;
          await productRepository.save(product);
        } else {
          return res.status(400).json({ message: `Insufficient stock for ${product.name}` });
        }
      }
    }

    const order = orderRepository.create({
      userId,
      items,
      total,
      shippingAddress,
      status: OrderStatus.PENDING,
      paymentStatus: PaymentStatus.PENDING,
    });

    const savedOrder = await orderRepository.save(order);

    // Get user details for email
    const user = await userRepository.findOne({ where: { id: userId } });
    
    // Send order confirmation emails (don't block order creation if emails fail)
    if (user) {
      emailService.sendOrderConfirmation(user.email, user.firstName, {
        id: savedOrder.id,
        total: `${savedOrder.total}`,
      }).catch(err => console.error('Failed to send order confirmation:', err));

      emailService.sendAdminOrderNotification({
        id: savedOrder.id,
        customerName: `${user.firstName} ${user.lastName}`,
        customerEmail: user.email,
        total: `${savedOrder.total}`,
        itemCount: items.length,
      }).catch(err => console.error('Failed to send admin order notification:', err));
    }

    res.status(201).json(savedOrder);
  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const getMyOrders = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    const orders = await orderRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });

    res.json(orders);
  } catch (error) {
    console.error('Get orders error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const getOrderById = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user?.userId;

    const order = await orderRepository.findOne({
      where: { id, userId },
      relations: ['user'],
    });

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    res.json(order);
  } catch (error) {
    console.error('Get order error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const updateOrderStatus = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { status, trackingNumber, carrier, estimatedDelivery, location } = req.body;

    const order = await orderRepository.findOne({ where: { id } });

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    order.status = status;
    
    if (trackingNumber) order.trackingNumber = trackingNumber;
    if (carrier) order.carrier = carrier;
    if (estimatedDelivery) order.estimatedDelivery = new Date(estimatedDelivery);

    // Add to tracking history
    if (!order.trackingHistory) {
      order.trackingHistory = [];
    }

    const statusDescriptions: { [key: string]: string } = {
      'pending': 'Order has been placed and is awaiting processing',
      'processing': 'Order is being prepared for shipment',
      'shipped': 'Order has been shipped from the warehouse',
      'in_transit': `Order is in transit${location ? ' to ' + location : ''}`,
      'out_for_delivery': 'Order is out for delivery',
      'delivered': 'Order has been delivered successfully',
      'cancelled': 'Order has been cancelled'
    };

    order.trackingHistory.push({
      status: status.replace('_', ' ').toUpperCase(),
      description: statusDescriptions[status] || 'Status updated',
      timestamp: new Date(),
      location: location
    });

    const updatedOrder = await orderRepository.save(order);

    // Get user details for email notification
    const user = await userRepository.findOne({ where: { id: order.userId } });
    if (user) {
      try {
        await emailService.sendOrderStatusUpdate(
          user.email,
          user.name,
          order.id,
          status,
          trackingNumber,
          carrier
        );
      } catch (emailError) {
        console.error('Email send error:', emailError);
      }
    }

    res.json(updatedOrder);
  } catch (error) {
    console.error('Update order error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const getOrderTracking = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const order = await orderRepository.findOne({ 
      where: { id },
      relations: ['user']
    });

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Build timeline from tracking history
    const timeline = [
      {
        status: 'Order Placed',
        description: 'Your order has been received and confirmed',
        date: order.createdAt.toLocaleString(),
        completed: true
      }
    ];

    if (order.trackingHistory) {
      order.trackingHistory.forEach(entry => {
        timeline.push({
          status: entry.status,
          description: entry.description,
          date: new Date(entry.timestamp).toLocaleString(),
          completed: true
        });
      });
    }

    // Add pending statuses
    const allStatuses = ['Order Placed', 'Processing', 'Shipped', 'In Transit', 'Out for Delivery', 'Delivered'];
    const completedStatuses = timeline.map(t => t.status);
    
    allStatuses.forEach(status => {
      if (!completedStatuses.some(cs => cs.toLowerCase().includes(status.toLowerCase()))) {
        timeline.push({
          status,
          description: `Awaiting ${status.toLowerCase()}`,
          date: 'Pending',
          completed: false
        });
      }
    });

    const trackingData = {
      orderId: order.id,
      status: order.status,
      orderDate: order.createdAt.toISOString().split('T')[0],
      estimatedDelivery: order.estimatedDelivery 
        ? order.estimatedDelivery.toISOString().split('T')[0]
        : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      trackingNumber: order.trackingNumber,
      carrier: order.carrier,
      items: order.items.map(item => ({
        name: item.productName,
        quantity: item.quantity,
        image: ''
      })),
      timeline
    };

    res.json(trackingData);
  } catch (error) {
    console.error('Get tracking error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
