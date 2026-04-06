# 📚 FraudShield ডকুমেন্টেশন (বাংলা সংস্করণ)

## সব ডকুমেন্টেশনের তালিকা

### 🚀 শুরু করার জন্য

| ফাইল | উদ্দেশ্য | পড়ার সময় |
|------|---------|-----------|
| **README_BANGLA.md** | সম্পূর্ণ প্রজেক্ট সারসংক্ষেপ বাংলায় | ১০ মিনিট |
| **BANGLA_GUIDE.md** | বিস্তারিত ব্যবহার গাইড | ২০ মিনিট |
| **QUICKSTART.md** | দ্রুত শুরু (৫ মিনিট) | ৫ মিনিট |
| **START_HERE.md** | সব কিছুর ভূমিকা | ১৫ মিনিট |

### 📖 বিস্তারিত গাইড

| ফাইল | উদ্দেশ্য | পড়ার সময় |
|------|---------|-----------|
| **USER_GUIDE.md** | ব্যবহারকারী পূর্ণ টিউটোরিয়াল | ৩০ মিনিট |
| **README.md** | ইংরেজি সম্পূর্ণ রেফারেন্স | ২৫ মিনিট |
| **API.md** | API এন্ডপয়েন্ট ডকুমেন্টেশন | ৪৫ মিনিট |

### ⚙️ প্রযুক্তিগত ডকুমেন্টেশন

| ফাইল | উদ্দেশ্য | পড়ার সময় |
|------|---------|-----------|
| **SETUP.md** | বিস্তারিত সেটআপ নির্দেশনা | ৩০ মিনিট |
| **DEPLOYMENT.md** | প্রোডাকশন ডিপ্লয়মেন্ট | ৪০ মিনিট |
| **PROJECT_SUMMARY.md** | আর্কিটেকচার ও কোড সারসংক্ষেপ | ৩৫ মিনিট |

### 📋 অন্যান্য

| ফাইল | উদ্দেশ্য | পড়ার সময় |
|------|---------|-----------|
| **COMPLETION_REPORT.md** | প্রজেক্ট সম্পূর্ণতার রিপোর্ট | ২০ মিনিট |
| **DOCS_INDEX.md** | ইংরেজি ডকুমেন্টেশন ইন্ডেক্স | ১০ মিনিট |

---

## 🎯 আপনার লক্ষ্য অনুযায়ী কি পড়বেন?

### আমি জানতে চাই: "এটা কি ও কিভাবে কাজ করে?"
```
পড়ুন: README_BANGLA.md → BANGLA_GUIDE.md
সময়: ৩০ মিনিট
```

### আমি চাই: "দ্রুত শুরু করতে"
```
পড়ুন: QUICKSTART.md → USER_GUIDE.md
সময়: ২০ মিনিট
```

### আমি ডেভেলপার: "API ব্যবহার করতে চাই"
```
পড়ুন: API.md → USER_GUIDE.md (Integration গাইড)
সময়: ৫০ মিনিট
```

### আমি চাই: "লাইভ করতে / Deployed করতে"
```
পড়ুন: SETUP.md → DEPLOYMENT.md
সময়: ৬০ মিনিট
```

### আমি চাই: "সবকিছু বুঝতে (প্রযুক্তিগত)"
```
পড়ুন: PROJECT_SUMMARY.md → COMPLETION_REPORT.md
সময়: ৫০ মিনিট
```

### আমি Shopify ব্যবহার করি
```
পড়ুন: BANGLA_GUIDE.md (Shopify Integration) → API.md
সময়: ২৫ মিনিট
```

### আমি WordPress/WooCommerce ব্যবহার করি
```
পড়ুন: BANGLA_GUIDE.md (WordPress Plugin) → USER_GUIDE.md
সময়: ২০ মিনিট
```

---

## 📱 দ্রুত রেফারেন্স

### সিস্টেম চালু করুন
```bash
# ফ্রন্টেন্ড
npm run dev

# ব্যাকএন্ড (নতুন টার্মিনাল)
cd server && npm run dev
```

### লগইন করুন
```
http://localhost:8085
ইমেইল: test@example.com
পাসওয়ার্ড: password123
```

### API Key পান
```
Dashboard → API Keys → Create New Key
```

### Order Analyze করুন
```bash
curl -X POST http://localhost:3001/api/orders/analyze \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{ ... order data ... }'
```

---

