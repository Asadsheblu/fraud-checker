# FraudShield API Documentation

Complete reference for all API endpoints and usage examples.

## Base URL

```
Development: http://localhost:3000
Production: https://api.fraudshield.io
```

## Authentication

All API requests require an API key in the Authorization header:

```bash
Authorization: Bearer YOUR_API_KEY
```

Get your API key from:
1. Dashboard > Settings > API Keys
2. Click "Generate New Key"
3. Copy the key (shown only once)

## Error Responses

All errors follow this format:

```json
{
  "error": "Error code",
  "message": "Human-readable error description",
  "details": {}
}
```

### HTTP Status Codes
- `200` - Success
- `400` - Bad request
- `401` - Unauthorized (missing/invalid API key)
- `403` - Forbidden (insufficient permissions)
- `404` - Not found
- `429` - Rate limit exceeded
- `500` - Server error

## Authentication Endpoints

### Login
```
POST /api/auth/login
```

**Request:**
```json
{
  "email": "user@example.com",
  "password": "securePassword123"
}
```

**Response:**
```json
{
  "user": {
    "id": "user_123",
    "email": "user@example.com",
    "company": "Acme Corp",
    "plan": "Pro"
  },
  "session": {
    "access_token": "eyJhbGciOiJIUzI1NiIs...",
    "refresh_token": "refresh_token_here",
    "expires_in": 3600
  }
}
```

### Sign Up
```
POST /api/auth/signup
```

**Request:**
```json
{
  "email": "newuser@example.com",
  "password": "securePassword123",
  "company": "New Company Inc"
}
```

**Response:**
```json
{
  "user": {
    "id": "user_456",
    "email": "newuser@example.com",
    "company": "New Company Inc",
    "plan": "Free"
  },
  "session": {
    "access_token": "eyJhbGciOiJIUzI1NiIs...",
    "refresh_token": "refresh_token_here",
    "expires_in": 3600
  }
}
```

### Verify Token
```
POST /api/auth/verify-token
```

