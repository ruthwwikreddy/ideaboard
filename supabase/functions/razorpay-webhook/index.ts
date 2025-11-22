import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.83.0';
import { crypto } from 'https://deno.land/std@0.177.0/crypto/mod.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-razorpay-signature',
};

async function verifyWebhookSignature(body: string, signature: string, secret: string): Promise<boolean> {
  const encoder = new TextEncoder();
  const keyData = encoder.encode(secret);
  const key = await crypto.subtle.importKey(
    'raw',
    keyData,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  
  const signatureBuffer = await crypto.subtle.sign(
    'HMAC',
    key,
    encoder.encode(body)
  );
  
  const expectedSignature = Array.from(new Uint8Array(signatureBuffer))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
  
  return expectedSignature === signature;
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          persistSession: false,
        },
      }
    );

    const RAZORPAY_WEBHOOK_SECRET = Deno.env.get('RAZORPAY_WEBHOOK_SECRET');
    
    if (!RAZORPAY_WEBHOOK_SECRET) {
      console.error('Webhook secret not configured');
      return new Response(
        JSON.stringify({ error: 'Webhook not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const signature = req.headers.get('x-razorpay-signature');
    const body = await req.text();

    if (!signature) {
      console.error('Missing signature');
      return new Response(
        JSON.stringify({ error: 'Missing signature' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Verify webhook signature
    const isValid = await verifyWebhookSignature(body, signature, RAZORPAY_WEBHOOK_SECRET);
    
    if (!isValid) {
      console.error('Invalid webhook signature');
      return new Response(
        JSON.stringify({ error: 'Invalid signature' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const event = JSON.parse(body);
    console.log('Webhook event received:', event.event);

    const { event: eventType, payload } = event;

    // Handle different event types
    switch (eventType) {
      case 'subscription.authenticated':
      case 'subscription.activated': {
        const subscription = payload.subscription.entity;
        const userId = subscription.notes?.user_id;
        const planId = subscription.notes?.plan_id;

        if (!userId || !planId) {
          console.error('Missing user_id or plan_id in subscription notes');
          break;
        }

        // Calculate period dates from subscription
        const currentStart = new Date(subscription.current_start * 1000);
        const currentEnd = new Date(subscription.current_end * 1000);

        // Create or update subscription
        const { error: subError } = await supabaseClient
          .from('subscriptions')
          .upsert({
            user_id: userId,
            plan_id: planId,
            status: 'active',
            razorpay_subscription_id: subscription.id,
            razorpay_plan_id: subscription.plan_id,
            payment_method: 'razorpay',
            current_period_start: currentStart.toISOString(),
            current_period_end: currentEnd.toISOString(),
            updated_at: new Date().toISOString(),
          }, {
            onConflict: 'user_id',
          });

        if (subError) {
          console.error('Error updating subscription:', subError);
        }

        // Reset generation count
        const { error: profileError } = await supabaseClient
          .from('profiles')
          .update({
            generation_count: 0,
            last_generation_reset: new Date().toISOString(),
          })
          .eq('id', userId);

        if (profileError) {
          console.error('Error resetting generation count:', profileError);
        }

        console.log('Subscription activated for user:', userId);
        break;
      }

      case 'subscription.charged': {
        const payment = payload.payment.entity;
        const subscription = payload.subscription?.entity;
        const userId = subscription?.notes?.user_id;

        if (!userId) {
          console.error('Missing user_id in subscription notes');
          break;
        }

        // Record payment in history
        const { error: historyError } = await supabaseClient
          .from('payment_history')
          .insert({
            user_id: userId,
            razorpay_payment_id: payment.id,
            amount: payment.amount,
            currency: payment.currency,
            status: 'captured',
            payment_method: payment.method,
          });

        if (historyError) {
          console.error('Error recording payment history:', historyError);
        }

        // Reset generation count on successful payment
        const { error: profileError } = await supabaseClient
          .from('profiles')
          .update({
            generation_count: 0,
            last_generation_reset: new Date().toISOString(),
          })
          .eq('id', userId);

        if (profileError) {
          console.error('Error resetting generation count:', profileError);
        }

        console.log('Subscription payment charged for user:', userId);
        break;
      }

      case 'subscription.cancelled':
      case 'subscription.completed':
      case 'subscription.halted': {
        const subscription = payload.subscription.entity;
        const userId = subscription.notes?.user_id;

        if (!userId) {
          console.error('Missing user_id in subscription notes');
          break;
        }

        // Update subscription status
        const { error: subError } = await supabaseClient
          .from('subscriptions')
          .update({
            status: eventType.split('.')[1], // 'cancelled', 'completed', or 'halted'
            updated_at: new Date().toISOString(),
          })
          .eq('user_id', userId)
          .eq('razorpay_subscription_id', subscription.id);

        if (subError) {
          console.error('Error updating subscription status:', subError);
        }

        console.log(`Subscription ${eventType} for user:`, userId);
        break;
      }

      case 'subscription.paused':
      case 'subscription.resumed': {
        const subscription = payload.subscription.entity;
        const userId = subscription.notes?.user_id;

        if (!userId) {
          console.error('Missing user_id in subscription notes');
          break;
        }

        // Update subscription status
        const { error: subError } = await supabaseClient
          .from('subscriptions')
          .update({
            status: eventType === 'subscription.paused' ? 'paused' : 'active',
            updated_at: new Date().toISOString(),
          })
          .eq('user_id', userId)
          .eq('razorpay_subscription_id', subscription.id);

        if (subError) {
          console.error('Error updating subscription status:', subError);
        }

        console.log(`Subscription ${eventType} for user:`, userId);
        break;
      }

      case 'payment.failed': {
        const payment = payload.payment.entity;
        const subscription = payload.subscription?.entity;
        const userId = subscription?.notes?.user_id;

        if (userId) {
          // Record failed payment
          const { error } = await supabaseClient
            .from('payment_history')
            .insert({
              user_id: userId,
              razorpay_payment_id: payment.id,
              amount: payment.amount,
              currency: payment.currency,
              status: 'failed',
              payment_method: payment.method,
            });

          if (error) {
            console.error('Error recording failed payment:', error);
          }
        }
        console.log('Subscription payment failed:', payment.id);
        break;
      }

      default:
        console.log('Unhandled event type:', eventType);
    }

    return new Response(
      JSON.stringify({ received: true }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in razorpay-webhook:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});