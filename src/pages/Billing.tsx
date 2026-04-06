import { Check } from "lucide-react";
import { useState } from "react";

const plans = [
  {
    name: "Free",
    price: "$0",
    period: "/month",
    description: "For getting started",
    checks: "100 checks/month",
    features: ["100 API checks", "Basic risk engine", "Email support", "1 API key"],
    current: false,
  },
  {
    name: "Pro",
    price: "$49",
    period: "/month",
    description: "For growing businesses",
    checks: "1,000 checks/month",
    features: ["1,000 API checks", "Advanced risk engine", "Priority support", "5 API keys", "Custom rules", "Webhook notifications"],
    current: true,
    popular: true,
  },
  {
    name: "Agency",
    price: "$199",
    period: "/month",
    description: "For agencies and enterprises",
    checks: "Unlimited checks",
    features: ["Unlimited API checks", "Full risk engine", "Dedicated support", "Unlimited API keys", "Custom rules", "Webhook notifications", "White-label reports", "SSO"],
    current: false,
  },
];

const Billing = () => {
  const [billingPeriod, setBillingPeriod] = useState<"monthly" | "yearly">("monthly");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Billing</h1>
        <p className="text-sm text-muted-foreground mt-1">Manage your subscription and billing</p>
      </div>

      {/* Usage bar */}
      <div className="gradient-card border border-border rounded-xl p-5">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-semibold text-foreground">Current Usage</h3>
          <span className="text-xs text-muted-foreground">412 / 1,000 checks</span>
        </div>
        <div className="w-full bg-muted rounded-full h-2">
          <div className="bg-primary rounded-full h-2 transition-all" style={{ width: "41.2%" }} />
        </div>
        <p className="text-xs text-muted-foreground mt-2">Resets on April 1, 2024</p>
      </div>

      {/* Period toggle */}
      <div className="flex justify-center">
        <div className="bg-muted rounded-lg p-1 flex gap-1">
          <button
            onClick={() => setBillingPeriod("monthly")}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${billingPeriod === "monthly" ? "bg-card text-foreground" : "text-muted-foreground"}`}
          >
            Monthly
          </button>
          <button
            onClick={() => setBillingPeriod("yearly")}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${billingPeriod === "yearly" ? "bg-card text-foreground" : "text-muted-foreground"}`}
          >
            Yearly <span className="text-safe text-xs">-20%</span>
          </button>
        </div>
      </div>

      {/* Plans */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {plans.map((plan) => (
          <div
            key={plan.name}
            className={`gradient-card border rounded-xl p-6 relative ${
              plan.popular ? "border-primary glow-primary" : "border-border"
            }`}
          >
            {plan.popular && (
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 gradient-primary text-primary-foreground text-[10px] font-bold rounded-full uppercase tracking-wider">
                Popular
              </span>
            )}
            <div className="text-center mb-5">
              <h3 className="text-lg font-bold text-foreground">{plan.name}</h3>
              <p className="text-xs text-muted-foreground mt-1">{plan.description}</p>
              <div className="mt-3">
                <span className="text-3xl font-bold text-foreground">{plan.price}</span>
                <span className="text-sm text-muted-foreground">{plan.period}</span>
              </div>
              <p className="text-xs text-primary font-medium mt-1">{plan.checks}</p>
            </div>
            <ul className="space-y-2 mb-6">
              {plan.features.map((f) => (
                <li key={f} className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Check className="h-3.5 w-3.5 text-primary shrink-0" />
                  {f}
                </li>
              ))}
            </ul>
            <button
              className={`w-full py-2.5 rounded-lg text-sm font-medium transition ${
                plan.current
                  ? "bg-muted text-muted-foreground border border-border cursor-default"
                  : "gradient-primary text-primary-foreground hover:opacity-90"
              }`}
              disabled={plan.current}
            >
              {plan.current ? "Current Plan" : "Upgrade"}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Billing;
