import express, { Router } from 'express';
import { createClient } from '@supabase/supabase-js';
import { v4 as uuidv4 } from 'uuid';
import { z } from 'zod';

const router = Router();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL!,
  process.env.VITE_SUPABASE_ANON_KEY!
);

// Validation schemas
const shopifySchema = z.object({
  shopName: z.string(),
  accessToken: z.string()
});

const woocommerceSchema = z.object({
  storeName: z.string(),
  consumerKey: z.string(),
  consumerSecret: z.string()
});

// Shopify OAuth callback
router.post('/shopify/connect', async (req, res) => {
  try {
    const userId = req.headers['x-user-id'] as string;
    const { shopName, accessToken } = shopifySchema.parse(req.body);

    if (!userId) {
      return res.status(401).json({ error: 'User ID required' });
    }

    const { data, error } = await supabase
      .from('shopify_integrations')
      .insert([
        {
          id: uuidv4(),
          user_id: userId,
          shop_name: shopName,
          access_token: accessToken,
          status: 'active',
          created_at: new Date().toISOString()
        }
      ])
      .select();

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    res.status(201).json({
      id: data[0].id,
      shopName: data[0].shop_name,
      status: data[0].status
    });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// WooCommerce connection
router.post('/woocommerce/connect', async (req, res) => {
  try {
    const userId = req.headers['x-user-id'] as string;
    const { storeName, consumerKey, consumerSecret } = woocommerceSchema.parse(req.body);

    if (!userId) {
      return res.status(401).json({ error: 'User ID required' });
    }

    const { data, error } = await supabase
      .from('woocommerce_integrations')
      .insert([
        {
          id: uuidv4(),
          user_id: userId,
          store_name: storeName,
          consumer_key: consumerKey,
          consumer_secret: consumerSecret,
          status: 'active',
          created_at: new Date().toISOString()
        }
      ])
      .select();

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    res.status(201).json({
      id: data[0].id,
      storeName: data[0].store_name,
      status: data[0].status
    });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// List integrations
router.get('/', async (req, res) => {
  try {
    const userId = req.headers['x-user-id'] as string;

    if (!userId) {
      return res.status(401).json({ error: 'User ID required' });
    }

    const { data: shopify } = await supabase
      .from('shopify_integrations')
      .select('id, shop_name, status, created_at')
      .eq('user_id', userId);

    const { data: woocommerce } = await supabase
      .from('woocommerce_integrations')
      .select('id, store_name, status, created_at')
      .eq('user_id', userId);

    res.json({
      shopify: shopify?.map(s => ({
        id: s.id,
        type: 'shopify',
        name: s.shop_name,
        status: s.status,
        connectedAt: s.created_at
      })) || [],
      woocommerce: woocommerce?.map(w => ({
        id: w.id,
        type: 'woocommerce',
        name: w.store_name,
        status: w.status,
        connectedAt: w.created_at
      })) || []
    });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// Disconnect integration
router.delete('/:integrationType/:integrationId', async (req, res) => {
  try {
    const userId = req.headers['x-user-id'] as string;
    const { integrationType, integrationId } = req.params;

    if (!userId) {
      return res.status(401).json({ error: 'User ID required' });
    }

    const table = integrationType === 'shopify' ? 'shopify_integrations' : 'woocommerce_integrations';

    const { error } = await supabase
      .from(table)
      .delete()
      .eq('id', integrationId)
      .eq('user_id', userId);

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    res.json({ message: `${integrationType} integration disconnected` });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

export default router;
