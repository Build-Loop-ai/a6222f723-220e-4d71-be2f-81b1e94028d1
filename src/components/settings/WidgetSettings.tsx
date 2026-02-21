import { useState, useEffect, useRef, useCallback } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Copy,
  Loader2,
  Plus,
  X,
  MessageSquare,
  ExternalLink,
  Code,
  Shield,
  Pencil,
  Type,
  Palette,
  Mic,
  Send,
  Sparkles,
  ChevronRight,
  ChevronDown,
  Layers,
  MousePointerClick,
  Wand2,
  LayoutGrid,
  Globe,
  CircleDot,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { EmbedCodeSnippet } from "@/components/embed/EmbedCodeSnippet";

interface WidgetSettingsProps {
  organizationId: string;
}

interface WidgetConfig {
  id: string;
  api_key: string;
  widget_title: string;
  welcome_message: string;
  placeholder_text: string;
  accent_color: string;
  position: string;
  theme: string;
  voice_enabled: boolean;
  avatar_url: string | null;
  allowed_domains: string[];
  header_text_color: string;
  bot_message_bg: string;
  bot_message_text_color: string;
  user_message_text_color: string;
  font_family: string;
  border_radius: string;
  show_branding: boolean;
  header_subtitle: string;
  bot_name: string;
  chat_bg_color: string;
  input_bg_color: string;
  input_text_color: string;
  input_border_color: string;
}

type EditingZone =
  | null
  | "header"
  | "welcome"
  | "user-bubble"
  | "bot-bubble"
  | "input"
  | "branding"
  | "bubble-btn";

const PRESET_COLORS = [
  "#34D77B", "#0d9488", "#6366f1", "#2563eb",
  "#dc2626", "#ea580c", "#d97706", "#16a34a",
  "#7c3aed", "#db2777", "#0891b2", "#059669",
];

const FONT_OPTIONS = [
  { value: "DM Sans", label: "DM Sans", preview: "Aa" },
  { value: "Inter", label: "Inter", preview: "Aa" },
  { value: "Syne", label: "Syne", preview: "Aa" },
  { value: "Space Grotesk", label: "Space Grotesk", preview: "Aa" },
  { value: "Plus Jakarta Sans", label: "Jakarta", preview: "Aa" },
  { value: "system-ui", label: "System", preview: "Aa" },
];

const RADIUS_OPTIONS = [
  { value: "none", label: "Sharp", css: "0px", icon: "□" },
  { value: "sm", label: "Soft", css: "8px", icon: "▢" },
  { value: "rounded", label: "Round", css: "16px", icon: "◻" },
  { value: "full", label: "Pill", css: "9999px", icon: "◯" },
];

