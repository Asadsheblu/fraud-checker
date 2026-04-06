# FraudShield - সম্পূর্ণ ব্যবহারকারী গাইড

## দ্রুত শুরু (৫ মিনিট)

### Step 1: সিস্টেম চালু করুন

#### ফ্রন্টেন্ড চালু করুন
```bash
# প্রজেক্ট ফোল্ডারে যান
cd /vercel/share/v0-project

# ডিপেন্ডেন্সি ইনস্টল করুন (প্রথম বার)
npm install

# ডেভেলপমেন্ট সার্ভার শুরু করুন
npm run dev

# আউটপুট দেখবেন:
# ➜  Local:   http://localhost:8085/
# পোর্ট বদলে যেতে পারে, কিন্তু কাজ করবে
```

#### ব্যাকএন্ড চালু করুন (নতুন টার্মিনাল)
```bash
# ব্যাকএন্ড ফোল্ডারে যান
cd /vercel/share/v0-project/server

# ডিপেন্ডেন্সি ইনস্টল করুন (প্রথম বার)
npm install

# ডেভেলপমেন্ট সার্ভার শুরু করুন
npm run dev

# আউটপুট দেখবেন:
# Server running on http://localhost:3001
# এখন API ready আছে!
```

### Step 2: লগইন করুন

ব্রাউজারে যান: `http://localhost:8085/` (অথবা প্রদর্শিত পোর্ট)

```
ইমেইল: test@example.com
পাসওয়ার্ড: password123

অথবা Sign Up ক্লিক করে নতুন অ্যাকাউন্ট তৈরি করুন
```

### Step 3: প্রথম API Key তৈরি করুন

```
ড্যাশবোর্ড → বাম দিকের মেনু → "API Keys"
"Create New Key" ক্লিক করুন
নাম দিন: "Test Key"
Copy করুন এবং সেভ করুন (খুবই গুরুত্বপূর্ণ!)
```

---

## আর্কিটেকচার (কিভাবে কাজ করে)

### সিস্টেম ডায়াগ্রাম

```
┌─────────────────────────────────────────────────────────────────┐
│                     ব্যবহারকারীর ব্রাউজার                          │
│                                                                     │
│         React App (http://localhost:8085)                         │
│  ┌────────────────────────────────────────────────────────┐       │
│  │ • Dashboard (ড্যাশবোর্ড)                              │       │
│  │ • Orders (অর্ডার লিস্ট)                              │       │
│  │ • API Keys (API কী ম্যানেজমেন্ট)                     │       │
│  │ • Admin Panel (এডমিন প্যানেল)                        │       │
│  │ • Settings (সেটিংস)                                   │       │
│  └────────────────────────────────────────────────────────┘       │
└────────────────┬──────────────────────────────────────────────────┘
                 │ HTTP Request
                 │ (API Key + Data)
                 ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Backend Server                                   │
│            (http://localhost:3001)                              │
│                                                                     │
│  ┌───────────────────────────────────────────────────────┐       │
│  │ Express.js Server                                   │       │
│  │                                                           │       │
│  │ Routes:                                               │       │
│  │ • POST /api/orders/analyze     → জালিয়াতি চেক      │       │
│  │ • POST /api/auth/login         → লগইন               │       │
│  │ • GET /api/api-keys            → API Keys            │       │
│  │ • POST /api/integrations/shopify → Shopify connect  │       │
│  │ • Webhook handlers             → ইভেন্ট পাবেন      │       │
│  └───────────────────────────────────────────────────────┘       │
└────────────────┬──────────────────────────────────────────────────┘
                 │ Database Query
                 │ (Encrypted)
                 ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Supabase Database                                │
│                    (PostgreSQL)                                     │
│                                                                     │
│  Tables:                                                            │
│  • users (ব্যবহারকারী)                                          │
│  • orders (অর্ডার)                                              │
│  • api_keys (API কী)                                            │
│  • fraud_rules (জালিয়াতির নিয়ম)                             │
│  • audit_logs (সব কার্যকলাপ রেকর্ড)                          │
│  • And more...                                                      │
│                                                                     │
│  All data encrypted & backed up ✓                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## API Reference (প্রোগ্রামারদের জন্য)

### 1. Order Analyze করুন

```bash
curl -X POST http://localhost:3001/api/orders/analyze \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "orderAmount": 5000,
    "customerEmail": "customer@example.com",
    "customerName": "রহিম আহমেদ",
    "shippingAddress": "Dhaka, Bangladesh",
    "billingAddress": "Dhaka, Bangladesh",
    "customerCountry": "BD",
    "customerPhone": "+8801700000000",
    "deviceId": "device_12345",
    "orderId": "ORD-001"
  }'
