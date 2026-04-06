import express, { Router } from 'express';
import { createClient } from '@supabase/supabase-js';
import { FraudDetectionEngine } from '../services/fraudDetection';
import { v4 as uuidv4 } from 'uuid';
import { z } from 'zod';

const router = Router();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY || process.env.VITE_SUPABASE_ANON_KEY!
);

const fraudEngine = new FraudDetectionEngine(supabase);

// Validation schema
const orderSchema = z.object({
  apiKey: z.string(),
  customer: z.object({
    email: z.string().email(),
    name: z.string(),
    phone: z.string().optional()
  }),
  amount: z.number().positive(),
  currency: z.string().default('USD'),
  shippingAddress: z.object({
    country: z.string(),
    state: z.string(),
    city: z.string(),
    zipCode: z.string(),
    street: z.string(),
    streetLine2: z.string().optional()
  }),
  billingAddress: z.object({
    country: z.string(),
    state: z.string(),
    city: z.string(),
    zipCode: z.string(),
    street: z.string(),
    streetLine2: z.string().optional()
  }).optional(),
  paymentMethod: z.string(),
  deviceFingerprint: z.string().optional(),
  ipAddress: z.string().optional(),
  userAgent: z.string().optional()
});

// Analyze order for fraud
router.post('/analyze', async (req, res) => {
  try {
    const orderData = orderSchema.parse(req.body);

    // Verify API key
    const { data: apiKeyData, error: apiKeyError } = await supabase
      .from('api_keys')
      .select('user_id, daily_limit, requests_today')
      .eq('key', orderData.apiKey)
      .eq('status', 'active')
      .single();

    if (apiKeyError || !apiKeyData) {
      return res.status(401).json({ error: 'Invalid API key' });
    }

    // Check rate limit
    if (apiKeyData.requests_today >= apiKeyData.daily_limit) {
      return res.status(429).json({ error: 'Rate limit exceeded' });
    }

    // Run fraud analysis
    const shipping = orderData.shippingAddress;
    const billing = orderData.billingAddress;

    const fraudAnalysis = await fraudEngine.analyzeFraud({
      orderId: uuidv4(),
      customerEmail: orderData.customer.email,
      amount: orderData.amount,
      currency: orderData.currency,
      customerName: orderData.customer.name,
      shippingAddress: {
        country: shipping.country ?? '',
        state: shipping.state ?? '',
        city: shipping.city ?? '',
        zipCode: shipping.zipCode ?? ''
      },
      billingAddress: billing ? {
        country: billing.country ?? '',
        state: billing.state ?? '',
        city: billing.city ?? '',
        zipCode: billing.zipCode ?? ''
      } : undefined,
      paymentMethod: orderData.paymentMethod,
      deviceFingerprint: orderData.deviceFingerprint,
      ipAddress: orderData.ipAddress,
      userAgent: orderData.userAgent
    });

    // Save order to database
    const { data: savedOrder, error: orderError } = await supabase
      .from('orders')
      .insert([
        {
          id: uuidv4(),
          user_id: apiKeyData.user_id,
          customer_email: orderData.customer.email,
          customer_name: orderData.customer.name,
          amount: orderData.amount,
          currency: orderData.currency,
          status: fraudAnalysis.recommendation === 'approve' ? 'approved' : fraudAnalysis.recommendation === 'block' ? 'blocked' : 'pending_review',
          risk_score: fraudAnalysis.riskScore,
          risk_level: fraudAnalysis.riskLevel,
          payment_method: orderData.paymentMethod,
          ip_address: orderData.ipAddress,
          device_fingerprint: orderData.deviceFingerprint,
          created_at: new Date().toISOString()
        }
      ])
      .select();

    if (orderError) {
      return res.status(500).json({ error: 'Failed to save order' });
    }

    // Update API key request count
    await supabase
      .from('api_keys')
      .update({ requests_today: (apiKeyData.requests_today || 0) + 1 })
      .eq('key', orderData.apiKey);

    // Log audit
    await supabase.from('audit_logs').insert([
      {
        user_id: apiKeyData.user_id,
        action: 'order_analyzed',
        resource: 'order',
        resource_id: savedOrder?.[0]?.id,
        details: { risk_score: fraudAnalysis.riskScore },
        created_at: new Date().toISOString()
      }
    ]);

    res.json({
      orderId: savedOrder?.[0]?.id,
      riskScore: fraudAnalysis.riskScore,
      riskLevel: fraudAnalysis.riskLevel,
      recommendation: fraudAnalysis.recommendation,
      rules: fraudAnalysis.rules
    });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// Get order details
router.get('/:orderId', async (req, res) => {
  try {
    const { orderId } = req.params;
    const apiKey = req.headers['x-api-key'] as string;

    // Verify API key
    const { data: apiKeyData, error: apiKeyError } = await supabase
      .from('api_keys')
      .select('user_id')
      .eq('key', apiKey)
      .eq('status', 'active')
      .single();

    if (apiKeyError || !apiKeyData) {
      return res.status(401).json({ error: 'Invalid API key' });
    }

    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('*')
      .eq('id', orderId)
      .eq('user_id', apiKeyData.user_id)
      .single();

    if (orderError || !order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    res.json(order);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// Get orders list
router.get('/', async (req, res) => {
  try {
    const apiKey = req.headers['x-api-key'] as string;
    const { limit = 10, offset = 0, status } = req.query;

    // Verify API key
    const { data: apiKeyData, error: apiKeyError } = await supabase
      .from('api_keys')
      .select('user_id')
      .eq('key', apiKey)
      .eq('status', 'active')
      .single();

    if (apiKeyError || !apiKeyData) {
      return res.status(401).json({ error: 'Invalid API key' });
    }

    let query = supabase
      .from('orders')
      .select('*')
      .eq('user_id', apiKeyData.user_id)
      .order('created_at', { ascending: false })
      .range(Number(offset), Number(offset) + Number(limit) - 1);

    if (status) {
      query = query.eq('status', status);
    }

    const { data: orders, error: orderError } = await query;

    if (orderError) {
      return res.status(500).json({ error: 'Failed to fetch orders' });
    }

    res.json({
      orders,
      limit,
      offset,
      total: orders?.length || 0
    });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

export default router;
