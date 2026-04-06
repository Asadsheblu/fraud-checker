# FraudShield SaaS - Setup Guide

Complete step-by-step instructions to get FraudShield running locally or deployed.

## Table of Contents
1. [Local Development Setup](#local-development-setup)
2. [Configure Supabase](#configure-supabase)
3. [Setup Integrations](#setup-integrations)
4. [Deploy to Production](#deploy-to-production)

## Local Development Setup

### Step 1: Clone and Install

```bash
# Clone repository
git clone https://github.com/asadsheblu/trusty-orders.git
cd trusty-orders

# Install frontend dependencies
npm install

# Install backend dependencies
cd server
npm install
cd ..
```

### Step 2: Configure Environment Variables

#### Frontend Configuration
Create `.env.development.local` in the project root:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
VITE_API_URL=http://localhost:3000
```

Get these values from [Supabase Dashboard](https://app.supabase.com):
1. Go to Settings > API
2. Copy "Project URL" and "anon public" key

#### Backend Configuration
Create `server/.env`:

```env
# Database Connection
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_min_32_characters
JWT_EXPIRY=7d

# Email Service (Resend)
RESEND_API_KEY=re_your_api_key_here
SENDER_EMAIL=noreply@fraudshield.io

# Shopify Integration (Optional)
SHOPIFY_APP_ID=your_shopify_app_id
SHOPIFY_APP_SECRET=your_shopify_app_secret
SHOPIFY_WEBHOOK_SECRET=your_webhook_secret

# Server Configuration
PORT=3000
NODE_ENV=development
CORS_ORIGIN=http://localhost:5173
```

### Step 3: Start Development Servers

**Terminal 1 - Frontend:**
```bash
npm run dev
# Server will run on http://localhost:5173
```

**Terminal 2 - Backend:**
```bash
cd server
npm run dev
# Server will run on http://localhost:3000
```

Access the application at `http://localhost:5173`

## Configure Supabase

### Step 1: Create Supabase Project

1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Click "New Project"
3. Enter project name and database password
4. Wait for project initialization

### Step 2: Run Database Migrations

The migrations in `supabase/migrations/` will run automatically when:
- You push to GitHub (if connected)
- Or run migrations manually via Supabase CLI

**Manual Migration:**
```bash
# Install Supabase CLI
npm install -g @supabase/cli

# Link project
supabase link --project-ref your-project-id

# Run migrations
supabase db push
```

### Step 3: Set Row Level Security (RLS)

All tables already have RLS policies configured. Verify in Supabase Dashboard:

1. Go to Authentication > Policies
2. Check each table has policies:
   - Users can only see their own data
   - Admins can see all data
   - Public access disabled

### Step 4: Get Service Role Key

For backend operations:
1. Go to Settings > API
2. Scroll to "Service Role Key"
3. Copy and add to `server/.env` as `SUPABASE_SERVICE_ROLE_KEY`

⚠️ **IMPORTANT**: Keep service role key secret! Never expose in frontend.

## Setup Integrations

### Shopify Integration

#### Prerequisites
- Shopify Partner account
- A development store

#### Setup Steps

1. **Create Shopify App**
   - Go to [Shopify Partner Dashboard](https://partners.shopify.com)
   - Click "Apps and sales channel apps"
   - Click "Create an app"
   - Choose "Custom app" type

2. **Configure OAuth**
   - In app settings, set Redirect URI to:
     ```
     https://your-domain.com/api/shopify/callback
     ```
   - Check scopes needed:
     - `read_orders`
     - `write_orders`
     - `read_customers`

3. **Add Credentials to .env**
   ```env
   SHOPIFY_APP_ID=your_app_id
   SHOPIFY_APP_SECRET=your_app_secret
   ```

4. **Test Integration**
   - Go to Integrations page in dashboard
   - Click "Connect Shopify"
   - Authorize and connect your store
   - Check FraudShield webhooks registered in Shopify admin

### Resend Email Service

#### Setup Steps

1. **Create Resend Account**
   - Go to [Resend.com](https://resend.com)
   - Sign up for free account

2. **Get API Key**
   - Go to Settings > API Keys
   - Create new API key
   - Copy and add to `server/.env`:
     ```env
     RESEND_API_KEY=re_your_key_here
     ```

3. **Verify Sender Email**
   - Go to Domains in Resend dashboard
   - Add your domain or use `noreply@resend.dev` for testing

4. **Update Sender Address**
   ```env
   SENDER_EMAIL=noreply@fraudshield.io
   ```

### Stripe Payments (Optional)

1. **Create Stripe Account**
   - Go to [Stripe.com](https://stripe.com)
   - Sign up

2. **Get API Keys**
   - Dashboard > Developers > API Keys
   - Copy Publishable and Secret keys

3. **Add to Backend .env**
   ```env
   STRIPE_SECRET_KEY=sk_live_your_key
   STRIPE_PUBLISHABLE_KEY=pk_live_your_key
   ```

## Deploy to Production

### Option 1: Vercel (Recommended)

#### Deploy Frontend

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel

# Follow prompts and connect to GitHub repo
```

#### Deploy Backend

```bash
cd server
vercel --prod
```

#### Set Environment Variables

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select project
3. Go to Settings > Environment Variables
4. Add all variables from `server/.env.example`:

```
SUPABASE_URL
SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
JWT_SECRET
RESEND_API_KEY
SENDER_EMAIL
SHOPIFY_APP_ID
SHOPIFY_APP_SECRET
```

### Option 2: Docker

```bash
# Build image
docker build -t fraudshield .

# Run container
docker run -p 5173:5173 -p 3000:3000 \
  -e SUPABASE_URL=your_url \
  -e SUPABASE_ANON_KEY=your_key \
  fraudshield
```

### Option 3: Traditional VPS

#### Backend Deployment

```bash
# SSH to server
ssh user@your-server.com

# Clone repo
git clone https://github.com/asadsheblu/trusty-orders.git
cd trusty-orders/server

# Install PM2
npm install -g pm2

# Create .env file with production values
cp .env.example .env
# Edit .env with production values

# Start with PM2
pm2 start "npm start" --name fraudshield-api

# Setup auto-restart
pm2 startup
pm2 save
```

#### Frontend Deployment

```bash
# Build
npm run build

# Deploy dist folder to web server (nginx, Apache, etc.)
# Configure as SPA (route all requests to index.html)
```

## Post-Deployment Checklist

- [ ] Database migrations run successfully
- [ ] Frontend loads without errors
- [ ] Backend API responds to requests
- [ ] Authentication works (login/signup)
- [ ] Email notifications send successfully
- [ ] Shopify integration connected
- [ ] Admin panel accessible with admin account
- [ ] SSL/TLS certificate installed
- [ ] Environment variables all set
- [ ] Database backups configured
- [ ] Monitoring and logging setup

## Troubleshooting

### Frontend won't load
```bash
# Check if port is in use
lsof -i :5173

# Clear build cache
rm -rf dist node_modules
npm install
npm run build
```

### Backend API errors
```bash
# Check logs
pm2 logs fraudshield-api

# Verify database connection
curl http://localhost:3000/health
```

### Database connection issues
```bash
# Verify credentials
echo $SUPABASE_URL
echo $SUPABASE_ANON_KEY

# Test connection with psql
psql -h db.supabase.co -U postgres -d postgres
```

### Email not sending
- Verify RESEND_API_KEY is valid
- Check sender email is verified in Resend dashboard
- Look for logs in Resend dashboard

### Shopify webhook not triggering
- Verify webhook URL is publicly accessible
- Check SHOPIFY_WEBHOOK_SECRET matches
- Test webhook in Shopify admin

## Need Help?

- Documentation: https://docs.fraudshield.io
- Issues: https://github.com/asadsheblu/trusty-orders/issues
- Email: support@fraudshield.io
- Discord: https://discord.gg/fraudshield
