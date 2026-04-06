import express, { Router } from 'express';
import { createClient } from '@supabase/supabase-js';

const router = Router();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL!,
  process.env.VITE_SUPABASE_ANON_KEY!
);

// Verify admin role
async function verifyAdmin(userId: string): Promise<boolean> {
  const { data, error } = await supabase
    .from('users')
    .select('role')
    .eq('id', userId)
    .single();

  return data?.role === 'admin';
}

// Get all users (admin only)
router.get('/users', async (req, res) => {
  try {
    const userId = req.headers['x-user-id'] as string;

    if (!userId || !(await verifyAdmin(userId))) {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const { data, error } = await supabase
      .from('users')
      .select('id, email, company, plan, status, created_at, subscription_start, subscription_end')
      .order('created_at', { ascending: false });

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    res.json({
      users: data.map(u => ({
        id: u.id,
        email: u.email,
        company: u.company,
        plan: u.plan,
        status: u.status,
        createdAt: u.created_at,
        subscriptionStart: u.subscription_start,
        subscriptionEnd: u.subscription_end
      }))
    });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// Get user details (admin only)
router.get('/users/:userId', async (req, res) => {
  try {
    const adminId = req.headers['x-user-id'] as string;
    const { userId } = req.params;

    if (!adminId || !(await verifyAdmin(adminId))) {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const { data: user } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    const { data: orders } = await supabase
      .from('orders')
      .select('id, status, risk_level, amount, created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(10);

    const { data: apiKeys } = await supabase
      .from('api_keys')
      .select('id, name, status, created_at')
      .eq('user_id', userId);

    res.json({
      user: {
        id: user?.id,
        email: user?.email,
        company: user?.company,
        plan: user?.plan,
        status: user?.status,
        createdAt: user?.created_at
      },
      recentOrders: orders || [],
      apiKeysCount: apiKeys?.length || 0
    });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// Update user status (admin only)
router.put('/users/:userId/status', async (req, res) => {
  try {
    const adminId = req.headers['x-user-id'] as string;
    const { userId } = req.params;
    const { status } = req.body;

    if (!adminId || !(await verifyAdmin(adminId))) {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const { data, error } = await supabase
      .from('users')
      .update({ status })
      .eq('id', userId)
      .select();

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    res.json({ message: 'User status updated' });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// Update user plan (admin only)
router.put('/users/:userId/plan', async (req, res) => {
  try {
    const adminId = req.headers['x-user-id'] as string;
    const { userId } = req.params;
    const { plan } = req.body;

    if (!adminId || !(await verifyAdmin(adminId))) {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const { data, error } = await supabase
      .from('users')
      .update({ plan })
      .eq('id', userId)
      .select();

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    res.json({ message: 'User plan updated' });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// Get system stats (admin only)
router.get('/stats/system', async (req, res) => {
  try {
    const userId = req.headers['x-user-id'] as string;

    if (!userId || !(await verifyAdmin(userId))) {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const { data: users } = await supabase.from('users').select('id');
    const { data: orders } = await supabase.from('orders').select('id, amount, status');
    const { data: apiKeys } = await supabase.from('api_keys').select('id');

    const totalUsers = users?.length || 0;
    const totalOrders = orders?.length || 0;
    const totalRevenue = orders?.reduce((sum, o) => sum + (o.amount || 0), 0) || 0;
    const blockedOrders = orders?.filter(o => o.status === 'blocked').length || 0;
    const totalApiKeys = apiKeys?.length || 0;

    res.json({
      totalUsers,
      totalOrders,
      totalRevenue,
      blockedOrders,
      fraudDetectionRate: totalOrders > 0 ? (blockedOrders / totalOrders) * 100 : 0,
      totalApiKeys,
      avgOrderValue: totalOrders > 0 ? totalRevenue / totalOrders : 0
    });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// Manage fraud rules (admin only)
router.get('/fraud-rules', async (req, res) => {
  try {
    const userId = req.headers['x-user-id'] as string;

    if (!userId || !(await verifyAdmin(userId))) {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const { data, error } = await supabase
      .from('fraud_rules')
      .select('*')
      .order('count', { ascending: false });

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    res.json({ rules: data });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// Get audit logs (admin only)
router.get('/audit-logs', async (req, res) => {
  try {
    const userId = req.headers['x-user-id'] as string;
    const { limit = 50, offset = 0 } = req.query;

    if (!userId || !(await verifyAdmin(userId))) {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const { data, error } = await supabase
      .from('audit_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .range(Number(offset), Number(offset) + Number(limit) - 1);

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    res.json({
      logs: data,
      limit,
      offset
    });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

export default router;
