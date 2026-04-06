import axios from 'axios';
import crypto from 'crypto';

export interface ShopifyWebhookPayload {
  id: number;
  email: string;
  customer: {
    id: number;
    email: string;
    first_name: string;
    last_name: string;
  };
  billing_address: {
    country: string;
    state: string;
    city: string;
    zip: string;
    address1: string;
    address2?: string;
  };
  shipping_address: {
    country: string;
    state: string;
    city: string;
    zip: string;
    address1: string;
    address2?: string;
  };
  line_items: Array<{
    id: number;
    quantity: number;
    price: string;
    product_id: number;
    product_title: string;
  }>;
  total_price: string;
  created_at: string;
}

export class ShopifyService {
  async verifyWebhookSignature(request: any, hmacHeader: string | string[] | undefined, secret: string): Promise<boolean> {
    if (!hmacHeader) return false;

    const hmac = Array.isArray(hmacHeader) ? hmacHeader[0] : hmacHeader;
    const body = request.body;

    // Debug log to verify incoming signature
    console.log('[Shopify Debug] Received HMAC:', hmac);

    const stringBody = typeof body === 'string' ? body : JSON.stringify(body);
    const hash = crypto
      .createHmac('sha256', secret)
      .update(stringBody, 'utf8')
      .digest('base64');

    const isValid = hash === hmac;
    console.log('[Shopify Debug] Computed Hash:', hash);
    console.log('[Shopify Debug] Signature Match:', isValid);

    return isValid;
  }

  async forwardOrderToFraudDetection(
    order: ShopifyWebhookPayload,
    shopifyIntegration: any,
    fraudDetectionApiUrl: string
  ) {
    try {
      // Convert Shopify order format to FraudShield format
      const fraudCheckPayload = {
        apiKey: shopifyIntegration.access_token,
        customer: {
          email: order.customer?.email || order.email,
          name: `${order.customer?.first_name || ''} ${order.customer?.last_name || ''}`.trim(),
          phone: undefined
        },
        amount: parseFloat(order.total_price),
        currency: 'USD',
        shippingAddress: {
          country: order.shipping_address?.country || '',
          state: order.shipping_address?.state || '',
          city: order.shipping_address?.city || '',
          zipCode: order.shipping_address?.zip || '',
          street: order.shipping_address?.address1 || '',
          streetLine2: order.shipping_address?.address2
        },
        billingAddress: {
          country: order.billing_address?.country || '',
          state: order.billing_address?.state || '',
          city: order.billing_address?.city || '',
          zipCode: order.billing_address?.zip || '',
          street: order.billing_address?.address1 || '',
          streetLine2: order.billing_address?.address2
        },
        paymentMethod: 'shopify',
        deviceFingerprint: undefined
      };

      const response = await axios.post(
        `${fraudDetectionApiUrl}/api/orders/analyze`,
        fraudCheckPayload
      );

      return response.data;
    } catch (error: any) {
      console.error('Failed to send order to fraud detection:', error.message);
      throw error;
    }
  }

  async getShopifyAccessToken(code: string, shopName: string, clientId: string, clientSecret: string): Promise<string> {
    try {
      const response = await axios.post(
        `https://${shopName}.myshopify.com/admin/oauth/access_tokens`,
        {
          client_id: clientId,
          client_secret: clientSecret,
          code
        }
      );

      return response.data.access_token;
    } catch (error: any) {
      console.error('Failed to get Shopify access token:', error.message);
      throw error;
    }
  }

  async getShopifyStoreInfo(shopName: string, accessToken: string) {
    try {
      const response = await axios.get(
        `https://${shopName}.myshopify.com/admin/api/2024-01/shop.json`,
        {
          headers: {
            'X-Shopify-Access-Token': accessToken
          }
        }
      );

      return response.data.shop;
    } catch (error: any) {
      console.error('Failed to get Shopify store info:', error.message);
      throw error;
    }
  }

  async registerWebhooks(shopName: string, accessToken: string, webhookUrl: string) {
    try {
      const events = ['orders/created', 'orders/updated'];
      const webhooks = [];

      for (const event of events) {
        const response = await axios.post(
          `https://${shopName}.myshopify.com/admin/api/2024-01/webhooks.json`,
          {
            webhook: {
              topic: event,
              address: `${webhookUrl}/shopify/webhook`,
              format: 'json'
            }
          },
          {
            headers: {
              'X-Shopify-Access-Token': accessToken
            }
          }
        );

        webhooks.push(response.data.webhook);
      }

      return webhooks;
    } catch (error: any) {
      console.error('Failed to register Shopify webhooks:', error.message);
      throw error;
    }
  }

  async unregisterWebhooks(shopName: string, accessToken: string) {
    try {
      const response = await axios.get(
        `https://${shopName}.myshopify.com/admin/api/2024-01/webhooks.json`,
        {
          headers: {
            'X-Shopify-Access-Token': accessToken
          }
        }
      );

      for (const webhook of response.data.webhooks) {
        await axios.delete(
          `https://${shopName}.myshopify.com/admin/api/2024-01/webhooks/${webhook.id}.json`,
          {
            headers: {
              'X-Shopify-Access-Token': accessToken
            }
          }
        );
      }

      return true;
    } catch (error: any) {
      console.error('Failed to unregister Shopify webhooks:', error.message);
      throw error;
    }
  }
}

export const shopifyService = new ShopifyService();
