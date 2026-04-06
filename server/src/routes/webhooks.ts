import express, { Router } from 'express';
import { createClient } from '@supabase/supabase-js';
import { v4 as uuidv4 } from 'uuid';
import crypto from 'crypto';
import { z } from 'zod';

const router = Router();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL!,
  process.env.VITE_SUPABASE_ANON_KEY!
);

// Validation schemas
const webhookSchema = z.object({
  url: z.string().url(),
  events: z.array(z.enum(['order.analyzed', 'order.blocked', 'order.approved']))
});

// Create webhook
router.post('/', async (req, res) => {
  try {
    const { url, events } = webhookSchema.parse(req.body);
    const userId = req.headers['x-user-id'] as string;

    if (!userId) {
      return res.status(401).json({ error: 'User ID required' });
    }

    const secret = crypto.randomBytes(32).toString('hex');

    const { data, error } = await supabase
      .from('webhooks')
      .insert([
        {
          id: uuidv4(),
          user_id: userId,
          url,
          events,
          secret,
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
      url: data[0].url,
      events: data[0].events,
      status: data[0].status,
      createdAt: data[0].created_at
    });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// List webhooks
router.get('/', async (req, res) => {
  try {
    const userId = req.headers['x-user-id'] as string;

    if (!userId) {
      return res.status(401).json({ error: 'User ID required' });
    }

    const { data, error } = await supabase
      .from('webhooks')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    res.json({
      webhooks: data.map(w => ({
        id: w.id,
        url: w.url,
        events: w.events,
        status: w.status,
        createdAt: w.created_at
      }))
    });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// Update webhook
router.put('/:webhookId', async (req, res) => {
  try {
    const userId = req.headers['x-user-id'] as string;
    const { webhookId } = req.params;
    const { url, events, status } = req.body;

    if (!userId) {
      return res.status(401).json({ error: 'User ID required' });
    }

    const { data, error } = await supabase
      .from('webhooks')
      .update({
        url: url || undefined,
        events: events || undefined,
        status: status || undefined
      })
      .eq('id', webhookId)
      .eq('user_id', userId)
      .select();

    if (error || !data || data.length === 0) {
      return res.status(404).json({ error: 'Webhook not found' });
    }

    res.json({
      id: data[0].id,
      url: data[0].url,
      events: data[0].events,
      status: data[0].status
    });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// Delete webhook
router.delete('/:webhookId', async (req, res) => {
  try {
    const userId = req.headers['x-user-id'] as string;
    const { webhookId } = req.params;

    if (!userId) {
      return res.status(401).json({ error: 'User ID required' });
    }

    const { error } = await supabase
      .from('webhooks')
      .delete()
      .eq('id', webhookId)
      .eq('user_id', userId);

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    res.json({ message: 'Webhook deleted' });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

export default router;
