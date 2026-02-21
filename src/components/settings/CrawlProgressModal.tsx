import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import {
  Globe,
  Search,
  FileText,
  Brain,
  CheckCircle2,
  Loader2,
  ExternalLink,
  Sparkles,
  MapPin,
  Phone,
  Clock,
  Briefcase,
  Building,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

type CrawlPhase = "mapping" | "scraping" | "analyzing" | "extracting" | "done";

interface CrawlResult {
  success: boolean;
  urls_discovered: number;
  pages_scraped: number;
  urls?: string[];
  scraped_titles?: { url: string; title: string }[];
  business_data_extracted: boolean;
  extracted_data?: {
    business_name?: string | null;
    business_type?: string | null;
    description?: string | null;
    phone?: string | null;
    address?: { street?: string; city?: string; postal_code?: string } | null;
    business_hours?: Record<string, unknown> | null;
    services?: Array<{ name: string }> | null;
  } | null;
}

interface CrawlProgressModalProps {
  open: boolean;
  onClose: () => void;
  websiteUrl: string;
  crawlPromise: Promise<CrawlResult> | null;
  onComplete?: () => void;
}

const PHASE_CONFIG: Record<
  CrawlPhase,
  { icon: typeof Globe; label: string; description: string }
> = {
  mapping: {
    icon: Search,
    label: "Discovering pages",
    description: "Mapping your entire website structure...",
  },
  scraping: {
    icon: FileText,
    label: "Reading content",
    description: "Extracting information from every page...",
  },
  analyzing: {
    icon: Brain,
    label: "AI analysis",
    description: "Understanding your business from the content...",
  },
  extracting: {
    icon: Sparkles,
    label: "Extracting data",
    description: "Pulling out business details, hours & services...",
  },
  done: {
    icon: CheckCircle2,
    label: "Complete",
    description: "Your AI now knows your business!",
  },
};

const PHASE_ORDER: CrawlPhase[] = [
  "mapping",
  "scraping",
  "analyzing",
  "extracting",
  "done",
];

function SitemapTree({ urls }: { urls: string[] }) {
  const grouped = urls.reduce<Record<string, string[]>>((acc, url) => {
    try {
      const u = new URL(url);
      const path = u.pathname === "/" ? "/" : u.pathname;
      const segments = path.split("/").filter(Boolean);
      const group = segments.length > 0 ? `/${segments[0]}` : "/";
      if (!acc[group]) acc[group] = [];
      acc[group].push(path);
    } catch {
      // skip invalid urls
    }
    return acc;
  }, {});

  const groups = Object.entries(grouped).slice(0, 8);

  return (
    <div className="space-y-1">
      {groups.map(([group, paths], gi) => (
        <motion.div
          key={group}
          initial={{ opacity: 0, x: -12 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: gi * 0.08, duration: 0.3 }}
        >
          <div className="flex items-center gap-2 text-xs">
            <div className="w-3 h-3 rounded-sm bg-primary/20 border border-primary/30" />
            <span className="font-medium text-foreground truncate">
              {group}
            </span>
            <Badge variant="secondary" className="text-[10px] h-4 px-1.5">
              {paths.length}
            </Badge>
          </div>
          <div className="ml-4 border-l border-border/50 pl-3 mt-0.5 space-y-0.5">
            {paths.slice(0, 3).map((p, pi) => (
              <motion.div
                key={p}
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.6 }}
                transition={{ delay: gi * 0.08 + pi * 0.04 + 0.2 }}
                className="text-[10px] text-muted-foreground truncate"
              >
                {p}
              </motion.div>
            ))}
            {paths.length > 3 && (
              <span className="text-[10px] text-muted-foreground/50">
                +{paths.length - 3} more
              </span>
            )}
          </div>
        </motion.div>
      ))}
    </div>
  );
}

