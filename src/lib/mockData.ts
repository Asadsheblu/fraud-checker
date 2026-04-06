export type RiskStatus = "safe" | "risky" | "fraud";

export interface Order {
  id: string;
  email: string;
  ip: string;
  country: string;
  amount: number;
  currency: string;
  platform: "shopify" | "woocommerce";
  riskScore: number;
  status: RiskStatus;
  reasons: string[];
  isNewCustomer: boolean;
  createdAt: string;
}

export const mockOrders: Order[] = [
  { id: "ORD-001", email: "john@gmail.com", ip: "192.168.1.1", country: "US", amount: 89.99, currency: "USD", platform: "shopify", riskScore: 12, status: "safe", reasons: [], isNewCustomer: false, createdAt: "2024-03-15T10:30:00Z" },
  { id: "ORD-002", email: "suspicious@tempmail.xyz", ip: "103.21.44.2", country: "NG", amount: 450.00, currency: "USD", platform: "woocommerce", riskScore: 85, status: "fraud", reasons: ["High risk country", "Disposable email", "High order amount"], isNewCustomer: true, createdAt: "2024-03-15T11:15:00Z" },
  { id: "ORD-003", email: "jane@outlook.com", ip: "72.14.201.3", country: "CA", amount: 210.50, currency: "USD", platform: "shopify", riskScore: 40, status: "risky", reasons: ["High order amount", "New customer"], isNewCustomer: true, createdAt: "2024-03-15T12:00:00Z" },
  { id: "ORD-004", email: "buyer@yopmail.com", ip: "185.107.56.8", country: "RU", amount: 899.00, currency: "USD", platform: "woocommerce", riskScore: 95, status: "fraud", reasons: ["High risk country", "Disposable email", "High order amount", "IP mismatch"], isNewCustomer: true, createdAt: "2024-03-14T09:20:00Z" },
  { id: "ORD-005", email: "mary@company.com", ip: "24.56.78.12", country: "US", amount: 55.00, currency: "USD", platform: "shopify", riskScore: 5, status: "safe", reasons: [], isNewCustomer: false, createdAt: "2024-03-14T14:45:00Z" },
  { id: "ORD-006", email: "alex@proton.me", ip: "89.34.111.7", country: "DE", amount: 320.00, currency: "EUR", platform: "shopify", riskScore: 35, status: "risky", reasons: ["New customer", "High order amount"], isNewCustomer: true, createdAt: "2024-03-14T16:30:00Z" },
  { id: "ORD-007", email: "test@guerrillamail.com", ip: "176.119.5.22", country: "UA", amount: 1200.00, currency: "USD", platform: "woocommerce", riskScore: 92, status: "fraud", reasons: ["High risk country", "Disposable email", "High order amount", "New customer"], isNewCustomer: true, createdAt: "2024-03-13T08:10:00Z" },
  { id: "ORD-008", email: "sarah@gmail.com", ip: "73.22.198.4", country: "US", amount: 42.99, currency: "USD", platform: "shopify", riskScore: 8, status: "safe", reasons: [], isNewCustomer: false, createdAt: "2024-03-13T11:55:00Z" },
  { id: "ORD-009", email: "shop@example.de", ip: "91.67.12.88", country: "DE", amount: 175.00, currency: "EUR", platform: "woocommerce", riskScore: 22, status: "safe", reasons: [], isNewCustomer: false, createdAt: "2024-03-13T15:20:00Z" },
  { id: "ORD-010", email: "newuser@mail.com", ip: "45.33.67.1", country: "BR", amount: 280.00, currency: "USD", platform: "shopify", riskScore: 55, status: "risky", reasons: ["New customer", "High order amount", "High risk country"], isNewCustomer: true, createdAt: "2024-03-12T10:00:00Z" },
];

export const mockStats = {
  totalOrders: 1247,
  safeOrders: 892,
  riskyOrders: 234,
  fraudOrders: 121,
  totalChecks: 3891,
  checksThisMonth: 412,
  avgRiskScore: 34,
  blockedAmount: 45230,
};

export const mockChartData = [
  { date: "Mar 1", safe: 42, risky: 8, fraud: 3 },
  { date: "Mar 2", safe: 38, risky: 12, fraud: 5 },
  { date: "Mar 3", safe: 55, risky: 6, fraud: 2 },
  { date: "Mar 4", safe: 47, risky: 15, fraud: 7 },
  { date: "Mar 5", safe: 61, risky: 9, fraud: 4 },
  { date: "Mar 6", safe: 52, risky: 11, fraud: 6 },
  { date: "Mar 7", safe: 44, risky: 7, fraud: 3 },
  { date: "Mar 8", safe: 58, risky: 13, fraud: 8 },
  { date: "Mar 9", safe: 49, risky: 10, fraud: 5 },
  { date: "Mar 10", safe: 63, risky: 8, fraud: 2 },
  { date: "Mar 11", safe: 51, risky: 14, fraud: 9 },
  { date: "Mar 12", safe: 46, risky: 6, fraud: 1 },
  { date: "Mar 13", safe: 57, risky: 11, fraud: 4 },
  { date: "Mar 14", safe: 53, risky: 9, fraud: 6 },
  { date: "Mar 15", safe: 48, risky: 7, fraud: 3 },
];

export const mockApiKeys = [
  { id: "1", key: "fs_live_a1b2c3d4e5f6g7h8i9j0", name: "Production", createdAt: "2024-01-15", lastUsed: "2024-03-15", usageCount: 3241, status: "active" as const },
  { id: "2", key: "fs_test_z9y8x7w6v5u4t3s2r1q0", name: "Development", createdAt: "2024-02-20", lastUsed: "2024-03-14", usageCount: 892, status: "active" as const },
  { id: "3", key: "fs_live_m1n2o3p4q5r6s7t8u9v0", name: "Staging", createdAt: "2024-03-01", lastUsed: "2024-03-10", usageCount: 156, status: "revoked" as const },
];
