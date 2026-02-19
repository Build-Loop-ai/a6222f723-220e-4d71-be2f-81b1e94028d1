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
    // Auth check
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const token = authHeader.replace("Bearer ", "");
    const { data: claimsData, error: claimsError } = await supabase.auth.getClaims(token);
    if (claimsError || !claimsData?.claims) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const userId = claimsData.claims.sub;

    const { organizationId, websiteUrl } = await req.json();
    if (!organizationId || !websiteUrl) {
      return new Response(
        JSON.stringify({ error: "organizationId and websiteUrl are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Verify user is org member
    const { data: profile } = await supabase
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
    await supabaseAdmin.from("site_maps").delete().eq("organization_id", organizationId);
    await supabaseAdmin.from("site_pages").delete().eq("organization_id", organizationId);

    // Store discovered URLs in site_maps
    if (urls.length > 0) {
      const siteMapRows = urls.map((url: string) => ({
        organization_id: organizationId,
        url,
        is_crawled: false,
      }));

      // Insert in batches of 100
      for (let i = 0; i < siteMapRows.length; i += 100) {
        const batch = siteMapRows.slice(i, i + 100);
        await supabaseAdmin.from("site_maps").upsert(batch, {
          onConflict: "organization_id,url",
        });
      }
    }

    // Step 2: Scrape top pages (limit 30 to stay within reasonable limits)
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

    // Scrape in batches of 5 to avoid rate limits
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
              content_markdown: markdown.substring(0, 50000), // Cap at 50k chars
              summary: null, // Will be generated later
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
        await supabaseAdmin.from("site_pages").upsert(batch, {
          onConflict: "organization_id,url",
        });
      }

      // Mark scraped URLs in site_maps
      const scrapedUrls = scrapedPages.map((p) => p.url);
      await supabaseAdmin
        .from("site_maps")
        .update({ is_crawled: true })
        .eq("organization_id", organizationId)
        .in("url", scrapedUrls);
    }

    // Step 3: Generate summaries using Lovable AI
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (LOVABLE_API_KEY && scrapedPages.length > 0) {
      console.log("Step 3: Generating page summaries");

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
    }

    return new Response(
      JSON.stringify({
        success: true,
        urls_discovered: urls.length,
        pages_scraped: scrapedPages.length,
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
