import axios from 'axios';

export interface EmailTemplate {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export class EmailService {
  private apiKey: string;
  private apiUrl = 'https://api.resend.com/emails';
  private fromAddress: string;

  constructor(apiKey?: string, fromAddress: string = 'noreply@fraudshield.app') {
    this.apiKey = apiKey || process.env.RESEND_API_KEY || '';
    this.fromAddress = fromAddress;
  }

  async sendEmail(email: EmailTemplate): Promise<{ id: string }> {
    try {
      const response = await axios.post(
        this.apiUrl,
        {
          from: this.fromAddress,
          to: email.to,
          subject: email.subject,
          html: email.html,
          text: email.text
        },
        {
          headers: {
            Authorization: `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json'
          }
        }
      );

      return response.data;
    } catch (error: any) {
      console.error('Email send error:', error.response?.data || error.message);
      throw new Error(`Failed to send email: ${error.message}`);
    }
  }

  // Welcome email
  async sendWelcomeEmail(email: string, name: string): Promise<{ id: string }> {
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #333;">Welcome to FraudShield! 🛡️</h1>
        <p>Hi ${name},</p>
        <p>Thank you for signing up for FraudShield. We're excited to help you protect your business from fraud.</p>
        
        <h2 style="color: #666;">Getting Started</h2>
        <ol style="line-height: 1.8;">
          <li>Log in to your dashboard</li>
          <li>Create an API key in the Settings</li>
          <li>Integrate FraudShield with your platform</li>
          <li>Start analyzing orders in real-time</li>
        </ol>

        <p><a href="https://app.fraudshield.app/dashboard" style="background-color: #2563eb; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px; display: inline-block;">Go to Dashboard</a></p>

        <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;">
        
        <p style="color: #999; font-size: 12px;">
          If you have any questions, check our docs at <a href="https://docs.fraudshield.app" style="color: #2563eb;">docs.fraudshield.app</a>
        </p>
      </div>
    `;

    return this.sendEmail({
      to: email,
      subject: 'Welcome to FraudShield!',
      html
    });
  }

  // Order fraud detected email
  async sendFraudAlertEmail(
    email: string,
    orderId: string,
    riskScore: number,
    recommendation: string
  ): Promise<{ id: string }> {
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #dc2626;">⚠️ Fraud Alert</h1>
        <p>A potentially fraudulent order has been detected:</p>

        <div style="background-color: #f3f4f6; padding: 20px; border-left: 4px solid #dc2626; margin: 20px 0;">
          <p><strong>Order ID:</strong> ${orderId}</p>
          <p><strong>Risk Score:</strong> ${riskScore}/100</p>
          <p><strong>Recommendation:</strong> <span style="color: #dc2626; font-weight: bold;">${recommendation.toUpperCase()}</span></p>
        </div>

        <p>Please review this order in your dashboard and take appropriate action.</p>
        
        <p><a href="https://app.fraudshield.app/orders/${orderId}" style="background-color: #dc2626; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px; display: inline-block;">Review Order</a></p>
      </div>
    `;

    return this.sendEmail({
      to: email,
      subject: `Fraud Alert: Order ${orderId}`,
      html
    });
  }

  // Email verification
  async sendVerificationEmail(
    email: string,
    verificationLink: string
  ): Promise<{ id: string }> {
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #333;">Verify Your Email</h1>
        <p>Click the link below to verify your email address:</p>
        
        <p><a href="${verificationLink}" style="background-color: #2563eb; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px; display: inline-block;">Verify Email</a></p>
        
        <p style="color: #999; font-size: 12px;">
          If you didn't sign up for FraudShield, you can ignore this email.
        </p>
      </div>
    `;

    return this.sendEmail({
      to: email,
      subject: 'Verify Your FraudShield Email',
      html
    });
  }

  // Password reset
  async sendPasswordResetEmail(
    email: string,
    resetLink: string
  ): Promise<{ id: string }> {
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #333;">Reset Your Password</h1>
        <p>Click the link below to reset your password:</p>
        
        <p><a href="${resetLink}" style="background-color: #2563eb; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px; display: inline-block;">Reset Password</a></p>
        
        <p style="color: #999; font-size: 12px;">
          This link will expire in 24 hours. If you didn't request a password reset, you can ignore this email.
        </p>
      </div>
    `;

    return this.sendEmail({
      to: email,
      subject: 'Reset Your FraudShield Password',
      html
    });
  }

  // Subscription confirmation
  async sendSubscriptionConfirmationEmail(
    email: string,
    plan: string,
    price: number
  ): Promise<{ id: string }> {
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #333;">Subscription Confirmed</h1>
        <p>Thank you for subscribing to FraudShield!</p>

        <div style="background-color: #f3f4f6; padding: 20px; border-left: 4px solid #16a34a; margin: 20px 0;">
          <p><strong>Plan:</strong> ${plan}</p>
          <p><strong>Price:</strong> $${price}/month</p>
        </div>

        <p>Your subscription is now active. You can start using all features immediately.</p>
        
        <p><a href="https://app.fraudshield.app/dashboard" style="background-color: #2563eb; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px; display: inline-block;">Go to Dashboard</a></p>
      </div>
    `;

    return this.sendEmail({
      to: email,
      subject: 'Welcome to FraudShield Premium',
      html
    });
  }

  // Daily digest
  async sendDailyDigestEmail(
    email: string,
    stats: {
      totalOrders: number;
      fraudDetected: number;
      totalValue: number;
      avgRiskScore: number;
    }
  ): Promise<{ id: string }> {
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #333;">Daily Summary - ${new Date().toLocaleDateString()}</h1>
        
        <div style="background-color: #f3f4f6; padding: 20px; border-radius: 4px; margin: 20px 0;">
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
            <div>
              <p style="color: #999; font-size: 12px;">TOTAL ORDERS</p>
              <p style="font-size: 24px; font-weight: bold; color: #333;">${stats.totalOrders}</p>
            </div>
            <div>
              <p style="color: #999; font-size: 12px;">FRAUD DETECTED</p>
              <p style="font-size: 24px; font-weight: bold; color: #dc2626;">${stats.fraudDetected}</p>
            </div>
            <div>
              <p style="color: #999; font-size: 12px;">TOTAL VALUE</p>
              <p style="font-size: 24px; font-weight: bold; color: #333;">$${stats.totalValue.toLocaleString()}</p>
            </div>
            <div>
              <p style="color: #999; font-size: 12px;">AVG RISK SCORE</p>
              <p style="font-size: 24px; font-weight: bold; color: #333;">${stats.avgRiskScore}</p>
            </div>
          </div>
        </div>

        <p><a href="https://app.fraudshield.app/dashboard" style="background-color: #2563eb; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px; display: inline-block;">View Full Report</a></p>
      </div>
    `;

    return this.sendEmail({
      to: email,
      subject: `Your Daily Summary - ${new Date().toLocaleDateString()}`,
      html
    });
  }
}

// Singleton instance
export const emailService = new EmailService();
