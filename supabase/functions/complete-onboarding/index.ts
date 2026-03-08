import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey);

    const authHeader = req.headers.get('Authorization');
    if (!authHeader) throw new Error('Missing authorization header');

    const anonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const supabaseUser = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } }
    });

    const { data: { user }, error: userError } = await supabaseUser.auth.getUser();
    if (userError || !user) throw new Error('Unauthorized');

    console.log('Processing onboarding for user:', user.id);

    const { businessData, widgetConfig, crawledPages } = await req.json();

    if (!businessData?.name) throw new Error('Business name is required');
    if (!businessData?.website) throw new Error('Website URL is required');

    // Idempotency: check if user already has an organization
    const { data: existingProfile } = await supabaseAdmin
      .from('profiles')
      .select('organization_id, onboarding_completed')
      .eq('id', user.id)
      .single();

    if (existingProfile?.onboarding_completed && existingProfile?.organization_id) {
      console.log('User already completed onboarding, returning existing org');
      return new Response(
        JSON.stringify({ success: true, organizationId: existingProfile.organization_id }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
      );
    }

    // 1. Create organization
    const { data: org, error: orgError } = await supabaseAdmin
      .from('organizations')
      .insert({
        name: businessData.name,
        business_type: businessData.type || 'other',
        phone: businessData.phone || null,
        website: businessData.website,
      })
      .select()
      .single();

    if (orgError) throw new Error('Failed to create organization: ' + orgError.message);
    console.log('Created organization:', org.id);

    // 2. Create organization settings
    const { error: settingsError } = await supabaseAdmin
      .from('organization_settings')
      .insert({
        organization_id: org.id,
        business_hours: {},
        services: [],
        language: 'en-US',
        custom_greeting: widgetConfig?.welcome_message || 'Hi there! How can I help you today?',
      });

    if (settingsError) throw new Error('Failed to create settings: ' + settingsError.message);

    // 3. Create user role (owner)
    const { error: roleError } = await supabaseAdmin
      .from('user_roles')
      .insert({ user_id: user.id, organization_id: org.id, role: 'owner' });

    if (roleError) throw new Error('Failed to create user role: ' + roleError.message);

    // 4. Upsert profile (handles case where trigger hasn't created it yet)
    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .upsert({
        id: user.id,
        email: user.email,
        full_name: user.user_metadata?.full_name || user.user_metadata?.name || null,
        organization_id: org.id,
        onboarding_completed: true,
      }, { onConflict: 'id' });

    if (profileError) throw new Error('Failed to update profile: ' + profileError.message);

    // 5. Create subscription (trial)
    const { error: subError } = await supabaseAdmin
      .from('subscriptions')
      .insert({
        organization_id: org.id,
        plan: 'starter',
        status: 'trialing',
        minutes_included: 100,
        minutes_used: 0,
        current_period_start: new Date().toISOString(),
        current_period_end: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
      });

    if (subError) throw new Error('Failed to create subscription: ' + subError.message);

    // 6. Create widget config
    const widgetInsert: Record<string, unknown> = {
      organization_id: org.id,
    };
    if (widgetConfig?.widget_title) widgetInsert.widget_title = widgetConfig.widget_title;
    if (widgetConfig?.welcome_message) widgetInsert.welcome_message = widgetConfig.welcome_message;
    if (widgetConfig?.accent_color) widgetInsert.accent_color = widgetConfig.accent_color;
    if (widgetConfig?.position) widgetInsert.position = widgetConfig.position;
    if (widgetConfig?.theme) widgetInsert.theme = widgetConfig.theme;

    const { error: widgetError } = await supabaseAdmin
      .from('widget_configs')
      .insert(widgetInsert);

    if (widgetError) {
      console.error('Failed to create widget config:', widgetError);
      // Non-blocking — user can create it later
    } else {
      console.log('Created widget config');
    }

    // 7. Trigger site crawl in background (non-blocking)
    if (businessData.website) {
      try {
        const crawlResponse = await fetch(`${supabaseUrl}/functions/v1/crawl-site`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${serviceRoleKey}`,
          },
          body: JSON.stringify({
            organizationId: org.id,
            websiteUrl: businessData.website,
          }),
        });

        if (crawlResponse.ok) {
          console.log('Site crawl initiated');
        } else {
          console.error('Site crawl failed:', await crawlResponse.text());
        }
      } catch (crawlErr) {
        console.error('Failed to initiate site crawl:', crawlErr);
      }
    }

    // 8. Try to create Vapi assistant (non-blocking)
    let assistantId = null;
    try {
      const vapiResponse = await fetch(`${supabaseUrl}/functions/v1/create-vapi-assistant`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${serviceRoleKey}`,
        },
        body: JSON.stringify({ organizationId: org.id }),
      });

      if (vapiResponse.ok) {
        const vapiData = await vapiResponse.json();
        assistantId = vapiData?.assistantId;
        console.log('Created Vapi assistant:', assistantId);
      }
    } catch (vapiErr) {
      console.error('Failed to create Vapi assistant:', vapiErr);
    }

    console.log('Onboarding completed successfully');

    return new Response(
      JSON.stringify({ success: true, organizationId: org.id, assistantId }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    );
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'An error occurred during onboarding';
    console.error('Onboarding error:', error);
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    );
  }
});