**Request:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIs..."
}
```

**Response:**
```json
{
  "valid": true,
  "user": {
    "id": "user_123",
    "email": "user@example.com"
  }
}
```

## Orders Endpoints

### Analyze Order for Fraud
```
POST /api/orders/analyze
Content-Type: application/json
Authorization: Bearer YOUR_API_KEY
```

**Request:**
```json
{
  "orderId": "ORD-12345",
  "orderAmount": 1500.00,
  "orderCurrency": "USD",
  "customerEmail": "john@example.com",
  "customerPhone": "+1-555-123-4567",
  "customerCountry": "US",
  "shippingAddress": "123 Main St, New York, NY 10001",
  "billingAddress": "123 Main St, New York, NY 10001",
  "customerAge": 35,
  "isFirstTime": false,
  "deviceId": "device_abc123",
  "ipAddress": "192.168.1.1",
  "paymentMethod": "credit_card",
  "cardBrand": "visa"
}
```

**Response:**
```json
{
  "orderId": "ORD-12345",
  "riskScore": 25,
  "riskLevel": "safe",
  "recommendation": "APPROVE",
  "triggers": [
    {
      "rule": "amount_check",
      "score": 10,
      "description": "Order amount within normal range"
    },
    {
      "rule": "address_match",
      "score": 0,
      "description": "Billing and shipping addresses match"
    }
  ],
  "timestamp": "2024-04-06T13:15:30Z",
  "processingTime": "245ms"
}
```

### List Orders
```
GET /api/orders?limit=50&offset=0
Authorization: Bearer YOUR_API_KEY
```

**Response:**
```json
{
  "orders": [
    {
      "id": "order_123",
      "externalId": "ORD-12345",
      "amount": 1500.00,
      "riskScore": 25,
      "riskLevel": "safe",
      "status": "approved",
      "createdAt": "2024-04-06T13:15:30Z"
    }
  ],
  "total": 250,
  "limit": 50,
  "offset": 0
}
```

### Get Order Details
```
GET /api/orders/:id
Authorization: Bearer YOUR_API_KEY
```

**Response:**
```json
{
  "id": "order_123",
  "externalId": "ORD-12345",
  "amount": 1500.00,
  "currency": "USD",
  "customerEmail": "john@example.com",
  "riskScore": 25,
  "riskLevel": "safe",
  "triggers": [...],
  "status": "approved",
  "metadata": {},
  "createdAt": "2024-04-06T13:15:30Z",
  "updatedAt": "2024-04-06T13:15:30Z"
}
```

### Update Order Status
```
PUT /api/orders/:id/status
Authorization: Bearer YOUR_API_KEY
```

**Request:**
```json
{
  "status": "blocked",
  "reason": "Manual review - suspicious activity"
}
```

**Response:**
```json
{
  "id": "order_123",
  "status": "blocked",
  "updatedAt": "2024-04-06T13:20:00Z"
}
```

## API Keys Endpoints

### Create API Key
```
POST /api/api-keys
Authorization: Bearer YOUR_API_KEY
```

**Request:**
```json
{
  "name": "Shopify Integration",
  "rateLimit": 10000
}
```

**Response:**
```json
{
  "id": "key_abc123",
  "key": "fraudshield_pk_abc123def456...",
  "name": "Shopify Integration",
  "rateLimit": 10000,
  "createdAt": "2024-04-06T13:15:30Z"
}
```

⚠️ **Note**: The key is only shown once! Save it securely.

### List API Keys
```
GET /api/api-keys
Authorization: Bearer YOUR_API_KEY
```

**Response:**
```json
{
  "keys": [
    {
      "id": "key_abc123",
      "name": "Shopify Integration",
      "status": "active",
      "rateLimit": 10000,
      "lastUsed": "2024-04-06T13:15:30Z",
      "createdAt": "2024-04-06T12:00:00Z"
    }
  ]
}
```

### Rotate API Key
```
PUT /api/api-keys/:id/rotate
Authorization: Bearer YOUR_API_KEY
```

**Response:**
```json
{
  "id": "key_abc123",
  "key": "fraudshield_pk_xyz789uvw012...",
  "name": "Shopify Integration",
  "status": "active",
  "rotatedAt": "2024-04-06T13:20:00Z"
}
```

### Delete API Key
```
DELETE /api/api-keys/:id
Authorization: Bearer YOUR_API_KEY
```

**Response:**
```json
{
  "success": true,
  "message": "API key deleted"
}
```

## Analytics Endpoints

### Get Dashboard Stats
```
GET /api/analytics/dashboard?period=30d
Authorization: Bearer YOUR_API_KEY
```

**Response:**
```json
{
  "period": "30d",
  "totalOrders": 1250,
  "totalSalesAmount": 187500.00,
  "fraudDetections": 45,
  "fraudRate": 3.6,
  "avgRiskScore": 28.5,
  "ordersApproved": 1205,
  "ordersBlocked": 45,
  "topFraudTriggers": [
    {
      "trigger": "high_amount",
      "count": 18,
      "percentage": 40.0
    }
  ]
}
```

### Get Risk Distribution
```
GET /api/analytics/risk-distribution?period=30d
Authorization: Bearer YOUR_API_KEY
```

**Response:**
```json
{
  "safe": 1000,
  "risky": 200,
  "fraud": 50,
  "riskLevelPercentages": {
    "safe": 80.0,
    "risky": 16.0,
    "fraud": 4.0
  }
}
```

### Get Fraud Triggers
```
GET /api/analytics/fraud-triggers?limit=10
Authorization: Bearer YOUR_API_KEY
```

**Response:**
```json
{
  "triggers": [
    {
      "rule": "high_amount",
      "count": 18,
      "avgScore": 28,
      "percentage": 40.0
    },
    {
      "rule": "address_mismatch",
      "count": 12,
      "avgScore": 20,
      "percentage": 26.7
    }
  ]
}
```

### Get Trends
```
GET /api/analytics/trends?period=30d&granularity=day
Authorization: Bearer YOUR_API_KEY
```

**Response:**
```json
{
  "period": "30d",
  "granularity": "day",
  "trends": [
    {
      "date": "2024-03-07",
      "orders": 35,
      "fraudDetections": 1,
      "totalAmount": 5250.00,
      "avgRiskScore": 25.3
    }
  ]
}
```

## Webhooks Endpoints

### Create Webhook
```
POST /api/webhooks
Authorization: Bearer YOUR_API_KEY
```

**Request:**
```json
{
  "url": "https://your-app.com/webhooks/fraudshield",
  "events": [
    "order.analyzed",
    "fraud.detected",
    "order.blocked"
  ]
}
```

**Response:**
```json
{
  "id": "webhook_abc123",
  "url": "https://your-app.com/webhooks/fraudshield",
  "events": ["order.analyzed", "fraud.detected", "order.blocked"],
  "status": "active",
  "createdAt": "2024-04-06T13:15:30Z"
}
```

### List Webhooks
```
GET /api/webhooks
Authorization: Bearer YOUR_API_KEY
```

### Update Webhook
```
PUT /api/webhooks/:id
Authorization: Bearer YOUR_API_KEY
```

### Delete Webhook
```
DELETE /api/webhooks/:id
Authorization: Bearer YOUR_API_KEY
```

## Webhook Events

### order.analyzed
Sent when an order is analyzed:

```json
{
  "event": "order.analyzed",
  "timestamp": "2024-04-06T13:15:30Z",
  "data": {
    "orderId": "ORD-12345",
    "riskScore": 25,
    "riskLevel": "safe",
    "recommendation": "APPROVE"
  }
}
```

### fraud.detected
Sent when fraud is detected:

```json
{
  "event": "fraud.detected",
  "timestamp": "2024-04-06T13:15:30Z",
  "data": {
    "orderId": "ORD-12345",
    "riskScore": 85,
    "riskLevel": "fraud",
    "triggers": [...]
  }
}
```

## Rate Limits

- **Free Plan**: 100 requests/hour
- **Pro Plan**: 10,000 requests/hour
- **Enterprise**: Custom limits

Rate limit headers:
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1712427300
```

