import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Globe, Mail, MapPin, DollarSign, Clock, User } from "lucide-react";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { RiskScoreGauge } from "@/components/shared/RiskScoreGauge";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";
import type { Database } from "@/integrations/supabase/types";

type Order = Database["public"]["Tables"]["orders"]["Row"];

const OrderDetail = () => {
  const { id } = useParams();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      const { data } = await supabase.from("orders").select("*").eq("id", id!).single();
      setOrder(data);
      setLoading(false);
    };
    fetch();
  }, [id]);

  if (loading) {
    return <div className="py-20 text-center text-muted-foreground">Loading...</div>;
  }

  if (!order) {
    return (
      <div className="text-center py-20">
        <p className="text-muted-foreground">Order not found</p>
        <Link to="/orders" className="text-primary hover:underline text-sm mt-2 inline-block">← Back to orders</Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link to="/orders" className="p-2 rounded-lg hover:bg-muted transition-colors">
          <ArrowLeft className="h-4 w-4 text-muted-foreground" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-3">
            {order.order_ref}
            <StatusBadge status={order.status} />
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">{new Date(order.created_at).toLocaleString()}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="gradient-card border border-border rounded-xl p-6 flex flex-col items-center justify-center">
          <p className="text-sm text-muted-foreground mb-3">Risk Score</p>
          <RiskScoreGauge score={order.risk_score} />
          <p className="text-sm font-medium text-foreground mt-3 capitalize">{order.status}</p>
        </div>

        <div className="gradient-card border border-border rounded-xl p-6 space-y-4">
          <h3 className="text-sm font-semibold text-foreground">Order Details</h3>
          <div className="space-y-3">
            {[
              { icon: Mail, label: "Email", value: order.email },
              { icon: Globe, label: "IP Address", value: order.ip || "N/A" },
              { icon: MapPin, label: "Country", value: order.country || "N/A" },
              { icon: DollarSign, label: "Amount", value: `$${Number(order.amount).toFixed(2)} ${order.currency}` },
              { icon: User, label: "New Customer", value: order.is_new_customer ? "Yes" : "No" },
              { icon: Clock, label: "Platform", value: order.platform },
            ].map((item) => (
              <div key={item.label} className="flex items-center gap-3">
                <item.icon className="h-4 w-4 text-muted-foreground shrink-0" />
                <span className="text-xs text-muted-foreground w-24">{item.label}</span>
                <span className="text-sm text-foreground">{item.value}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="gradient-card border border-border rounded-xl p-6">
          <h3 className="text-sm font-semibold text-foreground mb-4">Risk Factors</h3>
          {order.reasons && order.reasons.length > 0 ? (
            <div className="space-y-2">
              {order.reasons.map((reason, i) => (
                <div key={i} className="flex items-center gap-2 bg-fraud/5 border border-fraud/10 rounded-lg px-3 py-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-fraud shrink-0" />
                  <span className="text-sm text-foreground">{reason}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No risk factors detected. This order appears safe.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default OrderDetail;
