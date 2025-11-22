import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.83.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface SubscriptionRequest {
  planId: 'basic' | 'premium';
  userId: string;
}

// Razorpay plan IDs (create these in Razorpay Dashboard first)
// After creating plans in Razorpay Dashboard, update these IDs
const RAZORPAY_PLAN_IDS = {
  basic: 'plan_XXXXXXXXXXXXX', // Replace with actual Razorpay Plan ID for Basic
  premium: 'plan_XXXXXXXXXXXXX', // Replace with actual Razorpay Plan ID for Premium
};

const PLAN_CONFIG = {
  basic: {
    name: 'Basic Plan',
    description: '5 AI generations/month',
  },
  premium: {
    name: 'Premium Plan',
    description: '10 AI generations/month',
  },
};

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        auth: {
          persistSession: false,
        },
      }
    );

    // Get user from auth header
    const authHeader = req.headers.get('Authorization')!;
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser(token);

    if (userError || !user) {
      console.error('Auth error:', userError);
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { planId, userId }: SubscriptionRequest = await req.json();

    if (userId !== user.id) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const planConfig = PLAN_CONFIG[planId];
    if (!planConfig) {
      return new Response(
        JSON.stringify({ error: 'Invalid plan' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get Razorpay credentials
    const RAZORPAY_KEY_ID = Deno.env.get('RAZORPAY_KEY_ID');
    const RAZORPAY_KEY_SECRET = Deno.env.get('RAZORPAY_KEY_SECRET');

    if (!RAZORPAY_KEY_ID || !RAZORPAY_KEY_SECRET) {
      console.error('Razorpay credentials not configured');
      return new Response(
        JSON.stringify({ error: 'Payment system not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get Razorpay Plan ID
    const razorpayPlanId = RAZORPAY_PLAN_IDS[planId];
    if (!razorpayPlanId || razorpayPlanId.includes('XXX')) {
      console.error('Razorpay Plan ID not configured for:', planId);
      return new Response(
        JSON.stringify({ error: 'Subscription plan not configured. Please contact support.' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const auth = btoa(`${RAZORPAY_KEY_ID}:${RAZORPAY_KEY_SECRET}`);
    
    // Create Razorpay Subscription
    const razorpayResponse = await fetch('https://api.razorpay.com/v1/subscriptions', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        plan_id: razorpayPlanId,
        total_count: 12, // 12 months
        customer_notify: 1,
        notes: {
          user_id: userId,
          plan_id: planId,
        },
      }),
    });

    if (!razorpayResponse.ok) {
      const errorText = await razorpayResponse.text();
      console.error('Razorpay API error:', errorText);
      return new Response(
        JSON.stringify({ error: 'Failed to create subscription' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const subscription = await razorpayResponse.json();
    console.log('Razorpay subscription created:', subscription.id);

    return new Response(
      JSON.stringify({
        subscriptionId: subscription.id,
        planId: razorpayPlanId,
        keyId: RAZORPAY_KEY_ID,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in create-razorpay-order:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});