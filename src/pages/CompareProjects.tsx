import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Helmet } from "react-helmet-async";

interface Research {
    name: string;
    problem: string;
    audience: string | any;
    competitors: Array<string | any>;
    marketGaps: string[];
    monetization: Array<string | any>;
    demandProbability: number;
}

interface Project {
    id: string;
    idea: string;
    platform: string | null;
    created_at: string;
    research: Research | null;
}

const CompareProjects = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const ids = searchParams.get("ids")?.split(",") || [];
        if (ids.length === 0) {
            toast.error("No projects selected for comparison");
            navigate("/dashboard");
            return;
        }
        fetchProjects(ids);
    }, [searchParams, navigate]);

    const fetchProjects = async (ids: string[]) => {
        try {
            const { data, error } = await supabase
                .from("projects")
                .select("*")
                .in("id", ids);

            if (error) throw error;
            setProjects((data as unknown as Project[]) || []);
        } catch (error: unknown) {
            console.error("Error fetching projects:", error);
            toast.error("Failed to load projects for comparison");
        } finally {
            setLoading(false);
        }
    };

    const renderCompetitors = (competitors: Array<string | any>) => {
        return (
            <ul className="list-disc list-inside space-y-1 text-sm">
                {competitors.map((comp, idx) => (
                    <li key={idx}>
                        {typeof comp === 'string' ? comp : comp.name}
                    </li>
                ))}
            </ul>
        );
    };

    const renderMonetization = (monetization: Array<string | any>) => {
        return (
            <ul className="list-disc list-inside space-y-1 text-sm">
                {monetization.map((mon, idx) => (
                    <li key={idx}>
                        {typeof mon === 'string' ? mon : mon.strategy}
                    </li>
                ))}
            </ul>
        );
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background">
            <Helmet>
                <title>Compare Projects - IdeaBoard AI</title>
            </Helmet>
            <header className="border-b border-border sticky top-0 bg-background/95 backdrop-blur z-10">
                <div className="container mx-auto px-6 py-4">
                    <div className="flex items-center gap-4">
                        <Button variant="ghost" onClick={() => navigate("/dashboard")}>
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back to Dashboard
                        </Button>
                        <h1 className="text-2xl font-bold">Compare Projects</h1>
                    </div>
                </div>
            </header>

            <main className="container mx-auto px-6 py-8 overflow-x-auto">
                <div className="min-w-max">
                    <div className="grid gap-6" style={{ gridTemplateColumns: `repeat(${projects.length}, minmax(300px, 1fr))` }}>
                        {projects.map((project) => (
                            <Card key={project.id} className="h-full flex flex-col">
                                <CardHeader>
                                    <CardTitle className="text-xl text-primary">
                                        {project.research?.name || "Untitled Project"}
                                    </CardTitle>
                                    <p className="text-sm text-muted-foreground line-clamp-2 h-10">
                                        {project.idea}
                                    </p>
                                </CardHeader>
                                <CardContent className="space-y-6 flex-1">
                                    <div>
                                        <h4 className="font-semibold mb-2 text-sm uppercase text-muted-foreground">Demand Probability</h4>
                                        <div className="text-2xl font-bold text-primary">
                                            {project.research?.demandProbability || 0}%
                                        </div>
                                    </div>

                                    <div>
                                        <h4 className="font-semibold mb-2 text-sm uppercase text-muted-foreground">Problem</h4>
                                        <p className="text-sm">{project.research?.problem}</p>
                                    </div>

                                    <div>
                                        <h4 className="font-semibold mb-2 text-sm uppercase text-muted-foreground">Target Audience</h4>
                                        <p className="text-sm">
                                            {typeof project.research?.audience === 'string'
                                                ? project.research?.audience
                                                : "Detailed audience analysis available"}
                                        </p>
                                    </div>

                                    <div>
                                        <h4 className="font-semibold mb-2 text-sm uppercase text-muted-foreground">Competitors</h4>
                                        {project.research?.competitors && renderCompetitors(project.research.competitors)}
                                    </div>

                                    <div>
                                        <h4 className="font-semibold mb-2 text-sm uppercase text-muted-foreground">Monetization</h4>
                                        {project.research?.monetization && renderMonetization(project.research.monetization)}
                                    </div>

                                    <div>
                                        <h4 className="font-semibold mb-2 text-sm uppercase text-muted-foreground">Market Gaps</h4>
                                        <ul className="list-disc list-inside space-y-1 text-sm">
                                            {project.research?.marketGaps.map((gap, idx) => (
                                                <li key={idx}>{gap}</li>
                                            ))}
                                        </ul>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            </main>
        </div>
    );
};

export default CompareProjects;
