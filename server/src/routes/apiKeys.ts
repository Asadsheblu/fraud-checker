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
const createKeySchema = z.object({
  name: z.string().min(3),
  dailyLimit: z.number().default(10000)
});

// Generate secure API key
function generateApiKey(): string {
  return 'fsh_' + crypto.randomBytes(32).toString('hex');
}

// Create API key
router.post('/', async (req, res) => {
  try {
    const { name, dailyLimit } = createKeySchema.parse(req.body);
    const userId = req.headers['x-user-id'] as string;

    if (!userId) {
      return res.status(401).json({ error: 'User ID required' });
    }

    const apiKey = generateApiKey();

    const { data, error } = await supabase
      .from('api_keys')
      .insert([
        {
          id: uuidv4(),
          user_id: userId,
          key: apiKey,
          name,
          daily_limit: dailyLimit,
          requests_today: 0,
          status: 'active',
          created_at: new Date().toISOString(),
          last_used_at: null
        }
      ])
      .select();

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    res.status(201).json({
      id: data[0].id,
      name: data[0].name,
      key: apiKey,
      dailyLimit: data[0].daily_limit,
      createdAt: data[0].created_at
    });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// List API keys
router.get('/', async (req, res) => {
  try {
    const userId = req.headers['x-user-id'] as string;

    if (!userId) {
      return res.status(401).json({ error: 'User ID required' });
    }

    const { data, error } = await supabase
      .from('api_keys')
      .select('id, name, status, daily_limit, requests_today, created_at, last_used_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    res.json({
      keys: data.map(k => ({
        id: k.id,
        name: k.name,
        status: k.status,
        dailyLimit: k.daily_limit,
        requestsToday: k.requests_today,
        createdAt: k.created_at,
        lastUsedAt: k.last_used_at
      }))
    });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// Get single API key (masked)
router.get('/:keyId', async (req, res) => {
  try {
    const userId = req.headers['x-user-id'] as string;
    const { keyId } = req.params;

    if (!userId) {
      return res.status(401).json({ error: 'User ID required' });
    }

    const { data, error } = await supabase
      .from('api_keys')
      .select('*')
      .eq('id', keyId)
      .eq('user_id', userId)
      .single();

    if (error || !data) {
      return res.status(404).json({ error: 'API key not found' });
    }

    res.json({
      id: data.id,
      name: data.name,
      keyPreview: data.key.substring(0, 7) + '...' + data.key.substring(data.key.length - 4),
      status: data.status,
      dailyLimit: data.daily_limit,
      requestsToday: data.requests_today,
      createdAt: data.created_at,
      lastUsedAt: data.last_used_at
    });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// Update API key
router.put('/:keyId', async (req, res) => {
  try {
    const userId = req.headers['x-user-id'] as string;
    const { keyId } = req.params;
    const { name, dailyLimit, status } = req.body;

    if (!userId) {
      return res.status(401).json({ error: 'User ID required' });
    }

    const { data, error } = await supabase
      .from('api_keys')
      .update({
        name: name || undefined,
        daily_limit: dailyLimit || undefined,
        status: status || undefined
      })
      .eq('id', keyId)
      .eq('user_id', userId)
      .select();

    if (error || !data || data.length === 0) {
      return res.status(404).json({ error: 'API key not found' });
    }

    res.json({
      id: data[0].id,
      name: data[0].name,
      status: data[0].status,
      dailyLimit: data[0].daily_limit,
      updatedAt: new Date().toISOString()
    });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// Delete API key
router.delete('/:keyId', async (req, res) => {
  try {
    const userId = req.headers['x-user-id'] as string;
    const { keyId } = req.params;

    if (!userId) {
      return res.status(401).json({ error: 'User ID required' });
    }

    const { error } = await supabase
      .from('api_keys')
      .delete()
      .eq('id', keyId)
      .eq('user_id', userId);

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    res.json({ message: 'API key deleted' });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

export default router;
