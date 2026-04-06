# FraudShield SaaS - Complete Implementation

A comprehensive fraud detection platform for e-commerce businesses with support for Shopify, WooCommerce, and REST APIs.

## Features

### Core Fraud Detection
- **7-Rule AI Scoring System**: Advanced machine learning-based fraud scoring (0-100 scale)
  - High amount detection
  - Address mismatch checking
  - High-risk country filtering
  - Velocity checks (frequency analysis)
  - Blacklist matching
  - Device fingerprinting
  - Email domain validation

### Platform Support
- **Shopify Integration**: OAuth flow with automatic webhook registration
- **WooCommerce Plugin**: Full WordPress plugin with real-time order analysis
- **REST API**: Full-featured API for custom integrations
- **Webhook Management**: Custom webhook support for real-time notifications

### Admin Features
- **Dashboard**: Real-time fraud statistics and metrics
- **User Management**: Complete user administration with role-based access
- **Audit Logs**: Comprehensive activity tracking for compliance
- **Fraud Rules**: Customizable fraud detection rules
- **Analytics**: Detailed reports on fraud patterns and trends

### Security & Compliance
- Supabase authentication with row-level security
- Row-level security (RLS) policies on all tables
- Encrypted API keys with rate limiting
- Complete audit logging for compliance
- GDPR-compliant user management

## Tech Stack

### Frontend
- React 18 with Vite
- TypeScript
- Tailwind CSS
- shadcn/ui components
- SWR for data fetching
- React Router for navigation

### Backend
- Express.js (Node.js)
- TypeScript
- Supabase PostgreSQL
- JWT authentication
- Resend for email services

### Integrations
- Supabase (Database, Auth, Realtime)
- Stripe (Payments & Subscriptions)
- Resend (Email)
- Shopify API
- WooCommerce REST API

## Project Structure

```
fraudshield/
├── src/                          # Frontend (React + Vite)
│   ├── pages/                    # Page components
│   │   ├── Login.tsx
│   │   ├── Dashboard.tsx
│   │   ├── Orders.tsx
│   │   ├── APIKeys.tsx
│   │   ├── Billing.tsx
│   │   ├── Settings.tsx
│   │   ├── AdminPanel.tsx
│   │   └── Integrations.tsx
│   ├── components/               # Reusable UI components
│   ├── hooks/                    # React hooks (useAuth, etc)
│   ├── api/                      # API client
│   ├── integrations/             # Supabase integration
│   ├── App.tsx
│   └── main.tsx
│
├── server/                       # Backend (Express.js)
│   ├── src/
│   │   ├── index.ts              # Main server file
│   │   ├── services/             # Business logic
│   │   │   ├── fraudDetection.ts # 7-rule fraud engine
│   │   │   ├── emailService.ts   # Email notifications
│   │   │   └── shopifyService.ts # Shopify OAuth & webhooks
│   │   ├── routes/               # API endpoints
│   │   │   ├── auth.ts           # Authentication
│   │   │   ├── orders.ts         # Order analysis
│   │   │   ├── apiKeys.ts        # API key management
│   │   │   ├── webhooks.ts       # Webhook management
│   │   │   ├── analytics.ts      # Statistics
│   │   │   ├── integrations.ts   # Platform integrations
│   │   │   ├── email.ts          # Email service
│   │   │   ├── shopifyWebhook.ts # Shopify webhooks
│   │   │   └── admin.ts          # Admin functions
│   │   └── middleware/           # Express middleware
│   ├── package.json
│   ├── tsconfig.json
│   ├── .env.example
│   └── start.sh
│
├── wordpress-plugin/             # WooCommerce Plugin
│   └── fraudshield-woocommerce.php
│
├── supabase/                     # Database
│   ├── migrations/               # Database migrations
│   └── config.json               # Supabase config
│
└── vite.config.ts                # Vite configuration
```

## Getting Started

### Prerequisites
- Node.js 18+ and npm
- Supabase account (free tier available)
- Git

### Installation

#### 1. Clone the Repository
```bash
git clone https://github.com/asadsheblu/trusty-orders.git
cd trusty-orders
```

#### 2. Frontend Setup
```bash
# Install dependencies
npm install

# Start the development server
npm run dev
```