```

**Response:**
```json
{
  "orderId": "ORD-001",
  "riskScore": 25,
  "riskLevel": "safe",
  "triggers": [],
  "recommendation": "APPROVE",
  "confidence": 0.98,
  "timestamp": "2026-04-06T07:35:00Z"
}
```

---

### 2. API Key ব্যবহার করুন

সব API request এ header যোগ করুন:
```
Authorization: Bearer sk_live_your_api_key_here
```

---

### 3. অর্ডার তথ্য পান

```bash
curl -X GET http://localhost:3001/api/orders \
  -H "Authorization: Bearer YOUR_API_KEY"

# Response: সব অর্ডারের লিস্ট
```

---

### 4. Webhook সেট আপ করুন

```bash
curl -X POST http://localhost:3001/api/webhooks \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://yoursite.com/webhook",
    "events": ["order.fraud_detected", "order.analyzed"],
    "active": true
  }'
```

**আপনার সার্ভারে পাবেন:**
```json
{
  "event": "order.fraud_detected",
  "orderId": "ORD-001",
  "riskScore": 95,
  "riskLevel": "fraud",
  "timestamp": "2026-04-06T07:35:00Z"
}
```

---

## Integration গাইড

### Shopify এর সাথে (সহজ)

```
Dashboard → Integrations → "Connect Shopify"
↓
Shopify Authorization Window খুলবে
↓
"Install App" ক্লিক করুন
↓
FraudShield সব সেটআপ করবে স্বয়ংক্রিয়ভাবে:
  ✓ Webhook রেজিস্টার
  ✓ Order Processing On
  ✓ Fraud Alerts চালু

এখন প্রতিটি নতুন অর্ডার স্বয়ংক্রিয়ভাবে চেক হবে!
```

**Shopify Dashboard এ দেখবেন:**
```
Orders → প্রতিটি অর্ডারে Fraud Risk Badge
  🟢 Safe (Green)
  🟡 Risky (Yellow)
  🔴 Fraud (Red)

Order Details এ FraudShield Analysis দেখবেন
```

---

### WordPress (WooCommerce) - প্লাগইন দিয়ে

#### ইনস্টলেশন

```
1. WordPress Admin Dashboard তে লগইন করুন

2. Plugins → Upload Plugin

3. fraudshield-woocommerce.php ফাইল আপলোড করুন

4. "Activate" বাটন ক্লিক করুন

5. FraudShield Settings খুলবে

6. API Key পেস্ট করুন (FraudShield থেকে পেয়েছেন)

7. সেভ করুন

8. শেষ!
```

#### কি হবে?

- প্রতিটি checkout এ fraud চেক হবে
- high-risk অর্ডার অটোমেটিক ব্লক হবে
- ইমেইল alert পাবেন
- Dashboard এ রিপোর্ট দেখবেন

---

### নিজের ওয়েবসাইটে Integration

#### NodeJS/Express এ

```javascript
// fraudshield-client.js
const axios = require('axios');

class FraudShield {
  constructor(apiKey) {
    this.apiKey = apiKey;
    this.baseURL = 'http://localhost:3001/api';
  }

  async analyzeOrder(orderData) {
    try {
      const response = await axios.post(
        `${this.baseURL}/orders/analyze`,
        orderData,
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json'
          }
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error analyzing order:', error);
      throw error;
    }
  }
}

module.exports = FraudShield;
```

#### ব্যবহার করুন

```javascript
const FraudShield = require('./fraudshield-client');
const fraudShield = new FraudShield('sk_live_your_key');

