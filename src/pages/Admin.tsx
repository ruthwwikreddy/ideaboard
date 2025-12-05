import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Loader2, Shield, User, Search, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { Helmet } from "react-helmet-async";

interface UserData {
  id: string;
  email: string;
  full_name: string;
  generation_count: number;
  plan_id: string;
  status: string;
}

const ADMIN_EMAILS = ["anupthedesigner@gmail.com", "akkenapally.reddy@gmail.com"];

const Admin = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState<UserData[]>([]);
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

      // Check if user is admin
      if (!ADMIN_EMAILS.includes(session.user.email || "")) {
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
        .select("id, email, full_name, generation_count")
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
        };
      }) || [];

      setUsers(usersData);
    } catch (error) {
      console.error("Error fetching users:", error);
      toast.error("Failed to fetch users");
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
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-4 font-semibold">User</th>
                    <th className="text-left py-3 px-4 font-semibold">Email</th>
                    <th className="text-left py-3 px-4 font-semibold">Plan</th>
                    <th className="text-left py-3 px-4 font-semibold">Used</th>
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
                        <span className={user.generation_count > 0 ? "text-yellow-500" : "text-green-500"}>
                          {user.generation_count}
                        </span>
                        <span className="text-muted-foreground">
                          /{user.plan_id === "premium" ? 10 : user.plan_id === "basic" ? 5 : 1}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => resetUserCredits(user.id)}
                          disabled={updating === user.id}
                        >
                          {updating === user.id ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            "Reset Credits"
                          )}
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default Admin;
