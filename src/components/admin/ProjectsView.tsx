import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, FolderOpen, Eye, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface Project {
  id: string;
  idea: string;
  platform: string | null;
  created_at: string;
  user_id: string;
  user_email?: string;
  user_name?: string;
}

const ProjectsView = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    setLoading(true);
    try {
      const { data: projectsData, error } = await supabase
        .from("projects")
        .select("id, idea, platform, created_at, user_id")
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Fetch user info for each project
      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, email, full_name");

      const projectsWithUsers = projectsData?.map(project => {
        const profile = profiles?.find(p => p.id === project.user_id);
        return {
          ...project,
          user_email: profile?.email || "Unknown",
          user_name: profile?.full_name || "Unknown",
        };
      }) || [];

      setProjects(projectsWithUsers);
    } catch (error) {
      console.error("Error fetching projects:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredProjects = projects.filter(project =>
    project.idea.toLowerCase().includes(searchTerm.toLowerCase()) ||
    project.user_email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    project.platform?.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FolderOpen className="w-5 h-5" />
            All Projects ({projects.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 mb-6">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search by idea, email, or platform..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-4 font-semibold">Idea</th>
                  <th className="text-left py-3 px-4 font-semibold">User</th>
                  <th className="text-left py-3 px-4 font-semibold">Platform</th>
                  <th className="text-left py-3 px-4 font-semibold">Date</th>
                  <th className="text-left py-3 px-4 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredProjects.map((project) => (
                  <tr key={project.id} className="border-b border-border/50 hover:bg-secondary/30">
                    <td className="py-3 px-4 max-w-[300px] truncate">{project.idea}</td>
                    <td className="py-3 px-4 text-muted-foreground text-sm">
                      <div>{project.user_name}</div>
                      <div className="text-xs">{project.user_email}</div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-1 bg-primary/10 rounded text-xs">
                        {project.platform || "Not selected"}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-sm text-muted-foreground">
                      {new Date(project.created_at || "").toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setSelectedProject(project)}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={!!selectedProject} onOpenChange={() => setSelectedProject(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Project Details</DialogTitle>
          </DialogHeader>
          {selectedProject && (
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Idea</label>
                <p className="mt-1">{selectedProject.idea}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">User</label>
                  <p className="mt-1">{selectedProject.user_name}</p>
                  <p className="text-sm text-muted-foreground">{selectedProject.user_email}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Platform</label>
                  <p className="mt-1">{selectedProject.platform || "Not selected"}</p>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Created</label>
                <p className="mt-1">{new Date(selectedProject.created_at || "").toLocaleString()}</p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ProjectsView;