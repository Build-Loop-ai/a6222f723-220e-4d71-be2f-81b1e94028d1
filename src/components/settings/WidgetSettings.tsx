import { useState, useEffect } from "react";
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
import { Copy, Loader2, Plus, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useRef, useCallback } from "react";

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

export const WidgetSettings = ({ organizationId }: WidgetSettingsProps) => {
  const [config, setConfig] = useState<WidgetConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [newDomain, setNewDomain] = useState("");

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
    if (error) {
      toast.error("Failed to save widget settings");
    }
  };

  const debounceRef = useRef<NodeJS.Timeout | null>(null);
  const debouncedSave = useCallback((updates: Partial<WidgetConfig>) => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => saveConfig(updates), 1000);
  }, [config]);

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

  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const embedScript = config
    ? `<script src="${supabaseUrl}/functions/v1/widget-loader?key=${config.api_key}"></script>`
    : "";

  if (loading) return <Card><CardContent className="p-6"><div className="h-32 animate-pulse bg-muted rounded-xl" /></CardContent></Card>;

  if (!config) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <p className="text-muted-foreground mb-4">No widget configured yet.</p>
          <Button onClick={handleCreate} disabled={creating}>
            {creating && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            Create Widget
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Embed Code */}
      <Card>
        <CardHeader>
          <CardTitle>Embed Code</CardTitle>
          <CardDescription>Add this script to your website to show the chat widget.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2">
            <code className="flex-1 text-xs bg-muted p-3 rounded-lg font-mono break-all">
              {embedScript}
            </code>
            <Button
              variant="outline"
              size="icon"
              onClick={() => {
                navigator.clipboard.writeText(embedScript);
                toast.success("Copied!");
              }}
            >
              <Copy className="w-4 h-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Appearance */}
      <Card>
        <CardHeader>
          <CardTitle>Appearance</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Widget Title</Label>
              <Input
                value={config.widget_title}
                onChange={(e) => {
                  setConfig({ ...config, widget_title: e.target.value });
                  debouncedSave({ widget_title: e.target.value });
                }}
              />
            </div>
            <div className="space-y-2">
              <Label>Accent Color</Label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={config.accent_color}
                  onChange={(e) => {
                    setConfig({ ...config, accent_color: e.target.value });
                     debouncedSave({ accent_color: e.target.value });
                  }}
                  className="w-10 h-10 rounded-lg border border-border cursor-pointer"
                />
                <Input
                  value={config.accent_color}
                  onChange={(e) => {
                    setConfig({ ...config, accent_color: e.target.value });
                    debouncedSave({ accent_color: e.target.value });
                  }}
                  className="flex-1"
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Welcome Message</Label>
            <Textarea
              value={config.welcome_message}
              onChange={(e) => {
                setConfig({ ...config, welcome_message: e.target.value });
                debouncedSave({ welcome_message: e.target.value });
              }}
              rows={2}
            />
          </div>

          <div className="space-y-2">
            <Label>Placeholder Text</Label>
            <Input
              value={config.placeholder_text}
              onChange={(e) => {
                setConfig({ ...config, placeholder_text: e.target.value });
                debouncedSave({ placeholder_text: e.target.value });
              }}
            />
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Position</Label>
              <Select
                value={config.position}
                onValueChange={(v) => {
                  setConfig({ ...config, position: v });
                  saveConfig({ position: v });
                }}
              >
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="bottom-right">Bottom Right</SelectItem>
                  <SelectItem value="bottom-left">Bottom Left</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Theme</Label>
              <Select
                value={config.theme}
                onValueChange={(v) => {
                  setConfig({ ...config, theme: v });
                  saveConfig({ theme: v });
                }}
              >
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="auto">Auto</SelectItem>
                  <SelectItem value="light">Light</SelectItem>
                  <SelectItem value="dark">Dark</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label>Voice Enabled</Label>
              <p className="text-xs text-muted-foreground">Allow visitors to use voice input</p>
            </div>
            <Switch
              checked={config.voice_enabled}
              onCheckedChange={(v) => {
                setConfig({ ...config, voice_enabled: v });
                saveConfig({ voice_enabled: v });
              }}
            />
          </div>
        </CardContent>
      </Card>

      {/* Allowed Domains */}
      <Card>
        <CardHeader>
          <CardTitle>Allowed Domains</CardTitle>
          <CardDescription>Restrict the widget to specific domains. Leave empty to allow all.</CardDescription>
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
              <Plus className="w-4 h-4" />
            </Button>
          </div>
          {(config.allowed_domains || []).length > 0 && (
            <div className="flex flex-wrap gap-2">
              {config.allowed_domains.map((d) => (
                <Badge key={d} variant="secondary" className="gap-1 pr-1">
                  {d}
                  <button onClick={() => removeDomain(d)} className="hover:text-destructive ml-1">
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
