import { Star, Quote } from "lucide-react";

const stats = [
    {
        number: "1,200+",
        label: "Ideas Validated",
        description: "Entrepreneurs trust IdeaBoard",
    },
    {
        number: "40+",
        label: "Hours Saved",
        description: "Average time saved per project",
    },
    {
        number: "92%",
        label: "Success Rate",
        description: "Ideas find product-market fit",
    },
    {
        number: "4.8/5",
        label: "User Rating",
        description: "Based on 127+ reviews",
    },
];

const quickWins = [
    "✅ No credit card required to start",
    "✅ Get results in under 5 minutes",
    "✅ Export as PDF for investors",
    "✅ Compare multiple ideas side-by-side",
    "✅ Platform-specific build prompts",
    "✅ Monetization strategy included",
];

export const SocialProof = () => {
    return (
        <section className="py-20 bg-background">
            <div className="container mx-auto px-6">
                {/* Stats Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-16">
                    {stats.map((stat, index) => (
                        <div key={index} className="text-center">
                            <div className="text-4xl font-bold mb-2 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                                {stat.number}
                            </div>
                            <div className="text-lg font-semibold mb-1">{stat.label}</div>
                            <div className="text-sm text-muted-foreground">{stat.description}</div>
                        </div>
                    ))}
                </div>

                {/* Trust Section */}
                <div className="bg-secondary/50 rounded-2xl p-8 md:p-12 border border-border">
                    <div className="grid md:grid-cols-2 gap-12 items-center">
                        <div>
                            <div className="flex items-center gap-2 mb-4">
                                <Quote className="w-8 h-8 text-primary" />
                                <div className="flex gap-1">
                                    {[...Array(5)].map((_, i) => (
                                        <Star key={i} className="w-5 h-5 fill-yellow-500 text-yellow-500" />
                                    ))}
                                </div>
                            </div>
                            <h3 className="text-2xl font-bold mb-4">
                                Trusted by Builders Worldwide
                            </h3>
                            <p className="text-muted-foreground text-lg mb-6">
                                Join thousands of entrepreneurs, developers, and startup founders who use
                                IdeaBoard to validate their ideas and accelerate their journey from concept to launch.
                            </p>
                            <div className="flex items-center gap-3">
                                <div className="flex -space-x-3">
                                    {[...Array(4)].map((_, i) => (
                                        <div
                                            key={i}
                                            className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-accent border-2 border-background flex items-center justify-center text-sm font-semibold"
                                        >
                                            {String.fromCharCode(65 + i)}
                                        </div>
                                    ))}
                                </div>
                                <span className="text-sm text-muted-foreground">
                                    1,200+ active users this month
                                </span>
                            </div>
                        </div>
                        <div className="space-y-3">
                            {quickWins.map((win, index) => (
                                <div
                                    key={index}
                                    className="flex items-center gap-3 text-foreground py-2"
                                >
                                    <span className="text-lg">{win}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default SocialProof;
