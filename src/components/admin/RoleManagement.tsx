import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Shield, Search, UserPlus, Trash2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Database } from "@/integrations/supabase/types";

type AppRole = Database['public']['Enums']['app_role'];

interface UserRole {
  id: string;
  user_id: string;
  role: AppRole;
  created_at: string;
  user_email?: string;
  user_name?: string;
}

interface UserData {
  id: string;
  email: string;
  full_name: string;
}

interface RoleManagementProps {
  users: UserData[];
  onRefresh: () => Promise<void>;
}

const RoleManagement = ({ users, onRefresh }: RoleManagementProps) => {
  const [roles, setRoles] = useState<UserRole[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUser, setSelectedUser] = useState("");
  const [selectedRole, setSelectedRole] = useState<AppRole>("moderator");
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    fetchRoles();
  }, []);

  const fetchRoles = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("user_roles")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Fetch user info
      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, email, full_name");

      const rolesWithUsers = data?.map(role => ({
        ...role,
        user_email: profiles?.find(p => p.id === role.user_id)?.email || "Unknown",
        user_name: profiles?.find(p => p.id === role.user_id)?.full_name || "Unknown",
      })) || [];

      setRoles(rolesWithUsers);
    } catch (error) {
      console.error("Error fetching roles:", error);
    } finally {
      setLoading(false);
    }
  };

  const addRole = async () => {
    if (!selectedUser) {
      toast.error("Please select a user");
      return;
    }

    // Check if user already has this role
    if (roles.some(r => r.user_id === selectedUser && r.role === selectedRole)) {
      toast.error("User already has this role");
      return;
    }

    setAdding(true);
    try {
      const { error } = await supabase
        .from("user_roles")
        .insert({
          user_id: selectedUser,
          role: selectedRole,
        });

      if (error) throw error;

      toast.success("Role assigned successfully");
      setSelectedUser("");
      await fetchRoles();
      await onRefresh();
    } catch (error) {
      toast.error("Failed to assign role");
    } finally {
      setAdding(false);
    }
  };

  const removeRole = async (roleId: string) => {
    try {
      const { error } = await supabase
        .from("user_roles")
        .delete()
        .eq("id", roleId);

      if (error) throw error;

      toast.success("Role removed");
      await fetchRoles();
      await onRefresh();
    } catch (error) {
      toast.error("Failed to remove role");
    }
  };

  const filteredUsers = users.filter(user =>
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.full_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getRoleBadgeColor = (role: AppRole) => {
    switch (role) {
      case 'admin':
        return 'bg-red-500/10 text-red-500';
      case 'moderator':
        return 'bg-yellow-500/10 text-yellow-500';
      default:
        return 'bg-blue-500/10 text-blue-500';
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin" />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserPlus className="w-5 h-5" />
            Assign Role
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Search User</label>
            <Input
              placeholder="Search by email or name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {searchTerm && (
            <div className="max-h-[200px] overflow-y-auto border rounded-lg">
              {filteredUsers.length === 0 ? (
                <p className="p-3 text-sm text-muted-foreground">No users found</p>
              ) : (
                filteredUsers.slice(0, 10).map((user) => (
                  <button
                    key={user.id}
                    onClick={() => { setSelectedUser(user.id); setSearchTerm(""); }}
                    className={`w-full p-3 text-left hover:bg-secondary/50 border-b last:border-b-0 ${
                      selectedUser === user.id ? 'bg-primary/10' : ''
                    }`}
                  >
                    <p className="font-medium text-sm">{user.full_name}</p>
                    <p className="text-xs text-muted-foreground">{user.email}</p>
                  </button>
                ))
              )}
            </div>
          )}

          {selectedUser && (
            <div className="p-3 bg-secondary/50 rounded-lg">
              <p className="text-sm font-medium">Selected:</p>
              <p className="text-sm">{users.find(u => u.id === selectedUser)?.email}</p>
            </div>
          )}

          <div className="space-y-2">
            <label className="text-sm font-medium">Role</label>
            <Select value={selectedRole} onValueChange={(v) => setSelectedRole(v as AppRole)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="moderator">Moderator</SelectItem>
                <SelectItem value="user">User</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button 
            onClick={addRole} 
            disabled={adding || !selectedUser}
            className="w-full gap-2"
          >
            {adding ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <UserPlus className="w-4 h-4" />
            )}
            Assign Role
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Current Roles ({roles.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 max-h-[400px] overflow-y-auto">
            {roles.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">No roles assigned yet</p>
            ) : (
              roles.map((role) => (
                <div 
                  key={role.id} 
                  className="flex items-center justify-between p-3 rounded-lg bg-secondary/30"
                >
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{role.user_name}</p>
                    <p className="text-xs text-muted-foreground truncate">{role.user_email}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${getRoleBadgeColor(role.role)}`}>
                      {role.role}
                    </span>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => removeRole(role.id)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default RoleManagement;