import { useState, useEffect } from "react";
import { Search } from "lucide-react";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

type Order = Database["public"]["Tables"]["orders"]["Row"];
type RiskStatus = Database["public"]["Enums"]["risk_status"];

const Orders = () => {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<RiskStatus | "all">("all");
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      const { data } = await supabase
        .from("orders")
        .select("*")
        .order("created_at", { ascending: false });
      setOrders(data || []);
      setLoading(false);
    };
    fetchOrders();
  }, []);

  const filtered = orders.filter((o) => {
    const matchSearch = o.email.toLowerCase().includes(search.toLowerCase()) || o.order_ref.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "all" || o.status === statusFilter;
    return matchSearch && matchStatus;
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Orders</h1>
        <p className="text-sm text-muted-foreground mt-1">All processed orders with risk analysis</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input className="w-full pl-9 pr-4 py-2.5 bg-muted border border-border rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary" placeholder="Search by email or order ID..." value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <div className="flex gap-2">
          {(["all", "safe", "risky", "fraud"] as const).map((s) => (
            <button key={s} onClick={() => setStatusFilter(s)} className={`px-3 py-2 rounded-lg text-xs font-medium transition-colors border ${statusFilter === s ? "bg-primary/10 text-primary border-primary/30" : "bg-muted text-muted-foreground border-border hover:bg-accent"}`}>
              {s === "all" ? "All" : s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div className="gradient-card border border-border rounded-xl overflow-hidden">
        {loading ? (
          <div className="py-12 text-center text-muted-foreground">Loading orders...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  <th className="text-left px-5 py-3 font-medium text-muted-foreground">Order</th>
                  <th className="text-left px-5 py-3 font-medium text-muted-foreground">Email</th>
                  <th className="text-left px-5 py-3 font-medium text-muted-foreground">Country</th>
                  <th className="text-left px-5 py-3 font-medium text-muted-foreground">Amount</th>
                  <th className="text-left px-5 py-3 font-medium text-muted-foreground">Score</th>
                  <th className="text-left px-5 py-3 font-medium text-muted-foreground">Status</th>
                  <th className="text-left px-5 py-3 font-medium text-muted-foreground">Platform</th>
                  <th className="text-left px-5 py-3 font-medium text-muted-foreground">Date</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((order) => (
                  <tr key={order.id} className="border-b border-border/40 hover:bg-muted/20 transition-colors">
                    <td className="px-5 py-3.5">
                      <Link to={`/orders/${order.id}`} className="font-mono text-xs text-primary hover:underline">{order.order_ref}</Link>
                    </td>
                    <td className="px-5 py-3.5 text-muted-foreground">{order.email}</td>
                    <td className="px-5 py-3.5 text-muted-foreground">{order.country}</td>
                    <td className="px-5 py-3.5 text-foreground font-medium">${Number(order.amount).toFixed(2)}</td>
                    <td className="px-5 py-3.5">
                      <span className={`font-mono font-bold ${order.risk_score <= 30 ? "text-safe" : order.risk_score <= 60 ? "text-risky" : "text-fraud"}`}>
                        {order.risk_score}
                      </span>
                    </td>
                    <td className="px-5 py-3.5"><StatusBadge status={order.status} /></td>
                    <td className="px-5 py-3.5 text-muted-foreground capitalize text-xs">{order.platform}</td>
                    <td className="px-5 py-3.5 text-muted-foreground text-xs">{new Date(order.created_at).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {!loading && filtered.length === 0 && (
          <div className="py-12 text-center text-muted-foreground">No orders found</div>
        )}
      </div>
    </div>
  );
};

export default Orders;
