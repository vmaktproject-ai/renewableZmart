import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import axios from 'axios';
import { AppDataSource } from '../config/database';
import { Order, OrderStatus, PaymentStatus } from '../models/Order';

const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY || 'sk_test_your_secret_key_here';
const PAYSTACK_BASE_URL = 'https://api.paystack.co';

export const initializePayment = async (req: AuthRequest, res: Response) => {
  try {
    const { amount, email, orderId, metadata } = req.body;

    console.log('=== Payment Initialization Request ===');
    console.log('Amount:', amount);
    console.log('Email:', email);
    console.log('Order ID:', orderId);
    console.log('Paystack Secret Key (first 20 chars):', PAYSTACK_SECRET_KEY?.substring(0, 20) + '...');

    // Validate inputs
    if (!amount || amount <= 0) {
      return res.status(400).json({ status: false, message: 'Invalid amount' });
    }
    if (!email || !email.includes('@')) {
      return res.status(400).json({ status: false, message: 'Invalid email address' });
    }

    const amountInKobo = Math.round(amount * 100);
    const reference = `RZM-${Date.now()}-${orderId || 'NOID'}`;

    const paystackPayload = {
      amount: amountInKobo,
      email,
      reference,
      callback_url: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/payment/callback`,
      metadata: {
        orderId,
        ...metadata
      }
    };

    console.log('Paystack Payload:', JSON.stringify(paystackPayload, null, 2));

    // Initialize Paystack transaction
    const response = await axios.post(
      `${PAYSTACK_BASE_URL}/transaction/initialize`,
      paystackPayload,
      {
        headers: {
          Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    console.log('Paystack Success Response:', response.data);

    res.json({
      success: true,
      status: true,
      message: 'Payment initialized',
      data: response.data.data
    });
  } catch (error: any) {
    console.error('Initialize payment error:', error.response?.data || error.message);
    console.error('Error details:', JSON.stringify(error.response?.data, null, 2));
    res.status(500).json({ 
      status: false,
      message: error.response?.data?.message || 'Failed to initialize payment',
      error: error.response?.data || error.message
    });
  }
};

export const verifyPayment = async (req: AuthRequest, res: Response) => {
  try {
    const { reference } = req.params;

    // Verify transaction with Paystack
    const response = await axios.get(
      `${PAYSTACK_BASE_URL}/transaction/verify/${reference}`,
      {
        headers: {
          Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`
        }
      }
    );

    const { data } = response.data;

    // Update order status if payment successful
    if (data.status === 'success') {
      const orderRepo = AppDataSource.getRepository(Order);
      const orderId = data.metadata?.orderId;

      if (orderId) {
        await orderRepo.update(
          { id: orderId },
          { 
            paymentStatus: PaymentStatus.PAID,
            status: OrderStatus.PROCESSING
          }
        );
      }
    }

    res.json({
      status: true,
      message: 'Payment verified',
      data: {
        reference: data.reference,
        amount: data.amount / 100, // Convert from kobo to naira
        status: data.status,
        paidAt: data.paid_at,
        channel: data.channel
      }
    });
  } catch (error: any) {
    console.error('Verify payment error:', error.response?.data || error.message);
    res.status(500).json({ 
      status: false,
      message: error.response?.data?.message || 'Failed to verify payment' 
    });
  }
};
