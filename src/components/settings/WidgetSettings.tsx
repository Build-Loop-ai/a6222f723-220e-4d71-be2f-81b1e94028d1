import { useState, useEffect, useRef, useCallback } from "react";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Copy,
  Loader2,
  Plus,
  X,
  Paintbrush,
  MessageSquare,
  Code,
  Shield,
  Eye,
  Smartphone,
  Monitor,
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
}

const PRESET_COLORS = [
  "#0d9488", "#6366f1", "#2563eb", "#dc2626",
  "#ea580c", "#d97706", "#16a34a", "#7c3aed",
  "#db2777", "#0891b2", "#4f46e5", "#059669",
];

export const WidgetSettings = ({ organizationId }: WidgetSettingsProps) => {
  const [config, setConfig] = useState<WidgetConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [newDomain, setNewDomain] = useState("");
  const [previewDevice, setPreviewDevice] = useState<"desktop" | "mobile">("desktop");
  const [previewOpen, setPreviewOpen] = useState(true);

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
    if (error) toast.error("Failed to save widget settings");
  };

  const debounceRef = useRef<NodeJS.Timeout | null>(null);
  const debouncedSave = useCallback(
    (updates: Partial<WidgetConfig>) => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => saveConfig(updates), 1000);
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

  const updateField = <K extends keyof WidgetConfig>(key: K, value: WidgetConfig[K]) => {
    if (!config) return;
    setConfig({ ...config, [key]: value });
    debouncedSave({ [key]: value });
  };

  const updateFieldImmediate = <K extends keyof WidgetConfig>(key: K, value: WidgetConfig[K]) => {
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
      <Card>
        <CardContent className="p-12 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
            <MessageSquare className="h-8 w-8 text-primary" />
          </div>
          <h3 className="mb-2 text-lg font-semibold">Create Your Chat Widget</h3>
          <p className="mb-6 text-muted-foreground">
            Build a beautiful, customizable chat widget for your website in minutes.
          </p>
          <Button onClick={handleCreate} disabled={creating} size="lg">
            {creating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Create Widget
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="flex gap-6 min-h-[700px]">
      {/* Left: Controls */}
      <div className="flex-1 min-w-0 space-y-0">
        <Tabs defaultValue="appearance" className="space-y-4">
          <TabsList className="bg-muted/50 w-full justify-start gap-1 p-1">
            <TabsTrigger value="appearance" className="gap-1.5 text-xs">
              <Paintbrush className="h-3.5 w-3.5" />
              Appearance
            </TabsTrigger>
            <TabsTrigger value="content" className="gap-1.5 text-xs">
              <MessageSquare className="h-3.5 w-3.5" />
              Content
            </TabsTrigger>
            <TabsTrigger value="embed" className="gap-1.5 text-xs">
              <Code className="h-3.5 w-3.5" />
              Embed
            </TabsTrigger>
            <TabsTrigger value="domains" className="gap-1.5 text-xs">
              <Shield className="h-3.5 w-3.5" />
              Domains
            </TabsTrigger>
          </TabsList>

          {/* ── Appearance ── */}
          <TabsContent value="appearance" className="space-y-4 mt-0">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Brand Color</CardTitle>
                <CardDescription>Pick a color that matches your brand.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex flex-wrap gap-2">
                  {PRESET_COLORS.map((c) => (
                    <button
                      key={c}
                      onClick={() => updateField("accent_color", c)}
                      className={`h-8 w-8 rounded-full border-2 transition-all hover:scale-110 ${
                        config.accent_color === c
                          ? "border-foreground scale-110 ring-2 ring-ring ring-offset-2 ring-offset-background"
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
                    onChange={(e) => updateField("accent_color", e.target.value)}
                    className="h-9 w-9 cursor-pointer rounded-lg border border-border"
                  />
                  <Input
                    value={config.accent_color}
                    onChange={(e) => updateField("accent_color", e.target.value)}
                    className="flex-1 font-mono text-sm"
                    placeholder="#000000"
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Layout & Position</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Widget Position</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {(["bottom-right", "bottom-left"] as const).map((pos) => (
                      <button
                        key={pos}
                        onClick={() => updateFieldImmediate("position", pos)}
                        className={`flex items-center justify-center gap-2 rounded-lg border-2 p-3 text-sm transition-all ${
                          config.position === pos
                            ? "border-primary bg-primary/5 text-primary"
                            : "border-border hover:border-primary/30"
                        }`}
                      >
                        <div className="relative h-8 w-12 rounded border border-current/20 bg-current/5">
                          <div
                            className={`absolute bottom-0.5 h-2 w-2 rounded-full bg-current ${
                              pos === "bottom-right" ? "right-0.5" : "left-0.5"
                            }`}
                          />
                        </div>
                        <span className="capitalize">{pos.replace("-", " ")}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Theme</Label>
                  <Select
                    value={config.theme}
                    onValueChange={(v) => updateFieldImmediate("theme", v)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="auto">Auto (follows system)</SelectItem>
                      <SelectItem value="light">Light</SelectItem>
                      <SelectItem value="dark">Dark</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Avatar URL</Label>
                  <Input
                    value={config.avatar_url || ""}
                    onChange={(e) => updateField("avatar_url", e.target.value || null)}
                    placeholder="https://example.com/avatar.png"
                  />
                  <p className="text-xs text-muted-foreground">
                    Shows a small avatar in the chat header.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Features</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Voice Input</Label>
                    <p className="text-xs text-muted-foreground">
                      Let visitors speak to your AI
                    </p>
                  </div>
                  <Switch
                    checked={config.voice_enabled}
                    onCheckedChange={(v) => updateFieldImmediate("voice_enabled", v)}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ── Content ── */}
          <TabsContent value="content" className="space-y-4 mt-0">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Widget Title</CardTitle>
                <CardDescription>The heading shown at the top of the chat window.</CardDescription>
              </CardHeader>
              <CardContent>
                <Input
                  value={config.widget_title}
                  onChange={(e) => updateField("widget_title", e.target.value)}
                  placeholder="Chat with us"
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Welcome Message</CardTitle>
                <CardDescription>
                  The first message visitors see when they open the widget.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Textarea
                  value={config.welcome_message}
                  onChange={(e) => updateField("welcome_message", e.target.value)}
                  rows={3}
                  placeholder="Hi! How can I help you today?"
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Input Placeholder</CardTitle>
                <CardDescription>
                  Placeholder text shown in the message input field.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Input
                  value={config.placeholder_text}
                  onChange={(e) => updateField("placeholder_text", e.target.value)}
                  placeholder="Type your message..."
                />
              </CardContent>
            </Card>
          </TabsContent>

          {/* ── Embed Code ── */}
          <TabsContent value="embed" className="space-y-4 mt-0">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Install on Your Website</CardTitle>
                <CardDescription>
                  Copy one of the snippets below and paste it into your website's HTML.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <EmbedCodeSnippet apiKey={config.api_key} />
              </CardContent>
            </Card>
          </TabsContent>

          {/* ── Domains ── */}
          <TabsContent value="domains" className="space-y-4 mt-0">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Allowed Domains</CardTitle>
                <CardDescription>
                  Restrict the widget to specific domains. Leave empty to allow everywhere.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex gap-2">
                  <Input
                    placeholder="example.com"
                    value={newDomain}
                    onChange={(e) => setNewDomain(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && addDomain()}
                  />
                  <Button variant="outline" onClick={addDomain}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                {(config.allowed_domains || []).length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {config.allowed_domains.map((d) => (
                      <Badge key={d} variant="secondary" className="gap-1 pr-1">
                        {d}
                        <button
                          onClick={() => removeDomain(d)}
                          className="ml-1 hover:text-destructive"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}
                {(config.allowed_domains || []).length === 0 && (
                  <p className="text-xs text-muted-foreground italic">
                    No restrictions — widget will work on any domain.
                  </p>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Right: Live Preview */}
      <div className="hidden lg:flex w-[420px] shrink-0 flex-col">
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Eye className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">Live Preview</span>
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
          className={`relative mx-auto overflow-hidden rounded-2xl border-2 border-border bg-muted/30 shadow-lg transition-all duration-300 ${
            previewDevice === "mobile" ? "w-[320px] h-[640px]" : "w-full h-[660px]"
          }`}
        >
          {/* Fake browser chrome */}
          <div className="flex h-7 items-center gap-1.5 bg-muted px-3">
            <div className="h-2 w-2 rounded-full bg-destructive/40" />
            <div className="h-2 w-2 rounded-full bg-warning/40" />
            <div className="h-2 w-2 rounded-full bg-success/40" />
            <div className="ml-2 h-3.5 flex-1 rounded bg-background" />
          </div>

          {/* Fake page content */}
          <div className="relative h-[calc(100%-1.75rem)] overflow-hidden">
            <div className="space-y-3 p-4">
              <div className="h-5 w-3/4 rounded bg-muted" />
              <div className="h-3 w-full rounded bg-muted/60" />
              <div className="h-3 w-5/6 rounded bg-muted/60" />
              <div className="h-24 w-full rounded-lg bg-muted/40" />
              <div className="h-3 w-full rounded bg-muted/60" />
              <div className="h-3 w-2/3 rounded bg-muted/60" />
              <div className="h-16 w-full rounded-lg bg-muted/30" />
              <div className="h-3 w-4/5 rounded bg-muted/50" />
            </div>

            {/* Preview widget: chat panel (always open for preview) */}
            {previewOpen && (
              <div
                className={`absolute z-10 ${
                  config.position === "bottom-right" ? "right-3" : "left-3"
                } bottom-16 flex flex-col overflow-hidden rounded-xl bg-white shadow-2xl`}
                style={{
                  width: previewDevice === "mobile" ? "280px" : "320px",
                  height: previewDevice === "mobile" ? "380px" : "400px",
                  fontFamily: "'DM Sans', system-ui, sans-serif",
                }}
              >
                {/* Header */}
                <div
                  className="flex items-center gap-2.5 px-3 py-2.5"
                  style={{ backgroundColor: config.accent_color }}
                >
                  {config.avatar_url && (
                    <img
                      src={config.avatar_url}
                      alt=""
                      className="h-7 w-7 rounded-full border-2 border-white/30 object-cover"
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <h3 className="truncate text-xs font-semibold text-white">
                      {config.widget_title || "Chat with us"}
                    </h3>
                    <p className="text-[10px] text-white/70">Online</p>
                  </div>
                  <button
                    onClick={() => setPreviewOpen(false)}
                    className="rounded p-0.5 text-white/70 hover:bg-white/10 hover:text-white"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto px-3 py-2.5">
                  <div className="mb-2 flex justify-start">
                    <div className="max-w-[85%] rounded-xl rounded-bl-sm bg-gray-100 px-3 py-2 text-xs text-gray-800">
                      {config.welcome_message || "Hi! How can I help you today?"}
                    </div>
                  </div>
                  <div className="mb-2 flex justify-end">
                    <div
                      className="max-w-[85%] rounded-xl rounded-br-sm px-3 py-2 text-xs text-white"
                      style={{ backgroundColor: config.accent_color }}
                    >
                      I'd like to book an appointment
                    </div>
                  </div>
                  <div className="mb-2 flex justify-start">
                    <div className="max-w-[85%] rounded-xl rounded-bl-sm bg-gray-100 px-3 py-2 text-xs text-gray-800">
                      Of course! I'd be happy to help you schedule an appointment. What date works best for you?
                    </div>
                  </div>
                </div>

                {/* Input */}
                <div className="flex items-center gap-1.5 border-t border-gray-100 px-2.5 py-2">
                  {config.voice_enabled && (
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-gray-400">
                      <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
                        <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                        <line x1="12" x2="12" y1="19" y2="22" />
                      </svg>
                    </div>
                  )}
                  <div className="flex-1 rounded-full border border-gray-200 bg-gray-50 px-3 py-1.5 text-[11px] text-gray-400">
                    {config.placeholder_text || "Type your message..."}
                  </div>
                  <div
                    className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-white"
                    style={{ backgroundColor: config.accent_color }}
                  >
                    <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="m22 2-7 20-4-9-9-4Z" />
                      <path d="M22 2 11 13" />
                    </svg>
                  </div>
                </div>

                <div className="border-t border-gray-50 py-1 text-center">
                  <span className="text-[9px] text-gray-300">Powered by AI</span>
                </div>
              </div>
            )}

            {/* Chat bubble */}
            <button
              onClick={() => setPreviewOpen(!previewOpen)}
              className={`absolute bottom-3 z-10 flex h-11 w-11 items-center justify-center rounded-full shadow-lg transition-transform hover:scale-110 ${
                config.position === "bottom-right" ? "right-3" : "left-3"
              }`}
              style={{ backgroundColor: config.accent_color }}
            >
              {previewOpen ? (
                <X className="h-5 w-5 text-white" />
              ) : (
                <MessageSquare className="h-5 w-5 text-white" />
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
