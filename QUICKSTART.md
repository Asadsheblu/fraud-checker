# FraudShield - Quick Start Guide

Get up and running in 5 minutes.

## Prerequisites
- Node.js 18+ installed
- Supabase account (https://supabase.com - free tier works!)
- Git

## 1. Clone & Install (2 minutes)

```bash
git clone https://github.com/asadsheblu/trusty-orders.git
cd trusty-orders

# Frontend
npm install

# Backend
cd server && npm install && cd ..
```

## 2. Setup Environment (2 minutes)

### Get Supabase Keys
1. Go to https://app.supabase.com
2. Create new project
3. Go to Settings > API
4. Copy **Project URL** and **anon key**

### Create `.env.development.local`
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGc...
VITE_API_URL=http://localhost:3000
```

### Create `server/.env`
```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=eyJhbGc...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...
JWT_SECRET=your_secret_min_32_chars_1234567890
RESEND_API_KEY=re_test_key_for_testing
SENDER_EMAIL=noreply@fraudshield.io
PORT=3000
NODE_ENV=development
CORS_ORIGIN=http://localhost:5173
```

Get **Service Role Key** from Settings > API in Supabase dashboard.

## 3. Run Migrations (1 minute)

```bash
# Install Supabase CLI
npm install -g @supabase/cli

# Link to your project
supabase link --project-ref your-project-id

# Run migrations
supabase db push
```

Or if CLI has issues, manually run SQL files:
1. Go to Supabase > SQL Editor
2. Create new query
3. Copy content from `supabase/migrations/*.sql`
4. Run each file

## 4. Start Development (0 minutes)

**Terminal 1 - Frontend:**
```bash
npm run dev
```
Opens on `http://localhost:5173`

**Terminal 2 - Backend:**
```bash
cd server
npm run dev
```
Runs on `http://localhost:3000`

## 5. Login & Explore

1. Click "Sign Up"
2. Create account with email: `test@example.com`
3. Verify email (check console or use Resend test mode)
4. Login
5. View dashboard with real-time data

## Common Paths

| Path | Purpose |
|------|---------|
| `/` | Home page |
| `/login` | Login/signup |
| `/dashboard` | Main dashboard |
| `/orders` | Orders list |
| `/api-keys` | API key management |
| `/integrations` | Shopify/WooCommerce |
| `/admin` | Admin panel (admin only) |

## Testing the Fraud Detection

### Via Dashboard
1. Go to Orders
2. Click "Test Order"
3. Fill in order details
4. View fraud score

### Via API
```bash
curl -X POST http://localhost:3000/api/orders/analyze \
  -H "Authorization: Bearer test_key" \
  -H "Content-Type: application/json" \
  -d '{
    "orderId": "TEST-001",
    "orderAmount": 5000,
    "customerEmail": "test@example.com",
    "customerCountry": "US"
  }'
```

## File Structure Overview

```
trusty-orders/
├── src/                 # React frontend
├── server/              # Express backend
├── wordpress-plugin/    # WooCommerce plugin
├── supabase/            # Database
├── API.md               # API docs
├── SETUP.md             # Detailed setup
└── README.md            # Full docs
```

## Troubleshooting

### Port in Use
```bash
# Kill process on port 5173 or 3000
lsof -i :5173
kill -9 <PID>
```

### CORS Error
- Check `CORS_ORIGIN` in `server/.env`
- Should be `http://localhost:5173`

### Email Not Working
- Use Resend test key `re_test_...` for dev
- Check `SENDER_EMAIL` is correct

### Database Connection Error
- Verify `SUPABASE_URL` and keys are correct
- Check migrations ran: `supabase db push`

## Next Steps

1. **Explore the code**
   - `/src/pages` - React components
   - `/server/src/services` - Fraud detection engine
   - `/server/src/routes` - API endpoints

2. **Try integrations**
   - Create Shopify app (optional)
   - Test WooCommerce plugin

3. **Deploy**
   - See `DEPLOYMENT.md`

4. **Customize**
   - Modify fraud rules in `server/src/services/fraudDetection.ts`
   - Update email templates in `server/src/services/emailService.ts`
   - Add new API endpoints in `server/src/routes/`

## Documentation Files

- **README.md** - Complete overview
- **API.md** - API reference (30+ endpoints)
- **SETUP.md** - Detailed setup guide
- **DEPLOYMENT.md** - Production deployment
- **PROJECT_SUMMARY.md** - Project architecture
- **QUICKSTART.md** - This file

## What's Built

✅ React frontend with Tailwind CSS  
✅ Express backend with fraud detection  
✅ Supabase database with RLS  
✅ Email notifications with Resend  
✅ Admin panel with user management  
✅ Shopify integration with OAuth  
✅ WooCommerce plugin (PHP)  
✅ 30+ API endpoints  
✅ Complete documentation  

## Support

- Issues: https://github.com/asadsheblu/trusty-orders/issues
- Docs: See markdown files in root
- Email: support@fraudshield.io

---

**That's it!** You now have FraudShield running locally. 🎉

Happy coding! 🚀
