const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { recipients, message } = await req.json();

    if (!recipients || !Array.isArray(recipients) || recipients.length === 0) {
      return new Response(
        JSON.stringify({ error: 'recipients array is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!message || typeof message !== 'string') {
      return new Response(
        JSON.stringify({ error: 'message string is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const accountSid = Deno.env.get('TWILIO_ACCOUNT_SID');
    const authToken = Deno.env.get('TWILIO_AUTH_TOKEN');
    const fromNumber = Deno.env.get('TWILIO_PHONE_NUMBER');

    if (!accountSid || !authToken || !fromNumber) {
      return new Response(
        JSON.stringify({ error: 'Twilio credentials not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const results: { to: string; status: string; sid?: string; error?: string }[] = [];

    for (const to of recipients) {
      try {
        const url = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`;
        const body = new URLSearchParams({
          To: to,
          From: fromNumber,
          Body: message,
        });

        const response = await fetch(url, {
          method: 'POST',
          headers: {
            'Authorization': 'Basic ' + btoa(`${accountSid}:${authToken}`),
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: body.toString(),
        });

        const data = await response.json();

        if (response.ok) {
          results.push({ to, status: 'sent', sid: data.sid });
        } else {
          results.push({ to, status: 'failed', error: data.message || 'Unknown error' });
        }
      } catch (err) {
        results.push({ to, status: 'failed', error: err.message });
      }
    }

    const sent = results.filter(r => r.status === 'sent').length;
    const failed = results.filter(r => r.status === 'failed').length;

    return new Response(
      JSON.stringify({ sent, failed, total: recipients.length, results }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: err.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
