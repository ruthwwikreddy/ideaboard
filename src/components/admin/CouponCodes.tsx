import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Ticket, Plus, Trash2, Loader2, Copy } from "lucide-react";
import { toast } from "sonner";

interface CouponCode {
  id: string;
  code: string;
  discount_percent: number;
  max_uses: number | null;
  current_uses: number;
  valid_from: string;
  valid_until: string | null;
  plan_restriction: string | null;
  is_active: boolean;
  created_at: string;
}

const CouponCodes = () => {
  const [coupons, setCoupons] = useState<CouponCode[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  
  // New coupon form
  const [newCode, setNewCode] = useState("");
  const [discountPercent, setDiscountPercent] = useState("10");
  const [maxUses, setMaxUses] = useState("");
  const [validUntil, setValidUntil] = useState("");
  const [planRestriction, setPlanRestriction] = useState("none");

  useEffect(() => {
    fetchCoupons();
  }, []);

  const fetchCoupons = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("coupon_codes")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setCoupons(data || []);
    } catch (error) {
      console.error("Error fetching coupons:", error);
    } finally {
      setLoading(false);
    }
  };

  const generateRandomCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 8; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setNewCode(code);
  };

  const createCoupon = async () => {
    if (!newCode.trim()) {
      toast.error("Please enter a coupon code");
      return;
    }

    setCreating(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { error } = await supabase
        .from("coupon_codes")
        .insert({
          code: newCode.toUpperCase(),
          discount_percent: parseInt(discountPercent),
          max_uses: maxUses ? parseInt(maxUses) : null,
          valid_until: validUntil || null,
          plan_restriction: planRestriction === 'none' ? null : planRestriction,
          created_by: user?.id,
        });

      if (error) throw error;

      toast.success("Coupon created!");
      setNewCode("");
      setDiscountPercent("10");
      setMaxUses("");
      setValidUntil("");
      setPlanRestriction("none");
      await fetchCoupons();
    } catch (error: any) {
      if (error.message.includes("duplicate")) {
        toast.error("Coupon code already exists");
      } else {
        toast.error("Failed to create coupon");
      }
    } finally {
      setCreating(false);
    }
  };

  const toggleCoupon = async (id: string, isActive: boolean) => {
    try {
      await supabase
        .from("coupon_codes")
        .update({ is_active: !isActive })
        .eq("id", id);

      await fetchCoupons();
      toast.success(`Coupon ${!isActive ? 'activated' : 'deactivated'}`);
    } catch (error) {
      toast.error("Failed to update coupon");
    }
  };

  const deleteCoupon = async (id: string) => {
    try {
      await supabase
        .from("coupon_codes")
        .delete()
        .eq("id", id);

      await fetchCoupons();
      toast.success("Coupon deleted");
    } catch (error) {
      toast.error("Failed to delete coupon");
    }
  };

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast.success("Code copied!");
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
            <Plus className="w-5 h-5" />
            Create Coupon
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Coupon Code</Label>
            <div className="flex gap-2">
              <Input
                placeholder="e.g., SAVE20"
                value={newCode}
                onChange={(e) => setNewCode(e.target.value.toUpperCase())}
              />
              <Button variant="outline" onClick={generateRandomCode}>
                Generate
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Discount Percentage</Label>
            <Select value={discountPercent} onValueChange={setDiscountPercent}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="10">10%</SelectItem>
                <SelectItem value="15">15%</SelectItem>
                <SelectItem value="20">20%</SelectItem>
                <SelectItem value="25">25%</SelectItem>
                <SelectItem value="30">30%</SelectItem>
                <SelectItem value="50">50%</SelectItem>
                <SelectItem value="100">100% (Free)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Max Uses (optional)</Label>
            <Input
              type="number"
              placeholder="Unlimited"
              value={maxUses}
              onChange={(e) => setMaxUses(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label>Valid Until (optional)</Label>
            <Input
              type="date"
              value={validUntil}
              onChange={(e) => setValidUntil(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label>Plan Restriction</Label>
            <Select value={planRestriction} onValueChange={setPlanRestriction}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">All Plans</SelectItem>
                <SelectItem value="basic">Basic Only</SelectItem>
                <SelectItem value="premium">Premium Only</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button 
            onClick={createCoupon} 
            disabled={creating}
            className="w-full gap-2"
          >
            {creating ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Plus className="w-4 h-4" />
            )}
            Create Coupon
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Ticket className="w-5 h-5" />
            Active Coupons ({coupons.filter(c => c.is_active).length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 max-h-[500px] overflow-y-auto">
            {coupons.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">No coupons created yet</p>
            ) : (
              coupons.map((coupon) => (
                <div 
                  key={coupon.id} 
                  className={`p-4 rounded-lg border ${coupon.is_active ? 'border-primary/30 bg-primary/5' : 'border-border bg-secondary/30 opacity-60'}`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <code className="text-lg font-bold">{coupon.code}</code>
                      <Button size="sm" variant="ghost" onClick={() => copyCode(coupon.code)}>
                        <Copy className="w-3 h-3" />
                      </Button>
                    </div>
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={coupon.is_active}
                        onCheckedChange={() => toggleCoupon(coupon.id, coupon.is_active)}
                      />
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        onClick={() => deleteCoupon(coupon.id)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2 text-xs">
                    <span className="px-2 py-1 bg-green-500/10 text-green-500 rounded">
                      {coupon.discount_percent}% OFF
                    </span>
                    <span className="px-2 py-1 bg-blue-500/10 text-blue-500 rounded">
                      {coupon.current_uses}/{coupon.max_uses || '∞'} uses
                    </span>
                    {coupon.plan_restriction && (
                      <span className="px-2 py-1 bg-purple-500/10 text-purple-500 rounded">
                        {coupon.plan_restriction} only
                      </span>
                    )}
                    {coupon.valid_until && (
                      <span className="px-2 py-1 bg-yellow-500/10 text-yellow-500 rounded">
                        Expires {new Date(coupon.valid_until).toLocaleDateString()}
                      </span>
                    )}
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

export default CouponCodes;