## Code Examples

### JavaScript/Node.js
```javascript
const apiKey = 'fraudshield_pk_...';

const response = await fetch('http://localhost:3000/api/orders/analyze', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${apiKey}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    orderId: 'ORD-12345',
    orderAmount: 1500,
    customerEmail: 'john@example.com',
    customerCountry: 'US'
  })
});

const result = await response.json();
console.log(`Risk Score: ${result.riskScore} (${result.riskLevel})`);
```

### cURL
```bash
curl -X POST http://localhost:3000/api/orders/analyze \
  -H "Authorization: Bearer fraudshield_pk_..." \
  -H "Content-Type: application/json" \
  -d '{
    "orderId": "ORD-12345",
    "orderAmount": 1500,
    "customerEmail": "john@example.com",
    "customerCountry": "US"
  }'
```

### Python
```python
import requests

headers = {
    'Authorization': 'Bearer fraudshield_pk_...',
    'Content-Type': 'application/json'
}

data = {
    'orderId': 'ORD-12345',
    'orderAmount': 1500,
    'customerEmail': 'john@example.com',
    'customerCountry': 'US'
}

response = requests.post(
    'http://localhost:3000/api/orders/analyze',
    headers=headers,
    json=data
)

result = response.json()
print(f"Risk Score: {result['riskScore']} ({result['riskLevel']})")
```

## Support

- Documentation: https://docs.fraudshield.io
- Status Page: https://status.fraudshield.io
- Support Email: support@fraudshield.io
