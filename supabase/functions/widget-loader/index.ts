import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  // Get widget key from query param
  const url = new URL(req.url);
  const widgetKey = url.searchParams.get("key");

  if (!widgetKey) {
    return new Response("// Widget key required", {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/javascript" },
    });
  }

  const supabaseAdmin = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  // Fetch widget config
  const { data: config, error } = await supabaseAdmin
    .from("widget_configs")
    .select("*")
    .eq("api_key", widgetKey)
    .single();

  if (error || !config) {
    return new Response("// Invalid widget key", {
      status: 401,
      headers: { ...corsHeaders, "Content-Type": "application/javascript" },
    });
  }

  // Enforce allowed_domains if configured
  const allowedDomains: string[] = config.allowed_domains || [];
  if (allowedDomains.length > 0) {
    const origin = req.headers.get("Origin") || req.headers.get("Referer") || "";
    let requestDomain = "";
    try {
      requestDomain = new URL(origin).hostname;
    } catch {
      // If no valid origin, allow (could be direct request or server-side)
    }
    if (requestDomain && !allowedDomains.some((d: string) => requestDomain === d || requestDomain.endsWith("." + d))) {
      return new Response("// Domain not authorized", {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/javascript" },
      });
    }
  }

  // If voice call is enabled, fetch VAPI config
  let vapiPublicKey = null;
  let vapiAssistantId = null;
  if (config.voice_call_enabled) {
    const { data: settings } = await supabaseAdmin
      .from("organization_settings")
      .select("vapi_assistant_id")
      .eq("organization_id", config.organization_id)
      .single();
    vapiPublicKey = Deno.env.get("VAPI_PUBLIC_KEY") || null;
    vapiAssistantId = settings?.vapi_assistant_id || null;
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;

  // Generate a self-contained widget script
  const widgetJS = `
(function() {
  if (window.__chatWidgetLoaded) return;
  window.__chatWidgetLoaded = true;

  var CONFIG = ${JSON.stringify({
    accentColor: config.accent_color,
    welcomeMessage: config.welcome_message,
    placeholderText: config.placeholder_text,
    widgetTitle: config.widget_title,
    avatarUrl: config.avatar_url,
    voiceEnabled: config.voice_enabled,
    voiceCallEnabled: config.voice_call_enabled,
    position: config.position,
    apiKey: config.api_key,
    supabaseUrl: supabaseUrl,
    vapiPublicKey: vapiPublicKey,
    vapiAssistantId: vapiAssistantId,
  })};

  // Inject styles
  var style = document.createElement('style');
  style.textContent = \`
    #__chat-widget-root * { box-sizing: border-box; margin: 0; padding: 0; font-family: 'DM Sans', system-ui, -apple-system, sans-serif; }
    #__chat-widget-root .cw-bubble { position: fixed; z-index: 99999; width: 56px; height: 56px; border-radius: 50%; border: none; cursor: pointer; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 20px rgba(0,0,0,0.15); transition: transform 0.2s, box-shadow 0.2s; }
    #__chat-widget-root .cw-bubble:hover { transform: scale(1.1); box-shadow: 0 6px 30px rgba(0,0,0,0.2); }
    #__chat-widget-root .cw-bubble svg { width: 24px; height: 24px; fill: none; stroke: white; stroke-width: 2; stroke-linecap: round; stroke-linejoin: round; }
    #__chat-widget-root .cw-panel { position: fixed; z-index: 99999; width: 380px; height: 520px; border-radius: 16px; background: white; box-shadow: 0 20px 60px rgba(0,0,0,0.15); display: flex; flex-direction: column; overflow: hidden; animation: cw-slide-up 0.3s ease-out; }
    @keyframes cw-slide-up { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
    #__chat-widget-root .cw-header { padding: 12px 16px; display: flex; align-items: center; gap: 12px; }
    #__chat-widget-root .cw-header-title { color: white; font-size: 14px; font-weight: 600; }
    #__chat-widget-root .cw-header-sub { color: rgba(255,255,255,0.7); font-size: 11px; }
    #__chat-widget-root .cw-close { background: none; border: none; color: rgba(255,255,255,0.7); cursor: pointer; padding: 4px; border-radius: 6px; display: flex; }
    #__chat-widget-root .cw-close:hover { background: rgba(255,255,255,0.1); color: white; }
    #__chat-widget-root .cw-close svg { width: 20px; height: 20px; }
    #__chat-widget-root .cw-messages { flex: 1; overflow-y: auto; padding: 12px 16px; scrollbar-width: thin; }
    #__chat-widget-root .cw-msg { margin-bottom: 12px; display: flex; }
    #__chat-widget-root .cw-msg-user { justify-content: flex-end; }
    #__chat-widget-root .cw-msg-assistant { justify-content: flex-start; }
    #__chat-widget-root .cw-msg-bubble { max-width: 80%; padding: 10px 16px; border-radius: 16px; font-size: 14px; line-height: 1.5; white-space: pre-wrap; word-wrap: break-word; }
    #__chat-widget-root .cw-msg-user .cw-msg-bubble { color: white; border-bottom-right-radius: 4px; }
    #__chat-widget-root .cw-msg-assistant .cw-msg-bubble { background: #f3f4f6; color: #111827; border-bottom-left-radius: 4px; }
    #__chat-widget-root .cw-msg-bubble a { text-decoration: underline; }
    #__chat-widget-root .cw-typing { display: flex; gap: 4px; padding: 12px 16px; }
    #__chat-widget-root .cw-typing span { width: 8px; height: 8px; border-radius: 50%; background: #9ca3af; animation: cw-bounce 1.4s infinite ease-in-out both; }
    #__chat-widget-root .cw-typing span:nth-child(2) { animation-delay: 0.16s; }
    #__chat-widget-root .cw-typing span:nth-child(3) { animation-delay: 0.32s; }
    @keyframes cw-bounce { 0%, 80%, 100% { transform: scale(0); } 40% { transform: scale(1); } }
    #__chat-widget-root .cw-input-bar { display: flex; align-items: center; gap: 8px; padding: 10px 12px; border-top: 1px solid #f3f4f6; }
    #__chat-widget-root .cw-input { flex: 1; height: 36px; border: 1px solid #e5e7eb; border-radius: 999px; padding: 0 16px; font-size: 14px; outline: none; background: #f9fafb; color: #111827; }
    #__chat-widget-root .cw-input:focus { border-color: #d1d5db; }
    #__chat-widget-root .cw-input::placeholder { color: #9ca3af; }
    #__chat-widget-root .cw-send { width: 36px; height: 36px; border-radius: 50%; border: none; cursor: pointer; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
    #__chat-widget-root .cw-send:disabled { opacity: 0.4; cursor: default; }
    #__chat-widget-root .cw-send svg { width: 16px; height: 16px; fill: none; stroke: white; stroke-width: 2; stroke-linecap: round; stroke-linejoin: round; }
    #__chat-widget-root .cw-footer { text-align: center; padding: 6px; border-top: 1px solid #f9fafb; font-size: 10px; color: #d1d5db; }
    #__chat-widget-root .cw-avatar { width: 36px; height: 36px; border-radius: 50%; object-fit: cover; border: 2px solid rgba(255,255,255,0.3); }
    @media (max-width: 440px) { #__chat-widget-root .cw-panel { width: calc(100vw - 24px); right: 12px !important; left: 12px !important; } }
  \`;
  document.head.appendChild(style);

  // Load font
  if (!document.querySelector('link[href*="DM+Sans"]')) {
    var link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600&display=swap';
    document.head.appendChild(link);
  }

  // Create root
  var root = document.createElement('div');
  root.id = '__chat-widget-root';
  document.body.appendChild(root);

  var isOpen = false;
  var messages = [{ role: 'assistant', content: CONFIG.welcomeMessage }];
  var conversationId = null;
  var isLoading = false;
  var visitorId = localStorage.getItem('__widget_visitor_id') || (function() { var id = crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substr(2); localStorage.setItem('__widget_visitor_id', id); return id; })();

  function escapeHtml(text) {
    var div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  function linkify(text) {
    return escapeHtml(text).replace(/(https?:\\/\\/[^\\s)>]+)/g, '<a href="$1" target="_blank" rel="noopener noreferrer">$1</a>');
  }

  var posRight = CONFIG.position === 'bottom-right';

  function render() {
    var html = '';

    // Bubble
    if (!isOpen) {
      html += '<button class="cw-bubble" style="background:' + CONFIG.accentColor + ';' + (posRight ? 'right:20px;bottom:20px;' : 'left:20px;bottom:20px;') + '" onclick="__cwToggle()">';
      html += '<svg viewBox="0 0 24 24"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>';
      html += '</button>';
    }

    // Panel
    if (isOpen) {
      html += '<div class="cw-panel" style="' + (posRight ? 'right:20px;bottom:88px;' : 'left:20px;bottom:88px;') + '">';
      // Header
      html += '<div class="cw-header" style="background:' + CONFIG.accentColor + ';">';
      if (CONFIG.avatarUrl) html += '<img class="cw-avatar" src="' + CONFIG.avatarUrl + '" alt="" />';
      html += '<div style="flex:1"><div class="cw-header-title">' + escapeHtml(CONFIG.widgetTitle) + '</div><div class="cw-header-sub">Online</div></div>';
      html += '<button class="cw-close" onclick="__cwToggle()"><svg viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg></button>';
      html += '</div>';
      // Messages
      html += '<div class="cw-messages" id="__cw-msgs">';
      messages.forEach(function(m) {
        html += '<div class="cw-msg cw-msg-' + m.role + '">';
        html += '<div class="cw-msg-bubble" style="' + (m.role === 'user' ? 'background:' + CONFIG.accentColor : '') + '">' + linkify(m.content) + '</div>';
        html += '</div>';
      });
      if (isLoading && messages[messages.length - 1].content === '') {
        html += '<div class="cw-msg cw-msg-assistant"><div class="cw-msg-bubble" style="padding:12px 16px"><div class="cw-typing"><span></span><span></span><span></span></div></div></div>';
      }
      html += '</div>';
      // Input
      html += '<form class="cw-input-bar" onsubmit="__cwSend(event)">';
      if (CONFIG.vapiPublicKey && CONFIG.vapiAssistantId && CONFIG.voiceCallEnabled) {
        html += '<button type="button" class="cw-send" style="background:transparent;color:#9ca3af;" onclick="__cwStartCall()" title="Voice call"><svg viewBox="0 0 24 24" style="stroke:#9ca3af;"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"></path></svg></button>';
      }
      html += '<input class="cw-input" id="__cw-input" placeholder="' + escapeHtml(CONFIG.placeholderText) + '" ' + (isLoading ? 'disabled' : '') + ' />';
      html += '<button type="submit" class="cw-send" style="background:' + CONFIG.accentColor + ';" ' + (isLoading ? 'disabled' : '') + '><svg viewBox="0 0 24 24"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg></button>';
      html += '</form>';
      html += '<div class="cw-footer">Powered by AI</div>';
      html += '</div>';

      // Keep bubble visible when open
      html += '<button class="cw-bubble" style="background:' + CONFIG.accentColor + ';' + (posRight ? 'right:20px;bottom:20px;' : 'left:20px;bottom:20px;') + '" onclick="__cwToggle()">';
      html += '<svg viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>';
      html += '</button>';
    }

    root.innerHTML = html;

    // Scroll to bottom
    var msgs = document.getElementById('__cw-msgs');
    if (msgs) msgs.scrollTop = msgs.scrollHeight;

    // Focus input
    var inp = document.getElementById('__cw-input');
    if (inp && isOpen) inp.focus();
  }

  window.__cwToggle = function() {
    isOpen = !isOpen;
    render();
  };

  window.__cwSend = async function(e) {
    e.preventDefault();
    var inp = document.getElementById('__cw-input');
    var text = inp ? inp.value.trim() : '';
    if (!text || isLoading) return;

    messages.push({ role: 'user', content: text });
    messages.push({ role: 'assistant', content: '' });
    isLoading = true;
    render();

    try {
      var res = await fetch(CONFIG.supabaseUrl + '/functions/v1/widget-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-widget-key': CONFIG.apiKey },
        body: JSON.stringify({ message: text, conversationId: conversationId, visitorId: visitorId, pageUrl: window.location.href })
      });

      var convId = res.headers.get('X-Conversation-Id');
      if (convId) conversationId = convId;

      if (!res.ok) throw new Error('Failed');

      var reader = res.body.getReader();
      var decoder = new TextDecoder();
      var fullText = '';

      while (true) {
        var result = await reader.read();
        if (result.done) break;
        var chunk = decoder.decode(result.value, { stream: true });
        var lines = chunk.split('\\n');
        for (var i = 0; i < lines.length; i++) {
          if (!lines[i].startsWith('data: ') || lines[i].includes('[DONE]')) continue;
          try {
            var parsed = JSON.parse(lines[i].slice(6));
            var content = parsed.choices && parsed.choices[0] && parsed.choices[0].delta && parsed.choices[0].delta.content;
            if (content) {
              fullText += content;
              messages[messages.length - 1].content = fullText;
              render();
            }
          } catch(ex) {}
        }
      }
    } catch(err) {
      messages[messages.length - 1].content = 'Sorry, something went wrong. Please try again.';
    }
    isLoading = false;
    render();
  };

  window.__cwStartCall = function() {
    if (!CONFIG.vapiPublicKey || !CONFIG.vapiAssistantId) return;
    // Load VAPI Web SDK dynamically
    if (window.__vapiSDK) { __cwInitCall(); return; }
    var script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/@vapi-ai/web@2.5.2/dist/vapi.umd.min.js';
    script.onload = function() {
      window.__vapiSDK = true;
      __cwInitCall();
    };
    document.head.appendChild(script);
  };

  function __cwInitCall() {
    var vapi = new window.Vapi(CONFIG.vapiPublicKey);
    window.__cwVapi = vapi;
    var callSeconds = 0;
    var callTimer = null;

    // Show overlay
    function renderCallOverlay(status) {
      var overlay = document.getElementById('__cw-call-overlay');
      if (!overlay) {
        overlay = document.createElement('div');
        overlay.id = '__cw-call-overlay';
        overlay.style.cssText = 'position:absolute;inset:0;z-index:99;background:white;display:flex;flex-direction:column;align-items:center;justify-content:center;';
        var panel = root.querySelector('.cw-panel');
        if (panel) { panel.style.position = 'relative'; panel.appendChild(overlay); }
      }
      var label = status === 'connecting' ? 'Connecting…' : status === 'speaking' ? 'Speaking…' : status === 'listening' ? 'Listening…' : 'Call ended';
      var m = Math.floor(callSeconds / 60);
      var s = callSeconds % 60;
      var time = m + ':' + (s < 10 ? '0' : '') + s;
      overlay.innerHTML = '<div style="width:64px;height:64px;border-radius:50%;background:' + CONFIG.accentColor + ';display:flex;align-items:center;justify-content:center;margin-bottom:24px;box-shadow:0 8px 32px -4px ' + CONFIG.accentColor + '50;"><svg viewBox="0 0 24 24" style="width:28px;height:28px;fill:none;stroke:white;stroke-width:2;stroke-linecap:round;stroke-linejoin:round;"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"></path></svg></div><p style="font-size:14px;font-weight:500;color:#374151;margin-bottom:4px;">' + label + '</p><p style="font-size:12px;color:#9ca3af;font-family:monospace;margin-bottom:32px;">' + time + '</p>' + (status !== 'ended' ? '<button onclick="__cwEndCall()" style="display:flex;align-items:center;gap:8px;background:#ef4444;color:white;border:none;border-radius:9999px;padding:12px 24px;font-size:14px;font-weight:600;cursor:pointer;box-shadow:0 4px 12px rgba(239,68,68,0.3);">End Call</button>' : '');
    }

    vapi.on('call-start', function() {
      renderCallOverlay('listening');
      callTimer = setInterval(function() {
        callSeconds++;
        if (callSeconds >= 300) { __cwEndCall(); return; }
        renderCallOverlay('listening');
      }, 1000);
    });
    vapi.on('call-end', function() { __cwCleanupCall(); });
    vapi.on('speech-start', function() { renderCallOverlay('speaking'); });
    vapi.on('speech-end', function() { renderCallOverlay('listening'); });
    vapi.on('error', function() { __cwCleanupCall(); });

    window.__cwEndCall = function() {
      try { vapi.stop(); } catch(e) {}
      __cwCleanupCall();
    };

    function __cwCleanupCall() {
      if (callTimer) clearInterval(callTimer);
      var overlay = document.getElementById('__cw-call-overlay');
      if (overlay) { overlay.remove(); }
      window.__cwVapi = null;
    }

    renderCallOverlay('connecting');
    vapi.start(CONFIG.vapiAssistantId);
  }

  render();
})();
`;

  return new Response(widgetJS, {
    headers: {
      ...corsHeaders,
      "Content-Type": "application/javascript",
      "Cache-Control": "public, max-age=300",
    },
  });
});