// checkout endpoint এ
app.post('/checkout', async (req, res) => {
  const { orderData } = req.body;
  
  // Fraud check
  const fraudAnalysis = await fraudShield.analyzeOrder({
    orderAmount: orderData.total,
    customerEmail: orderData.email,
    customerName: orderData.name,
    shippingAddress: orderData.shippingAddress,
    billingAddress: orderData.billingAddress,
    customerCountry: orderData.country,
    deviceId: orderData.deviceId
  });

  // রেজাল্ট দেখুন
  if (fraudAnalysis.riskLevel === 'fraud') {
    return res.status(400).json({
      error: 'Order blocked due to fraud detection',
      score: fraudAnalysis.riskScore
    });
  }

  // Process order
  // ... payment processing ...
  
  res.json({ success: true, orderId: fraudAnalysis.orderId });
});
```

---

## ট্রাবলশুটিং

### সমস্যা: ব্যাকএন্ড চালু হচ্ছে না

```bash
# ডিপেন্ডেন্সি ইনস্টল করুন
cd server
npm install

# Port ব্যস্ত আছে?
lsof -i :3001
# Kill করুন:
kill -9 <PID>

# আবার চালু করুন
npm run dev
```

---

### সমস্যা: API কল fail হচ্ছে

```javascript
// কারণ চেক করুন:

1. API Key ভুল?
   → Dashboard এ Regenerate করুন

2. Headers ভুল?
   → Authorization header আছে কি?

3. Request format ভুল?
   → API reference দেখুন

4. Server বন্ধ?
   → npm run dev চালান

// Debug করুন:
curl -v -X GET http://localhost:3001/health
// 'status: ok' পাওয়া উচিত
```

---

### সমস্যা: Database connection fail

```bash
# Supabase credentials চেক করুন
cat .env.development.local

# আছে কি:
# VITE_SUPABASE_URL=...
# VITE_SUPABASE_ANON_KEY=...

# Supabase website এ সঠিক credentials আছে কি দেখুন
```

---

## নিরাপত্তা বেস্ট প্র্যাকটিস

### API Key সুরক্ষা

```
❌ করবেন না:
• GitHub এ commit করবেন না
• Client-side JavaScript এ দেখাবেন না
• Email এ পাঠাবেন না
• Log file এ রাখবেন না

✅ করুন:
• Server-side এ সংরক্ষণ করুন
• Environment variables ব্যবহার করুন
• Regular rotate করুন
• Monitoring চালু করুন
```

### Request Validation

```javascript
// Always validate user input
const schema = zod.object({
  orderAmount: zod.number().positive(),
  customerEmail: zod.string().email(),
  customerCountry: zod.string().length(2),
  // ... more validations
});

const validatedData = schema.parse(req.body);
```

---

## পারফরম্যান্স টিপস

### Caching ব্যবহার করুন

```javascript
// Redis caching
const riskScore = await cache.get(`order_${orderId}`);
if (!riskScore) {
  riskScore = await analyzeOrder(orderData);
  await cache.set(`order_${orderId}`, riskScore, 3600); // 1 hour
}
```

### Batch Processing

```javascript
// একসাথে অনেক অর্ডার চেক করুন
const orders = [order1, order2, order3];
const results = await Promise.all(
  orders.map(o => fraudShield.analyzeOrder(o))
);
```

---

## মনিটরিং ও ডেবাগিং

### সার্ভার লগ দেখুন

```bash
# সব লগ দেখুন
npm run dev 2>&1 | tee debug.log

# নির্দিষ্ট লাইন খুঁজুন
grep -i "error" debug.log
grep -i "fraud" debug.log
```

### Database Query Debug

```javascript
// Supabase SDK debug mode চালু করুন
const supabase = createClient(url, key, {
  auth: { debug: true }
});
```

---

## আরও সাহায্য দরকার?

| সমস্যা | সমাধান |
|--------|--------|
| Setup এ সমস্যা | [SETUP.md](./SETUP.md) দেখুন |
| API reference | [API.md](./API.md) দেখুন |
| Deploy করতে চান | [DEPLOYMENT.md](./DEPLOYMENT.md) দেখুন |
| বাংলায় পড়তে চান | [BANGLA_GUIDE.md](./BANGLA_GUIDE.md) দেখুন |
| কোড বোঝেন না | [PROJECT_SUMMARY.md](./PROJECT_SUMMARY.md) পড়ুন |

---

**এখন প্রস্তুত! শুরু করতে `npm run dev` করুন এবং `http://localhost:8085` খুলুন।**
