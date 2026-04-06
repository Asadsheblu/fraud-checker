import { useState, useEffect } from "react";
import { Save } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const SettingsPage = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [notifications, setNotifications] = useState({ email: true, webhook: false, telegram: false });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user) {
      setEmail(user.email || "");
      supabase.from("profiles").select("display_name").eq("user_id", user.id).single()
        .then(({ data }) => { if (data) setName(data.display_name || ""); });
    }
  }, [user]);

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    await supabase.from("profiles").update({ display_name: name }).eq("user_id", user.id);
    setSaving(false);
    toast({ title: "Settings saved!" });
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Settings</h1>
        <p className="text-sm text-muted-foreground mt-1">Configure your FraudShield preferences</p>
      </div>

      <div className="gradient-card border border-border rounded-xl p-6 space-y-4">
        <h3 className="text-sm font-semibold text-foreground">Profile</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs text-muted-foreground block mb-1.5">Name</label>
            <input className="w-full px-3 py-2.5 bg-muted border border-border rounded-lg text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary" value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div>
            <label className="text-xs text-muted-foreground block mb-1.5">Email</label>
            <input className="w-full px-3 py-2.5 bg-muted border border-border rounded-lg text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary" value={email} disabled />
          </div>
        </div>
      </div>

      <div className="gradient-card border border-border rounded-xl p-6 space-y-4">
        <h3 className="text-sm font-semibold text-foreground">Risk Thresholds</h3>
        <p className="text-xs text-muted-foreground">Customize the score boundaries for risk classification</p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="text-xs text-safe block mb-1.5">Safe (0 – )</label>
            <input type="number" className="w-full px-3 py-2.5 bg-muted border border-border rounded-lg text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary font-mono" defaultValue={30} />
          </div>
          <div>
            <label className="text-xs text-risky block mb-1.5">Risky (– )</label>
            <input type="number" className="w-full px-3 py-2.5 bg-muted border border-border rounded-lg text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary font-mono" defaultValue={60} />
          </div>
          <div>
            <label className="text-xs text-fraud block mb-1.5">Fraud (– 100)</label>
            <input type="number" className="w-full px-3 py-2.5 bg-muted border border-border rounded-lg text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary font-mono" defaultValue={100} />
          </div>
        </div>
      </div>

      <div className="gradient-card border border-border rounded-xl p-6 space-y-4">
        <h3 className="text-sm font-semibold text-foreground">Notifications</h3>
        {[
          { key: "email" as const, label: "Email Alerts", desc: "Get notified when fraud is detected" },
          { key: "webhook" as const, label: "Webhook", desc: "Send events to your webhook URL" },
          { key: "telegram" as const, label: "Telegram", desc: "Receive alerts via Telegram bot" },
        ].map((item) => (
          <div key={item.key} className="flex items-center justify-between">
            <div>
              <p className="text-sm text-foreground">{item.label}</p>
              <p className="text-xs text-muted-foreground">{item.desc}</p>
            </div>
            <button
              onClick={() => setNotifications((n) => ({ ...n, [item.key]: !n[item.key] }))}
              className={`w-10 h-5.5 rounded-full transition-colors relative ${notifications[item.key] ? "bg-primary" : "bg-muted border border-border"}`}
            >
              <span className={`absolute top-0.5 w-4.5 h-4.5 rounded-full transition-transform ${notifications[item.key] ? "translate-x-5 bg-primary-foreground" : "translate-x-0.5 bg-muted-foreground"}`} />
            </button>
          </div>
        ))}
      </div>

      <div className="gradient-card border border-border rounded-xl p-6 space-y-4">
        <h3 className="text-sm font-semibold text-foreground">Auto Actions</h3>
        <p className="text-xs text-muted-foreground">Automatically take action when an order is flagged</p>
        <div className="space-y-3">
          <div>
            <label className="text-xs text-muted-foreground block mb-1.5">On Fraud Detected</label>
            <select className="w-full px-3 py-2.5 bg-muted border border-border rounded-lg text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary">
              <option>Cancel order</option>
              <option>Hold order</option>
              <option>Tag order</option>
              <option>Do nothing</option>
            </select>
          </div>
          <div>
            <label className="text-xs text-muted-foreground block mb-1.5">On Risky Detected</label>
            <select className="w-full px-3 py-2.5 bg-muted border border-border rounded-lg text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary">
              <option>Hold order</option>
              <option>Send verification email</option>
              <option>Tag order</option>
              <option>Do nothing</option>
            </select>
          </div>
        </div>
      </div>

      <button onClick={handleSave} disabled={saving} className="flex items-center gap-2 px-5 py-2.5 gradient-primary text-primary-foreground rounded-lg text-sm font-medium hover:opacity-90 transition disabled:opacity-50">
        <Save className="h-4 w-4" />
        {saving ? "Saving..." : "Save Changes"}
      </button>
    </div>
  );
};

export default SettingsPage;
