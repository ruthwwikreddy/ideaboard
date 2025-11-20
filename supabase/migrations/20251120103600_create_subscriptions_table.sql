CREATE TABLE public.subscriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    status TEXT NOT NULL, -- e.g., 'active', 'cancelled', 'past_due'
    plan_id TEXT NOT NULL, -- e.g., 'free', 'basic', 'premium'
    current_period_start TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    current_period_end TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own subscriptions."
  ON public.subscriptions FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create a subscription."
  ON public.subscriptions FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own subscription."
  ON public.subscriptions FOR UPDATE USING (auth.uid() = user_id);