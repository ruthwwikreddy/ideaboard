import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";

export const CTABanner = () => {
    const navigate = useNavigate();

    return (
        <section className="py-20 bg-gradient-to-br from-primary/10 via-accent/5 to-background">
            <div className="container mx-auto px-6">
                <div className="max-w-4xl mx-auto text-center">
                    <div className="inline-flex items-center gap-2 bg-primary/20 px-4 py-2 rounded-full mb-6">
                        <Sparkles className="w-4 h-4 text-primary" />
                        <span className="text-sm font-semibold">Free to Start • No Credit Card Required</span>
                    </div>

                    <h2 className="text-4xl md:text-5xl font-bold mb-6">
                        Ready to Validate Your Idea?
                    </h2>

                    <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
                        Join 1,200+ entrepreneurs who've saved 40+ hours of research and launched
                        successful products with IdeaBoard. Start building with confidence today.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                        <Button
                            onClick={() => document.getElementById("idea-panel")?.scrollIntoView({ behavior: "smooth" })}
                            size="lg"
                            className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold px-8 py-6 text-lg shadow-neon-cyan transition-all"
                        >
                            Get Started Free
                            <ArrowRight className="ml-2 h-5 w-5" />
                        </Button>

                        <Button
                            onClick={() => navigate("/pricing")}
                            size="lg"
                            variant="outline"
                            className="border-border hover:bg-secondary px-8 py-6 text-lg"
                        >
                            View Pricing
                        </Button>
                    </div>

                    <div className="mt-8 flex flex-wrap justify-center gap-6 text-sm text-muted-foreground">
                        <div className="flex items-center gap-2">
                            <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                            <span>Instant Results</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                            <span>No Commitment</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                            <span>Export to PDF</span>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default CTABanner;
