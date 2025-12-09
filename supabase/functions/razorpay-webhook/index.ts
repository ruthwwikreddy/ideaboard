import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.83.0';
import { crypto } from 'https://deno.land/std@0.177.0/crypto/mod.ts';
import { Resend } from "https://esm.sh/resend@2.0.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-razorpay-signature',
};

const PLAN_DETAILS: { [key: string]: { name: string; credits: number; price: string } } = {
  basic: { name: 'Basic Pack', credits: 5, price: '₹10' },
  premium: { name: 'Premium Pack', credits: 10, price: '₹15' },
};

async function sendPaymentSuccessEmail(email: string, planId: string, credits: number) {
  const resendApiKey = Deno.env.get('RESEND_API_KEY');
  if (!resendApiKey) {
    console.log('RESEND_API_KEY not configured, skipping email');
    return;
  }

  const resend = new Resend(resendApiKey);
  const planInfo = PLAN_DETAILS[planId] || { name: planId, credits, price: 'N/A' };

  try {
    await resend.emails.send({
      from: 'IdeaBoard AI <noreply@ideaboard.live>',
      to: [email],
      subject: '🎉 Payment Successful - Your Credits Are Ready!',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #0a0a0a; color: #ffffff; margin: 0; padding: 40px 20px;">
          <div style="max-width: 600px; margin: 0 auto; background: linear-gradient(135deg, #1a1a1a 0%, #0d0d0d 100%); border-radius: 16px; overflow: hidden; border: 1px solid #333;">
            <div style="background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); padding: 32px; text-align: center;">
              <h1 style="margin: 0; font-size: 28px; font-weight: bold;">Payment Successful! 🚀</h1>
            </div>
            <div style="padding: 32px;">
              <p style="font-size: 16px; line-height: 1.6; color: #e0e0e0; margin-bottom: 24px;">
                Thank you for your purchase! Your account has been credited and you're ready to continue building amazing ideas.
              </p>
              
              <div style="background: #1f1f1f; border-radius: 12px; padding: 24px; margin-bottom: 24px; border: 1px solid #333;">
                <h2 style="margin: 0 0 16px 0; font-size: 18px; color: #a78bfa;">Order Details</h2>
                <table style="width: 100%; border-collapse: collapse;">
                  <tr>
                    <td style="padding: 8px 0; color: #888;">Plan</td>
                    <td style="padding: 8px 0; text-align: right; font-weight: bold; color: #fff;">${planInfo.name}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #888;">Credits Added</td>
                    <td style="padding: 8px 0; text-align: right; font-weight: bold; color: #22c55e;">${planInfo.credits} generations</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #888;">Amount Paid</td>
                    <td style="padding: 8px 0; text-align: right; font-weight: bold; color: #fff;">${planInfo.price}</td>
                  </tr>
                </table>
              </div>

              <div style="text-align: center; margin-top: 32px;">
                <a href="https://www.ideaboard.live/dashboard" style="display: inline-block; background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); color: #fff; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: bold; font-size: 16px;">
                  Start Creating →
                </a>
              </div>

              <p style="font-size: 14px; color: #666; text-align: center; margin-top: 32px;">
                Questions? Reply to this email or contact us at support@ideaboard.live
              </p>
            </div>
          </div>
        </body>
        </html>
      `,
    });
    console.log('Payment success email sent to:', email);
  } catch (error) {
    console.error('Failed to send payment success email:', error);
  }
}

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

        // First, check if subscription exists
        const { data: existingSub } = await supabaseClient
          .from('subscriptions')
          .select('id')
          .eq('user_id', userId)
          .maybeSingle();

        if (existingSub) {
          // Update existing subscription
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

          if (updateError) {
            console.error('Error updating subscription:', updateError);
          }
        } else {
          // Insert new subscription
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
        }

        // Fetch user email and send confirmation email
        const { data: userProfile } = await supabaseClient
          .from('profiles')
          .select('email')
          .eq('id', userId)
          .single();

        if (userProfile?.email) {
          // Send email in background (don't await)
          sendPaymentSuccessEmail(userProfile.email, planId, credits).catch(err => 
            console.error('Background email failed:', err)
          );
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