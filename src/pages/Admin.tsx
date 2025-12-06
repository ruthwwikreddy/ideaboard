import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Loader2, Shield, User, Search, RefreshCw, Download, Ban, Activity, DollarSign, Users, TrendingUp, PieChart as PieChartIcon } from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  Legend
} from "recharts";
import { toast } from "sonner";
import { Helmet } from "react-helmet-async";

interface UserData {
  id: string;
  email: string;
  full_name: string;
  generation_count: number;
  plan_id: string;
  status: string;
  created_at: string;
}

const Admin = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState<UserData[]>([]);
  const [projectStats, setProjectStats] = useState<{ date: string; count: number }[]>([]);
  const [userGrowthStats, setUserGrowthStats] = useState<{ date: string; count: number }[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [updating, setUpdating] = useState<string | null>(null);

  useEffect(() => {
    checkAdminAndFetchUsers();
  }, []);

  const checkAdminAndFetchUsers = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        navigate("/auth");
        return;
      }

      // Check if user is admin using server-side role check
      const { data: roleData, error: roleError } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", session.user.id)
        .eq("role", "admin")
        .maybeSingle();

      if (roleError || !roleData) {
        toast.error("Access denied. Admin only.");
        navigate("/dashboard");
        return;
      }

      setIsAdmin(true);
      await fetchUsers();
    } catch (error) {
      console.error("Error:", error);
      toast.error("Failed to load admin panel");
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      // Fetch all profiles with their subscriptions using raw SQL via RPC or separate queries
      const { data: profiles, error: profilesError } = await supabase
        .from("profiles")
        .select("id, email, full_name, generation_count, created_at")
        .order("created_at", { ascending: false });

      if (profilesError) throw profilesError;

      // Fetch all subscriptions
      const { data: subscriptions, error: subsError } = await supabase
        .from("subscriptions")
        .select("user_id, plan_id, status");

      if (subsError) throw subsError;

      // Merge data
      const usersData = profiles?.map(profile => {
        const sub = subscriptions?.find(s => s.user_id === profile.id);
        return {
          id: profile.id,
          email: profile.email || "No email",
          full_name: profile.full_name || "No name",
          generation_count: profile.generation_count || 0,
          plan_id: sub?.plan_id || "free",
          status: sub?.status || "none",
          created_at: profile.created_at,
        };
      }) || [];

      // Fetch projects for analytics
      const { data: projects, error: projectsError } = await supabase
        .from("projects")
        .select("created_at");

      if (projectsError) throw projectsError;

      // Process User Growth (last 30 days)
      const last30Days = [...Array(30)].map((_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - i);
        return d.toISOString().split('T')[0];
      }).reverse();

      const userGrowth = last30Days.map(date => ({
        date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        count: profiles?.filter(p => p.created_at.startsWith(date)).length || 0
      }));

      // Process Project Growth
      const projectGrowth = last30Days.map(date => ({
        date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        count: projects?.filter(p => p.created_at.startsWith(date)).length || 0
      }));

      setUserGrowthStats(userGrowth);
      setProjectStats(projectGrowth);
      setUsers(usersData);
    } catch (error) {
      console.error("Error fetching users:", error);
      toast.error("Failed to fetch users");
    }
  };

  const planDistribution = [
    { name: 'Free', value: users.filter(u => u.plan_id === 'free').length, color: '#94a3b8' },
    { name: 'Basic', value: users.filter(u => u.plan_id === 'basic').length, color: '#3b82f6' },
    { name: 'Premium', value: users.filter(u => u.plan_id === 'premium').length, color: '#8b5cf6' },
  ].filter(item => item.value > 0);

  const stats = {
    totalUsers: users.length,
    activeSubs: users.filter(u => u.status === 'active' && u.plan_id !== 'free').length,
    totalGenerations: users.reduce((acc, u) => acc + (u.generation_count || 0), 0),
    mrr: users.reduce((acc, u) => {
      if (u.status !== 'active') return acc;
      if (u.plan_id === 'basic') return acc + 10;
      if (u.plan_id === 'premium') return acc + 15;
      return acc;
    }, 0)
  };

  const handleExport = () => {
    const headers = ["ID", "Name", "Email", "Plan", "Status", "Generations"];
    const csvContent = [
      headers.join(","),
      ...users.map(u => [u.id, `"${u.full_name}"`, u.email, u.plan_id, u.status, u.generation_count].join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `users-export-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
    toast.success("Exported user list to CSV");
  };

  const handleBan = async (userId: string, currentStatus: string) => {
    setUpdating(userId);
    try {
      const newStatus = currentStatus === 'suspended' ? 'active' : 'suspended';
      const { error } = await supabase
        .from("subscriptions")
        .update({ status: newStatus })
        .eq("user_id", userId);

      if (error) throw error;

      toast.success(`User ${newStatus === 'suspended' ? 'suspended' : 'activated'} successfully`);
      await fetchUsers();
    } catch (error) {
      console.error("Error updating status:", error);
      toast.error("Failed to update user status");
    } finally {
      setUpdating(null);
    }
  };



  const updateUserPlan = async (userId: string, newPlanId: string) => {
    setUpdating(userId);
    try {
      const now = new Date();
      const periodEnd = new Date(now);
      periodEnd.setDate(periodEnd.getDate() + 365);

      // Check if subscription exists
      const { data: existingSub } = await supabase
        .from("subscriptions")
        .select("id")
        .eq("user_id", userId)
        .maybeSingle();

      if (existingSub) {
        // Update existing
        const { error } = await supabase
          .from("subscriptions")
          .update({
            plan_id: newPlanId,
            status: "active",
            payment_method: "admin_granted",
            current_period_start: now.toISOString(),
            current_period_end: periodEnd.toISOString(),
          })
          .eq("user_id", userId);

        if (error) throw error;
      } else {
        // Insert new
        const { error } = await supabase
          .from("subscriptions")
          .insert({
            user_id: userId,
            plan_id: newPlanId,
            status: "active",
            payment_method: "admin_granted",
            current_period_start: now.toISOString(),
            current_period_end: periodEnd.toISOString(),
          });

        if (error) throw error;
      }

      // Reset generation count
      const { error: profileError } = await supabase
        .from("profiles")
        .update({ generation_count: 0, last_generation_reset: now.toISOString() })
        .eq("id", userId);

      if (profileError) throw profileError;

      toast.success("User plan updated successfully!");
      await fetchUsers();
    } catch (error) {
      console.error("Error updating plan:", error);
      toast.error("Failed to update user plan");
    } finally {
      setUpdating(null);
    }
  };

  const resetUserCredits = async (userId: string) => {
    setUpdating(userId);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({ generation_count: 0, last_generation_reset: new Date().toISOString() })
        .eq("id", userId);

      if (error) throw error;

      toast.success("Credits reset successfully!");
      await fetchUsers();
    } catch (error) {
      console.error("Error resetting credits:", error);
      toast.error("Failed to reset credits");
    } finally {
      setUpdating(null);
    }
  };

  const filteredUsers = users.filter(user =>
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.full_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>Admin Panel - IdeaBoard AI</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>

      <header className="border-b border-border">
        <div className="container mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Shield className="w-8 h-8 text-primary" />
              <h1 className="text-3xl font-bold tracking-tight">Admin Panel</h1>
            </div>
            <Button onClick={() => navigate("/dashboard")} variant="outline">
              Back to Dashboard
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8">
        {/* Analytics Dashboard */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Users</p>
                <h3 className="text-2xl font-bold mt-2">{stats.totalUsers}</h3>
              </div>
              <div className="p-3 bg-primary/10 rounded-full">
                <Users className="w-6 h-6 text-primary" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active Subs</p>
                <h3 className="text-2xl font-bold mt-2">{stats.activeSubs}</h3>
              </div>
              <div className="p-3 bg-green-500/10 rounded-full">
                <Activity className="w-6 h-6 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Ideas</p>
                <h3 className="text-2xl font-bold mt-2">{stats.totalGenerations}</h3>
              </div>
              <div className="p-3 bg-blue-500/10 rounded-full">
                <Shield className="w-6 h-6 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Est. MRR</p>
                <h3 className="text-2xl font-bold mt-2">₹{stats.mrr}</h3>
              </div>
              <div className="p-3 bg-yellow-500/10 rounded-full">
                <DollarSign className="w-6 h-6 text-yellow-500" />
              </div>
            </CardContent>
          </Card>
        </div>


        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <Card className="col-span-1">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-primary" />
                Growth Trends (Last 30 Days)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={userGrowthStats}>
                    <defs>
                      <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="colorIdeas" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="date" className="text-xs" />
                    <YAxis className="text-xs" />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #333' }}
                      itemStyle={{ color: '#fff' }}
                    />
                    <Area
                      type="monotone"
                      dataKey="count"
                      name="New Users"
                      stroke="#8b5cf6"
                      fillOpacity={1}
                      fill="url(#colorUsers)"
                      strokeWidth={2}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card className="col-span-1">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="w-5 h-5 text-primary" />
                Ideas Generated
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={projectStats}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="date" className="text-xs" />
                    <YAxis className="text-xs" />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #333' }}
                      itemStyle={{ color: '#fff' }}
                      cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                    />
                    <Bar dataKey="count" name="Ideas" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card className="col-span-1 lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PieChartIcon className="w-5 h-5 text-primary" />
                Subscription Distribution
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] w-full flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={planDistribution}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {planDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #333' }}
                      itemStyle={{ color: '#fff' }}
                    />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5" />
              User Management ({users.length} users)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4 mb-6">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search by email or name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button onClick={fetchUsers} variant="outline" size="icon">
                <RefreshCw className="w-4 h-4" />
              </Button>
              <Button onClick={handleExport} variant="outline" className="gap-2">
                <Download className="w-4 h-4" />
                Export CSV
              </Button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-4 font-semibold">User</th>
                    <th className="text-left py-3 px-4 font-semibold">Email</th>
                    <th className="text-left py-3 px-4 font-semibold">Plan</th>

                    <th className="text-left py-3 px-4 font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((user) => (
                    <tr key={user.id} className="border-b border-border/50 hover:bg-secondary/30">
                      <td className="py-3 px-4">{user.full_name}</td>
                      <td className="py-3 px-4 text-muted-foreground">{user.email}</td>
                      <td className="py-3 px-4">
                        <Select
                          value={user.plan_id}
                          onValueChange={(value) => updateUserPlan(user.id, value)}
                          disabled={updating === user.id}
                        >
                          <SelectTrigger className="w-32">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="free">Free</SelectItem>
                            <SelectItem value="basic">Basic</SelectItem>
                            <SelectItem value="premium">Premium</SelectItem>
                          </SelectContent>
                        </Select>
                      </td>

                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => resetUserCredits(user.id)}
                            disabled={updating === user.id}
                            title="Reset Credits"
                          >
                            <RefreshCw className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleBan(user.id, user.status)}
                            disabled={updating === user.id}
                            className={user.status === 'suspended' ? "text-red-500 border-red-200 hover:bg-red-50" : ""}
                            title={user.status === 'suspended' ? "Unsuspend User" : "Suspend User"}
                          >
                            <Ban className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </main >
    </div >
  );
};

export default Admin;
