import { useEffect, useState } from "react";
import { Users, Activity, Ban, Eye, Search, ShieldCheck, ShieldX, AlertTriangle, Loader2 } from "lucide-react";
import { StatCard } from "@/components/shared/StatCard";
import { apiClient } from "@/api/client";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";

const AdminPanel = () => {
  const { user, session } = useAuth();
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [users, setUsers] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Redirect if not admin
    if (!user || user.role !== 'admin') {
      navigate('/dashboard');
      return;
    }

    const fetchAdminData = async () => {
      try {
        setLoading(true);
        const token = session?.access_token;
        if (!token) return;

        // Fetch all admin data in parallel
        const [usersRes, statsRes, logsRes] = await Promise.all([
          apiClient.getAdminUsers(token),
          apiClient.getSystemStats(token),
          apiClient.getAuditLogs(token, 50, 0)
        ]);

        setUsers(usersRes.users || []);
        setStats(statsRes);
        setAuditLogs(logsRes.logs || []);
      } catch (err: any) {
        setError(err.message);
        console.error('Failed to load admin data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAdminData();
  }, [user, session, navigate]);

  const filtered = users.filter((u) => u.email?.toLowerCase().includes(search.toLowerCase()));

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Admin Panel</h1>
          <p className="text-sm text-muted-foreground mt-1">System overview and user management</p>
        </div>
        <div className="flex items-center justify-center h-96">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Admin Panel</h1>
          <p className="text-sm text-muted-foreground mt-1">System overview and user management</p>
        </div>
        <div className="p-4 bg-fraud/10 border border-fraud text-fraud rounded-lg">
          <p>Error loading admin data: {error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Admin Panel</h1>
        <p className="text-sm text-muted-foreground mt-1">System overview and user management</p>
      </div>

      {/* Admin stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Users" value={stats?.totalUsers?.toLocaleString() || "0"} changeType="positive" icon={Users} />
        <StatCard title="Total Orders" value={stats?.totalOrders?.toLocaleString() || "0"} icon={Activity} />
        <StatCard title="Total Revenue" value={`$${(stats?.totalRevenue || 0).toLocaleString()}`} changeType="positive" icon={ShieldCheck} />
        <StatCard title="Fraud Detection Rate" value={`${(stats?.fraudDetectionRate || 0).toFixed(1)}%`} icon={ShieldX} iconColor="text-fraud" />
      </div>

      {/* System logs */}
      <div className="gradient-card border border-border rounded-xl p-5">
        <h3 className="text-sm font-semibold text-foreground mb-3">Recent Audit Logs</h3>
        <div className="space-y-2">
          {auditLogs.slice(0, 5).map((log, i) => (
            <div key={i} className="flex items-center gap-3 text-xs py-2 border-b border-border/30 last:border-0">
              <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                log.action?.includes('fraud') ? "bg-fraud" : log.action?.includes('block') ? "bg-risky" : "bg-safe"
              }`} />
              <span className="text-muted-foreground w-20 shrink-0">
                {new Date(log.created_at).toLocaleTimeString()}
              </span>
              <span className="text-foreground">{log.action}: {log.resource} {log.resource_id}</span>
            </div>
          ))}
          {auditLogs.length === 0 && (
            <p className="text-muted-foreground text-xs py-2">No audit logs yet</p>
          )}
        </div>
      </div>

      {/* Users table */}
      <div className="gradient-card border border-border rounded-xl p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-foreground">All Users ({users.length})</h3>
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <input
              className="w-full pl-9 pr-4 py-2 bg-muted border border-border rounded-lg text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              placeholder="Search users..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-muted-foreground">
                <th className="text-left py-2.5 font-medium">Email</th>
                <th className="text-left py-2.5 font-medium">Company</th>
                <th className="text-left py-2.5 font-medium">Plan</th>
                <th className="text-left py-2.5 font-medium">Status</th>
                <th className="text-left py-2.5 font-medium">Joined</th>
                <th className="text-left py-2.5 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length > 0 ? filtered.map((user) => (
                <tr key={user.id} className="border-b border-border/40 hover:bg-muted/20">
                  <td className="py-3 text-foreground">{user.email}</td>
                  <td className="py-3 text-muted-foreground text-xs">{user.company || "—"}</td>
                  <td className="py-3">
                    <span className="text-xs px-2 py-0.5 bg-primary/10 text-primary rounded-full font-medium">{user.plan}</span>
                  </td>
                  <td className="py-3">
                    <span className={`text-xs font-medium ${user.status === "active" ? "text-safe" : "text-fraud"}`}>
                      {user.status}
                    </span>
                  </td>
                  <td className="py-3 text-muted-foreground text-xs">
                    {new Date(user.createdAt || user.created_at).toLocaleDateString()}
                  </td>
                  <td className="py-3 flex gap-1">
                    <button 
                      onClick={() => navigate(`/admin/users/${user.id}`)}
                      className="p-1.5 rounded hover:bg-muted text-muted-foreground"
                    >
                      <Eye className="h-3.5 w-3.5" />
                    </button>
                    <button className="p-1.5 rounded hover:bg-muted text-fraud">
                      <Ban className="h-3.5 w-3.5" />
                    </button>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={6} className="py-4 text-center text-muted-foreground">
                    No users found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;
