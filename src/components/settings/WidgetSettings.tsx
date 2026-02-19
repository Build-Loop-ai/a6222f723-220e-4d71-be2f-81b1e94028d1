import { useState, useEffect, useRef, useCallback } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Copy,
  Loader2,
  Plus,
  X,
  MessageSquare,
  Code,
  Shield,
  Eye,
  Smartphone,
  Monitor,
  Pencil,
  Check,
  Type,
  Palette,
  Mic,
  Send,
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
  "#0d9488", "#6366f1", "#2563eb", "#dc2626",
  "#ea580c", "#d97706", "#16a34a", "#7c3aed",
  "#db2777", "#0891b2", "#4f46e5", "#059669",
];

const FONT_OPTIONS = [
  { value: "DM Sans", label: "DM Sans" },
  { value: "Inter", label: "Inter" },
  { value: "Syne", label: "Syne" },
  { value: "Space Grotesk", label: "Space Grotesk" },
  { value: "Plus Jakarta Sans", label: "Plus Jakarta Sans" },
  { value: "system-ui", label: "System Default" },
];

const RADIUS_OPTIONS = [
  { value: "none", label: "Square", css: "0px" },
  { value: "sm", label: "Subtle", css: "8px" },
  { value: "rounded", label: "Rounded", css: "16px" },
  { value: "full", label: "Pill", css: "9999px" },
];

function ColorInput({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs">{label}</Label>
      <div className="flex items-center gap-2">
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="h-8 w-8 cursor-pointer rounded-lg border border-border"
        />
        <Input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="flex-1 font-mono text-xs h-8"
        />
      </div>
    </div>
  );
}

