import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.83.0';
import { Resend } from "https://esm.sh/resend@2.0.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const PLAN_LIMITS: { [key: string]: number } = {
  free: 3,
  basic: 5,
  premium: 10,
};

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      { auth: { persistSession: false } }
    );

    const resendApiKey = Deno.env.get('RESEND_API_KEY');
    if (!resendApiKey) {
      console.error('RESEND_API_KEY not configured');
      return new Response(
        JSON.stringify({ error: 'Email service not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const resend = new Resend(resendApiKey);
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    // Fetch all users with email addresses
    const { data: profiles, error: profilesError } = await supabaseClient
      .from('profiles')
      .select('id, email, full_name, generation_count')
      .not('email', 'is', null);

    if (profilesError) {
      console.error('Error fetching profiles:', profilesError);
      throw profilesError;
    }

    console.log(`Found ${profiles?.length || 0} users to send digest to`);

    let emailsSent = 0;
    let errors = 0;

    for (const profile of profiles || []) {
      if (!profile.email) continue;

      try {
        // Get user's subscription for plan info
        const { data: subscription } = await supabaseClient
          .from('subscriptions')
          .select('plan_id, status')
          .eq('user_id', profile.id)
          .eq('status', 'active')
          .maybeSingle();

        const planId = subscription?.plan_id || 'free';
        const planLimit = PLAN_LIMITS[planId] || 3;
        const usedCredits = profile.generation_count || 0;
        const remainingCredits = Math.max(0, planLimit - usedCredits);

        // Get projects created in the last week
        const { data: newProjects, error: projectsError } = await supabaseClient
          .from('projects')
          .select('id, idea, created_at, research, build_plan')
          .eq('user_id', profile.id)
          .gte('created_at', oneWeekAgo.toISOString())
          .order('created_at', { ascending: false });

        if (projectsError) {
          console.error(`Error fetching projects for user ${profile.id}:`, projectsError);
          continue;
        }

        // Get total project count
        const { count: totalProjects } = await supabaseClient
          .from('projects')
          .select('id', { count: 'exact', head: true })
          .eq('user_id', profile.id);

        // Get recent activity logs
        const { data: activities } = await supabaseClient
          .from('user_activity_logs')
          .select('action, created_at')
          .eq('user_id', profile.id)
          .gte('created_at', oneWeekAgo.toISOString())
          .order('created_at', { ascending: false })
          .limit(10);

        const userName = profile.full_name || 'there';
        const projectsThisWeek = newProjects?.length || 0;
        const activityCount = activities?.length || 0;

        // Build project list HTML
        let projectsHtml = '';
        if (newProjects && newProjects.length > 0) {
          projectsHtml = `
            <h3 style="color: #a78bfa; margin: 24px 0 16px;">New Projects This Week</h3>
            ${newProjects.slice(0, 5).map(p => `
              <div style="background: #1f1f1f; border-radius: 8px; padding: 16px; margin-bottom: 12px; border: 1px solid #333;">
                <p style="margin: 0; color: #fff; font-weight: 500;">${(p.idea || '').slice(0, 100)}${(p.idea || '').length > 100 ? '...' : ''}</p>
                <p style="margin: 8px 0 0; font-size: 12px; color: #888;">
                  ${p.research ? '✅ Researched' : '⏳ Pending Research'} • 
                  ${p.build_plan ? '✅ Plan Generated' : '⏳ No Plan Yet'}
                </p>
              </div>
            `).join('')}
          `;
        }

        // Determine credit status color and message
        let creditColor = '#22c55e';
        let creditMessage = 'You have plenty of credits!';
        if (remainingCredits <= 1) {
          creditColor = '#ef4444';
          creditMessage = '⚠️ Running low on credits - consider upgrading!';
        } else if (remainingCredits <= 2) {
          creditColor = '#f59e0b';
          creditMessage = 'Getting low on credits';
        }

        const emailHtml = `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
          </head>
          <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #0a0a0a; color: #ffffff; margin: 0; padding: 40px 20px;">
            <div style="max-width: 600px; margin: 0 auto; background: linear-gradient(135deg, #1a1a1a 0%, #0d0d0d 100%); border-radius: 16px; overflow: hidden; border: 1px solid #333;">
              <div style="background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); padding: 32px; text-align: center;">
                <h1 style="margin: 0; font-size: 24px; font-weight: bold;">📊 Your Weekly Digest</h1>
                <p style="margin: 8px 0 0; opacity: 0.9;">IdeaBoard AI Activity Summary</p>
              </div>
              
              <div style="padding: 32px;">
                <p style="font-size: 18px; margin-bottom: 24px;">Hey ${userName}! 👋</p>
                
                <!-- Stats Grid -->
                <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px; margin-bottom: 24px;">
                  <div style="background: #1f1f1f; border-radius: 12px; padding: 20px; text-align: center; border: 1px solid #333;">
                    <p style="margin: 0; font-size: 32px; font-weight: bold; color: #6366f1;">${projectsThisWeek}</p>
                    <p style="margin: 8px 0 0; color: #888; font-size: 14px;">New Projects</p>
                  </div>
                  <div style="background: #1f1f1f; border-radius: 12px; padding: 20px; text-align: center; border: 1px solid #333;">
                    <p style="margin: 0; font-size: 32px; font-weight: bold; color: #8b5cf6;">${totalProjects || 0}</p>
                    <p style="margin: 8px 0 0; color: #888; font-size: 14px;">Total Projects</p>
                  </div>
                </div>

                <!-- Credits Status -->
                <div style="background: #1f1f1f; border-radius: 12px; padding: 20px; margin-bottom: 24px; border: 1px solid #333;">
                  <h3 style="margin: 0 0 12px; color: #a78bfa;">💳 Credits Status</h3>
                  <div style="display: flex; justify-content: space-between; align-items: center;">
                    <div>
                      <p style="margin: 0; font-size: 24px; font-weight: bold; color: ${creditColor};">${remainingCredits}/${planLimit}</p>
                      <p style="margin: 4px 0 0; font-size: 12px; color: #888;">Remaining Credits</p>
                    </div>
                    <div style="text-align: right;">
                      <p style="margin: 0; font-size: 14px; color: #fff; text-transform: capitalize;">${planId} Plan</p>
                      <p style="margin: 4px 0 0; font-size: 12px; color: ${creditColor};">${creditMessage}</p>
                    </div>
                  </div>
                </div>

                ${projectsHtml}

                ${activityCount > 0 ? `
                  <p style="color: #888; font-size: 14px; margin-top: 24px;">
                    You had ${activityCount} activity${activityCount !== 1 ? 'ies' : ''} this week. Keep up the great work! 🚀
                  </p>
                ` : ''}

                <div style="text-align: center; margin-top: 32px;">
                  <a href="https://www.ideaboard.live/dashboard" style="display: inline-block; background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); color: #fff; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: bold; font-size: 16px;">
                    View Dashboard →
                  </a>
                </div>

                ${remainingCredits <= 2 ? `
                  <div style="text-align: center; margin-top: 16px;">
                    <a href="https://www.ideaboard.live/pricing" style="display: inline-block; background: transparent; color: #a78bfa; text-decoration: none; padding: 12px 24px; border-radius: 8px; font-weight: 500; font-size: 14px; border: 1px solid #a78bfa;">
                      Get More Credits
                    </a>
                  </div>
                ` : ''}
              </div>

              <div style="padding: 24px; background: #0a0a0a; text-align: center; border-top: 1px solid #333;">
                <p style="margin: 0; font-size: 12px; color: #666;">
                  You're receiving this because you signed up for IdeaBoard AI.<br>
                  <a href="https://www.ideaboard.live/profile" style="color: #6366f1;">Manage preferences</a>
                </p>
              </div>
            </div>
          </body>
          </html>
        `;

        await resend.emails.send({
          from: 'IdeaBoard AI <digest@ideaboard.live>',
          to: [profile.email],
          subject: `📊 Your Weekly Digest: ${projectsThisWeek} new project${projectsThisWeek !== 1 ? 's' : ''} • ${remainingCredits} credits left`,
          html: emailHtml,
        });

        emailsSent++;
        console.log(`Digest sent to: ${profile.email}`);
      } catch (emailError) {
        console.error(`Failed to send digest to ${profile.email}:`, emailError);
        errors++;
      }
    }

    console.log(`Weekly digest complete: ${emailsSent} sent, ${errors} failed`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        emailsSent, 
        errors,
        message: `Sent ${emailsSent} digest emails` 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in weekly-digest:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
