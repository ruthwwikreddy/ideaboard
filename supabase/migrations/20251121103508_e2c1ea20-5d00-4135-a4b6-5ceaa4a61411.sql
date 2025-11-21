-- Add Razorpay-specific columns to subscriptions table
ALTER TABLE public.subscriptions
ADD COLUMN IF NOT EXISTS razorpay_subscription_id TEXT,
ADD COLUMN IF NOT EXISTS razorpay_plan_id TEXT,
ADD COLUMN IF NOT EXISTS razorpay_payment_id TEXT,
ADD COLUMN IF NOT EXISTS payment_method TEXT DEFAULT 'razorpay',
ADD COLUMN IF NOT EXISTS cancel_at_period_end BOOLEAN DEFAULT false;

-- Create payment_history table for tracking all payment transactions
CREATE TABLE IF NOT EXISTS public.payment_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  subscription_id UUID REFERENCES public.subscriptions(id) ON DELETE CASCADE,
  razorpay_payment_id TEXT NOT NULL,
  razorpay_order_id TEXT,
  amount INTEGER NOT NULL,
  currency TEXT DEFAULT 'INR',
  status TEXT NOT NULL,
  payment_method TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on payment_history
ALTER TABLE public.payment_history ENABLE ROW LEVEL SECURITY;

-- RLS policies for payment_history
CREATE POLICY "Users can view their own payment history"
ON public.payment_history
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own payment history"
ON public.payment_history
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Add updated_at trigger for payment_history
CREATE TRIGGER update_payment_history_updated_at
BEFORE UPDATE ON public.payment_history
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();