export const WidgetSettings = ({ organizationId }: WidgetSettingsProps) => {
  const [config, setConfig] = useState<WidgetConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [newDomain, setNewDomain] = useState("");
  const [previewDevice, setPreviewDevice] = useState<"desktop" | "mobile">("desktop");
  const [previewOpen, setPreviewOpen] = useState(true);
  const [editingZone, setEditingZone] = useState<EditingZone>(null);
  const [showEmbed, setShowEmbed] = useState(false);
  const [showDomains, setShowDomains] = useState(false);

  useEffect(() => {
    const fetchConfig = async () => {
      const { data } = await supabase
        .from("widget_configs")
        .select("*")
        .eq("organization_id", organizationId)
        .maybeSingle();
      setConfig(data);
      setLoading(false);
    };
    fetchConfig();
  }, [organizationId]);

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

  if (loading)
    return (
      <Card>
        <CardContent className="p-6">
          <div className="h-32 animate-pulse rounded-xl bg-muted" />
        </CardContent>
      </Card>
    );

  if (!config) {
    return (
      <Card className="border-dashed">
        <CardContent className="p-16 text-center">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-primary/10"
          >
            <MessageSquare className="h-10 w-10 text-primary" />
          </motion.div>
          <h3 className="mb-2 text-xl font-semibold">Build Your Chat Widget</h3>
          <p className="mx-auto mb-8 max-w-sm text-muted-foreground">
            Create a beautiful, fully customizable chat widget. Click any element in the preview to edit it.
          </p>
          <Button onClick={handleCreate} disabled={creating} size="lg">
            {creating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Start Building
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="flex gap-6 min-h-[720px]">
      {/* ─── Left: Context-sensitive editor panel ─── */}
      <div className="w-[340px] shrink-0 space-y-4 overflow-y-auto max-h-[720px] pr-1">
        {/* Instruction */}
        <div className="flex items-center gap-2 rounded-xl border border-dashed border-primary/30 bg-primary/5 px-3 py-2">
          <Pencil className="h-4 w-4 text-primary shrink-0" />
          <p className="text-xs text-primary">
            Click any element in the preview to edit it
          </p>
        </div>

        {/* ── Global settings (always visible) ── */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Palette className="h-4 w-4" />
              Global Style
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {/* Color presets */}
            <div className="space-y-1.5">
              <Label className="text-xs">Brand Color</Label>
              <div className="flex flex-wrap gap-1.5">
                {PRESET_COLORS.map((c) => (
                  <button
                    key={c}
                    onClick={() => u("accent_color", c)}
                    className={`h-6 w-6 rounded-full border-2 transition-all hover:scale-110 ${
                      config.accent_color === c
                        ? "border-foreground ring-2 ring-ring ring-offset-1 ring-offset-background"
                        : "border-transparent"
                    }`}
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={config.accent_color}
                  onChange={(e) => u("accent_color", e.target.value)}
                  className="h-8 w-8 cursor-pointer rounded-lg border border-border"
                />
                <Input
                  value={config.accent_color}
                  onChange={(e) => u("accent_color", e.target.value)}
                  className="flex-1 font-mono text-xs h-8"
                />
              </div>
            </div>

            {/* Font */}
            <div className="space-y-1.5">
              <Label className="text-xs">Font Family</Label>
              <Select value={config.font_family} onValueChange={(v) => uNow("font_family", v)}>
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {FONT_OPTIONS.map((f) => (
                    <SelectItem key={f.value} value={f.value} style={{ fontFamily: f.value }}>
                      {f.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Border Radius */}
            <div className="space-y-1.5">
              <Label className="text-xs">Corner Style</Label>
              <div className="grid grid-cols-4 gap-1.5">
                {RADIUS_OPTIONS.map((r) => (
                  <button
                    key={r.value}
                    onClick={() => uNow("border_radius", r.value)}
                    className={`flex flex-col items-center gap-1 rounded-lg border-2 p-2 text-[10px] transition-all ${
                      config.border_radius === r.value
                        ? "border-primary bg-primary/5 text-primary"
                        : "border-border hover:border-primary/30"
                    }`}
                  >
                    <div
                      className="h-5 w-5 border-2 border-current"
                      style={{ borderRadius: r.css }}
                    />
                    {r.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Position */}
            <div className="space-y-1.5">
              <Label className="text-xs">Position</Label>
              <div className="grid grid-cols-2 gap-1.5">
                {(["bottom-right", "bottom-left"] as const).map((pos) => (
                  <button
                    key={pos}
                    onClick={() => uNow("position", pos)}
                    className={`flex items-center justify-center gap-1.5 rounded-lg border-2 p-2 text-[11px] transition-all ${
                      config.position === pos
                        ? "border-primary bg-primary/5 text-primary"
                        : "border-border hover:border-primary/30"
                    }`}
                  >
                    <div className="relative h-6 w-10 rounded border border-current/20 bg-current/5">
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

            {/* Toggles */}
            <div className="space-y-2 pt-1">
              <div className="flex items-center justify-between">
                <Label className="text-xs">Voice Input</Label>
                <Switch
                  checked={config.voice_enabled}
                  onCheckedChange={(v) => uNow("voice_enabled", v)}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label className="text-xs">Show Branding</Label>
                <Switch
                  checked={config.show_branding}
                  onCheckedChange={(v) => uNow("show_branding", v)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* ── Zone-specific editor (shows on click) ── */}
        <AnimatePresence mode="wait">
          {editingZone && (
            <motion.div
              key={editingZone}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
            >
              <Card className="border-primary/30 shadow-md">
                <CardHeader className="pb-2 flex flex-row items-center justify-between">
                  <CardTitle className="text-sm">
                    {editingZone === "header" && "Header"}
                    {editingZone === "welcome" && "Welcome Message"}
                    {editingZone === "bot-bubble" && "Bot Messages"}
                    {editingZone === "user-bubble" && "User Messages"}
                    {editingZone === "input" && "Input Field"}
                    {editingZone === "branding" && "Branding Footer"}
                    {editingZone === "bubble-btn" && "Chat Button"}
                  </CardTitle>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={() => setEditingZone(null)}
                  >
                    <X className="h-3.5 w-3.5" />
                  </Button>
                </CardHeader>
                <CardContent className="space-y-3">
                  {editingZone === "header" && (
                    <>
                      <div className="space-y-1.5">
                        <Label className="text-xs">Title</Label>
                        <Input
                          value={config.widget_title}
                          onChange={(e) => u("widget_title", e.target.value)}
                          className="h-8 text-xs"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-xs">Subtitle</Label>
                        <Input
                          value={config.header_subtitle}
                          onChange={(e) => u("header_subtitle", e.target.value)}
                          className="h-8 text-xs"
                        />
                      </div>
                      <ColorInput
                        label="Background Color"
                        value={config.accent_color}
                        onChange={(v) => u("accent_color", v)}
                      />
                      <ColorInput
                        label="Text Color"
                        value={config.header_text_color}
                        onChange={(v) => u("header_text_color", v)}
                      />
                      <div className="space-y-1.5">
                        <Label className="text-xs">Avatar URL</Label>
                        <Input
                          value={config.avatar_url || ""}
                          onChange={(e) => u("avatar_url", e.target.value || null)}
                          placeholder="https://..."
                          className="h-8 text-xs"
                        />
                      </div>
                    </>
                  )}

                  {editingZone === "welcome" && (
                    <>
                      <div className="space-y-1.5">
                        <Label className="text-xs">Bot Name</Label>
                        <Input
                          value={config.bot_name}
                          onChange={(e) => u("bot_name", e.target.value)}
                          className="h-8 text-xs"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-xs">Welcome Message</Label>
                        <Textarea
                          value={config.welcome_message}
                          onChange={(e) => u("welcome_message", e.target.value)}
                          rows={3}
                          className="text-xs"
                        />
                      </div>
                    </>
                  )}

                  {editingZone === "bot-bubble" && (
                    <>
                      <ColorInput
                        label="Background"
                        value={config.bot_message_bg}
                        onChange={(v) => u("bot_message_bg", v)}
                      />
                      <ColorInput
                        label="Text Color"
                        value={config.bot_message_text_color}
                        onChange={(v) => u("bot_message_text_color", v)}
                      />
                      <ColorInput
                        label="Chat Background"
                        value={config.chat_bg_color}
                        onChange={(v) => u("chat_bg_color", v)}
                      />
                    </>
                  )}

                  {editingZone === "user-bubble" && (
                    <>
                      <ColorInput
                        label="Background"
                        value={config.accent_color}
                        onChange={(v) => u("accent_color", v)}
                      />
                      <ColorInput
                        label="Text Color"
                        value={config.user_message_text_color}
                        onChange={(v) => u("user_message_text_color", v)}
                      />
                    </>
                  )}

                  {editingZone === "input" && (
                    <>
                      <div className="space-y-1.5">
                        <Label className="text-xs">Placeholder Text</Label>
                        <Input
                          value={config.placeholder_text}
                          onChange={(e) => u("placeholder_text", e.target.value)}
                          className="h-8 text-xs"
                        />
                      </div>
                      <ColorInput
                        label="Background"
                        value={config.input_bg_color}
                        onChange={(v) => u("input_bg_color", v)}
                      />
                      <ColorInput
                        label="Text Color"
                        value={config.input_text_color}
                        onChange={(v) => u("input_text_color", v)}
                      />
                      <ColorInput
                        label="Border Color"
                        value={config.input_border_color}
                        onChange={(v) => u("input_border_color", v)}
                      />
                    </>
                  )}

                  {editingZone === "branding" && (
                    <div className="flex items-center justify-between">
                      <Label className="text-xs">Show "Powered by" text</Label>
                      <Switch
                        checked={config.show_branding}
                        onCheckedChange={(v) => uNow("show_branding", v)}
                      />
                    </div>
                  )}

                  {editingZone === "bubble-btn" && (
                    <>
                      <ColorInput
                        label="Button Color"
                        value={config.accent_color}
                        onChange={(v) => u("accent_color", v)}
                      />
                      <div className="space-y-1.5">
                        <Label className="text-xs">Position</Label>
                        <Select
                          value={config.position}
                          onValueChange={(v) => uNow("position", v)}
                        >
                          <SelectTrigger className="h-8 text-xs">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="bottom-right">Bottom Right</SelectItem>
                            <SelectItem value="bottom-left">Bottom Left</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Quick actions ── */}
        <div className="flex gap-2">
          <Button
            variant={showEmbed ? "default" : "outline"}
            size="sm"
            className="gap-1.5 flex-1 text-xs"
            onClick={() => { setShowEmbed(!showEmbed); setShowDomains(false); }}
          >
            <Code className="h-3.5 w-3.5" />
            Embed Code
          </Button>
          <Button
            variant={showDomains ? "default" : "outline"}
            size="sm"
            className="gap-1.5 flex-1 text-xs"
            onClick={() => { setShowDomains(!showDomains); setShowEmbed(false); }}
          >
            <Shield className="h-3.5 w-3.5" />
            Domains
          </Button>
        </div>

        <AnimatePresence>
          {showEmbed && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
            >
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Install on Your Website</CardTitle>
                </CardHeader>
                <CardContent>
                  <EmbedCodeSnippet apiKey={config.api_key} />
                </CardContent>
              </Card>
            </motion.div>
          )}
          {showDomains && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
            >
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Allowed Domains</CardTitle>
                  <CardDescription className="text-xs">Leave empty to allow everywhere.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex gap-2">
                    <Input
                      placeholder="example.com"
                      value={newDomain}
                      onChange={(e) => setNewDomain(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && addDomain()}
                      className="h-8 text-xs"
                    />
                    <Button variant="outline" size="sm" onClick={addDomain}>
                      <Plus className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                  {(config.allowed_domains || []).length > 0 ? (
                    <div className="flex flex-wrap gap-1.5">
                      {config.allowed_domains.map((d) => (
                        <Badge key={d} variant="secondary" className="gap-1 pr-1 text-xs">
                          {d}
                          <button onClick={() => removeDomain(d)} className="ml-1 hover:text-destructive">
                            <X className="h-3 w-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  ) : (
                    <p className="text-[11px] text-muted-foreground italic">No restrictions.</p>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ─── Right: Interactive Live Preview ─── */}
      <div className="flex-1 flex flex-col min-w-0">
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Eye className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">Live Preview</span>
            <span className="text-[10px] text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
              Click to edit
            </span>
          </div>
          <div className="flex items-center gap-1 rounded-lg border border-border p-0.5">
            <button
              onClick={() => setPreviewDevice("desktop")}
              className={`rounded-md p-1.5 transition-colors ${
                previewDevice === "desktop"
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Monitor className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={() => setPreviewDevice("mobile")}
              className={`rounded-md p-1.5 transition-colors ${
                previewDevice === "mobile"
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Smartphone className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        <div
          className={`relative mx-auto overflow-hidden rounded-2xl border-2 border-border bg-muted/20 shadow-lg transition-all duration-300 ${
            previewDevice === "mobile" ? "w-[360px] h-[700px]" : "w-full h-[700px]"
          }`}
        >
          {/* Browser chrome */}
          <div className="flex h-7 items-center gap-1.5 bg-muted px-3">
            <div className="h-2 w-2 rounded-full bg-destructive/40" />
            <div className="h-2 w-2 rounded-full bg-warning/40" />
            <div className="h-2 w-2 rounded-full bg-success/40" />
            <div className="ml-2 h-3.5 flex-1 rounded bg-background" />
          </div>

          {/* Page content */}
          <div className="relative h-[calc(100%-1.75rem)] overflow-hidden bg-white">
            <div className="space-y-3 p-5 opacity-40">
              <div className="h-6 w-3/4 rounded bg-gray-200" />
              <div className="h-3 w-full rounded bg-gray-100" />
              <div className="h-3 w-5/6 rounded bg-gray-100" />
              <div className="h-28 w-full rounded-lg bg-gray-100" />
              <div className="h-3 w-full rounded bg-gray-100" />
              <div className="h-3 w-2/3 rounded bg-gray-100" />
              <div className="h-20 w-full rounded-lg bg-gray-50" />
              <div className="h-3 w-4/5 rounded bg-gray-100" />
              <div className="h-3 w-3/5 rounded bg-gray-100" />
            </div>

            {/* ── Widget Chat Panel ── */}
            <AnimatePresence>
              {previewOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 20, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 20, scale: 0.95 }}
                  transition={{ type: "spring", damping: 25, stiffness: 350 }}
                  className={`absolute z-10 flex flex-col overflow-hidden shadow-2xl ${
                    config.position === "bottom-right" ? "right-4" : "left-4"
                  } bottom-[72px]`}
                  style={{
                    width: previewDevice === "mobile" ? "300px" : "340px",
                    height: previewDevice === "mobile" ? "420px" : "460px",
                    fontFamily: `'${config.font_family}', system-ui, sans-serif`,
                    borderRadius: config.border_radius === "full" ? "24px" : config.border_radius === "rounded" ? "16px" : config.border_radius === "sm" ? "8px" : "0px",
                  }}
                >
                  {/* HEADER — clickable zone */}
                  <div
                    onClick={() => setEditingZone("header")}
                    className={`group relative flex items-center gap-2.5 px-4 py-3 cursor-pointer transition-all ${
                      editingZone === "header" ? "ring-2 ring-primary ring-inset" : ""
                    }`}
                    style={{ backgroundColor: config.accent_color }}
                  >
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                      <Pencil className="h-4 w-4 text-white drop-shadow" />
                    </div>
                    {config.avatar_url && (
                      <img
                        src={config.avatar_url}
                        alt=""
                        className="h-8 w-8 rounded-full border-2 border-white/30 object-cover"
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <h3
                        className="truncate text-sm font-semibold"
                        style={{ color: config.header_text_color }}
                      >
                        {config.widget_title || "Chat with us"}
                      </h3>
                      <p
                        className="text-[11px]"
                        style={{ color: config.header_text_color + "b3" }}
                      >
                        {config.header_subtitle || "Online"}
                      </p>
                    </div>
                    <button className="rounded p-0.5 hover:bg-white/10">
                      <X className="h-4 w-4" style={{ color: config.header_text_color + "b3" }} />
                    </button>
                  </div>

                  {/* MESSAGES AREA */}
                  <div
                    className="flex-1 overflow-y-auto px-4 py-3"
                    style={{ backgroundColor: config.chat_bg_color }}
                  >
                    {/* Welcome / bot bubble — clickable */}
                    <div
                      onClick={() => setEditingZone("welcome")}
                      className={`group relative mb-3 flex justify-start cursor-pointer`}
                    >
                      <div
                        className={`max-w-[85%] px-3 py-2 text-xs relative transition-all ${
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

                    {/* User bubble — clickable */}
                    <div
                      onClick={() => setEditingZone("user-bubble")}
                      className="group relative mb-3 flex justify-end cursor-pointer"
                    >
                      <div
                        className={`max-w-[85%] px-3 py-2 text-xs relative transition-all ${
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

                    {/* Another bot bubble — clickable */}
                    <div
                      onClick={() => setEditingZone("bot-bubble")}
                      className="group relative mb-3 flex justify-start cursor-pointer"
                    >
                      <div
                        className={`max-w-[85%] px-3 py-2 text-xs relative transition-all ${
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
                        Of course! I'd be happy to help you schedule an appointment. What date works best for you?
                      </div>
                    </div>
                  </div>

                  {/* INPUT — clickable zone */}
                  <div
                    onClick={() => setEditingZone("input")}
                    className={`group relative flex items-center gap-1.5 border-t px-3 py-2.5 cursor-pointer transition-all ${
                      editingZone === "input" ? "ring-2 ring-primary ring-inset" : ""
                    }`}
                    style={{
                      borderColor: config.input_border_color,
                      backgroundColor: config.chat_bg_color,
                    }}
                  >
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/[0.02] transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100 z-10">
                      <Pencil className="h-3.5 w-3.5 text-foreground/40" />
                    </div>
                    {config.voice_enabled && (
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-gray-400">
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
                      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-white"
                      style={{ backgroundColor: config.accent_color }}
                    >
                      <Send className="h-3.5 w-3.5" />
                    </div>
                  </div>

                  {/* BRANDING — clickable zone */}
                  {config.show_branding && (
                    <div
                      onClick={() => setEditingZone("branding")}
                      className={`group relative cursor-pointer border-t py-1.5 text-center transition-all ${
                        editingZone === "branding" ? "ring-2 ring-primary ring-inset" : ""
                      }`}
                      style={{
                        borderColor: config.input_border_color + "40",
                        backgroundColor: config.chat_bg_color,
                      }}
                    >
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/[0.02] transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                        <Pencil className="h-3 w-3 text-foreground/30" />
                      </div>
                      <span className="text-[9px] text-gray-300">Powered by AI</span>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            {/* ── Chat Bubble Button — clickable zone ── */}
            <motion.button
              onClick={() => {
                if (!previewOpen) {
                  setPreviewOpen(true);
                } else {
                  setEditingZone("bubble-btn");
                }
              }}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              className={`absolute bottom-4 z-10 flex h-12 w-12 items-center justify-center rounded-full shadow-lg transition-all ${
                config.position === "bottom-right" ? "right-4" : "left-4"
              } ${editingZone === "bubble-btn" ? "ring-2 ring-primary ring-offset-2" : ""}`}
              style={{ backgroundColor: config.accent_color }}
            >
              {previewOpen ? (
                <X className="h-5 w-5 text-white" />
              ) : (
                <MessageSquare className="h-5 w-5 text-white" />
              )}
            </motion.button>
          </div>
        </div>
      </div>
    </div>
  );
};
