import { useEffect, useState } from "react";
import { ShoppingCart, ShieldCheck, AlertTriangle, ShieldX, Activity, DollarSign, BarChart3 } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { StatCard } from "@/components/shared/StatCard";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

type Order = Database["public"]["Tables"]["orders"]["Row"];

const Dashboard = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const { data } = await supabase.from("orders").select("*").order("created_at", { ascending: false });
      setOrders(data || []);
      setLoading(false);
    };
    fetchData();
  }, []);

  const totalOrders = orders.length;
  const safeOrders = orders.filter(o => o.status === "safe").length;
  const riskyOrders = orders.filter(o => o.status === "risky").length;
  const fraudOrders = orders.filter(o => o.status === "fraud").length;
  const avgScore = totalOrders > 0 ? Math.round(orders.reduce((sum, o) => sum + o.risk_score, 0) / totalOrders) : 0;
  const blockedAmount = orders.filter(o => o.status === "fraud").reduce((sum, o) => sum + Number(o.amount), 0);

  const pieData = [
    { name: "Safe", value: safeOrders || 1, color: "hsl(160, 84%, 39%)" },
    { name: "Risky", value: riskyOrders || 0, color: "hsl(38, 92%, 50%)" },
    { name: "Fraud", value: fraudOrders || 0, color: "hsl(0, 72%, 51%)" },
  ];

  // Group orders by date for chart
  const chartMap = new Map<string, { safe: number; risky: number; fraud: number }>();
  orders.forEach(o => {
    const date = new Date(o.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric" });
    const entry = chartMap.get(date) || { safe: 0, risky: 0, fraud: 0 };
    entry[o.status]++;
    chartMap.set(date, entry);
  });
  const chartData = Array.from(chartMap.entries()).map(([date, counts]) => ({ date, ...counts })).reverse();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-1">Real-time fraud detection overview</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Orders" value={totalOrders.toLocaleString()} icon={ShoppingCart} />
        <StatCard title="Safe Orders" value={safeOrders.toLocaleString()} change={totalOrders > 0 ? `${((safeOrders/totalOrders)*100).toFixed(1)}% of total` : undefined} changeType="positive" icon={ShieldCheck} iconColor="text-safe" />
        <StatCard title="Risky Orders" value={riskyOrders.toLocaleString()} change={totalOrders > 0 ? `${((riskyOrders/totalOrders)*100).toFixed(1)}% of total` : undefined} changeType="neutral" icon={AlertTriangle} iconColor="text-risky" />
        <StatCard title="Fraud Detected" value={fraudOrders.toLocaleString()} icon={ShieldX} iconColor="text-fraud" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 gradient-card border border-border rounded-xl p-5">
          <h3 className="text-sm font-semibold text-foreground mb-4">Order Risk Trend</h3>
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={260}>
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorSafe" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(160, 84%, 39%)" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="hsl(160, 84%, 39%)" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorRisky" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(38, 92%, 50%)" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="hsl(38, 92%, 50%)" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorFraud" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(0, 72%, 51%)" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="hsl(0, 72%, 51%)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 14%, 16%)" />
                <XAxis dataKey="date" tick={{ fill: "hsl(215, 12%, 50%)", fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "hsl(215, 12%, 50%)", fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ backgroundColor: "hsl(220, 18%, 10%)", border: "1px solid hsl(220, 14%, 16%)", borderRadius: "8px", color: "hsl(210, 20%, 92%)" }} />
                <Area type="monotone" dataKey="safe" stroke="hsl(160, 84%, 39%)" fill="url(#colorSafe)" strokeWidth={2} />
                <Area type="monotone" dataKey="risky" stroke="hsl(38, 92%, 50%)" fill="url(#colorRisky)" strokeWidth={2} />
                <Area type="monotone" dataKey="fraud" stroke="hsl(0, 72%, 51%)" fill="url(#colorFraud)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[260px] flex items-center justify-center text-muted-foreground text-sm">
              {loading ? "Loading..." : "No order data yet. Use the API to check orders."}
            </div>
          )}
        </div>

        <div className="gradient-card border border-border rounded-xl p-5">
          <h3 className="text-sm font-semibold text-foreground mb-4">Risk Distribution</h3>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={pieData} cx="50%" cy="50%" innerRadius={55} outerRadius={80} paddingAngle={4} dataKey="value">
                {pieData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
              </Pie>
              <Tooltip contentStyle={{ backgroundColor: "hsl(220, 18%, 10%)", border: "1px solid hsl(220, 14%, 16%)", borderRadius: "8px", color: "hsl(210, 20%, 92%)" }} />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex justify-center gap-4 mt-2">
            {pieData.map((d) => (
              <div key={d.name} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: d.color }} />
                {d.name}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard title="Avg Risk Score" value={avgScore} icon={BarChart3} />
        <StatCard title="Blocked Amount" value={`$${blockedAmount.toLocaleString()}`} change="Prevented losses" changeType="positive" icon={DollarSign} />
        <StatCard title="Total Checks" value={totalOrders.toLocaleString()} icon={Activity} />
      </div>

      <div className="gradient-card border border-border rounded-xl p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-foreground">Recent Orders</h3>
          <Link to="/orders" className="text-xs text-primary hover:underline">View all →</Link>
        </div>
        {orders.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-muted-foreground">
                  <th className="text-left py-2.5 font-medium">Order</th>
                  <th className="text-left py-2.5 font-medium">Email</th>
                  <th className="text-left py-2.5 font-medium">Country</th>
                  <th className="text-left py-2.5 font-medium">Amount</th>
                  <th className="text-left py-2.5 font-medium">Score</th>
                  <th className="text-left py-2.5 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {orders.slice(0, 5).map((order) => (
                  <tr key={order.id} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                    <td className="py-3 font-mono text-xs text-foreground">{order.order_ref}</td>
                    <td className="py-3 text-muted-foreground">{order.email}</td>
                    <td className="py-3 text-muted-foreground">{order.country}</td>
                    <td className="py-3 text-foreground font-medium">${Number(order.amount).toFixed(2)}</td>
                    <td className="py-3">
                      <span className={`font-mono font-bold ${order.risk_score <= 30 ? "text-safe" : order.risk_score <= 60 ? "text-risky" : "text-fraud"}`}>
                        {order.risk_score}
                      </span>
                    </td>
                    <td className="py-3"><StatusBadge status={order.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-8 text-center text-muted-foreground text-sm">
            {loading ? "Loading..." : "No orders yet. Use the API to start checking orders."}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
