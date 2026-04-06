import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const HIGH_RISK_COUNTRIES = ["NG", "RU", "UA", "CN", "VN", "PH", "ID", "BD", "PK", "KE"];
const DISPOSABLE_DOMAINS = [
  "tempmail.xyz", "guerrillamail.com", "yopmail.com", "mailinator.com",
  "throwaway.email", "sharklasers.com", "guerrillamailblock.com",
  "10minutemail.com", "trashmail.com", "dispostable.com"
];

interface CheckOrderRequest {
  apiKey: string;
  platform: "shopify" | "woocommerce";
  email: string;
  ip: string;
  country: string;
  amount: number;
  currency: string;
  isNewCustomer: boolean;
}

function calculateRisk(data: CheckOrderRequest): { score: number; reasons: string[] } {
  let score = 0;
  const reasons: string[] = [];

  if (HIGH_RISK_COUNTRIES.includes(data.country?.toUpperCase())) {
    score += 30;
    reasons.push("High risk country");
  }
  if (data.isNewCustomer) {
    score += 20;
    reasons.push("New customer");
  }
  if (data.amount > 200) {
    score += 20;
    reasons.push("High order amount");
  }
  const emailDomain = data.email?.split("@")[1]?.toLowerCase();
  if (emailDomain && DISPOSABLE_DOMAINS.includes(emailDomain)) {
    score += 25;
    reasons.push("Disposable email");
  }

  return { score: Math.min(score, 100), reasons };
}

function getStatus(score: number): "safe" | "risky" | "fraud" {
  if (score <= 30) return "safe";
  if (score <= 60) return "risky";
  return "fraud";
}

function getAction(status: string): string {
  if (status === "fraud") return "cancel";
  if (status === "risky") return "hold";
  return "allow";
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const body: CheckOrderRequest = await req.json();

    if (!body.apiKey || !body.email || !body.platform) {
      return new Response(
        JSON.stringify({ error: "Missing required fields: apiKey, email, platform" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Validate API key
    const { data: apiKeyData, error: keyError } = await supabaseAdmin
      .from("api_keys")
      .select("id, user_id, status")
      .eq("key", body.apiKey)
      .single();

    if (keyError || !apiKeyData || apiKeyData.status !== "active") {
      return new Response(
        JSON.stringify({ error: "Invalid or revoked API key" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check usage limits
    const { data: sub } = await supabaseAdmin
      .from("subscriptions")
      .select("checks_used, checks_limit, plan")
      .eq("user_id", apiKeyData.user_id)
      .single();

    if (sub && sub.plan !== "agency" && sub.checks_used >= sub.checks_limit) {
      return new Response(
        JSON.stringify({ error: "Monthly check limit reached. Please upgrade your plan." }),
        { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Calculate risk
    const { score, reasons } = calculateRisk(body);
    const status = getStatus(score);
    const action = getAction(status);

    // Generate order ref
    const orderRef = `ORD-${Date.now().toString(36).toUpperCase()}`;

    // Save order
    await supabaseAdmin.from("orders").insert({
      user_id: apiKeyData.user_id,
      order_ref: orderRef,
      email: body.email,
      ip: body.ip || null,
      country: body.country || null,
      amount: body.amount || 0,
      currency: body.currency || "USD",
      platform: body.platform,
      risk_score: score,
      status,
      reasons,
      is_new_customer: body.isNewCustomer || false,
    });

    // Update usage counts
    await supabaseAdmin
      .from("api_keys")
      .update({ usage_count: (apiKeyData as any).usage_count + 1, last_used_at: new Date().toISOString() })
      .eq("id", apiKeyData.id);

    if (sub) {
      await supabaseAdmin
        .from("subscriptions")
        .update({ checks_used: sub.checks_used + 1 })
        .eq("user_id", apiKeyData.user_id);
    }

    return new Response(
      JSON.stringify({ riskScore: score, status, reasons, action, orderRef }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