/* ── Inline color swatch + picker ── */
function ColorSwatch({
  value,
  onChange,
  label,
}: {
  value: string;
  onChange: (v: string) => void;
  label: string;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="space-y-1">
      <span className="text-[10px] uppercase tracking-wider text-gray-400 font-medium">
        {label}
      </span>
      <div className="flex items-center gap-2">
        <button
          onClick={() => setOpen(!open)}
          className="relative h-7 w-7 rounded-lg border border-gray-200 transition-all hover:scale-110 hover:shadow-md active:scale-95 shrink-0"
          style={{ backgroundColor: value }}
        >
          {open && (
            <motion.div
              layoutId="color-ring"
              className="absolute -inset-[3px] rounded-[10px] border-2 border-primary"
            />
          )}
        </button>
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="flex-1 h-7 bg-transparent border-0 border-b border-gray-200 text-[11px] font-mono text-gray-700 outline-none focus:border-primary/50 transition-colors px-0"
        />
      </div>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="pt-1.5 flex items-center gap-2">
              <input
                type="color"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="h-7 w-7 cursor-pointer rounded-lg border-0 bg-transparent p-0"
              />
              <div className="flex flex-wrap gap-1">
                {PRESET_COLORS.slice(0, 8).map((c) => (
                  <button
                    key={c}
                    onClick={() => { onChange(c); setOpen(false); }}
                    className={`h-4 w-4 rounded-full transition-all hover:scale-125 ${
                      value === c ? "ring-1 ring-primary ring-offset-1 ring-offset-white" : ""
                    }`}
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ── Zone label mapping ── */
const ZONE_LABELS: Record<string, { title: string; icon: React.ReactNode; desc: string }> = {
  header: { title: "Header", icon: <Layers className="h-3.5 w-3.5" />, desc: "Title, subtitle & colors" },
  welcome: { title: "Welcome", icon: <Sparkles className="h-3.5 w-3.5" />, desc: "First impression message" },
  "bot-bubble": { title: "Bot Messages", icon: <MessageSquare className="h-3.5 w-3.5" />, desc: "AI response styling" },
  "user-bubble": { title: "User Messages", icon: <Send className="h-3.5 w-3.5" />, desc: "Visitor message styling" },
  input: { title: "Input", icon: <Type className="h-3.5 w-3.5" />, desc: "Text field appearance" },
  branding: { title: "Branding", icon: <CircleDot className="h-3.5 w-3.5" />, desc: "Footer attribution" },
  "bubble-btn": { title: "Chat Button", icon: <MousePointerClick className="h-3.5 w-3.5" />, desc: "Floating trigger button" },
};

export const WidgetSettings = ({ organizationId }: WidgetSettingsProps) => {
  const [config, setConfig] = useState<WidgetConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [newDomain, setNewDomain] = useState("");
  const [previewOpen, setPreviewOpen] = useState(true);
  const [editingZone, setEditingZone] = useState<EditingZone>(null);
  const [activePanel, setActivePanel] = useState<"style" | "embed" | "domains">("style");
  const [websiteUrl, setWebsiteUrl] = useState<string | null>(null);
  const [iframeLoaded, setIframeLoaded] = useState(false);
  const [iframeFailed, setIframeFailed] = useState(false);
  const [screenshotLoaded, setScreenshotLoaded] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const iframeTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const fetchConfig = async () => {
      const [{ data: widgetData }, { data: orgData }] = await Promise.all([
        supabase
          .from("widget_configs")
          .select("*")
          .eq("organization_id", organizationId)
          .maybeSingle(),
        supabase
          .from("organizations")
          .select("website")
          .eq("id", organizationId)
          .maybeSingle(),
      ]);
      setConfig(widgetData);
      if (orgData?.website) {
        let url = orgData.website.trim();
        if (!url.startsWith("http://") && !url.startsWith("https://")) {
          url = `https://${url}`;
        }
        setWebsiteUrl(url);
      }
      setLoading(false);
    };
    fetchConfig();
  }, [organizationId]);

  useEffect(() => {
    if (!websiteUrl || iframeLoaded) return;
    iframeTimeoutRef.current = setTimeout(() => {
      if (!iframeLoaded) {
        setIframeFailed(true);
      }
    }, 5000);
    return () => {
      if (iframeTimeoutRef.current) clearTimeout(iframeTimeoutRef.current);
    };
  }, [websiteUrl, iframeLoaded]);

  const saveConfig = async (updates: Partial<WidgetConfig>) => {
    if (!config) return;
    const { error } = await supabase
      .from("widget_configs")
      .update(updates)
      .eq("id", config.id);
    if (error) toast.error("Failed to save");
  };

  const debounceRef = useRef<NodeJS.Timeout | null>(null);
  const debouncedSave = useCallback(
    (updates: Partial<WidgetConfig>) => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => saveConfig(updates), 800);
    },
    [config]
  );

  const handleCreate = async () => {
    setCreating(true);
    try {
      const { data, error } = await supabase
        .from("widget_configs")
        .insert({ organization_id: organizationId })
        .select()
        .single();
      if (error) throw error;
      setConfig(data);
      toast.success("Widget created!");
    } catch (err: any) {
      toast.error(err.message || "Failed to create widget");
    } finally {
      setCreating(false);
    }
  };

  const u = <K extends keyof WidgetConfig>(key: K, value: WidgetConfig[K]) => {
    if (!config) return;
    setConfig({ ...config, [key]: value });
    debouncedSave({ [key]: value });
  };

  const uNow = <K extends keyof WidgetConfig>(key: K, value: WidgetConfig[K]) => {
    if (!config) return;
    setConfig({ ...config, [key]: value });
    saveConfig({ [key]: value });
  };

  const addDomain = () => {
    if (!newDomain || !config) return;
    const updated = [...(config.allowed_domains || []), newDomain];
    setConfig({ ...config, allowed_domains: updated });
    saveConfig({ allowed_domains: updated });
    setNewDomain("");
  };

  const removeDomain = (domain: string) => {
    if (!config) return;
    const updated = (config.allowed_domains || []).filter((d) => d !== domain);
    setConfig({ ...config, allowed_domains: updated });
    saveConfig({ allowed_domains: updated });
  };

  const radiusCss =
    RADIUS_OPTIONS.find((r) => r.value === config?.border_radius)?.css || "16px";

  // Open the dropdown when switching to embed/domains or when editing a zone
  useEffect(() => {
    if (activePanel !== "style") {
      setDropdownOpen(true);
      setEditingZone(null);
    }
  }, [activePanel]);

  useEffect(() => {
    if (editingZone) {
      setDropdownOpen(true);
      setActivePanel("style");
    }
  }, [editingZone]);

  if (loading)
    return (
      <div className="flex items-center justify-center flex-1 h-full">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center gap-3"
        >
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
          <span className="text-xs text-muted-foreground">Loading builder…</span>
        </motion.div>
      </div>
    );

  if (!config) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex items-center justify-center flex-1 h-full"
      >
        <div className="text-center max-w-md">
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="mx-auto mb-8 relative"
          >
            <div className="h-24 w-24 mx-auto rounded-[28px] bg-gray-100 flex items-center justify-center shadow-sm">
              <Wand2 className="h-10 w-10 text-primary" />
            </div>
            <div className="absolute -inset-4 rounded-[36px] bg-gray-100/50 blur-xl -z-10" />
          </motion.div>
          <motion.h3
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-2xl font-bold font-heading mb-2 text-gray-900"
          >
            Widget Builder
          </motion.h3>
          <motion.p
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-sm text-gray-500 mb-8"
          >
            Design your chat widget visually. Click any element to customize it in real-time.
          </motion.p>
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            <Button
              onClick={handleCreate}
              disabled={creating}
              size="lg"
              className="rounded-2xl px-8 h-12 text-sm font-semibold gap-2"
            >
              {creating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
              Start Building
            </Button>
          </motion.div>
        </div>
      </motion.div>
    );
  }

  /* ── Zone editor content (for dropdown panel) ── */
  const renderZoneEditor = () => {
    if (!editingZone) return null;
    const zone = ZONE_LABELS[editingZone];

    return (
      <motion.div
        key={editingZone}
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        transition={{ type: "spring", damping: 25, stiffness: 400 }}
        className="space-y-3"
      >
        {/* Zone header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-6 w-6 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
              {zone.icon}
            </div>
            <div>
              <h4 className="text-xs font-semibold text-gray-900">{zone.title}</h4>
              <p className="text-[10px] text-gray-500">{zone.desc}</p>
            </div>
          </div>
          <button
            onClick={() => { setEditingZone(null); setDropdownOpen(false); }}
            className="h-6 w-6 rounded-md flex items-center justify-center text-gray-400 hover:text-gray-900 hover:bg-white/50 transition-colors"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>

        <div className="h-px bg-white/30" />

        {/* Zone-specific controls in a horizontal flow */}
        <div className="flex flex-wrap gap-4">
          {editingZone === "header" && (
            <>
              <div className="w-40"><FieldInput label="Title" value={config.widget_title} onChange={(v) => u("widget_title", v)} /></div>
              <div className="w-40"><FieldInput label="Subtitle" value={config.header_subtitle} onChange={(v) => u("header_subtitle", v)} /></div>
              <ColorSwatch label="Background" value={config.accent_color} onChange={(v) => u("accent_color", v)} />
              <ColorSwatch label="Text Color" value={config.header_text_color} onChange={(v) => u("header_text_color", v)} />
              <div className="w-48"><FieldInput label="Avatar URL" value={config.avatar_url || ""} onChange={(v) => u("avatar_url", v || null)} placeholder="https://..." /></div>
            </>
          )}

          {editingZone === "welcome" && (
            <>
              <div className="w-40"><FieldInput label="Bot Name" value={config.bot_name} onChange={(v) => u("bot_name", v)} /></div>
              <div className="w-64 space-y-1">
                <span className="text-[10px] uppercase tracking-wider text-gray-500 font-medium">Welcome Message</span>
                <Textarea
                  value={config.welcome_message}
                  onChange={(e) => u("welcome_message", e.target.value)}
                  rows={2}
                  className="text-xs bg-white/60 border-white/40 text-gray-900 focus:border-primary/50 resize-none"
                />
              </div>
            </>
          )}

          {editingZone === "bot-bubble" && (
            <>
              <ColorSwatch label="Background" value={config.bot_message_bg} onChange={(v) => u("bot_message_bg", v)} />
              <ColorSwatch label="Text Color" value={config.bot_message_text_color} onChange={(v) => u("bot_message_text_color", v)} />
              <ColorSwatch label="Chat Background" value={config.chat_bg_color} onChange={(v) => u("chat_bg_color", v)} />
            </>
          )}

          {editingZone === "user-bubble" && (
            <>
              <ColorSwatch label="Background" value={config.accent_color} onChange={(v) => u("accent_color", v)} />
              <ColorSwatch label="Text Color" value={config.user_message_text_color} onChange={(v) => u("user_message_text_color", v)} />
            </>
          )}

          {editingZone === "input" && (
            <>
              <div className="w-40"><FieldInput label="Placeholder" value={config.placeholder_text} onChange={(v) => u("placeholder_text", v)} /></div>
              <ColorSwatch label="Background" value={config.input_bg_color} onChange={(v) => u("input_bg_color", v)} />
              <ColorSwatch label="Text Color" value={config.input_text_color} onChange={(v) => u("input_text_color", v)} />
              <ColorSwatch label="Border" value={config.input_border_color} onChange={(v) => u("input_border_color", v)} />
            </>
          )}

          {editingZone === "branding" && (
            <div className="flex items-center gap-3">
              <span className="text-xs text-gray-700">Show "Powered by" text</span>
              <Switch checked={config.show_branding} onCheckedChange={(v) => uNow("show_branding", v)} />
            </div>
          )}

          {editingZone === "bubble-btn" && (
            <>
              <ColorSwatch label="Button Color" value={config.accent_color} onChange={(v) => u("accent_color", v)} />
              <div className="space-y-1.5">
                <span className="text-[10px] uppercase tracking-wider text-gray-500 font-medium">Position</span>
                <div className="flex gap-1.5">
                  {(["bottom-right", "bottom-left"] as const).map((pos) => (
                    <button
                      key={pos}
                      onClick={() => uNow("position", pos)}
                      className={`relative rounded-xl p-2.5 text-[10px] font-medium transition-all w-20 ${
                        config.position === pos
                          ? "bg-primary/10 text-primary border border-primary/30"
                          : "bg-white/50 text-gray-500 border border-white/40 hover:border-gray-300"
                      }`}
                    >
                      <div className="relative h-6 w-full rounded-md border border-current/10 bg-current/5 mb-1">
                        <div
                          className={`absolute bottom-0.5 h-2 w-2 rounded-full bg-current ${
                            pos === "bottom-right" ? "right-0.5" : "left-0.5"
                          }`}
                        />
                      </div>
                      {pos === "bottom-right" ? "Right" : "Left"}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </motion.div>
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex-1 min-h-0 h-full overflow-hidden bg-white text-gray-900 relative"
    >
      {/* ━━━━ Glassy Top Bar ━━━━ */}
      <div className="absolute top-0 left-0 right-0 z-30">
        {/* Main bar */}
        <div className="h-14 backdrop-blur-xl bg-white/70 border-b border-white/30 shadow-lg flex items-center px-4 gap-3">
          {/* Left: label + auto-save */}
          <div className="flex items-center gap-2 shrink-0">
            <div className="h-7 w-7 rounded-lg bg-primary/10 flex items-center justify-center">
              <Wand2 className="h-3.5 w-3.5 text-primary" />
            </div>
            <span className="text-xs font-semibold text-gray-900 hidden sm:inline">Widget Builder</span>
            <div className="flex items-center gap-1.5 ml-1">
              <div className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
              <span className="text-[9px] text-primary font-medium">Auto-saving</span>
            </div>
          </div>

          {/* Center: Tab pills */}
          <div className="flex-1 flex justify-center">
            <div className="flex gap-0.5 p-0.5 rounded-xl bg-black/5 backdrop-blur-sm">
              {([
                { key: "style", icon: <Palette className="h-3 w-3" />, label: "Design" },
                { key: "embed", icon: <Code className="h-3 w-3" />, label: "Embed" },
                { key: "domains", icon: <Globe className="h-3 w-3" />, label: "Domains" },
              ] as const).map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => {
                    setActivePanel(tab.key);
                    if (tab.key === "style") {
                      setDropdownOpen(false);
                      setEditingZone(null);
                    }
                  }}
                  className={`flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-[11px] font-medium transition-all ${
                    activePanel === tab.key
                      ? "bg-white text-gray-900 shadow-sm"
                      : "text-gray-500 hover:text-gray-900"
                  }`}
                >
                  {tab.icon}
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Right: Design inline controls + preview + position */}
          <div className="flex items-center gap-2 shrink-0">
            {activePanel === "style" && (
              <>
                {/* Inline color swatches */}
                <div className="hidden md:flex items-center gap-1">
                  {PRESET_COLORS.slice(0, 6).map((c) => (
                    <motion.button
                      key={c}
                      whileHover={{ scale: 1.2 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => u("accent_color", c)}
                      className={`h-5 w-5 rounded-full transition-all ${
                        config.accent_color === c
                          ? "ring-2 ring-primary ring-offset-1 ring-offset-white/70 shadow-md"
                          : "hover:shadow-sm"
                      }`}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                  <input
                    type="color"
                    value={config.accent_color}
                    onChange={(e) => u("accent_color", e.target.value)}
                    className="h-5 w-5 cursor-pointer rounded-full border-0 bg-transparent p-0 ml-0.5"
                  />
                </div>

                <div className="hidden md:block h-5 w-px bg-gray-200" />

                {/* Font popover */}
                <Popover>
                  <PopoverTrigger asChild>
                    <button className="flex items-center gap-1 rounded-lg bg-black/5 hover:bg-black/10 px-2 py-1 text-[10px] font-medium text-gray-600 transition-all">
                      <Type className="h-3 w-3" />
                      <span className="hidden lg:inline" style={{ fontFamily: config.font_family }}>{FONT_OPTIONS.find(f => f.value === config.font_family)?.label || "Font"}</span>
                      <ChevronDown className="h-2.5 w-2.5" />
                    </button>
                  </PopoverTrigger>
                  <PopoverContent className="w-48 p-2 bg-white border border-gray-200 shadow-xl z-50" align="end" sideOffset={8}>
                    <div className="space-y-0.5">
                      {FONT_OPTIONS.map((f) => (
                        <button
                          key={f.value}
                          onClick={() => uNow("font_family", f.value)}
                          className={`w-full flex items-center gap-2 rounded-lg px-2.5 py-2 text-xs transition-all ${
                            config.font_family === f.value
                              ? "bg-primary/10 text-primary"
                              : "text-gray-600 hover:bg-gray-50"
                          }`}
                        >
                          <span className="text-sm font-bold w-6" style={{ fontFamily: f.value }}>{f.preview}</span>
                          {f.label}
                        </button>
                      ))}
                    </div>
                  </PopoverContent>
                </Popover>

                {/* Corners popover */}
                <Popover>
                  <PopoverTrigger asChild>
                    <button className="flex items-center gap-1 rounded-lg bg-black/5 hover:bg-black/10 px-2 py-1 text-[10px] font-medium text-gray-600 transition-all">
                      <LayoutGrid className="h-3 w-3" />
                      <span className="hidden lg:inline">{RADIUS_OPTIONS.find(r => r.value === config.border_radius)?.label || "Corners"}</span>
                      <ChevronDown className="h-2.5 w-2.5" />
                    </button>
                  </PopoverTrigger>
                  <PopoverContent className="w-44 p-2 bg-white border border-gray-200 shadow-xl z-50" align="end" sideOffset={8}>
                    <div className="space-y-0.5">
                      {RADIUS_OPTIONS.map((r) => (
                        <button
                          key={r.value}
                          onClick={() => uNow("border_radius", r.value)}
                          className={`w-full flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-xs transition-all ${
                            config.border_radius === r.value
                              ? "bg-primary/10 text-primary"
                              : "text-gray-600 hover:bg-gray-50"
                          }`}
                        >
                          <div className="h-4 w-4 border-2 border-current" style={{ borderRadius: r.css === "9999px" ? "50%" : r.css }} />
                          {r.label}
                        </button>
                      ))}
                    </div>
                  </PopoverContent>
                </Popover>

                <div className="hidden md:block h-5 w-px bg-gray-200" />

                {/* Feature toggle icons */}
                <button
                  onClick={() => uNow("voice_enabled", !config.voice_enabled)}
                  className={`h-7 w-7 rounded-lg flex items-center justify-center transition-all ${
                    config.voice_enabled
                      ? "bg-primary/10 text-primary"
                      : "bg-black/5 text-gray-400 hover:text-gray-600"
                  }`}
                  title="Voice input"
                >
                  <Mic className="h-3.5 w-3.5" />
                </button>
                <button
                  onClick={() => uNow("show_branding", !config.show_branding)}
                  className={`h-7 w-7 rounded-lg flex items-center justify-center transition-all ${
                    config.show_branding
                      ? "bg-primary/10 text-primary"
                      : "bg-black/5 text-gray-400 hover:text-gray-600"
                  }`}
                  title="Show branding"
                >
                  <CircleDot className="h-3.5 w-3.5" />
                </button>
              </>
            )}

            <div className="h-5 w-px bg-gray-200" />

            {/* Position toggle */}
            <button
              onClick={() => uNow("position", config.position === "bottom-right" ? "bottom-left" : "bottom-right")}
              className="flex items-center gap-1 rounded-lg bg-black/5 hover:bg-black/10 px-2 py-1 text-[10px] font-medium text-gray-600 transition-all"
              title={`Position: ${config.position}`}
            >
              <div className="relative h-4 w-6 rounded border border-current/20 bg-current/5">
                <div className={`absolute bottom-0.5 h-1.5 w-1.5 rounded-full bg-primary ${config.position === "bottom-right" ? "right-0.5" : "left-0.5"}`} />
              </div>
            </button>

            {/* Preview button */}
            <button
              onClick={() => window.open("/widget-preview", "_blank")}
              className="flex items-center gap-1 rounded-lg bg-primary/10 hover:bg-primary/20 px-2.5 py-1.5 text-[10px] font-medium text-primary transition-all"
            >
              <ExternalLink className="h-3 w-3" />
              Preview
            </button>
          </div>
        </div>

        {/* ━━━━ Slide-down dropdown panel ━━━━ */}
        <AnimatePresence>
          {dropdownOpen && (activePanel !== "style" || editingZone) && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ type: "spring", damping: 30, stiffness: 400 }}
              className="overflow-hidden"
            >
              <div className="backdrop-blur-xl bg-white/80 border-b border-white/30 shadow-md px-6 py-4 max-h-[50vh] overflow-y-auto">
                <AnimatePresence mode="wait">
                  {activePanel === "style" && editingZone && renderZoneEditor()}

                  {activePanel === "embed" && (
                    <motion.div
                      key="embed"
                      initial={{ opacity: 0, y: -8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      className="max-w-2xl mx-auto"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <h4 className="text-xs font-semibold text-gray-900">Install on Your Website</h4>
                          <p className="text-[10px] text-gray-500">Add this snippet before the closing {'</body>'} tag.</p>
                        </div>
                        <button
                          onClick={() => { setDropdownOpen(false); setActivePanel("style"); }}
                          className="h-6 w-6 rounded-md flex items-center justify-center text-gray-400 hover:text-gray-900 hover:bg-white/50 transition-colors"
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </div>
                      <EmbedCodeSnippet apiKey={config.api_key} />
                    </motion.div>
                  )}

                  {activePanel === "domains" && (
                    <motion.div
                      key="domains"
                      initial={{ opacity: 0, y: -8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      className="max-w-lg mx-auto space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="text-xs font-semibold text-gray-900">Allowed Domains</h4>
                          <p className="text-[10px] text-gray-500">Restrict where your widget can appear. Leave empty for no restrictions.</p>
                        </div>
                        <button
                          onClick={() => { setDropdownOpen(false); setActivePanel("style"); }}
                          className="h-6 w-6 rounded-md flex items-center justify-center text-gray-400 hover:text-gray-900 hover:bg-white/50 transition-colors"
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </div>
                      <div className="flex gap-1.5">
                        <Input
                          placeholder="example.com"
                          value={newDomain}
                          onChange={(e) => setNewDomain(e.target.value)}
                          onKeyDown={(e) => e.key === "Enter" && addDomain()}
                          className="h-8 text-xs bg-white/60 border-white/40 text-gray-900"
                        />
                        <Button variant="outline" size="sm" onClick={addDomain} className="h-8 w-8 p-0 shrink-0">
                          <Plus className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                      {(config.allowed_domains || []).length > 0 ? (
                        <div className="flex flex-wrap gap-1.5">
                          {config.allowed_domains.map((d) => (
                            <Badge key={d} variant="secondary" className="gap-1 pr-1 text-[10px] rounded-lg">
                              {d}
                              <button onClick={() => removeDomain(d)} className="ml-1 hover:text-destructive">
                                <X className="h-2.5 w-2.5" />
                              </button>
                            </Badge>
                          ))}
                        </div>
                      ) : (
                        <div className="rounded-xl border border-dashed border-gray-200 py-4 text-center">
                          <Shield className="h-4 w-4 text-gray-300 mx-auto mb-1.5" />
                          <p className="text-[10px] text-gray-400">No domain restrictions</p>
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ━━━━ Full Canvas ━━━━ */}
      <div className="absolute inset-0 pt-14">
        {/* Website iframe or fallback skeleton */}
        <div className="absolute inset-0 pointer-events-none">
          {websiteUrl ? (
            <>
              {iframeFailed && !iframeLoaded && (
                <div className="absolute inset-0">
                  {!screenshotLoaded && (
                    <div className="absolute inset-0 flex items-center justify-center bg-muted/30">
                      <div className="flex flex-col items-center gap-2">
                        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground/40" />
                        <span className="text-[10px] text-muted-foreground/60">Capturing screenshot…</span>
                      </div>
                    </div>
                  )}
                  <img
                    src={`https://image.thum.io/get/width/1440/crop/900/noanimate/${websiteUrl}`}
                    alt="Website preview"
                    className={`w-full h-full object-cover object-top transition-opacity duration-500 ${screenshotLoaded ? "opacity-100" : "opacity-0"}`}
                    onLoad={() => setScreenshotLoaded(true)}
                    onError={() => setScreenshotLoaded(false)}
                  />
                  {screenshotLoaded && (
                    <div className="absolute inset-0 bg-white/10 backdrop-blur-[0.5px]" />
                  )}
                </div>
              )}

              {!iframeFailed && (
                <>
                  {!iframeLoaded && (
                    <div className="absolute inset-0 flex items-center justify-center bg-background">
                      <div className="flex flex-col items-center gap-2">
                        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground/40" />
                        <span className="text-[10px] text-muted-foreground/60">Loading website…</span>
                      </div>
                    </div>
                  )}
                  <iframe
                    src={websiteUrl}
                    className={`w-full h-full border-0 transition-opacity duration-500 ${iframeLoaded ? "opacity-100" : "opacity-0"}`}
                    sandbox="allow-scripts allow-same-origin"
                    loading="lazy"
                    onLoad={() => {
                      setIframeLoaded(true);
                      if (iframeTimeoutRef.current) clearTimeout(iframeTimeoutRef.current);
                    }}
                    onError={() => setIframeFailed(true)}
                    title="Website preview"
                  />
                  {iframeLoaded && (
                    <div className="absolute inset-0 bg-white/10 backdrop-blur-[0.5px]" />
                  )}
                </>
              )}
            </>
          ) : (
            <div className="max-w-2xl mx-auto space-y-4 p-10 pt-16 opacity-[0.06]">
              <div className="h-8 w-2/3 rounded-lg bg-foreground" />
              <div className="h-3 w-full rounded bg-foreground" />
              <div className="h-3 w-5/6 rounded bg-foreground" />
              <div className="h-3 w-4/5 rounded bg-foreground" />
              <div className="h-40 w-full rounded-xl bg-foreground mt-6" />
              <div className="h-3 w-full rounded bg-foreground mt-6" />
              <div className="h-3 w-3/4 rounded bg-foreground" />
              <div className="h-3 w-2/3 rounded bg-foreground" />
              <div className="h-32 w-full rounded-xl bg-foreground mt-6" />
              <div className="h-3 w-4/5 rounded bg-foreground mt-6" />
              <div className="h-3 w-full rounded bg-foreground" />
              <div className="h-3 w-3/5 rounded bg-foreground" />
            </div>
          )}
        </div>

        {/* Click-to-edit hint (when no zone selected, design tab active) */}
        {activePanel === "style" && !editingZone && !dropdownOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="absolute top-3 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1.5 bg-white/80 backdrop-blur-sm border border-white/30 text-gray-600 rounded-full px-3 py-1.5 shadow-sm"
          >
            <MousePointerClick className="h-3 w-3 text-primary" />
            <span className="text-[10px] font-medium">Click any widget element to edit</span>
          </motion.div>
        )}

        {/* Editing zone indicator */}
        {editingZone && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="absolute top-3 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1.5 bg-white/80 backdrop-blur-sm border border-white/30 text-foreground rounded-full px-3 py-1.5 shadow-sm"
          >
            <Pencil className="h-2.5 w-2.5 text-primary" />
            <span className="text-[10px] font-medium">Editing {ZONE_LABELS[editingZone]?.title}</span>
          </motion.div>
        )}

        {/* ── Widget Chat Panel (real position) ── */}
        <AnimatePresence>
          {previewOpen && (
            <motion.div
              initial={{ opacity: 0, y: 24, scale: 0.92 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 24, scale: 0.92 }}
              transition={{ type: "spring", damping: 28, stiffness: 380 }}
              className={`absolute z-10 flex flex-col overflow-hidden ${
                config.position === "bottom-right" ? "right-6" : "left-6"
              } bottom-[76px]`}
              style={{
                width: "380px",
                height: "480px",
                fontFamily: `'${config.font_family}', system-ui, sans-serif`,
                borderRadius: config.border_radius === "full" ? "24px" : config.border_radius === "rounded" ? "16px" : config.border_radius === "sm" ? "8px" : "2px",
                boxShadow: "0 20px 60px -12px rgba(0,0,0,0.25), 0 8px 24px -8px rgba(0,0,0,0.12)",
              }}
            >
              {/* HEADER */}
              <div
                onClick={() => setEditingZone("header")}
                className={`group relative flex items-center gap-2.5 px-4 py-3 cursor-pointer transition-all ${
                  editingZone === "header" ? "ring-2 ring-primary ring-inset" : ""
                }`}
                style={{ backgroundColor: config.accent_color }}
              >
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                  <Pencil className="h-3.5 w-3.5 text-white drop-shadow" />
                </div>
                {config.avatar_url && (
                  <img src={config.avatar_url} alt="" className="h-8 w-8 rounded-full border-2 border-white/20 object-cover" />
                )}
                <div className="flex-1 min-w-0">
                  <h3 className="truncate text-sm font-semibold" style={{ color: config.header_text_color }}>
                    {config.widget_title || "Chat with us"}
                  </h3>
                  <p className="text-[10px]" style={{ color: config.header_text_color + "99" }}>
                    {config.header_subtitle || "Online"}
                  </p>
                </div>
                <button className="rounded p-0.5 hover:bg-white/10">
                  <X className="h-4 w-4" style={{ color: config.header_text_color + "80" }} />
                </button>
              </div>

              {/* MESSAGES */}
              <div className="flex-1 overflow-y-auto px-4 py-3 space-y-2.5" style={{ backgroundColor: config.chat_bg_color }}>
                <div
                  onClick={() => setEditingZone("welcome")}
                  className="group relative flex justify-start cursor-pointer"
                >
                  <div
                    className={`max-w-[85%] px-3.5 py-2.5 text-xs leading-relaxed relative transition-all ${
                      editingZone === "welcome" ? "ring-2 ring-primary" : ""
                    }`}
                    style={{
                      backgroundColor: config.bot_message_bg,
                      color: config.bot_message_text_color,
                      borderRadius: radiusCss,
                      borderBottomLeftRadius: config.border_radius === "full" ? "4px" : "2px",
                    }}
                  >
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors rounded-[inherit] flex items-center justify-center opacity-0 group-hover:opacity-100">
                      <Pencil className="h-3 w-3 text-foreground/50" />
                    </div>
                    {config.welcome_message || "Hi! How can I help you today?"}
                  </div>
                </div>

                <div
                  onClick={() => setEditingZone("user-bubble")}
                  className="group relative flex justify-end cursor-pointer"
                >
                  <div
                    className={`max-w-[85%] px-3.5 py-2.5 text-xs leading-relaxed relative transition-all ${
                      editingZone === "user-bubble" ? "ring-2 ring-primary" : ""
                    }`}
                    style={{
                      backgroundColor: config.accent_color,
                      color: config.user_message_text_color,
                      borderRadius: radiusCss,
                      borderBottomRightRadius: config.border_radius === "full" ? "4px" : "2px",
                    }}
                  >
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors rounded-[inherit] flex items-center justify-center opacity-0 group-hover:opacity-100">
                      <Pencil className="h-3 w-3 text-white drop-shadow" />
                    </div>
                    I'd like to book an appointment
                  </div>
                </div>

                <div
                  onClick={() => setEditingZone("bot-bubble")}
                  className="group relative flex justify-start cursor-pointer"
                >
                  <div
                    className={`max-w-[85%] px-3.5 py-2.5 text-xs leading-relaxed relative transition-all ${
                      editingZone === "bot-bubble" ? "ring-2 ring-primary" : ""
                    }`}
                    style={{
                      backgroundColor: config.bot_message_bg,
                      color: config.bot_message_text_color,
                      borderRadius: radiusCss,
                      borderBottomLeftRadius: config.border_radius === "full" ? "4px" : "2px",
                    }}
                  >
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors rounded-[inherit] flex items-center justify-center opacity-0 group-hover:opacity-100">
                      <Pencil className="h-3 w-3 text-foreground/50" />
                    </div>
                    Of course! I'd be happy to help. What date works best for you?
                  </div>
                </div>

                <div className="flex justify-start">
                  <div
                    className="flex gap-1 px-3.5 py-2.5"
                    style={{
                      backgroundColor: config.bot_message_bg,
                      borderRadius: radiusCss,
                      borderBottomLeftRadius: config.border_radius === "full" ? "4px" : "2px",
                    }}
                  >
                    <span className="h-1.5 w-1.5 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: "0ms" }} />
                    <span className="h-1.5 w-1.5 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: "150ms" }} />
                    <span className="h-1.5 w-1.5 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: "300ms" }} />
                  </div>
                </div>
              </div>

              {/* INPUT */}
              <div
                onClick={() => setEditingZone("input")}
                className={`group relative flex items-center gap-1.5 border-t px-3 py-2.5 cursor-pointer transition-all ${
                  editingZone === "input" ? "ring-2 ring-primary ring-inset" : ""
                }`}
                style={{
                  borderColor: config.input_border_color + "40",
                  backgroundColor: config.chat_bg_color,
                }}
              >
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/[0.02] transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100 z-10">
                  <Pencil className="h-3 w-3 text-foreground/40" />
                </div>
                {config.voice_enabled && (
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-gray-400">
                    <Mic className="h-3.5 w-3.5" />
                  </div>
                )}
                <div
                  className="flex-1 rounded-full px-3 py-1.5 text-[11px]"
                  style={{
                    backgroundColor: config.input_bg_color,
                    color: config.input_text_color + "80",
                    border: `1px solid ${config.input_border_color}`,
                  }}
                >
                  {config.placeholder_text || "Type your message..."}
                </div>
                <div
                  className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-white"
                  style={{ backgroundColor: config.accent_color }}
                >
                  <Send className="h-3 w-3" />
                </div>
              </div>

              {/* BRANDING */}
              {config.show_branding && (
                <div
                  onClick={() => setEditingZone("branding")}
                  className={`group relative cursor-pointer border-t py-1.5 text-center transition-all ${
                    editingZone === "branding" ? "ring-2 ring-primary ring-inset" : ""
                  }`}
                  style={{
                    borderColor: config.input_border_color + "20",
                    backgroundColor: config.chat_bg_color,
                  }}
                >
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/[0.02] transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                    <Pencil className="h-2.5 w-2.5 text-foreground/30" />
                  </div>
                  <span className="text-[9px] text-gray-300">Powered by AI</span>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Chat Bubble (real position) ── */}
        <motion.button
          onClick={() => {
            if (!previewOpen) setPreviewOpen(true);
            else setEditingZone("bubble-btn");
          }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          className={`absolute bottom-5 z-10 flex h-14 w-14 items-center justify-center rounded-full shadow-lg transition-all ${
            config.position === "bottom-right" ? "right-6" : "left-6"
          } ${editingZone === "bubble-btn" ? "ring-2 ring-primary ring-offset-2" : ""}`}
          style={{
            backgroundColor: config.accent_color,
            boxShadow: `0 8px 24px -4px ${config.accent_color}60`,
          }}
        >
          {previewOpen ? (
            <X className="h-5 w-5 text-white" />
          ) : (
            <MessageSquare className="h-5 w-5 text-white" />
          )}
        </motion.button>
      </div>
    </motion.div>
  );
};

/* ── Reusable field input ── */
function FieldInput({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <div className="space-y-1">
      <span className="text-[10px] uppercase tracking-wider text-gray-500 font-medium">
        {label}
      </span>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full h-7 bg-white/60 border-0 border-b border-gray-200 text-xs text-gray-900 outline-none focus:border-primary/50 transition-colors px-0 placeholder:text-gray-300"
      />
    </div>
  );
}
