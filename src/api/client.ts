const API_BASE_URL =  'http://localhost:3001/api';

export interface ApiRequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  headers?: Record<string, string>;
  body?: any;
  apiKey?: string;
  token?: string;
}

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  private async request<T>(
    endpoint: string,
    options: ApiRequestOptions = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...options.headers
    };

    if (options.apiKey) {
      headers['x-api-key'] = options.apiKey;
    }

    if (options.token) {
      headers['Authorization'] = `Bearer ${options.token}`;
    }

    const response = await fetch(url, {
      method: options.method || 'GET',
      headers,
      body: options.body ? JSON.stringify(options.body) : undefined
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || `API Error: ${response.statusText}`);
    }

    return response.json();
  }

  // Auth endpoints
  async login(email: string, password: string) {
    return this.request('/auth/login', {
      method: 'POST',
      body: { email, password }
    });
  }

  async signup(data: {
    email: string;
    password: string;
    company: string;
    firstName: string;
    lastName: string;
  }) {
    return this.request('/auth/signup', {
      method: 'POST',
      body: data
    });
  }

  async verifyToken(token: string) {
    return this.request('/auth/verify', {
      method: 'POST',
      token
    });
  }

  async logout(token: string) {
    return this.request('/auth/logout', {
      method: 'POST',
      token
    });
  }

  // Orders endpoints
  async analyzeOrder(orderData: any, apiKey: string) {
    return this.request('/orders/analyze', {
      method: 'POST',
      body: orderData,
      apiKey
    });
  }

  async getOrder(orderId: string, apiKey: string) {
    return this.request(`/orders/${orderId}`, {
      apiKey
    });
  }

  async listOrders(
    apiKey: string,
    options?: { limit?: number; offset?: number; status?: string }
  ) {
    const params = new URLSearchParams();
    if (options?.limit) params.append('limit', options.limit.toString());
    if (options?.offset) params.append('offset', options.offset.toString());
    if (options?.status) params.append('status', options.status);

    return this.request(`/orders?${params.toString()}`, {
      apiKey
    });
  }

  // API Keys endpoints
  async createApiKey(name: string, dailyLimit: number, token: string) {
    return this.request('/api-keys', {
      method: 'POST',
      body: { name, dailyLimit },
      token
    });
  }

  async listApiKeys(token: string) {
    return this.request('/api-keys', {
      token
    });
  }

  async getApiKey(keyId: string, token: string) {
    return this.request(`/api-keys/${keyId}`, {
      token
    });
  }

  async updateApiKey(
    keyId: string,
    data: { name?: string; dailyLimit?: number; status?: string },
    token: string
  ) {
    return this.request(`/api-keys/${keyId}`, {
      method: 'PUT',
      body: data,
      token
    });
  }

  async deleteApiKey(keyId: string, token: string) {
    return this.request(`/api-keys/${keyId}`, {
      method: 'DELETE',
      token
    });
  }

  // Webhooks endpoints
  async createWebhook(
    url: string,
    events: string[],
    token: string
  ) {
    return this.request('/webhooks', {
      method: 'POST',
      body: { url, events },
      token
    });
  }

  async listWebhooks(token: string) {
    return this.request('/webhooks', {
      token
    });
  }

  async updateWebhook(
    webhookId: string,
    data: { url?: string; events?: string[]; status?: string },
    token: string
  ) {
    return this.request(`/webhooks/${webhookId}`, {
      method: 'PUT',
      body: data,
      token
    });
  }

  async deleteWebhook(webhookId: string, token: string) {
    return this.request(`/webhooks/${webhookId}`, {
      method: 'DELETE',
      token
    });
  }

  // Analytics endpoints
  async getDashboardStats(token: string, period: string = 'month') {
    return this.request(`/analytics/stats?period=${period}`, {
      token
    });
  }

  async getRiskDistribution(token: string, period: string = 'month') {
    return this.request(`/analytics/risk-distribution?period=${period}`, {
      token
    });
  }

  async getTopFraudTriggers(token: string) {
    return this.request('/analytics/top-fraud-triggers', {
      token
    });
  }

  async getTrends(token: string) {
    return this.request('/analytics/trends', {
      token
    });
  }

  // Integrations endpoints
  async connectShopify(shopName: string, accessToken: string, token: string) {
    return this.request('/integrations/shopify/connect', {
      method: 'POST',
      body: { shopName, accessToken },
      token
    });
  }

  async connectWooCommerce(
    storeName: string,
    consumerKey: string,
    consumerSecret: string,
    token: string
  ) {
    return this.request('/integrations/woocommerce/connect', {
      method: 'POST',
      body: { storeName, consumerKey, consumerSecret },
      token
    });
  }

  async listIntegrations(token: string) {
    return this.request('/integrations', {
      token
    });
  }

  async disconnectIntegration(
    integrationType: string,
    integrationId: string,
    token: string
  ) {
    return this.request(`/integrations/${integrationType}/${integrationId}`, {
      method: 'DELETE',
      token
    });
  }

  // Admin endpoints
  async getAdminUsers(token: string) {
    return this.request('/admin/users', {
      token
    });
  }

  async getAdminUserDetails(userId: string, token: string) {
    return this.request(`/admin/users/${userId}`, {
      token
    });
  }

  async updateUserStatus(userId: string, status: string, token: string) {
    return this.request(`/admin/users/${userId}/status`, {
      method: 'PUT',
      body: { status },
      token
    });
  }

  async updateUserPlan(userId: string, plan: string, token: string) {
    return this.request(`/admin/users/${userId}/plan`, {
      method: 'PUT',
      body: { plan },
      token
    });
  }

  async getSystemStats(token: string) {
    return this.request('/admin/stats/system', {
      token
    });
  }

  async getFraudRules(token: string) {
    return this.request('/admin/fraud-rules', {
      token
    });
  }

  async getAuditLogs(token: string, limit: number = 50, offset: number = 0) {
    return this.request(`/admin/audit-logs?limit=${limit}&offset=${offset}`, {
      token
    });
  }
}

export const apiClient = new ApiClient();
