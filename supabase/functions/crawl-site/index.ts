import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Auth check — support both user JWT and service-role key
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const token = authHeader.replace("Bearer ", "");
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const isServiceRole = token === serviceRoleKey;

    const { organizationId, websiteUrl } = await req.json();

    if (!organizationId || typeof websiteUrl !== "string" || !websiteUrl.trim()) {
      return new Response(
        JSON.stringify({ error: "organizationId and websiteUrl are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // If not service role, verify user is org member
    if (!isServiceRole) {
      const supabase = createClient(
        Deno.env.get("SUPABASE_URL")!,
        Deno.env.get("SUPABASE_ANON_KEY")!,
        { global: { headers: { Authorization: authHeader } } }
      );

      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        console.error("Auth error:", userError?.message);
        return new Response(JSON.stringify({ error: "Unauthorized" }), {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const userId = user.id;

      const supabaseAdmin = createClient(
        Deno.env.get("SUPABASE_URL")!,
        serviceRoleKey
      );

      const { data: profile } = await supabaseAdmin
        .from("profiles")
        .select("organization_id")
        .eq("id", userId)
        .single();

      if (!profile || profile.organization_id !== organizationId) {
        return new Response(JSON.stringify({ error: "Forbidden" }), {
          status: 403,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    const FIRECRAWL_API_KEY = Deno.env.get("FIRECRAWL_API_KEY");
    if (!FIRECRAWL_API_KEY) {
      return new Response(
        JSON.stringify({ error: "Firecrawl connector not configured" }),
        { status: 503, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Use service role for DB writes
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    let formattedUrl = websiteUrl.trim();
    if (!formattedUrl.startsWith("http://") && !formattedUrl.startsWith("https://")) {
      formattedUrl = `https://${formattedUrl}`;
    }

    // Only crawl public websites — reject localhost/private/internal hosts
    let hostname: string;
    try {
      hostname = new URL(formattedUrl).hostname.toLowerCase();
    } catch {
      return new Response(
        JSON.stringify({ error: "Invalid website URL" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    const isPrivateHost =
      hostname === "localhost" ||
      !hostname.includes(".") ||
      /^127\.|^10\.|^192\.168\.|^169\.254\.|^0\./.test(hostname) ||
      /^172\.(1[6-9]|2\d|3[01])\./.test(hostname) ||
      hostname.endsWith(".local") ||
      hostname.endsWith(".internal");
    if (isPrivateHost) {
      return new Response(
        JSON.stringify({ error: "Only public websites can be crawled" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("Step 1: Mapping site URLs for", formattedUrl);

    // Step 1: Map the site to discover URLs
    const mapRes = await fetch("https://api.firecrawl.dev/v1/map", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${FIRECRAWL_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        url: formattedUrl,
        limit: 200,
        includeSubdomains: false,
      }),
    });

    const mapData = await mapRes.json();
    if (!mapRes.ok) {
      console.error("Firecrawl map error:", mapData);
      return new Response(
        JSON.stringify({ error: "Failed to map website", details: mapData.error }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const urls: string[] = mapData.links || [];
    console.log(`Discovered ${urls.length} URLs`);

    // Clear old site_maps and site_pages for this org
    const { error: deleteMapErr } = await supabaseAdmin.from("site_maps").delete().eq("organization_id", organizationId);
    if (deleteMapErr) console.warn("Failed to clear old site_maps:", deleteMapErr);
    
    const { error: deletePagesErr } = await supabaseAdmin.from("site_pages").delete().eq("organization_id", organizationId);
    if (deletePagesErr) console.warn("Failed to clear old site_pages:", deletePagesErr);

    // Store discovered URLs in site_maps
    if (urls.length > 0) {
      const siteMapRows = urls.map((url: string) => ({
        organization_id: organizationId,
        url,
        is_crawled: false,
      }));

      for (let i = 0; i < siteMapRows.length; i += 100) {
        const batch = siteMapRows.slice(i, i + 100);
        const { error: insertErr } = await supabaseAdmin.from("site_maps").insert(batch);
        if (insertErr) console.warn(`Failed to insert site_maps batch ${i}:`, insertErr);
      }
    }

    // Step 2: Scrape top pages (limit 30)
    const pagesToScrape = urls.slice(0, 30);
    console.log(`Step 2: Scraping ${pagesToScrape.length} pages`);

    const scrapedPages: Array<{
      organization_id: string;
      url: string;
      title: string;
      content_markdown: string;
      summary: string | null;
      last_crawled_at: string;
    }> = [];

    // Scrape in batches of 5
    for (let i = 0; i < pagesToScrape.length; i += 5) {
      const batch = pagesToScrape.slice(i, i + 5);
      const scrapePromises = batch.map(async (pageUrl: string) => {
        try {
          const scrapeRes = await fetch("https://api.firecrawl.dev/v1/scrape", {
            method: "POST",
            headers: {
              Authorization: `Bearer ${FIRECRAWL_API_KEY}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              url: pageUrl,
              formats: ["markdown"],
              onlyMainContent: true,
            }),
          });

          const scrapeData = await scrapeRes.json();
          if (scrapeRes.ok && scrapeData.success) {
            const markdown = scrapeData.data?.markdown || scrapeData.markdown || "";
            const title =
              scrapeData.data?.metadata?.title || scrapeData.metadata?.title || pageUrl;

            return {
              organization_id: organizationId,
              url: pageUrl,
              title: title.substring(0, 500),
              content_markdown: markdown.substring(0, 50000),
              summary: null,
              last_crawled_at: new Date().toISOString(),
            };
          }
          console.warn(`Failed to scrape ${pageUrl}:`, scrapeData.error);
          return null;
        } catch (err) {
          console.warn(`Error scraping ${pageUrl}:`, err);
          return null;
        }
      });

      const results = await Promise.all(scrapePromises);
      for (const r of results) {
        if (r) scrapedPages.push(r);
      }
    }

    console.log(`Successfully scraped ${scrapedPages.length} pages`);

    // Store scraped pages
    if (scrapedPages.length > 0) {
      for (let i = 0; i < scrapedPages.length; i += 20) {
        const batch = scrapedPages.slice(i, i + 20);
        const { error: insertErr } = await supabaseAdmin.from("site_pages").insert(batch);
        if (insertErr) console.warn(`Failed to insert site_pages batch ${i}:`, insertErr);
      }

      const scrapedUrls = scrapedPages.map((p) => p.url);
      await supabaseAdmin
        .from("site_maps")
        .update({ is_crawled: true })
        .eq("organization_id", organizationId)
        .in("url", scrapedUrls);
    }

    // Step 3: Generate summaries + extract business data using AI
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    let extractedBusinessData: Record<string, unknown> | null = null;

    if (LOVABLE_API_KEY && scrapedPages.length > 0) {
      console.log("Step 3: Generating summaries");

      // Summaries
      for (const page of scrapedPages.slice(0, 20)) {
        try {
          const content = page.content_markdown.substring(0, 3000);
          const aiRes = await fetch(
            "https://ai.gateway.lovable.dev/v1/chat/completions",
            {
              method: "POST",
              headers: {
                Authorization: `Bearer ${LOVABLE_API_KEY}`,
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                model: "google/gemini-2.5-flash-lite",
                messages: [
                  {
                    role: "system",
                    content:
                      "Summarize this webpage content in 1-2 sentences. Focus on what the page is about and what a visitor would find there. Be concise.",
                  },
                  { role: "user", content: `Page: ${page.title}\nURL: ${page.url}\n\nContent:\n${content}` },
                ],
              }),
            }
          );

          if (aiRes.ok) {
            const aiData = await aiRes.json();
            const summary = aiData.choices?.[0]?.message?.content;
            if (summary) {
              await supabaseAdmin
                .from("site_pages")
                .update({ summary })
                .eq("organization_id", organizationId)
                .eq("url", page.url);
            }
          }
        } catch (err) {
          console.warn(`Failed to summarize ${page.url}:`, err);
        }
      }

      // Step 4: Extract structured business data from all scraped content
      console.log("Step 4: Extracting business data from website content");
      try {
        // Combine content from top pages for extraction
        const combinedContent = scrapedPages
          .slice(0, 10)
          .map((p) => `--- PAGE: ${p.title} (${p.url}) ---\n${p.content_markdown.substring(0, 4000)}`)
          .join("\n\n");

        const extractRes = await fetch(
          "https://ai.gateway.lovable.dev/v1/chat/completions",
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${LOVABLE_API_KEY}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              model: "google/gemini-2.5-flash",
              messages: [
                {
                  role: "system",
                  content: `You are a data extraction assistant. Extract structured business information from the website content provided. Return ONLY valid JSON with these fields (use null for any field you cannot find):

{
  "business_name": "string or null",
  "business_type": "one of: dental_clinic, medical_practice, salon, restaurant, saas, agency, ecommerce, consulting, law_firm, accounting, real_estate, insurance, fitness, spa, automotive, education, nonprofit, healthcare, construction, retail, hospitality, technology, marketing, financial_services, photography, cleaning, plumbing, electrician, landscaping, pet_services, logistics, travel, food_delivery, coaching, other",
  "description": "string or null - a concise description of the business",
  "phone": "string or null - phone number in international format if possible",
  "address": {
    "street": "string or null",
    "city": "string or null",
    "postal_code": "string or null"
  },
  "business_hours": {
    "monday": { "isOpen": true/false, "open": "HH:MM", "close": "HH:MM" },
    "tuesday": { "isOpen": true/false, "open": "HH:MM", "close": "HH:MM" },
    "wednesday": { "isOpen": true/false, "open": "HH:MM", "close": "HH:MM" },
    "thursday": { "isOpen": true/false, "open": "HH:MM", "close": "HH:MM" },
    "friday": { "isOpen": true/false, "open": "HH:MM", "close": "HH:MM" },
    "saturday": { "isOpen": true/false, "open": "HH:MM", "close": "HH:MM" },
    "sunday": { "isOpen": true/false, "open": "HH:MM", "close": "HH:MM" }
  },
  "services": [
    { "name": "string", "duration": number_or_null_in_minutes, "description": "string or null" }
  ]
}

Only include data you actually find on the website. Use null for anything not found. Do not guess or make up data.`,
                },
                { role: "user", content: combinedContent },
              ],
            }),
          }
        );

        if (extractRes.ok) {
          const extractData = await extractRes.json();
          let rawContent = extractData.choices?.[0]?.message?.content || "";
          
          // Strip markdown code fences if present
          rawContent = rawContent.replace(/```json\s*/g, "").replace(/```\s*/g, "").trim();
          
          try {
            extractedBusinessData = JSON.parse(rawContent);
            console.log("Successfully extracted business data:", JSON.stringify(extractedBusinessData).substring(0, 200));

            // Store extracted data in organization_settings
            await supabaseAdmin
              .from("organization_settings")
              .update({
                extracted_business_data: {
                  ...extractedBusinessData,
                  extracted_at: new Date().toISOString(),
                  source_url: formattedUrl,
                },
              })
              .eq("organization_id", organizationId);

            // Auto-populate empty fields in organizations table
            const { data: currentOrg } = await supabaseAdmin
              .from("organizations")
              .select("name, description, phone, address, business_type")
              .eq("id", organizationId)
              .single();

            if (currentOrg && extractedBusinessData) {
              const updates: Record<string, unknown> = {};
              const extracted = extractedBusinessData as Record<string, unknown>;

              // Only fill in empty fields
              if (!currentOrg.name && extracted.business_name) {
                updates.name = extracted.business_name;
              } else if (currentOrg.name === 'My Organization' && extracted.business_name) {
                // Replace default placeholder name
                updates.name = extracted.business_name;
              }
              if (!currentOrg.description && extracted.description) {
                updates.description = extracted.description;
              }
              if (!currentOrg.phone && extracted.phone) {
                updates.phone = extracted.phone;
              }
              if ((!currentOrg.business_type || currentOrg.business_type === 'other') && extracted.business_type) {
                updates.business_type = extracted.business_type;
              }
              const currentAddr = (currentOrg.address as Record<string, string>) || {};
              const extractedAddr = (extracted.address as Record<string, string>) || {};
              if ((!currentAddr.street && extractedAddr?.street) || 
                  (!currentAddr.city && extractedAddr?.city) || 
                  (!currentAddr.postal_code && extractedAddr?.postal_code)) {
                updates.address = {
                  street: currentAddr.street || extractedAddr?.street || "",
                  city: currentAddr.city || extractedAddr?.city || "",
                  postal_code: currentAddr.postal_code || extractedAddr?.postal_code || "",
                };
              }

              if (Object.keys(updates).length > 0) {
                console.log("Auto-populating organization fields:", Object.keys(updates));
                await supabaseAdmin
                  .from("organizations")
                  .update(updates)
                  .eq("id", organizationId);
              }
            }

            // Auto-populate empty settings fields
            const { data: currentSettings } = await supabaseAdmin
              .from("organization_settings")
              .select("business_hours, services")
              .eq("organization_id", organizationId)
              .single();

            if (currentSettings && extractedBusinessData) {
              const settingsUpdates: Record<string, unknown> = {};
              const extracted = extractedBusinessData as Record<string, unknown>;
              const currentHours = currentSettings.business_hours as Record<string, unknown> | null;
              const currentServices = currentSettings.services as unknown[] | null;

              if ((!currentHours || Object.keys(currentHours).length === 0) && extracted.business_hours) {
                settingsUpdates.business_hours = extracted.business_hours;
              }
              if ((!currentServices || currentServices.length === 0) && extracted.services) {
                settingsUpdates.services = extracted.services;
              }

              if (Object.keys(settingsUpdates).length > 0) {
                console.log("Auto-populating settings fields:", Object.keys(settingsUpdates));
                await supabaseAdmin
                  .from("organization_settings")
                  .update(settingsUpdates)
                  .eq("organization_id", organizationId);
              }
            }
          } catch (parseErr) {
            console.warn("Failed to parse extracted business data:", parseErr);
          }
        }
      } catch (err) {
        console.warn("Failed to extract business data:", err);
      }
    }

    // Step 5: Auto-sync Vapi assistant with new website knowledge
    try {
      const { data: orgSettings } = await supabaseAdmin
        .from("organization_settings")
        .select("vapi_assistant_id")
        .eq("organization_id", organizationId)
        .single();

      if (orgSettings?.vapi_assistant_id) {
        console.log("Step 5: Syncing Vapi assistant with new website content");
        const vapiSyncRes = await fetch(
          `${Deno.env.get("SUPABASE_URL")}/functions/v1/create-vapi-assistant`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ organizationId }),
          }
        );
        if (vapiSyncRes.ok) {
          console.log("Vapi assistant synced successfully after crawl");
        } else {
          console.warn("Failed to sync Vapi assistant:", await vapiSyncRes.text());
        }
      }
    } catch (err) {
      console.warn("Failed to sync Vapi assistant after crawl:", err);
    }

    return new Response(
      JSON.stringify({
        success: true,
        urls_discovered: urls.length,
        pages_scraped: scrapedPages.length,
        urls: urls.slice(0, 50),
        scraped_titles: scrapedPages.map(p => ({ url: p.url, title: p.title })),
        business_data_extracted: extractedBusinessData !== null,
        extracted_data: extractedBusinessData || null,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("crawl-site error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
