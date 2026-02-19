import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RotateCcw, Save, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  SUPPORTED_LANGUAGES, 
  ELEVENLABS_VOICES,
  getLanguageByCode, 
  getDefaultGreeting,
  getDefaultVoiceId,
  migrateOldVoiceId,
} from "@/lib/voice-config";

interface VoiceLanguageSettingsProps {
  organizationId?: string;
  organizationName?: string;
}

export function VoiceLanguageSettings({ organizationId, organizationName = "our business" }: VoiceLanguageSettingsProps) {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [orgId, setOrgId] = useState<string | null>(organizationId || null);
  
  const [language, setLanguage] = useState("en-US");
  const [voiceId, setVoiceId] = useState(getDefaultVoiceId());
  const [customGreeting, setCustomGreeting] = useState("");
  const [assistantId, setAssistantId] = useState<string | null>(null);

  useEffect(() => {
    async function fetchOrgId() {
      if (organizationId) { setOrgId(organizationId); return; }
      if (!user?.id) return;
      const { data: profile } = await supabase
        .from("profiles").select("organization_id").eq("id", user.id).single();
      if (profile?.organization_id) setOrgId(profile.organization_id);
    }
    fetchOrgId();
  }, [user?.id, organizationId]);

  useEffect(() => {
    async function loadSettings() {
      if (!orgId) return;
      try {
        const { data, error } = await supabase
          .from("organization_settings")
          .select("language, voice_id, custom_greeting, vapi_assistant_id")
          .eq("organization_id", orgId).single();
        if (error && error.code !== "PGRST116") throw error;
        if (data) {
          const lang = data.language || "en-US";
          setLanguage(lang);
          setVoiceId(migrateOldVoiceId(data.voice_id || getDefaultVoiceId()));
          setCustomGreeting(data.custom_greeting || getDefaultGreeting(lang, organizationName));
          setAssistantId(data.vapi_assistant_id);
        } else {
          setCustomGreeting(getDefaultGreeting(language, organizationName));
        }
      } catch (error) {
        console.error("Error loading settings:", error);
        toast.error("Failed to load voice settings");
      } finally {
        setIsLoading(false);
      }
    }
    loadSettings();
  }, [orgId]);

  const resetGreeting = () => setCustomGreeting(getDefaultGreeting(language, organizationName));

  const handleSave = async () => {
    if (!orgId) { toast.error("Organization not found"); return; }
    setIsSaving(true);
    try {
      const langConfig = getLanguageByCode(language);
      const transcriberLanguage = langConfig?.transcriberLang || language;

      const { error: settingsError } = await supabase
        .from("organization_settings")
        .update({
          language, voice_provider: '11labs', voice_id: voiceId,
          custom_greeting: customGreeting, transcriber_language: transcriberLanguage,
        })
        .eq("organization_id", orgId);
      if (settingsError) throw settingsError;

      if (assistantId) {
        await supabase.functions.invoke("update-vapi-assistant", {
          body: {
            organizationId: orgId,
            updates: {
              transcriber: { provider: "deepgram", model: "nova-2", language: transcriberLanguage },
              voice: { provider: "11labs", voiceId },
              firstMessage: customGreeting,
            },
          },
        });
      }
      toast.success("Voice settings saved successfully");
    } catch (error) {
      console.error("Error saving settings:", error);
      toast.error("Failed to save settings");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Voice & Language</CardTitle>
          <CardDescription>Choose the language and voice for your AI assistant.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Language</Label>
              <Select value={language} onValueChange={setLanguage}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {SUPPORTED_LANGUAGES.map((lang) => (
                    <SelectItem key={lang.code} value={lang.code}>
                      {lang.name} ({lang.nativeName})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Voice</Label>
              <Select value={voiceId} onValueChange={setVoiceId}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {ELEVENLABS_VOICES.map((voice) => (
                    <SelectItem key={voice.id} value={voice.id}>
                      {voice.name} — {voice.gender}, {voice.description}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Custom Greeting</CardTitle>
          <CardDescription>The first message your AI sends to visitors</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            value={customGreeting}
            onChange={(e) => setCustomGreeting(e.target.value)}
            placeholder="Enter your custom greeting..."
            rows={4}
            className="resize-none"
          />
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>{customGreeting.length} characters</span>
            <Button variant="ghost" size="sm" onClick={resetGreeting} className="h-auto py-1">
              <RotateCcw className="h-3 w-3 mr-1" /> Reset to default
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={isSaving}>
          {isSaving ? (
            <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...</>
          ) : (
            <><Save className="mr-2 h-4 w-4" /> Save Settings</>
          )}
        </Button>
      </div>
    </div>
  );
}
