import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Search, RefreshCw, Download, Ban, Trash2, User } from "lucide-react";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface UserData {
  id: string;
  email: string;
  full_name: string;
  generation_count: number;
  plan_id: string;
  status: string;
  created_at: string;
}

interface UserManagementProps {
  users: UserData[];
  onRefresh: () => Promise<void>;
}

const UserManagement = ({ users, onRefresh }: UserManagementProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [updating, setUpdating] = useState<string | null>(null);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<UserData | null>(null);

  const filteredUsers = users.filter(user =>
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.full_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleExport = () => {
    const headers = ["ID", "Name", "Email", "Plan", "Status", "Generations", "Created At"];
    const csvContent = [
      headers.join(","),
      ...users.map(u => [u.id, `"${u.full_name}"`, u.email, u.plan_id, u.status, u.generation_count, u.created_at].join(","))
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

  const updateUserPlan = async (userId: string, newPlanId: string) => {
    setUpdating(userId);
    try {
      const now = new Date();
      const periodEnd = new Date(now);
      periodEnd.setDate(periodEnd.getDate() + 365);

      const { data: existingSub } = await supabase
        .from("subscriptions")
        .select("id")
        .eq("user_id", userId)
        .maybeSingle();

      if (existingSub) {
        await supabase
          .from("subscriptions")
          .update({
            plan_id: newPlanId,
            status: "active",
            payment_method: "admin_granted",
            current_period_start: now.toISOString(),
            current_period_end: periodEnd.toISOString(),
          })
          .eq("user_id", userId);
      } else {
        await supabase
          .from("subscriptions")
          .insert({
            user_id: userId,
            plan_id: newPlanId,
            status: "active",
            payment_method: "admin_granted",
            current_period_start: now.toISOString(),
            current_period_end: periodEnd.toISOString(),
          });
      }

      await supabase
        .from("profiles")
        .update({ generation_count: 0, last_generation_reset: now.toISOString() })
        .eq("id", userId);

      toast.success("User plan updated!");
      await onRefresh();
    } catch (error) {
      toast.error("Failed to update plan");
    } finally {
      setUpdating(null);
    }
  };

  const resetUserCredits = async (userId: string) => {
    setUpdating(userId);
    try {
      await supabase
        .from("profiles")
        .update({ generation_count: 0, last_generation_reset: new Date().toISOString() })
        .eq("id", userId);

      toast.success("Credits reset!");
      await onRefresh();
    } catch (error) {
      toast.error("Failed to reset credits");
    } finally {
      setUpdating(null);
    }
  };

  const handleBan = async (userId: string, currentStatus: string) => {
    setUpdating(userId);
    try {
      const newStatus = currentStatus === 'suspended' ? 'active' : 'suspended';
      await supabase
        .from("subscriptions")
        .update({ status: newStatus })
        .eq("user_id", userId);

      toast.success(`User ${newStatus === 'suspended' ? 'suspended' : 'activated'}`);
      await onRefresh();
    } catch (error) {
      toast.error("Failed to update status");
    } finally {
      setUpdating(null);
    }
  };

  const handleDeleteUser = async () => {
    if (!userToDelete) return;
    
    setUpdating(userToDelete.id);
    try {
      // Delete user's projects
      await supabase.from("projects").delete().eq("user_id", userToDelete.id);
      // Delete user's subscriptions
      await supabase.from("subscriptions").delete().eq("user_id", userToDelete.id);
      // Delete user's payment history
      await supabase.from("payment_history").delete().eq("user_id", userToDelete.id);
      // Delete user's roles
      await supabase.from("user_roles").delete().eq("user_id", userToDelete.id);
      // Delete user's profile
      await supabase.from("profiles").delete().eq("id", userToDelete.id);

      toast.success("User deleted successfully");
      setDeleteDialogOpen(false);
      setUserToDelete(null);
      await onRefresh();
    } catch (error) {
      toast.error("Failed to delete user");
    } finally {
      setUpdating(null);
    }
  };

  // Bulk actions
  const handleBulkAction = async (action: 'reset' | 'suspend' | 'activate') => {
    if (selectedUsers.length === 0) {
      toast.error("No users selected");
      return;
    }

    try {
      for (const userId of selectedUsers) {
        if (action === 'reset') {
          await supabase
            .from("profiles")
            .update({ generation_count: 0, last_generation_reset: new Date().toISOString() })
            .eq("id", userId);
        } else {
          await supabase
            .from("subscriptions")
            .update({ status: action === 'suspend' ? 'suspended' : 'active' })
            .eq("user_id", userId);
        }
      }
      
      toast.success(`Bulk ${action} completed for ${selectedUsers.length} users`);
      setSelectedUsers([]);
      await onRefresh();
    } catch (error) {
      toast.error("Bulk action failed");
    }
  };

  const toggleSelectAll = () => {
    if (selectedUsers.length === filteredUsers.length) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(filteredUsers.map(u => u.id));
    }
  };

  const toggleSelectUser = (userId: string) => {
    setSelectedUsers(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="w-5 h-5" />
            User Management ({users.length} users)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap items-center gap-4 mb-6">
            <div className="relative flex-1 min-w-[200px] max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search by email or name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button onClick={onRefresh} variant="outline" size="icon">
              <RefreshCw className="w-4 h-4" />
            </Button>
            <Button onClick={handleExport} variant="outline" className="gap-2">
              <Download className="w-4 h-4" />
              Export
            </Button>
          </div>

          {selectedUsers.length > 0 && (
            <div className="flex items-center gap-2 mb-4 p-3 bg-secondary/50 rounded-lg">
              <span className="text-sm">{selectedUsers.length} selected</span>
              <Button size="sm" variant="outline" onClick={() => handleBulkAction('reset')}>
                Reset Credits
              </Button>
              <Button size="sm" variant="outline" onClick={() => handleBulkAction('suspend')}>
                Suspend All
              </Button>
              <Button size="sm" variant="outline" onClick={() => handleBulkAction('activate')}>
                Activate All
              </Button>
              <Button size="sm" variant="ghost" onClick={() => setSelectedUsers([])}>
                Clear
              </Button>
            </div>
          )}

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-4">
                    <Checkbox 
                      checked={selectedUsers.length === filteredUsers.length && filteredUsers.length > 0}
                      onCheckedChange={toggleSelectAll}
                    />
                  </th>
                  <th className="text-left py-3 px-4 font-semibold">User</th>
                  <th className="text-left py-3 px-4 font-semibold">Email</th>
                  <th className="text-left py-3 px-4 font-semibold">Plan</th>
                  <th className="text-left py-3 px-4 font-semibold">Credits Used</th>
                  <th className="text-left py-3 px-4 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="border-b border-border/50 hover:bg-secondary/30">
                    <td className="py-3 px-4">
                      <Checkbox 
                        checked={selectedUsers.includes(user.id)}
                        onCheckedChange={() => toggleSelectUser(user.id)}
                      />
                    </td>
                    <td className="py-3 px-4">{user.full_name}</td>
                    <td className="py-3 px-4 text-muted-foreground">{user.email}</td>
                    <td className="py-3 px-4">
                      <Select
                        value={user.plan_id}
                        onValueChange={(value) => updateUserPlan(user.id, value)}
                        disabled={updating === user.id}
                      >
                        <SelectTrigger className="w-28">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="free">Free</SelectItem>
                          <SelectItem value="basic">Basic</SelectItem>
                          <SelectItem value="premium">Premium</SelectItem>
                        </SelectContent>
                      </Select>
                    </td>
                    <td className="py-3 px-4">{user.generation_count}</td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => resetUserCredits(user.id)}
                          disabled={updating === user.id}
                          title="Reset Credits"
                        >
                          <RefreshCw className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleBan(user.id, user.status)}
                          disabled={updating === user.id}
                          className={user.status === 'suspended' ? "text-red-500" : ""}
                          title={user.status === 'suspended' ? "Activate" : "Suspend"}
                        >
                          <Ban className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => { setUserToDelete(user); setDeleteDialogOpen(true); }}
                          disabled={updating === user.id}
                          className="text-destructive hover:text-destructive"
                          title="Delete User"
                        >
                          <Trash2 className="w-4 h-4" />
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

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete User</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete <strong>{userToDelete?.email}</strong>? 
              This will permanently remove all their data including projects, subscriptions, and payment history.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteUser} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default UserManagement;