The frontend will be available at `http://localhost:5173` or the next available port.

#### 3. Backend Setup
```bash
# Navigate to server directory
cd server

# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Update .env with your configuration (see Configuration section)

# Start the backend server
npm run dev
# Or use the startup script
bash start.sh
```

The backend API will run on `http://localhost:3000` by default.

### Configuration

#### Frontend Environment Variables
Create a `.env.development.local` file in the project root:

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_API_URL=http://localhost:3000
```

#### Backend Environment Variables
Create a `.env` file in the `server/` directory:

```env
# Database
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Authentication
JWT_SECRET=your_jwt_secret
JWT_EXPIRY=7d

# Email Service
RESEND_API_KEY=your_resend_api_key
SENDER_EMAIL=noreply@fraudshield.io

# Shopify
SHOPIFY_APP_ID=your_shopify_app_id
SHOPIFY_APP_SECRET=your_shopify_app_secret
SHOPIFY_WEBHOOK_SECRET=your_webhook_secret

# Server
PORT=3000
NODE_ENV=development
CORS_ORIGIN=http://localhost:5173
```

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/signup` - User registration
- `POST /api/auth/verify-token` - Verify JWT token
- `POST /api/auth/logout` - User logout

### Orders
- `POST /api/orders/analyze` - Analyze order for fraud
- `GET /api/orders` - List user's orders
- `GET /api/orders/:id` - Get order details
- `PUT /api/orders/:id` - Update order status

### API Keys
- `POST /api/api-keys` - Create new API key
- `GET /api/api-keys` - List API keys
- `DELETE /api/api-keys/:id` - Delete API key
- `PUT /api/api-keys/:id/rotate` - Rotate API key

### Analytics
- `GET /api/analytics/dashboard` - Dashboard statistics
- `GET /api/analytics/risk-distribution` - Risk score distribution
- `GET /api/analytics/fraud-triggers` - Top fraud triggers
- `GET /api/analytics/trends` - Historical trends

### Admin
- `GET /api/admin/users` - List all users
- `POST /api/admin/users/:id/block` - Block user account
- `GET /api/admin/stats` - System statistics
- `GET /api/admin/audit-logs` - Audit trail

## Using the REST API

### Example: Analyze an Order

```bash
curl -X POST http://localhost:3000/api/orders/analyze \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "orderAmount": 1500,
    "customerEmail": "john@example.com",
    "shippingAddress": "123 Main St, New York, NY",
    "billingAddress": "123 Main St, New York, NY",
    "customerCountry": "US",
    "deviceId": "device_12345"
  }'
```

## Fraud Detection Rules

The fraud detection engine evaluates 7 key rules:

1. **Amount Check** (0-30 points) - Flags unusually high amounts
2. **Address Mismatch** (0-20 points) - Compares billing and shipping addresses
3. **High-Risk Country** (0-25 points) - Identifies high-risk geographic regions
4. **Velocity Check** (0-15 points) - Detects multiple orders in short timeframe
5. **Blacklist Match** (0-30 points) - Checks against fraud blacklist
6. **Device Fingerprinting** (0-20 points) - Analyzes device history
7. **Email Domain Check** (0-10 points) - Validates email domain

### Risk Levels
- **Safe** (0-30): Approve automatically
- **Risky** (31-60): Review before processing
- **Fraud** (61-100): Block or request verification

## Shopify Integration

Navigate to Integrations page and click "Connect Shopify". FraudShield will:
1. Handle OAuth authentication
2. Automatically register webhooks
3. Analyze orders in real-time
4. Flag suspicious orders for review

## WooCommerce Integration

1. Upload `fraudshield-woocommerce.php` to WordPress plugins
2. Activate the plugin
3. Configure API key in WooCommerce settings
4. Orders will be analyzed automatically at checkout

## Deployment

### Deploy to Vercel

```bash
# Frontend
vercel

# Backend (if using Vercel Functions)
cd server && vercel --prod
```

### Environment Variables

Add all variables from `.env.example` in your hosting dashboard.

## Support

For issues or questions:
- GitHub: https://github.com/asadsheblu/trusty-orders/issues
- Email: support@fraudshield.io

---

Built with ❤️ by FraudShield Team
