# FraudShield Integration - সম্পূর্ণ গাইড

## Dashboard এ কীভাবে একশেস করবেন?

### ধাপ ১: ড্যাশবোর্ডে লগইন

```
URL: http://localhost:8085
ইমেইল: test@example.com
পাসওয়ার্ড: password123
```

### ধাপ ২: বাম সাইডবারে "Integrations" ক্লিক করুন

```
বাম মেনুতে দেখবেন:
✓ Dashboard
✓ Orders  
✓ API Keys
✓ Integrations  ← এখানে ক্লিক করুন
✓ Billing
✓ Settings
```

---

## তিনটি Integration অপশন

### 1️⃣ Shopify Integration

**কি হবে?**
- আপনার Shopify স্টোরের সব অর্ডার স্বয়ংক্রিয়ভাবে চেক হবে
- জালিয়াতি ধরা পড়ায় আপনি alert পাবেন
- Dashboard এ সব অর্ডারের fraud score দেখবেন

**কীভাবে করবেন?**

```
Step 1: Integrations পেজ খুলুন
Step 2: Shopify কার্ডে "Connect Shopify" বাটন ক্লিক করুন
Step 3: Shopify লগইন পেজে পাঠানো হবে
Step 4: আপনার Shopify Store select করুন
Step 5: Permission দিন
Step 6: সম্পন্ন! সব কাজ হয়ে গেছে
```

**Shopify এ কি ঘটবে?**
- প্রতিটি নতুন অর্ডার FraudShield এ যাবে
- কয়েক সেকেন্ডে fraud score পাবেন
- নিরাপদ অর্ডার: ✅ (সবুজ)
- ঝুঁকিপূর্ণ অর্ডার: ⚠️ (হলুদ)  
- জালিয়াতির অর্ডার: ❌ (লাল)

---

### 2️⃣ WordPress/WooCommerce Integration

**কি হবে?**
- আপনার WordPress সাইটে একটি plugin ইনস্টল হবে
- প্রতিটি অর্ডার চেকআউটের সময় চেক হবে
- সন্দেহজনক অর্ডার ব্লক হয়ে যাবে

**কীভাবে করবেন?**

```
Step 1: Integrations পেজ খুলুন
Step 2: WooCommerce কার্ডে "Setup WooCommerce" ক্লিক করুন
Step 3: একটি popup মেসেজ আসবে plugin info সহ
Step 4: fraudshield-woocommerce.php ডাউনলোড করুন
Step 5: WordPress Admin এ যান
Step 6: Plugins → Upload Plugin
Step 7: fraudshield-woocommerce.php আপলোড করুন
Step 8: "Activate" বাটন ক্লিক করুন
Step 9: WooCommerce Settings এ যান
Step 10: FraudShield section খুঁজুন
Step 11: API Key paste করুন (API Keys পেজ থেকে)
Step 12: সেভ করুন এবং সম্পন্ন!
```

**WordPress এ কি ঘটবে?**
- চেকআউট পেজে স্বয়ংক্রিয় fraud চেক
- সন্দেহজনক কাস্টমারদের জন্য extra verification
- WordPress admin এ fraud stats দেখতে পারবেন

---

### 3️⃣ REST API Integration (নিজস্ব সাইটের জন্য)

**কি হবে?**
- আপনি নিজের সাইটের code থেকে FraudShield API কল করবেন
- প্রতিটি অর্ডারের fraud score পাবেন
- আপনি নিজের মতো handle করতে পারবেন

**API Key কিভাবে পাবেন?**

```
Step 1: Dashboard এ যান
Step 2: বাম মেনুতে "API Keys" ক্লিক করুন
Step 3: "Create New Key" বাটন ক্লিক করুন
Step 4: নাম দিন (যেমন: "My Website")
Step 5: "Create" ক্লিক করুন
Step 6: Key copy করুন (পরে দেখা যাবে না!)
```

**কীভাবে API ব্যবহার করবেন?**

**JavaScript এ:**
```javascript
const apiKey = "your_api_key_here";

const orderData = {
  orderAmount: 5000,
  customerEmail: "buyer@example.com",
  shippingAddress: "Dhaka, Bangladesh",
  billingAddress: "Dhaka, Bangladesh",
  customerCountry: "BD",
  deviceId: "device_12345"
};

fetch("http://localhost:3001/api/orders/analyze", {
  method: "POST",
  headers: {
    "Authorization": `Bearer ${apiKey}`,
    "Content-Type": "application/json"
  },
  body: JSON.stringify(orderData)
})
.then(res => res.json())
.then(data => {
  console.log("Fraud Score:", data.riskScore);
  console.log("Risk Level:", data.riskLevel);
  console.log("Recommendation:", data.recommendation);
  
  if (data.riskLevel === "fraud") {
    // অর্ডার ব্লক করুন
    alert("সন্দেহজনক অর্ডার! অনুগ্রহ করে যাচাই করুন।");
  }
});
```