function ExtractedDataSummary({
  data,
}: {
  data: NonNullable<CrawlResult["extracted_data"]>;
}) {
  const items: { icon: typeof Building; label: string; value: string }[] = [];

  if (data.business_name) {
    items.push({ icon: Building, label: "Name", value: data.business_name });
  }
  if (data.business_type && data.business_type !== "other") {
    items.push({
      icon: Briefcase,
      label: "Type",
      value: data.business_type.replace(/_/g, " "),
    });
  }
  if (data.phone) {
    items.push({ icon: Phone, label: "Phone", value: data.phone });
  }
  if (data.address?.city) {
    items.push({
      icon: MapPin,
      label: "Location",
      value: [data.address.street, data.address.city].filter(Boolean).join(", "),
    });
  }
  if (data.business_hours && Object.keys(data.business_hours).length > 0) {
    items.push({ icon: Clock, label: "Hours", value: "Detected" });
  }
  if (data.services && data.services.length > 0) {
    items.push({
      icon: Briefcase,
      label: "Services",
      value: `${data.services.length} found`,
    });
  }

  return (
    <div className="grid grid-cols-2 gap-2">
      {items.map((item, i) => (
        <motion.div
          key={item.label}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: i * 0.1, duration: 0.3 }}
          className="flex items-center gap-2 px-3 py-2 rounded-lg bg-primary/5 border border-primary/10"
        >
          <item.icon className="w-3.5 h-3.5 text-primary shrink-0" />
          <div className="min-w-0">
            <div className="text-[10px] text-muted-foreground">{item.label}</div>
            <div className="text-xs font-medium text-foreground truncate capitalize">
              {item.value}
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}

export function CrawlProgressModal({
  open,
  onClose,
  websiteUrl,
  crawlPromise,
  onComplete,
}: CrawlProgressModalProps) {
  const [phase, setPhase] = useState<CrawlPhase>("mapping");
  const [result, setResult] = useState<CrawlResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [simulatedUrls, setSimulatedUrls] = useState<string[]>([]);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Simulate phase progression while waiting for real result
  useEffect(() => {
    if (!open || !crawlPromise) return;

    setPhase("mapping");
    setResult(null);
    setError(null);
    setSimulatedUrls([]);

    // Simulate URL discovery
    let urlCount = 0;
    const hostname = (() => {
      try {
        return new URL(
          websiteUrl.startsWith("http") ? websiteUrl : `https://${websiteUrl}`
        ).hostname;
      } catch {
        return websiteUrl;
      }
    })();

    const fakePages = [
      "/",
      "/about",
      "/services",
      "/contact",
      "/pricing",
      "/team",
      "/blog",
      "/faq",
      "/terms",
      "/privacy",
      "/careers",
      "/portfolio",
    ];

    intervalRef.current = setInterval(() => {
      if (urlCount < fakePages.length) {
        setSimulatedUrls((prev) => [
          ...prev,
          `https://${hostname}${fakePages[urlCount]}`,
        ]);
        urlCount++;
      }
    }, 400);

    // Phase timing
    const t1 = setTimeout(() => setPhase("scraping"), 3000);
    const t2 = setTimeout(() => setPhase("analyzing"), 8000);
    const t3 = setTimeout(() => setPhase("extracting"), 14000);

    crawlPromise
      .then((data) => {
        if (intervalRef.current) clearInterval(intervalRef.current);
        // Replace simulated URLs with real ones
        if (data.urls) setSimulatedUrls(data.urls);
        setResult(data);
        setPhase("done");
      })
      .catch((err) => {
        if (intervalRef.current) clearInterval(intervalRef.current);
        setError(err?.message || "Crawl failed");
        setPhase("done");
      });

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [open, crawlPromise, websiteUrl]);

  const currentPhaseIndex = PHASE_ORDER.indexOf(phase);
  const progress = phase === "done" ? 100 : (currentPhaseIndex / (PHASE_ORDER.length - 1)) * 100;

  const hostname = (() => {
    try {
      return new URL(
        websiteUrl.startsWith("http") ? websiteUrl : `https://${websiteUrl}`
      ).hostname;
    } catch {
      return websiteUrl;
    }
  })();

  return (
    <Dialog open={open} onOpenChange={() => phase === "done" && onClose()}>
      <DialogContent className="sm:max-w-lg p-0 gap-0 overflow-hidden">
        {/* Header */}
        <div className="px-6 pt-6 pb-4">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Globe className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">
                Learning from your website
              </h3>
              <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                <ExternalLink className="w-3 h-3" />
                {hostname}
              </div>
            </div>
          </div>
        </div>

        {/* Progress bar */}
        <div className="px-6">
          <Progress value={progress} className="h-1.5" />
        </div>

        {/* Steps */}
        <div className="px-6 py-4">
          <div className="space-y-2">
            {PHASE_ORDER.filter((p) => p !== "done").map((p, i) => {
              const config = PHASE_CONFIG[p];
              const Icon = config.icon;
              const isActive = p === phase;
              const isDone = currentPhaseIndex > i || phase === "done";

              return (
                <motion.div
                  key={p}
                  initial={{ opacity: 0.4 }}
                  animate={{
                    opacity: isDone || isActive ? 1 : 0.4,
                  }}
                  className={`flex items-center gap-3 py-1.5 px-3 rounded-lg transition-colors ${
                    isActive
                      ? "bg-primary/5"
                      : isDone
                      ? "bg-muted/30"
                      : ""
                  }`}
                >
                  {isDone ? (
                    <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
                  ) : isActive ? (
                    <Loader2 className="w-4 h-4 text-primary animate-spin shrink-0" />
                  ) : (
                    <Icon className="w-4 h-4 text-muted-foreground shrink-0" />
                  )}
                  <div className="min-w-0">
                    <div
                      className={`text-sm font-medium ${
                        isDone || isActive
                          ? "text-foreground"
                          : "text-muted-foreground"
                      }`}
                    >
                      {config.label}
                    </div>
                    {isActive && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        className="text-xs text-muted-foreground"
                      >
                        {config.description}
                      </motion.div>
                    )}
                  </div>
                  {isDone && p === "mapping" && result && (
                    <Badge variant="secondary" className="ml-auto text-[10px]">
                      {result.urls_discovered} pages
                    </Badge>
                  )}
                  {isDone && p === "scraping" && result && (
                    <Badge variant="secondary" className="ml-auto text-[10px]">
                      {result.pages_scraped} scraped
                    </Badge>
                  )}
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Visual panel — sitemap or extracted data */}
        <div className="px-6 pb-4">
          <AnimatePresence mode="wait">
            {phase !== "done" && simulatedUrls.length > 0 && (
              <motion.div
                key="sitemap"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="rounded-xl border bg-muted/30 p-4 max-h-44 overflow-y-auto"
              >
                <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-2 font-medium">
                  Site Map
                </div>
                <SitemapTree urls={simulatedUrls} />
              </motion.div>
            )}

            {phase === "done" && !error && result?.extracted_data && (
              <motion.div
                key="extracted"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-xl border bg-muted/30 p-4"
              >
                <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-3 font-medium flex items-center gap-1.5">
                  <Sparkles className="w-3 h-3 text-primary" />
                  Extracted from your website
                </div>
                <ExtractedDataSummary data={result.extracted_data} />
              </motion.div>
            )}

            {phase === "done" && error && (
              <motion.div
                key="error"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="rounded-xl border border-destructive/20 bg-destructive/5 p-4 text-sm text-destructive"
              >
                {error}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer */}
        {phase === "done" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="px-6 pb-6"
          >
            <Button
              onClick={() => {
                onComplete?.();
                onClose();
              }}
              className="w-full"
            >
              {error ? "Close" : "Done — View Results"}
            </Button>
          </motion.div>
        )}
      </DialogContent>
    </Dialog>
  );
}
