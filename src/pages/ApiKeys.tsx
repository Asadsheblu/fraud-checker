import { useState, useEffect } from "react";
import { Copy, Eye, EyeOff, Plus, RotateCcw, Trash2, Check } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import type { Database } from "@/integrations/supabase/types";

type ApiKey = Database["public"]["Tables"]["api_keys"]["Row"];

const ApiKeys = () => {
  const [showKey, setShowKey] = useState<Record<string, boolean>>({});
  const [copied, setCopied] = useState<string | null>(null);
  const [keys, setKeys] = useState<ApiKey[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchKeys = async () => {
    const { data } = await supabase.from("api_keys").select("*").order("created_at", { ascending: false });
    setKeys(data || []);
    setLoading(false);
  };

  useEffect(() => { fetchKeys(); }, []);

  const toggleShow = (id: string) => setShowKey((s) => ({ ...s, [id]: !s[id] }));

  const copyKey = (id: string, key: string) => {
    navigator.clipboard.writeText(key);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  const maskKey = (key: string) => key.slice(0, 8) + "•".repeat(20) + key.slice(-4);

  const generateKey = async (name: string) => {
    if (!user) return;
    setGenerating(true);
    // Generate key client-side
    const arr = new Uint8Array(24);
    crypto.getRandomValues(arr);
    const hex = Array.from(arr).map(b => b.toString(16).padStart(2, '0')).join('');
    const key = `fs_live_${hex}`;

    const { error } = await supabase.from("api_keys").insert({ user_id: user.id, key, name });
    setGenerating(false);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "API key generated!" });
      fetchKeys();
    }
  };

  const revokeKey = async (id: string) => {
    await supabase.from("api_keys").update({ status: "revoked" }).eq("id", id);
    fetchKeys();
    toast({ title: "API key revoked" });
  };

  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "";
  const apiEndpoint = `${supabaseUrl}/functions/v1/check-order`;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">API Keys</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage your API keys for platform integrations</p>
        </div>
        <button onClick={() => generateKey("Production")} disabled={generating} className="flex items-center gap-2 px-4 py-2.5 gradient-primary text-primary-foreground rounded-lg text-sm font-medium hover:opacity-90 transition disabled:opacity-50">
          <Plus className="h-4 w-4" />
          {generating ? "Generating..." : "Generate Key"}
        </button>
      </div>

      <div className="gradient-card border border-border rounded-xl p-5">
        <h3 className="text-sm font-semibold text-foreground mb-2">API Endpoint</h3>
        <div className="bg-muted rounded-lg p-3 font-mono text-xs text-muted-foreground break-all">
          <span className="text-primary">POST</span> {apiEndpoint}
        </div>
        <p className="text-xs text-muted-foreground mt-2">Include your API key in the request body as the <code className="text-primary font-mono">"apiKey"</code> field.</p>
      </div>

      {loading ? (
        <div className="text-center py-8 text-muted-foreground">Loading keys...</div>
      ) : keys.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">No API keys yet. Generate your first key to get started.</div>
      ) : (
        <div className="space-y-3">
          {keys.map((apiKey) => (
            <div key={apiKey.id} className="gradient-card border border-border rounded-xl p-5">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-semibold text-foreground">{apiKey.name}</h3>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${apiKey.status === "active" ? "bg-safe/15 text-safe" : "bg-muted text-muted-foreground"}`}>
                      {apiKey.status}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    <code className="text-xs font-mono text-muted-foreground bg-muted px-2 py-1 rounded break-all">
                      {showKey[apiKey.id] ? apiKey.key : maskKey(apiKey.key)}
                    </code>
                    <button onClick={() => toggleShow(apiKey.id)} className="p-1 rounded hover:bg-muted transition-colors text-muted-foreground">
                      {showKey[apiKey.id] ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                    </button>
                    <button onClick={() => copyKey(apiKey.id, apiKey.key)} className="p-1 rounded hover:bg-muted transition-colors text-muted-foreground">
                      {copied === apiKey.id ? <Check className="h-3.5 w-3.5 text-safe" /> : <Copy className="h-3.5 w-3.5" />}
                    </button>
                  </div>
                </div>
                <div className="flex gap-1.5">
                  {apiKey.status === "active" && (
                    <button onClick={() => revokeKey(apiKey.id)} className="p-2 rounded-lg hover:bg-muted transition-colors text-fraud" title="Revoke">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>
              <div className="flex gap-6 mt-3 text-xs text-muted-foreground">
                <span>Created: {new Date(apiKey.created_at).toLocaleDateString()}</span>
                {apiKey.last_used_at && <span>Last used: {new Date(apiKey.last_used_at).toLocaleDateString()}</span>}
                <span>Requests: {apiKey.usage_count.toLocaleString()}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="gradient-card border border-border rounded-xl p-5">
        <h3 className="text-sm font-semibold text-foreground mb-3">Quick Start</h3>
        <pre className="bg-muted rounded-lg p-4 text-xs font-mono text-muted-foreground overflow-x-auto">
{`curl -X POST ${apiEndpoint} \\
  -H "Content-Type: application/json" \\
  -d '{
    "apiKey": "your_api_key",
    "platform": "shopify",
    "email": "customer@email.com",
    "ip": "1.1.1.1",
    "country": "US",
    "amount": 250,
    "currency": "USD",
    "isNewCustomer": true
  }'`}
        </pre>
      </div>
    </div>
  );
};

export default ApiKeys;