**PHP এ:**
```php
<?php
$apiKey = "your_api_key_here";

$orderData = [
    "orderAmount" => 5000,
    "customerEmail" => "buyer@example.com",
    "shippingAddress" => "Dhaka, Bangladesh",
    "billingAddress" => "Dhaka, Bangladesh",
    "customerCountry" => "BD",
    "deviceId" => "device_12345"
];

$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, "http://localhost:3001/api/orders/analyze");
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($orderData));
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    "Authorization: Bearer " . $apiKey,
    "Content-Type: application/json"
]);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);

$response = json_decode(curl_exec($ch), true);
curl_close($ch);

echo "Fraud Score: " . $response['riskScore'];
echo "Risk Level: " . $response['riskLevel'];
echo "Recommendation: " . $response['recommendation'];

if ($response['riskLevel'] === 'fraud') {
    // অর্ডার ব্লক করুন
    die("সন্দেহজনক অর্ডার! অনুগ্রহ করে যাচাই করুন।");
}
?>
```

**Python এ:**
```python
import requests
import json

api_key = "your_api_key_here"

order_data = {
    "orderAmount": 5000,
    "customerEmail": "buyer@example.com",
    "shippingAddress": "Dhaka, Bangladesh",
    "billingAddress": "Dhaka, Bangladesh",
    "customerCountry": "BD",
    "deviceId": "device_12345"
}

headers = {
    "Authorization": f"Bearer {api_key}",
    "Content-Type": "application/json"
}

response = requests.post(
    "http://localhost:3001/api/orders/analyze",
    json=order_data,
    headers=headers
)

result = response.json()

print(f"Fraud Score: {result['riskScore']}")
print(f"Risk Level: {result['riskLevel']}")
print(f"Recommendation: {result['recommendation']}")

if result['riskLevel'] == 'fraud':
    print("সন্দেহজনক অর্ডার! অনুগ্রহ করে যাচাই করুন।")
```

---

## API Response কিভাবে পড়বেন?

```json
{
  "riskScore": 45,
  "riskLevel": "risky",
  "triggers": [
    "HIGH_AMOUNT",
    "ADDRESS_MISMATCH"
  ],
  "recommendation": "REVIEW",
  "fraudReason": "Order amount is 5x higher than average and address mismatch detected"
}
```

**এর মানে কি?**

- **riskScore (০-১००)**: জালিয়াতির সম্ভাবনা
  - ০-३०: নিরাপদ
  - ३१-६०: ঝুঁকিপূর্ণ
  - ६१-१००: জালিয়াতি

- **riskLevel**: তিনটি লেভেল
  - `safe` - স্বয়ংক্রিয় অনুমোদন
  - `risky` - ম্যানুয়াল রিভিউ করুন
  - `fraud` - তাৎক্ষণিক ব্লক করুন

- **triggers**: কোন নিয়ম match হয়েছে
- **recommendation**: কি করবেন
- **fraudReason**: কেন suspect?

---

## সমস্যা সমাধান

### Shopify Connect কাজ করছে না?

```
✓ আপনি admin হন কিনা চেক করুন
✓ Shopify app permission দিয়েছেন কিনা
✓ ব্রাউজার cache clear করুন
✓ নতুন tab এ চেষ্টা করুন
```

### WordPress Plugin activate হচ্ছে না?

```
✓ PHP version 7.4+ আছে কিনা চেক করুন
✓ Plugin ফোল্ডারে upload হয়েছে কিনা দেখুন
✓ Write permission আছে কিনা চেক করুন
✓ WordPress version updated আছে কিনা দেখুন
```

### API Key কাজ করছে না?

```
✓ API Key copy করেছেন ঠিকমতো?
✓ Bearer এর আগে space আছে?
✓ API Key inactive করে নি?
✓ Backend server চলছে কিনা চেক করুন
```

---

## সাধারণ প্রশ্ন (FAQ)

**Q: Integrations কিভাবে disable করব?**
```
A: Dashboard → Settings → Integrations section এ যান
   সংশ্লিষ্ট integration এর পাশে disconnect বাটন ক্লিক করুন
```

**Q: ডেটা সেফ কিনা?**
```
A: হ্যাঁ, সব ডেটা encrypted থাকে
   আমরা কোনো পেমেন্ট info store করি না
   শুধু order details এবং fraud analysis রাখি
```

**Q: API rate limit কত?**
```
A: Free plan: ১০০০ requests/day
   Pro plan: ১০,০০০ requests/day
   Enterprise: Unlimited
```

**Q: কত দ্রুত fraud detect হয়?**
```
A: সাধারণত ১-২ সেকেন্ড
   Max ৫ সেকেন্ড
```

---

এখন আপনি সম্পূর্ণভাবে FraudShield integrate করতে পারবেন! 🎉
