import { useState } from "react";
import { Loader2, ExternalLink, CheckCircle2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";

const Integrations = () => {
  const { user, session } = useAuth();
  const [loading, setLoading] = useState(false);
  const [connectedPlatforms, setConnectedPlatforms] = useState({
    shopify: false,
    woocommerce: false,
  });

  const handleShopifyConnect = async () => {
    setLoading(true);
    try {
      // Initialize Shopify OAuth flow
      const clientId = import.meta.env.VITE_SHOPIFY_APP_ID || "your_app_id";
      const redirectUri = `${window.location.origin}/auth/shopify/callback`;
      const scope = "write_orders,read_orders,write_products";
      const state = Math.random().toString(36).substring(7);

      const shopifyAuthUrl = `https://shopify.com/admin/oauth/authorize?client_id=${clientId}&scope=${scope}&redirect_uri=${redirectUri}&state=${state}`;

      // Store state in session for verification
      sessionStorage.setItem("shopify_oauth_state", state);

      window.location.href = shopifyAuthUrl;
    } catch (error) {
      console.error("Shopify connection error:", error);
      alert("Failed to initiate Shopify connection");
    } finally {
      setLoading(false);
    }
  };

  const handleWooCommerceConnect = async () => {
    setLoading(true);
    try {
      // Show WooCommerce setup guide
      alert(
        "WooCommerce Integration:\n\n1. Upload the fraudshield-woocommerce.php plugin to your WordPress site\n2. Activate the plugin\n3. Go to WooCommerce → Settings → FraudShield\n4. Enter your API Key\n5. Orders will be analyzed automatically\n\nPlugin file: /wordpress-plugin/fraudshield-woocommerce.php"
      );
    } catch (error) {
      console.error("WooCommerce setup error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Integrations</h1>
        <p className="text-muted-foreground mt-2">
          Connect FraudShield to your e-commerce platform
        </p>
      </div>

      {/* Integration Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Shopify Card */}
        <div className="gradient-card border border-border rounded-xl p-6 hover:border-primary/50 transition">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold text-foreground">Shopify</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Real-time fraud detection for Shopify stores
              </p>
            </div>
            {connectedPlatforms.shopify && (
              <CheckCircle2 className="h-5 w-5 text-green-500" />
            )}
          </div>

          <div className="space-y-3 mb-4">
            <div className="flex items-start gap-2">
              <AlertCircle className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
              <div className="text-sm text-muted-foreground">
                <p className="font-medium">What you get:</p>
                <ul className="list-disc list-inside mt-1 space-y-1">
                  <li>Automatic order analysis</li>
                  <li>Real-time fraud alerts</li>
                  <li>Custom webhook support</li>
                  <li>Dashboard analytics</li>
                </ul>
              </div>
            </div>
          </div>

          <Button
            onClick={handleShopifyConnect}
            disabled={loading || connectedPlatforms.shopify}
            className="w-full"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Connecting...
              </>
            ) : connectedPlatforms.shopify ? (
              <>
                <CheckCircle2 className="mr-2 h-4 w-4" />
                Connected
              </>
            ) : (
              <>
                <ExternalLink className="mr-2 h-4 w-4" />
                Connect Shopify
              </>
            )}
          </Button>
        </div>

        {/* WooCommerce Card */}
        <div className="gradient-card border border-border rounded-xl p-6 hover:border-primary/50 transition">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold text-foreground">
                WooCommerce
              </h3>
              <p className="text-sm text-muted-foreground mt-1">
                WordPress plugin for automatic fraud detection
              </p>
            </div>
            {connectedPlatforms.woocommerce && (
              <CheckCircle2 className="h-5 w-5 text-green-500" />
            )}
          </div>

          <div className="space-y-3 mb-4">
            <div className="flex items-start gap-2">
              <AlertCircle className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
              <div className="text-sm text-muted-foreground">
                <p className="font-medium">What you get:</p>
                <ul className="list-disc list-inside mt-1 space-y-1">
                  <li>Checkout page protection</li>
                  <li>Admin dashboard widget</li>
                  <li>Email notifications</li>
                  <li>Easy configuration</li>
                </ul>
              </div>
            </div>
          </div>

          <Button
            onClick={handleWooCommerceConnect}
            disabled={loading}
            className="w-full"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Setting up...
              </>
            ) : connectedPlatforms.woocommerce ? (
              <>
                <CheckCircle2 className="mr-2 h-4 w-4" />
                Configured
              </>
            ) : (
              <>
                <ExternalLink className="mr-2 h-4 w-4" />
                Setup WooCommerce
              </>
            )}
          </Button>
        </div>
      </div>

      {/* REST API Card */}
      <div className="gradient-card border border-border rounded-xl p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">
          REST API
        </h3>
        <p className="text-sm text-muted-foreground mb-4">
          Integrate FraudShield into your custom application
        </p>

        <div className="bg-muted rounded-lg p-4 mb-4 font-mono text-xs overflow-x-auto">
          <pre className="text-foreground">{`curl -X POST https://api.fraudshield.io/api/orders/analyze \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "orderAmount": 5000,
    "customerEmail": "buyer@example.com",
    "shippingAddress": "Dhaka, Bangladesh",
    "customerCountry": "BD"
  }'`}</pre>
        </div>

        <Button variant="outline" className="w-full">
          <ExternalLink className="mr-2 h-4 w-4" />
          View API Documentation
        </Button>
      </div>

      {/* Installation Guide */}
      <div className="gradient-card border border-border rounded-xl p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">
          Installation Guide
        </h3>

        <div className="space-y-4">
          <div>
            <h4 className="font-medium text-foreground mb-2">
              1. Shopify Integration
            </h4>
            <ol className="list-decimal list-inside text-sm text-muted-foreground space-y-1">
              <li>Click "Connect Shopify" button above</li>
              <li>Authorize the FraudShield app</li>
              <li>Webhooks will be registered automatically</li>
              <li>Start analyzing orders in real-time</li>
            </ol>
          </div>

          <hr className="border-border" />

          <div>
            <h4 className="font-medium text-foreground mb-2">
              2. WooCommerce Installation
            </h4>
            <ol className="list-decimal list-inside text-sm text-muted-foreground space-y-1">
              <li>Download fraudshield-woocommerce.php</li>
              <li>Upload to your WordPress /plugins folder</li>
              <li>Activate in WordPress admin</li>
              <li>Configure API key in plugin settings</li>
              <li>Orders analyzed automatically at checkout</li>
            </ol>
          </div>

          <hr className="border-border" />

          <div>
            <h4 className="font-medium text-foreground mb-2">
              3. Custom Integration (API)
            </h4>
            <ol className="list-decimal list-inside text-sm text-muted-foreground space-y-1">
              <li>Get your API key from the API Keys page</li>
              <li>Send order data to /api/orders/analyze endpoint</li>
              <li>Receive fraud score and recommendation</li>
              <li>Apply recommendations in your system</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Integrations;
