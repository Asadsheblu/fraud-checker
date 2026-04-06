-- ========================
-- FRAUD DETECTION RULES TABLE
-- ========================
CREATE TABLE public.fraud_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  rule_type TEXT NOT NULL CHECK (rule_type IN ('velocity_check', 'card_pattern', 'geo_mismatch', 'value_threshold', 'device_fingerprint', 'email_pattern', 'custom')),
  name TEXT NOT NULL,
  description TEXT,
  is_enabled BOOLEAN NOT NULL DEFAULT true,
  weight INTEGER NOT NULL DEFAULT 10 CHECK (weight >= 0 AND weight <= 100),
  threshold INTEGER CHECK (threshold >= 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.fraud_rules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own rules" ON public.fraud_rules FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own rules" ON public.fraud_rules FOR ALL USING (auth.uid() = user_id);

CREATE TRIGGER update_fraud_rules_updated_at BEFORE UPDATE ON public.fraud_rules
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ========================
-- AUDIT LOGS TABLE
-- ========================
CREATE TABLE public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  resource_type TEXT NOT NULL,
  resource_id TEXT,
  changes JSONB,
  ip_address TEXT,
  user_agent TEXT,
  status TEXT NOT NULL DEFAULT 'success' CHECK (status IN ('success', 'failed')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own logs" ON public.audit_logs FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins can view all logs" ON public.audit_logs FOR SELECT USING (public.has_role(auth.uid(), 'admin'));

CREATE INDEX idx_audit_logs_user_id ON public.audit_logs(user_id);
CREATE INDEX idx_audit_logs_created_at ON public.audit_logs(created_at DESC);
CREATE INDEX idx_audit_logs_action ON public.audit_logs(action);

-- ========================
-- WEBHOOKS TABLE
-- ========================
CREATE TABLE public.webhooks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  event_type TEXT NOT NULL CHECK (event_type IN ('order.analyzed', 'order.flagged', 'api_key.created', 'api_key.revoked')),
  is_active BOOLEAN NOT NULL DEFAULT true,
  secret TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.webhooks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own webhooks" ON public.webhooks FOR ALL USING (auth.uid() = user_id);

CREATE INDEX idx_webhooks_user_id ON public.webhooks(user_id);

CREATE TRIGGER update_webhooks_updated_at BEFORE UPDATE ON public.webhooks
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ========================
-- WEBHOOK LOGS TABLE
-- ========================
CREATE TABLE public.webhook_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  webhook_id UUID NOT NULL REFERENCES public.webhooks(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,
  payload JSONB NOT NULL,
  response_status INTEGER,
  response_body TEXT,
  attempts INTEGER NOT NULL DEFAULT 1,
  last_attempted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.webhook_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own webhook logs" ON public.webhook_logs FOR SELECT USING (auth.uid() = user_id);

CREATE INDEX idx_webhook_logs_webhook_id ON public.webhook_logs(webhook_id);
CREATE INDEX idx_webhook_logs_user_id ON public.webhook_logs(user_id);
CREATE INDEX idx_webhook_logs_created_at ON public.webhook_logs(created_at DESC);

-- ========================
-- SHOPIFY INTEGRATION TABLE
-- ========================
CREATE TABLE public.shopify_integrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  shop_name TEXT NOT NULL,
  access_token TEXT NOT NULL,
  scope TEXT[],
  webhook_topics TEXT[],
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.shopify_integrations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own shopify integration" ON public.shopify_integrations FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own shopify integration" ON public.shopify_integrations FOR ALL USING (auth.uid() = user_id);

CREATE TRIGGER update_shopify_integrations_updated_at BEFORE UPDATE ON public.shopify_integrations
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ========================
-- WOOCOMMERCE INTEGRATION TABLE
-- ========================
CREATE TABLE public.woocommerce_integrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  store_url TEXT NOT NULL,
  consumer_key TEXT NOT NULL,
  consumer_secret TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.woocommerce_integrations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own woocommerce integration" ON public.woocommerce_integrations FOR ALL USING (auth.uid() = user_id);

CREATE TRIGGER update_woocommerce_integrations_updated_at BEFORE UPDATE ON public.woocommerce_integrations
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ========================
-- CUSTOMER FINGERPRINTS TABLE (for fraud detection)
-- ========================
CREATE TABLE public.customer_fingerprints (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  fingerprint_hash TEXT NOT NULL,
  email TEXT,
  ip_address TEXT,
  country TEXT,
  device_type TEXT,
  browser TEXT,
  os TEXT,
  total_orders INTEGER NOT NULL DEFAULT 1,
  total_spent NUMERIC(12,2) NOT NULL DEFAULT 0,
  is_suspicious BOOLEAN NOT NULL DEFAULT false,
  last_seen_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.customer_fingerprints ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own fingerprints" ON public.customer_fingerprints FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert fingerprints" ON public.customer_fingerprints FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update fingerprints" ON public.customer_fingerprints FOR UPDATE USING (auth.uid() = user_id);

CREATE INDEX idx_customer_fingerprints_user_id ON public.customer_fingerprints(user_id);
CREATE INDEX idx_customer_fingerprints_fingerprint_hash ON public.customer_fingerprints(fingerprint_hash);
CREATE INDEX idx_customer_fingerprints_email ON public.customer_fingerprints(email);
CREATE INDEX idx_customer_fingerprints_ip ON public.customer_fingerprints(ip_address);

-- ========================
-- BLACKLIST TABLE
-- ========================
CREATE TABLE public.blacklist (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  item_type TEXT NOT NULL CHECK (item_type IN ('email', 'ip', 'card', 'fingerprint')),
  item_value TEXT NOT NULL,
  reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.blacklist ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own blacklist" ON public.blacklist FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own blacklist" ON public.blacklist FOR ALL USING (auth.uid() = user_id);

CREATE INDEX idx_blacklist_user_id ON public.blacklist(user_id);
CREATE INDEX idx_blacklist_item_value ON public.blacklist(item_value);

-- ========================
-- ANALYTICS TABLE
-- ========================
CREATE TABLE public.analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  total_orders INTEGER NOT NULL DEFAULT 0,
  flagged_orders INTEGER NOT NULL DEFAULT 0,
  fraud_detected INTEGER NOT NULL DEFAULT 0,
  total_amount NUMERIC(12,2) NOT NULL DEFAULT 0,
  blocked_amount NUMERIC(12,2) NOT NULL DEFAULT 0,
  api_calls INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, date)
);

ALTER TABLE public.analytics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own analytics" ON public.analytics FOR SELECT USING (auth.uid() = user_id);

CREATE INDEX idx_analytics_user_id ON public.analytics(user_id);
CREATE INDEX idx_analytics_date ON public.analytics(date DESC);
