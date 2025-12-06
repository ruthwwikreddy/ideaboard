import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
    LogOut,
    User,
    Loader2,
    Home,
    ArrowLeft,
    CreditCard,
    Receipt,
    IndianRupee,
    Download,
    Filter,
    Calendar
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import type { Session, User as SupabaseUser } from "@supabase/supabase-js";
import { Helmet } from "react-helmet-async";

interface PaymentHistory {
    id: string;
    amount: number;
    currency: string;
    status: string;
    payment_method: string | null;
    razorpay_payment_id: string;
    created_at: string;
}

const PaymentHistory = () => {
    const navigate = useNavigate();
    const [session, setSession] = useState<Session | null>(null);
    const [user, setUser] = useState<SupabaseUser | null>(null);
    const [paymentHistory, setPaymentHistory] = useState<PaymentHistory[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<"all" | "captured" | "failed">("all");

    useEffect(() => {
        // Set up auth listener
        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
            setSession(session);
            setUser(session?.user ?? null);

            if (!session) {
                navigate("/auth");
            }
        });

        // Check for existing session
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session);
            setUser(session?.user ?? null);

            if (!session) {
                navigate("/auth");
            } else {
                fetchPaymentHistory();
            }
        });

        return () => subscription.unsubscribe();
    }, [navigate]);

    const fetchPaymentHistory = async () => {
        try {
            const { data, error } = await supabase
                .from("payment_history")
                .select("*")
                .order("created_at", { ascending: false });

            if (error) throw error;
            setPaymentHistory((data as unknown as PaymentHistory[]) || []);
        } catch (error: unknown) {
            console.error("Failed to load payment history:", error);
            toast.error("Failed to load payment history");
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = async () => {
        await supabase.auth.signOut();
        toast.success("Logged out successfully");
    };

    const getUserInitials = () => {
        if (!user?.email) return "U";
        return user.email.charAt(0).toUpperCase();
    };

    const filteredPayments = paymentHistory.filter(payment => {
        if (filter === "all") return true;
        return payment.status === filter;
    });

    const totalAmount = filteredPayments.reduce((sum, payment) => {
        if (payment.status === "captured") {
            return sum + payment.amount;
        }
        return sum;
    }, 0);

    const successfulPayments = paymentHistory.filter(p => p.status === "captured").length;
    const failedPayments = paymentHistory.filter(p => p.status === "failed").length;

    if (loading) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="text-center">
                    <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
                    <p className="text-muted-foreground">Loading payment history...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background">
            <Helmet>
                <title>Payment History - IdeaBoard AI</title>
                <meta name="description" content="View your complete payment history and transaction details." />
                <meta name="robots" content="noindex, nofollow" />
            </Helmet>

            {/* Header */}
            <header className="sticky top-0 z-50 backdrop-blur-xl bg-background/80 border-b border-border/50">
                <div className="container mx-auto px-6">
                    <div className="flex items-center justify-between h-16">
                        {/* Logo & Navigation */}
                        <div className="flex items-center gap-8">
                            <div
                                className="flex items-center gap-3 cursor-pointer group"
                                onClick={() => navigate("/")}
                            >
                                <div className="relative">
                                    <img src="/logo.png" alt="IdeaBoard" className="w-8 h-8 transition-transform group-hover:scale-110" />
                                    <div className="absolute inset-0 blur-lg bg-primary/30 group-hover:bg-primary/50 transition-all"></div>
                                </div>
                                <span className="text-xl font-bold tracking-tight">IdeaBoard</span>
                            </div>

                            <nav className="hidden md:flex items-center gap-1">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="text-muted-foreground hover:text-foreground hover:bg-secondary/50"
                                    onClick={() => navigate("/dashboard")}
                                >
                                    <Home className="w-4 h-4 mr-2" />
                                    Dashboard
                                </Button>
                            </nav>
                        </div>

                        {/* User Section */}
                        <div className="flex items-center gap-3">
                            <div className="hidden sm:flex items-center gap-3 px-3 py-1.5 rounded-full bg-secondary/50 border border-border/50">
                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center text-primary-foreground font-semibold text-sm">
                                    {getUserInitials()}
                                </div>
                                <div className="text-sm">
                                    <div className="font-medium line-clamp-1 max-w-[120px]">
                                        {user?.email?.split('@')[0] || 'User'}
                                    </div>
                                </div>
                            </div>

                            <Button
                                onClick={() => navigate("/profile")}
                                variant="ghost"
                                size="sm"
                                className="hidden sm:flex hover:bg-secondary/50"
                            >
                                <User className="h-4 w-4" />
                            </Button>

                            <Button
                                onClick={handleLogout}
                                variant="ghost"
                                size="sm"
                                className="hover:bg-destructive/10 hover:text-destructive"
                            >
                                <LogOut className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                </div>
            </header>

            <main className="container mx-auto px-6 py-8 max-w-6xl">
                {/* Back Button */}
                <Button
                    variant="ghost"
                    size="sm"
                    className="mb-6 hover:bg-secondary"
                    onClick={() => navigate("/dashboard")}
                >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Dashboard
                </Button>

                {/* Hero Section */}
                <div className="mb-8">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                            <Receipt className="w-6 h-6 text-primary" />
                        </div>
                        <h1 className="text-4xl md:text-5xl font-bold tracking-tight">Payment History</h1>
                    </div>
                    <p className="text-xl text-muted-foreground ml-15">
                        View all your transactions and payment details
                    </p>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
                    <Card className="border-border bg-gradient-to-br from-card via-card to-primary/5">
                        <CardContent className="p-6">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                                    <IndianRupee className="w-5 h-5 text-primary" />
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground font-medium">Total Spent</p>
                                    <p className="text-2xl font-bold">₹{(totalAmount / 100).toFixed(0)}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-border bg-gradient-to-br from-card via-card to-green-500/5">
                        <CardContent className="p-6">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center">
                                    <CreditCard className="w-5 h-5 text-green-500" />
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground font-medium">Successful</p>
                                    <p className="text-2xl font-bold text-green-500">{successfulPayments}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-border bg-gradient-to-br from-card via-card to-destructive/5">
                        <CardContent className="p-6">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="w-10 h-10 rounded-lg bg-destructive/10 flex items-center justify-center">
                                    <CreditCard className="w-5 h-5 text-destructive" />
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground font-medium">Failed</p>
                                    <p className="text-2xl font-bold text-destructive">{failedPayments}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Filter Buttons */}
                <div className="flex items-center gap-3 mb-6">
                    <Filter className="w-4 h-4 text-muted-foreground" />
                    <div className="flex gap-2">
                        <Button
                            variant={filter === "all" ? "default" : "outline"}
                            size="sm"
                            onClick={() => setFilter("all")}
                        >
                            All ({paymentHistory.length})
                        </Button>
                        <Button
                            variant={filter === "captured" ? "default" : "outline"}
                            size="sm"
                            onClick={() => setFilter("captured")}
                        >
                            Successful ({successfulPayments})
                        </Button>
                        <Button
                            variant={filter === "failed" ? "default" : "outline"}
                            size="sm"
                            onClick={() => setFilter("failed")}
                        >
                            Failed ({failedPayments})
                        </Button>
                    </div>
                </div>

                {/* Payment History List */}
                {filteredPayments.length === 0 ? (
                    <Card className="border-border">
                        <CardContent className="p-16 text-center">
                            <div className="flex flex-col items-center gap-4">
                                <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center">
                                    <Receipt className="w-8 h-8 text-primary" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-semibold mb-2">No payments found</h3>
                                    <p className="text-muted-foreground">
                                        {filter === "all"
                                            ? "You haven't made any payments yet."
                                            : `No ${filter} payments found.`
                                        }
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ) : (
                    <Card className="border-border">
                        <CardContent className="p-0">
                            <div className="divide-y divide-border">
                                {filteredPayments.map((payment) => (
                                    <div
                                        key={payment.id}
                                        className="flex items-center justify-between p-6 hover:bg-secondary/30 transition-colors"
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${payment.status === "captured"
                                                    ? "bg-green-500/10"
                                                    : "bg-destructive/10"
                                                }`}>
                                                <CreditCard className={`w-6 h-6 ${payment.status === "captured"
                                                        ? "text-green-500"
                                                        : "text-destructive"
                                                    }`} />
                                            </div>
                                            <div>
                                                <div className="font-semibold flex items-center gap-3 mb-1">
                                                    <div className="flex items-center gap-1">
                                                        <IndianRupee className="w-4 h-4" />
                                                        <span className="text-lg">{(payment.amount / 100).toFixed(0)}</span>
                                                    </div>
                                                    <Badge
                                                        variant={payment.status === "captured" ? "default" : payment.status === "failed" ? "destructive" : "secondary"}
                                                        className="text-xs"
                                                    >
                                                        {payment.status}
                                                    </Badge>
                                                </div>
                                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                    <Calendar className="w-3 h-3" />
                                                    {new Date(payment.created_at).toLocaleDateString("en-US", {
                                                        year: "numeric",
                                                        month: "long",
                                                        day: "numeric",
                                                        hour: "2-digit",
                                                        minute: "2-digit"
                                                    })}
                                                </div>
                                                {payment.payment_method && (
                                                    <p className="text-xs text-muted-foreground mt-1">
                                                        Method: {payment.payment_method}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-xs text-muted-foreground font-mono mb-2">
                                                ID: {payment.razorpay_payment_id.slice(0, 20)}...
                                            </p>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="text-xs"
                                                onClick={() => {
                                                    navigator.clipboard.writeText(payment.razorpay_payment_id);
                                                    toast.success("Payment ID copied!");
                                                }}
                                            >
                                                <Download className="w-3 h-3 mr-1" />
                                                Copy ID
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                )}
            </main>
        </div>
    );
};

export default PaymentHistory;
