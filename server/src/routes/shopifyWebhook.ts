import express, { Router } from 'express';
import { createClient } from '@supabase/supabase-js';
import { shopifyService } from '../services/shopifyService';
import { FraudDetectionEngine } from '../services/fraudDetection';

const router = Router();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL!,
  process.env.VITE_SUPABASE_ANON_KEY!
);

const fraudEngine = new FraudDetectionEngine(supabase);

// Shopify webhook handler for orders
router.post('/webhook', async (req, res) => {
  try {
    const hmacHeader = req.headers['x-shopify-hmac-sha256'];
    const topic = req.headers['x-shopify-topic'];
    const webhookSecret = process.env.SHOPIFY_WEBHOOK_SECRET;

    if (!webhookSecret) {
      console.error('Missing SHOPIFY_WEBHOOK_SECRET');
      return res.status(500).json({ error: 'Webhook secret not configured' });
    }

    // Verify webhook signature
    const isValid = await shopifyService.verifyWebhookSignature(req, hmacHeader, webhookSecret);
    if (!isValid) {
      return res.status(401).json({ error: 'Invalid webhook signature' });
    }

    const order = req.body;

    // Shopify sends the shop domain in this header
    const shopDomain = req.headers['x-shopify-shop-domain'] as string;
    
    if (!shopDomain) {
      console.error('[Shopify Webhook] Header x-shopify-shop-domain is missing');
      return res.status(400).json({ error: 'Shop domain missing' });
    }

    console.log(`[Shopify Webhook] Processing for shop: ${shopDomain}`);

    // Use shop_name or shop_domain to find the integration
    const { data: integration, error: dbError } = await supabase
      .from('shopify_integrations')
      .select('*')
      .eq('shop_name', shopDomain)
      .single();

    if (dbError || !integration) {
      console.error(`[Shopify Webhook] No integration found for: ${shopDomain}`);
      return res.status(404).json({ error: 'Integration not found' });
    }

    if (!integration) {
      return res.status(404).json({ error: 'Integration not found' });
    }

    // Analyze order for fraud
    const fraudAnalysis = await fraudEngine.analyzeFraud({
      orderId: order.id?.toString() || '',
      customerEmail: order.customer?.email || order.email,
      amount: parseFloat(order.total_price),
      currency: 'USD',
      customerName: `${order.customer?.first_name || ''} ${order.customer?.last_name || ''}`.trim(),
      shippingAddress: {
        country: order.shipping_address?.country || '',
        state: order.shipping_address?.state || '',
        city: order.shipping_address?.city || '',
        zipCode: order.shipping_address?.zip || ''
      },
      billingAddress: {
        country: order.billing_address?.country || '',
        state: order.billing_address?.state || '',
        city: order.billing_address?.city || '',
        zipCode: order.billing_address?.zip || ''
      },
      paymentMethod: 'shopify'
    });

    // Save webhook log
    await supabase.from('webhook_logs').insert([
      {
        webhook_id: integration.id,
        event_type: topic,
        payload: order,
        response: fraudAnalysis,
        status: 'processed',
        created_at: new Date().toISOString()
      }
    ]);

    // If fraud detected, send alert webhook to merchant
    if (fraudAnalysis.recommendation !== 'approve') {
      // Send email alert to merchant
      const { data: user } = await supabase
        .from('users')
        .select('email')
        .eq('id', integration.user_id)
        .single();

      if (user) {
        // Send fraud alert via webhook/email
        console.log(`Fraud alert for shop ${shopName}: Order ${order.id} - Risk Score: ${fraudAnalysis.riskScore}`);
      }
    }

    res.status(200).json({
      success: true,
      orderId: order.id,
      riskScore: fraudAnalysis.riskScore,
      recommendation: fraudAnalysis.recommendation
    });
  } catch (error: any) {
    console.error('Shopify webhook error:', error);
    res.status(400).json({ error: error.message });
  }
});

// OAuth callback handler
router.post('/oauth/callback', async (req, res) => {
  try {
    const { code, shop, userId } = req.body;

    if (!code || !shop) {
      return res.status(400).json({ error: 'Missing code or shop parameter' });
    }

    // Exchange code for access token
    const accessToken = await shopifyService.getShopifyAccessToken(
      code,
      shop,
      process.env.SHOPIFY_CLIENT_ID!,
      process.env.SHOPIFY_CLIENT_SECRET!
    );

    // Get shop info
    const shopInfo = await shopifyService.getShopifyStoreInfo(shop, accessToken);

    // Save integration to database
    const { data, error } = await supabase
      .from('shopify_integrations')
      .insert([
        {
          user_id: userId,
          shop_name: shop,
          access_token: accessToken,
          shop_domain: shopInfo.domain,
          status: 'active',
          created_at: new Date().toISOString()
        }
      ])
      .select();

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    // Register webhooks
    const webhookUrl = process.env.WEBHOOK_URL || 'https://api.fraudshield.app';
    await shopifyService.registerWebhooks(shop, accessToken, webhookUrl);

    res.json({
      success: true,
      message: 'Shopify integration successful',
      integration: data?.[0]
    });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// Disconnect Shopify integration
router.post('/disconnect', async (req, res) => {
  try {
    const { integrationId } = req.body;
    const userId = req.headers['x-user-id'] as string;

    if (!userId) {
      return res.status(401).json({ error: 'User ID required' });
    }

    const { data: integration } = await supabase
      .from('shopify_integrations')
      .select('*')
      .eq('id', integrationId)
      .eq('user_id', userId)
      .single();

    if (!integration) {
      return res.status(404).json({ error: 'Integration not found' });
    }

    // Unregister webhooks
    await shopifyService.unregisterWebhooks(integration.shop_name, integration.access_token);

    // Delete integration
    await supabase.from('shopify_integrations').delete().eq('id', integrationId);

    res.json({ message: 'Shopify integration disconnected' });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

export default router;
