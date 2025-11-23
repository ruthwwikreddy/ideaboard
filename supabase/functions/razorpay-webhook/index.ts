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
      case 'payment.authorized':
      case 'payment.captured': {
        const payment = payload.payment.entity;
        const userId = payment.notes?.user_id;
        const planId = payment.notes?.plan_id;
        const credits = parseInt(payment.notes?.credits || '0');

        if (!userId || !planId || !credits) {
          console.error('Missing user_id, plan_id, or credits in payment notes');
          break;
        }

        const now = new Date();

        // Record payment in history
        const { error: historyError } = await supabaseClient
          .from('payment_history')
          .insert({
            user_id: userId,
            razorpay_payment_id: payment.id,
            razorpay_order_id: payment.order_id,
            amount: payment.amount,
            currency: payment.currency,
            status: payment.status,
            payment_method: payment.method,
          });

        if (historyError) {
          console.error('Error recording payment history:', historyError);
        }

        // Reset generation count (giving them the purchased credits)
        const { error: profileError } = await supabaseClient
          .from('profiles')
          .update({
            generation_count: 0,
            last_generation_reset: now.toISOString(),
          })
          .eq('id', userId);

        if (profileError) {
          console.error('Error resetting generation count:', profileError);
        }

        // Update or create subscription record to track last purchase
        const periodEnd = new Date(now);
        periodEnd.setDate(periodEnd.getDate() + 365); // 1 year validity

        // First, try to update existing subscription
        const { error: updateError } = await supabaseClient
          .from('subscriptions')
          .update({
            plan_id: planId,
            status: 'active',
            razorpay_payment_id: payment.id,
            payment_method: 'razorpay',
            current_period_start: now.toISOString(),
            current_period_end: periodEnd.toISOString(),
            updated_at: now.toISOString(),
          })
          .eq('user_id', userId);

        // If no rows updated, insert new subscription
        if (updateError?.code === 'PGRST116') {
          const { error: insertError } = await supabaseClient
            .from('subscriptions')
            .insert({
              user_id: userId,
              plan_id: planId,
              status: 'active',
              razorpay_payment_id: payment.id,
              payment_method: 'razorpay',
              current_period_start: now.toISOString(),
              current_period_end: periodEnd.toISOString(),
            });

          if (insertError) {
            console.error('Error creating subscription:', insertError);
          }
        } else if (updateError) {
          console.error('Error updating subscription:', updateError);
        }

        console.log(`Credits purchased successfully for user ${userId}: ${credits} credits`);
        break;
      }

      case 'payment.failed': {
        const payment = payload.payment.entity;
        const userId = payment.notes?.user_id;

        if (userId) {
          // Record failed payment
          const { error } = await supabaseClient
            .from('payment_history')
            .insert({
              user_id: userId,
              razorpay_payment_id: payment.id,
              razorpay_order_id: payment.order_id,
              amount: payment.amount,
              currency: payment.currency,
              status: 'failed',
              payment_method: payment.method,
            });

          if (error) {
            console.error('Error recording failed payment:', error);
          }
        }
        console.log('Payment failed for order:', payment.order_id);
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