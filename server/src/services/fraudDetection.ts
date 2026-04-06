import { SupabaseClient } from '@supabase/supabase-js';

export interface FraudAnalysisRequest {
  orderId: string;
  customerEmail: string;
  amount: number;
  currency: string;
  customerName: string;
  shippingAddress: {
    country: string;
    state: string;
    city: string;
    zipCode: string;
  };
  billingAddress?: {
    country: string;
    state: string;
    city: string;
    zipCode: string;
  };
  paymentMethod: string;
  deviceFingerprint?: string;
  ipAddress?: string;
  userAgent?: string;
}

export interface FraudAnalysisResult {
  riskScore: number;
  riskLevel: 'safe' | 'risky' | 'fraud';
  rules: {
    name: string;
    score: number;
    triggered: boolean;
  }[];
  recommendation: 'approve' | 'review' | 'block';
  timestamp: Date;
}

export class FraudDetectionEngine {
  constructor(private supabase: SupabaseClient) {}

  async analyzeFraud(request: FraudAnalysisRequest): Promise<FraudAnalysisResult> {
    let riskScore = 0;
    const triggeredRules: { name: string; score: number; triggered: boolean }[] = [];

    // Rule 1: High amount transactions
    const highAmountRule = {
      name: 'High Amount Transaction',
      score: this.checkHighAmount(request.amount) ? 15 : 0,
      triggered: this.checkHighAmount(request.amount)
    };
    triggeredRules.push(highAmountRule);
    riskScore += highAmountRule.score;

    // Rule 2: Address mismatch
    const addressMismatchRule = {
      name: 'Address Mismatch',
      score: this.checkAddressMismatch(request.shippingAddress, request.billingAddress) ? 12 : 0,
      triggered: this.checkAddressMismatch(request.shippingAddress, request.billingAddress)
    };
    triggeredRules.push(addressMismatchRule);
    riskScore += addressMismatchRule.score;

    // Rule 3: High-risk country
    const highRiskCountryRule = {
      name: 'High Risk Country',
      score: this.checkHighRiskCountry(request.shippingAddress.country) ? 18 : 0,
      triggered: this.checkHighRiskCountry(request.shippingAddress.country)
    };
    triggeredRules.push(highRiskCountryRule);
    riskScore += highRiskCountryRule.score;

    // Rule 4: Velocity check (multiple orders in short time)
    const velocityScore = await this.checkVelocity(request.customerEmail);
    const velocityRule = {
      name: 'High Order Velocity',
      score: velocityScore,
      triggered: velocityScore > 0
    };
    triggeredRules.push(velocityRule);
    riskScore += velocityScore;

    // Rule 5: Blacklist check
    const blacklistRule = {
      name: 'Blacklist Match',
      score: await this.checkBlacklist(request.customerEmail) ? 25 : 0,
      triggered: await this.checkBlacklist(request.customerEmail)
    };
    triggeredRules.push(blacklistRule);
    riskScore += blacklistRule.score;

    // Rule 6: Fingerprint check (same device, multiple accounts)
    const fingerprintScore = await this.checkFingerprint(request.deviceFingerprint);
    const fingerprintRule = {
      name: 'Multiple Accounts Same Device',
      score: fingerprintScore,
      triggered: fingerprintScore > 0
    };
    triggeredRules.push(fingerprintRule);
    riskScore += fingerprintScore;

    // Rule 7: Email domain check
    const emailDomainRule = {
      name: 'Suspicious Email Domain',
      score: this.checkEmailDomain(request.customerEmail) ? 8 : 0,
      triggered: this.checkEmailDomain(request.customerEmail)
    };
    triggeredRules.push(emailDomainRule);
    riskScore += emailDomainRule.score;

    // Determine risk level
    let riskLevel: 'safe' | 'risky' | 'fraud';
    let recommendation: 'approve' | 'review' | 'block';

    if (riskScore <= 30) {
      riskLevel = 'safe';
      recommendation = 'approve';
    } else if (riskScore <= 60) {
      riskLevel = 'risky';
      recommendation = 'review';
    } else {
      riskLevel = 'fraud';
      recommendation = 'block';
    }

    const result: FraudAnalysisResult = {
      riskScore: Math.min(100, riskScore),
      riskLevel,
      rules: triggeredRules,
      recommendation,
      timestamp: new Date()
    };

    return result;
  }

  private checkHighAmount(amount: number): boolean {
    return amount > 500; // Configurable threshold
  }

  private checkAddressMismatch(shipping: any, billing?: any): boolean {
    if (!billing) return false;
    return shipping.country !== billing.country || shipping.zipCode !== billing.zipCode;
  }

  private checkHighRiskCountry(country: string): boolean {
    const highRiskCountries = ['KP', 'IR', 'SY']; // ISO country codes
    return highRiskCountries.includes(country);
  }

  private async checkVelocity(email: string): Promise<number> {
    // Check orders in last 24 hours
    const oneDay = new Date(Date.now() - 24 * 60 * 60 * 1000);
    
    const { data, error } = await this.supabase
      .from('orders')
      .select('id')
      .eq('customer_email', email)
      .gt('created_at', oneDay.toISOString());

    if (error || !data) return 0;

    const count = data.length;
    if (count >= 5) return 10;
    if (count >= 3) return 5;
    return 0;
  }

  private async checkBlacklist(email: string): Promise<boolean> {
    const { data, error } = await this.supabase
      .from('blacklist')
      .select('id')
      .eq('email', email)
      .single();

    return !!data && !error;
  }

  private async checkFingerprint(fingerprint?: string): Promise<number> {
    if (!fingerprint) return 0;

    const { data, error } = await this.supabase
      .from('customer_fingerprints')
      .select('customer_email')
      .eq('fingerprint', fingerprint);

    if (error || !data) return 0;

    // If same fingerprint has multiple different emails
    const uniqueEmails = new Set(data.map(d => d.customer_email));
    if (uniqueEmails.size >= 3) return 12;
    if (uniqueEmails.size >= 2) return 7;
    return 0;
  }

  private checkEmailDomain(email: string): boolean {
    const domain = email.split('@')[1];
    const disposableDomains = ['tempmail.com', '10minutemail.com', 'guerrillamail.com'];
    return disposableDomains.includes(domain);
  }
}