## 🔍 শব্দ অনুসন্ধান

### আমি খুঁজছি...

**"API Key"** সম্পর্কে?
→ USER_GUIDE.md → API Reference
→ API.md → Authentication

**"Shopify Connect"** কিভাবে?
→ BANGLA_GUIDE.md → Shopify Integration
→ USER_GUIDE.md → Integration Guide

**"Fraud Detection"** কিভাবে কাজ করে?
→ BANGLA_GUIDE.md → ৭টি নিয়ম
→ README_BANGLA.md → Fraud Detection Engine

**"Admin Panel"** দিয়ে কি করব?
→ BANGLA_GUIDE.md → Admin Features
→ USER_GUIDE.md → Admin Panel Section

**"Database"** কোথায় আছে?
→ SETUP.md → Supabase Configuration
→ PROJECT_SUMMARY.md → Architecture

**"ট্রাবলশুটিং"** করতে?
→ USER_GUIDE.md → Troubleshooting
→ SETUP.md → Common Issues

---

## 🎓 শেখার ক্রম (Beginner থেকে Advanced)

### শুরু করুন (প্রথম দিন)
```
1. README_BANGLA.md পড়ুন (10 মিনিট)
2. QUICKSTART.md অনুসরণ করুন (5 মিনিট)
3. লগইন করুন এবং ড্যাশবোর্ড দেখুন (10 মিনিট)
```

### দ্বিতীয় দিন
```
1. BANGLA_GUIDE.md সম্পূর্ণ পড়ুন (20 মিনিট)
2. API Key তৈরি করুন (5 মিনিট)
3. USER_GUIDE.md Integration Section (15 মিনিট)
```

### তৃতীয় দিন
```
1. SETUP.md পড়ুন (30 মিনিট)
2. নিজের API ইন্টিগ্রেট করুন
3. API.md রেফারেন্স দেখুন (প্রয়োজন অনুযায়ী)
```

### চতুর্থ দিন
```
1. DEPLOYMENT.md পড়ুন (40 মিনিট)
2. Production এ ডিপ্লয় করুন
3. Monitoring সেটআপ করুন
```

### পঞ্চম দিন (Advanced)
```
1. PROJECT_SUMMARY.md পড়ুন (35 মিনিট)
2. কোড Review করুন
3. কাস্টমাইজেশন করুন
```

---

## 📞 সাহায্য পেতে

### আমি বুঝতে পারছি না...

**"Fraud Scoring"** কিভাবে কাজ করে?
→ কমেন্ট: BANGLA_GUIDE.md ৭টি নিয়ম সেকশনে

**"API কল"** কিভাবে করতে হয়?
→ কমেন্ট: USER_GUIDE.md Integration Guide

**"একটি ফিচার"** কিভাবে ব্যবহার করব?
→ কমেন্ট: সেই ফিচারের পাশে লেখা ডকুমেন্টেশন

**"Error"** পাচ্ছি?
→ দেখুন: USER_GUIDE.md → Troubleshooting

---

## 🔗 দ্রুত লিঙ্ক

### প্রধান ডকুমেন্ট
- [README_BANGLA.md](./README_BANGLA.md) - প্রজেক্ট সারসংক্ষেপ
- [BANGLA_GUIDE.md](./BANGLA_GUIDE.md) - বিস্তারিত গাইড
- [USER_GUIDE.md](./USER_GUIDE.md) - টিউটোরিয়াল

### প্রযুক্তিগত
- [API.md](./API.md) - API রেফারেন্স
- [SETUP.md](./SETUP.md) - সেটআপ গাইড
- [DEPLOYMENT.md](./DEPLOYMENT.md) - ডিপ্লয়মেন্ট

### রেফারেন্স
- [PROJECT_SUMMARY.md](./PROJECT_SUMMARY.md) - আর্কিটেকচার
- [COMPLETION_REPORT.md](./COMPLETION_REPORT.md) - সম্পূর্ণতা রিপোর্ট

---

## 🎉 প্রস্তুত?

```
এখনই শুরু করুন:

১. README_BANGLA.md খুলুন
২. "শুরু করুন" সেকশন অনুসরণ করুন
३. npm run dev চালান
४. http://localhost:8085 খুলুন

লেখক: FraudShield Team
আপডেট: এপ্রিল ২০২৬
```

---

**সব ডকুমেন্টেশন বাংলায় এবং ইংরেজিতে উপলব্ধ! 📚**
