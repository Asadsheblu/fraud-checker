import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());

// Shopify Webhook এবং অন্যান্য ওয়েবহুকের জন্য Raw Body সেভ করার কনফিগারেশন
app.use(express.json({
  verify: (req: any, res, buf) => {
    if (req.originalUrl && req.originalUrl.includes('/webhook')) {
      req.rawBody = buf; // এখানে অরিজিনাল ডাটা সেভ করা হচ্ছে
    }
  }
}));

// ডিবাগ করার জন্য এই মিডলওয়্যারটি এড করতে পারেন (অপশনাল)
app.use((req: any, res, next) => {
  if (req.originalUrl.includes('/shopify')) {
    console.log(`[Debug] Incoming request to: ${req.originalUrl}`);
  }
  next();
});

// Initialize Supabase client
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API Routes
app.use('/api/auth', require('./routes/auth').default);
app.use('/api/orders', require('./routes/orders').default);
app.use('/api/api-keys', require('./routes/apiKeys').default);
app.use('/api/webhooks', require('./routes/webhooks').default);
app.use('/api/analytics', require('./routes/analytics').default);
app.use('/api/integrations', require('./routes/integrations').default);
app.use('/api/email', require('./routes/email').default);
app.use('/api/shopify', require('./routes/shopifyWebhook').default);
app.use('/api/admin', require('./routes/admin').default);

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error',
    timestamp: new Date().toISOString()
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`FraudShield API server running on port ${PORT}`);
});
