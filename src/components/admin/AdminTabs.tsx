import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Users, FolderOpen, CreditCard, Activity, Mail, Ticket, Shield } from "lucide-react";
import UserManagement from "./UserManagement";
import ProjectsView from "./ProjectsView";
import RevenueAnalytics from "./RevenueAnalytics";
import ActivityLogs from "./ActivityLogs";
import EmailUsers from "./EmailUsers";
import CouponCodes from "./CouponCodes";
import RoleManagement from "./RoleManagement";

interface UserData {
  id: string;
  email: string;
  full_name: string;
  generation_count: number;
  plan_id: string;
  status: string;
  created_at: string;
}

interface AdminTabsProps {
  users: UserData[];
  onRefresh: () => Promise<void>;
}

const AdminTabs = ({ users, onRefresh }: AdminTabsProps) => {
  return (
    <Tabs defaultValue="users" className="w-full">
      <TabsList className="grid w-full grid-cols-7 mb-6">
        <TabsTrigger value="users" className="gap-2">
          <Users className="w-4 h-4" />
          <span className="hidden sm:inline">Users</span>
        </TabsTrigger>
        <TabsTrigger value="projects" className="gap-2">
          <FolderOpen className="w-4 h-4" />
          <span className="hidden sm:inline">Projects</span>
        </TabsTrigger>
        <TabsTrigger value="revenue" className="gap-2">
          <CreditCard className="w-4 h-4" />
          <span className="hidden sm:inline">Revenue</span>
        </TabsTrigger>
        <TabsTrigger value="activity" className="gap-2">
          <Activity className="w-4 h-4" />
          <span className="hidden sm:inline">Activity</span>
        </TabsTrigger>
        <TabsTrigger value="email" className="gap-2">
          <Mail className="w-4 h-4" />
          <span className="hidden sm:inline">Email</span>
        </TabsTrigger>
        <TabsTrigger value="coupons" className="gap-2">
          <Ticket className="w-4 h-4" />
          <span className="hidden sm:inline">Coupons</span>
        </TabsTrigger>
        <TabsTrigger value="roles" className="gap-2">
          <Shield className="w-4 h-4" />
          <span className="hidden sm:inline">Roles</span>
        </TabsTrigger>
      </TabsList>

      <TabsContent value="users">
        <UserManagement users={users} onRefresh={onRefresh} />
      </TabsContent>
      
      <TabsContent value="projects">
        <ProjectsView />
      </TabsContent>
      
      <TabsContent value="revenue">
        <RevenueAnalytics />
      </TabsContent>
      
      <TabsContent value="activity">
        <ActivityLogs />
      </TabsContent>
      
      <TabsContent value="email">
        <EmailUsers users={users} />
      </TabsContent>
      
      <TabsContent value="coupons">
        <CouponCodes />
      </TabsContent>
      
      <TabsContent value="roles">
        <RoleManagement users={users} onRefresh={onRefresh} />
      </TabsContent>
    </Tabs>
  );
};

export default AdminTabs;