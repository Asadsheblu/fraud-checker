import express, { Router } from 'express';
import { createClient } from '@supabase/supabase-js';

const router = Router();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL!,
  process.env.VITE_SUPABASE_ANON_KEY!
);

// Get dashboard stats
router.get('/stats', async (req, res) => {
  try {
    const userId = req.headers['x-user-id'] as string;
    const { period = 'month' } = req.query;

    if (!userId) {
      return res.status(401).json({ error: 'User ID required' });
    }

    // Calculate date range
    const now = new Date();
    let startDate = new Date();

    switch (period) {
      case 'week':
        startDate.setDate(now.getDate() - 7);
        break;
      case 'month':
        startDate.setMonth(now.getMonth() - 1);
        break;
      case 'year':
        startDate.setFullYear(now.getFullYear() - 1);
        break;
    }

    const { data: orders, error: ordersError } = await supabase
      .from('orders')
      .select('id, status, risk_level, amount')
      .eq('user_id', userId)
      .gte('created_at', startDate.toISOString());

    if (ordersError) {
      return res.status(500).json({ error: 'Failed to fetch orders' });
    }

    // Calculate stats
    const totalOrders = orders?.length || 0;
    const approvedOrders = orders?.filter(o => o.status === 'approved').length || 0;
    const blockedOrders = orders?.filter(o => o.status === 'blocked').length || 0;
    const reviewOrders = orders?.filter(o => o.status === 'pending_review').length || 0;
    const totalValue = orders?.reduce((sum, o) => sum + (o.amount || 0), 0) || 0;
    const avgValue = totalOrders > 0 ? totalValue / totalOrders : 0;

    res.json({
      totalOrders,
      approvedOrders,
      blockedOrders,
      reviewOrders,
      totalValue,
      avgValue,
      approvalRate: totalOrders > 0 ? (approvedOrders / totalOrders) * 100 : 0,
      fraudRate: totalOrders > 0 ? (blockedOrders / totalOrders) * 100 : 0
    });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// Get risk distribution
router.get('/risk-distribution', async (req, res) => {
  try {
    const userId = req.headers['x-user-id'] as string;
    const { period = 'month' } = req.query;

    if (!userId) {
      return res.status(401).json({ error: 'User ID required' });
    }

    // Calculate date range
    const now = new Date();
    let startDate = new Date();

    switch (period) {
      case 'week':
        startDate.setDate(now.getDate() - 7);
        break;
      case 'month':
        startDate.setMonth(now.getMonth() - 1);
        break;
      case 'year':
        startDate.setFullYear(now.getFullYear() - 1);
        break;
    }

    const { data: orders, error: ordersError } = await supabase
      .from('orders')
      .select('risk_level')
      .eq('user_id', userId)
      .gte('created_at', startDate.toISOString());

    if (ordersError) {
      return res.status(500).json({ error: 'Failed to fetch orders' });
    }

    const safe = orders?.filter(o => o.risk_level === 'safe').length || 0;
    const risky = orders?.filter(o => o.risk_level === 'risky').length || 0;
    const fraud = orders?.filter(o => o.risk_level === 'fraud').length || 0;

    res.json({
      safe,
      risky,
      fraud
    });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// Get top fraud triggers
router.get('/top-fraud-triggers', async (req, res) => {
  try {
    const userId = req.headers['x-user-id'] as string;

    if (!userId) {
      return res.status(401).json({ error: 'User ID required' });
    }

    const { data: rules, error: rulesError } = await supabase
      .from('fraud_rules')
      .select('name, count')
      .eq('user_id', userId)
      .order('count', { ascending: false })
      .limit(5);

    if (rulesError) {
      return res.status(500).json({ error: 'Failed to fetch rules' });
    }

    res.json({
      triggers: rules.map(r => ({
        name: r.name,
        count: r.count
      }))
    });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// Get trends
router.get('/trends', async (req, res) => {
  try {
    const userId = req.headers['x-user-id'] as string;

    if (!userId) {
      return res.status(401).json({ error: 'User ID required' });
    }

    // Get last 30 days of data
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const { data: orders, error: ordersError } = await supabase
      .from('orders')
      .select('created_at, status, amount')
      .eq('user_id', userId)
      .gte('created_at', thirtyDaysAgo.toISOString())
      .order('created_at', { ascending: true });

    if (ordersError) {
      return res.status(500).json({ error: 'Failed to fetch orders' });
    }

    // Group by day
    const trends: { [key: string]: { orders: number; value: number } } = {};

    orders?.forEach(order => {
      const date = new Date(order.created_at).toISOString().split('T')[0];
      if (!trends[date]) {
        trends[date] = { orders: 0, value: 0 };
      }
      trends[date].orders++;
      trends[date].value += order.amount || 0;
    });

    res.json({
      trends: Object.entries(trends).map(([date, data]) => ({
        date,
        orders: data.orders,
        value: data.value
      }))
    });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

export default router;
