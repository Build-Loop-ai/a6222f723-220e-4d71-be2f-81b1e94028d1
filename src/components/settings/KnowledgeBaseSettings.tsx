import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Globe, RefreshCw, FileText, Loader2, ExternalLink, CheckCircle2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { format, parseISO } from "date-fns";

interface KnowledgeBaseSettingsProps {
  organizationId: string;
}

interface SitePage {
  id: string;
  url: string;
  title: string | null;
  summary: string | null;
  last_crawled_at: string | null;
}

interface SiteMap {
  id: string;
  url: string;
  is_crawled: boolean;
}

export const KnowledgeBaseSettings = ({ organizationId }: KnowledgeBaseSettingsProps) => {
  const [pages, setPages] = useState<SitePage[]>([]);
  const [siteMap, setSiteMap] = useState<SiteMap[]>([]);
  const [loading, setLoading] = useState(true);
  const [crawling, setCrawling] = useState(false);
  const [websiteUrl, setWebsiteUrl] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      const [pagesRes, mapRes, orgRes] = await Promise.all([
        supabase
          .from("site_pages")
          .select("id, url, title, summary, last_crawled_at")
          .eq("organization_id", organizationId)
          .order("last_crawled_at", { ascending: false }),
        supabase
          .from("site_maps")
          .select("id, url, is_crawled")
          .eq("organization_id", organizationId),
        supabase
          .from("organizations")
          .select("website")
          .eq("id", organizationId)
          .single(),
      ]);

      setPages(pagesRes.data || []);
      setSiteMap(mapRes.data || []);
      setWebsiteUrl(orgRes.data?.website || "");
      setLoading(false);
    };
    fetchData();
  }, [organizationId]);

  const handleCrawl = async () => {
    if (!websiteUrl) {
      toast.error("Set your website URL in Business settings first");
      return;
    }

    setCrawling(true);
    try {
      const { data, error } = await supabase.functions.invoke("crawl-site", {
        body: { organizationId, websiteUrl },
      });

      if (error) throw error;

      toast.success(`Crawled ${data?.pagesProcessed || 0} pages`);

      // Refresh data
      const [pagesRes, mapRes] = await Promise.all([
        supabase
          .from("site_pages")
          .select("id, url, title, summary, last_crawled_at")
          .eq("organization_id", organizationId)
          .order("last_crawled_at", { ascending: false }),
        supabase
          .from("site_maps")
          .select("id, url, is_crawled")
          .eq("organization_id", organizationId),
      ]);
      setPages(pagesRes.data || []);
      setSiteMap(mapRes.data || []);
    } catch (err: any) {
      toast.error(err.message || "Failed to crawl site");
    } finally {
      setCrawling(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <Skeleton className="h-48 w-full rounded-xl" />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Overview */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Knowledge Base</CardTitle>
            <CardDescription>
              Pages crawled from your website that your AI uses to answer questions.
            </CardDescription>
          </div>
          <Button onClick={handleCrawl} disabled={crawling} className="gap-2">
            {crawling ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <RefreshCw className="w-4 h-4" />
            )}
            {crawling ? "Crawling..." : "Re-crawl"}
          </Button>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="text-center p-4 rounded-xl bg-muted/50">
              <p className="text-2xl font-semibold">{pages.length}</p>
              <p className="text-xs text-muted-foreground">Pages indexed</p>
            </div>
            <div className="text-center p-4 rounded-xl bg-muted/50">
              <p className="text-2xl font-semibold">{siteMap.length}</p>
              <p className="text-xs text-muted-foreground">URLs discovered</p>
            </div>
            <div className="text-center p-4 rounded-xl bg-muted/50">
              <p className="text-2xl font-semibold truncate text-sm mt-1">
                {websiteUrl ? new URL(websiteUrl.startsWith("http") ? websiteUrl : `https://${websiteUrl}`).hostname : "Not set"}
              </p>
              <p className="text-xs text-muted-foreground">Website</p>
            </div>
          </div>

          {/* Pages list */}
          {pages.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Globe className="w-10 h-10 mx-auto mb-3 opacity-40" />
              <p className="text-sm">No pages crawled yet</p>
              <p className="text-xs mt-1">Click "Re-crawl" to index your website</p>
            </div>
          ) : (
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {pages.map((page) => (
                <div
                  key={page.id}
                  className="flex items-start gap-3 p-3 rounded-xl border border-border hover:bg-muted/30 transition-colors"
                >
                  <FileText className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">
                      {page.title || page.url}
                    </p>
                    {page.summary && (
                      <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">
                        {page.summary}
                      </p>
                    )}
                    <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                      {page.last_crawled_at && (
                        <span>Crawled {format(parseISO(page.last_crawled_at), "MMM d, HH:mm")}</span>
                      )}
                    </div>
                  </div>
                  <a
                    href={page.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-muted-foreground hover:text-foreground shrink-0"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Site Map */}
      {siteMap.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Site Map</CardTitle>
            <CardDescription>All discovered URLs from your website.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-1 max-h-64 overflow-y-auto">
              {siteMap.map((entry) => (
                <div key={entry.id} className="flex items-center gap-2 text-sm py-1">
                  {entry.is_crawled ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-success shrink-0" />
                  ) : (
                    <Globe className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                  )}
                  <span className="truncate text-muted-foreground">{entry.url}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
