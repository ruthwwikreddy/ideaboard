import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, Shield, Users, Activity, DollarSign, TrendingUp } from "lucide-react";
import { toast } from "sonner";
import { Helmet } from "react-helmet-async";
import AdminTabs from "@/components/admin/AdminTabs";

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
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

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
      const { data: profiles, error: profilesError } = await supabase
        .from("profiles")
        .select("id, email, full_name, generation_count, created_at")
        .order("created_at", { ascending: false });

      if (profilesError) throw profilesError;

      const { data: subscriptions, error: subsError } = await supabase
        .from("subscriptions")
        .select("user_id, plan_id, status");

      if (subsError) throw subsError;

      const usersData = profiles?.map(profile => {
        const sub = subscriptions?.find(s => s.user_id === profile.id);
        return {
          id: profile.id,
          email: profile.email || "No email",
          full_name: profile.full_name || "No name",
          generation_count: profile.generation_count || 0,
          plan_id: sub?.plan_id || "free",
          status: sub?.status || "none",
          created_at: profile.created_at || "",
        };
      }) || [];

      setUsers(usersData);
    } catch (error) {
      console.error("Error fetching users:", error);
      toast.error("Failed to fetch users");
    }
  };

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

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAdmin) return null;

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
        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <Users className="w-5 h-5 text-primary" />
              <div>
                <p className="text-xs text-muted-foreground">Users</p>
                <p className="text-xl font-bold">{stats.totalUsers}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <Activity className="w-5 h-5 text-green-500" />
              <div>
                <p className="text-xs text-muted-foreground">Active Subs</p>
                <p className="text-xl font-bold">{stats.activeSubs}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <TrendingUp className="w-5 h-5 text-blue-500" />
              <div>
                <p className="text-xs text-muted-foreground">Ideas</p>
                <p className="text-xl font-bold">{stats.totalGenerations}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <DollarSign className="w-5 h-5 text-yellow-500" />
              <div>
                <p className="text-xs text-muted-foreground">MRR</p>
                <p className="text-xl font-bold">₹{stats.mrr}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <AdminTabs users={users} onRefresh={fetchUsers} />
      </main>
    </div>
  );
};

export default Admin;