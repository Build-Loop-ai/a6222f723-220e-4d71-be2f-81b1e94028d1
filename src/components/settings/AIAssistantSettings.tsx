import { useState, useEffect, useMemo, useCallback } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Loader2, RotateCcw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getDefaultGreeting, getDefaultVoiceId, migrateOldVoiceId, getLanguageByCode, SUPPORTED_LANGUAGES, ELEVENLABS_VOICES } from "@/lib/voice-config";
import { useAutoSave } from "@/hooks/useAutoSave";
import { SaveStatusIndicator } from "@/components/ui/save-status";

interface AIAssistantSettingsProps {
  organizationId?: string;
}

export function AIAssistantSettings({ organizationId: propOrgId }: AIAssistantSettingsProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [organizationId, setOrganizationId] = useState<string | null>(propOrgId || null);
  const [organizationName, setOrganizationName] = useState<string>("your business");
  
  const [language, setLanguage] = useState("en-US");
  const [voiceId, setVoiceId] = useState(getDefaultVoiceId());
  const [customGreeting, setCustomGreeting] = useState("");
  const [specialInstructions, setSpecialInstructions] = useState("");
  const [assistantId, setAssistantId] = useState<string | null>(null);
  const [dataLoaded, setDataLoaded] = useState(false);

  const settingsData = useMemo(() => ({
    language, voiceId, customGreeting, specialInstructions, assistantId,
  }), [language, voiceId, customGreeting, specialInstructions, assistantId]);

  const saveToDatabase = useCallback(async (data: typeof settingsData) => {
    if (!organizationId) return;

    const { error: orgError } = await supabase
      .from("organizations")
      .update({ special_instructions: data.specialInstructions })
      .eq("id", organizationId);
    if (orgError) throw orgError;

    const { data: existingSettings } = await supabase
      .from("organization_settings")
      .select("id")
      .eq("organization_id", organizationId)
      .single();

    const langConfig = getLanguageByCode(data.language);
    const transcriberLang = langConfig?.transcriberLang || data.language.split("-")[0];

    const settingsPayload = {
      language: data.language,
      transcriber_language: transcriberLang,
      voice_id: data.voiceId,
      voice_provider: "elevenlabs",
      custom_greeting: data.customGreeting,
    };

    if (existingSettings) {
      const { error } = await supabase
        .from("organization_settings")
        .update(settingsPayload)
        .eq("organization_id", organizationId);
      if (error) throw error;
    } else {
      const { error } = await supabase
        .from("organization_settings")
        .insert({ ...settingsPayload, organization_id: organizationId });
      if (error) throw error;
    }
  }, [organizationId]);

  const syncToVapi = useCallback(async (data: typeof settingsData) => {
    if (!organizationId) return;
    if (data.assistantId) {
      const langConfig = getLanguageByCode(data.language);
      const transcriberLang = langConfig?.transcriberLang || data.language.split("-")[0];
      await supabase.functions.invoke("update-vapi-assistant", {
        body: {
          organizationId,
          updates: {
            voice: { voiceId: data.voiceId, provider: "11labs", model: "eleven_multilingual_v2" },
            transcriber: { language: transcriberLang },
            firstMessage: data.customGreeting,
          },
        },
      });
    }
    await supabase.functions.invoke("create-vapi-assistant", {
      body: { organizationId },
    });
  }, [organizationId]);

  const { status, syncStatus } = useAutoSave({
    data: settingsData,
    onSave: saveToDatabase,
    onSync: syncToVapi,
    debounceMs: 1500,
    syncDebounceMs: 4000,
    enabled: dataLoaded && !!organizationId,
  });

  useEffect(() => {
    async function loadOrgId() {
      if (propOrgId) { setOrganizationId(propOrgId); return; }
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data: profile } = await supabase
        .from("profiles").select("organization_id").eq("id", user.id).single();
      if (profile?.organization_id) setOrganizationId(profile.organization_id);
    }
    loadOrgId();
  }, [propOrgId]);

  useEffect(() => {
    if (!organizationId) return;
    async function loadSettings() {
      setLoading(true);
      try {
        const { data: orgData } = await supabase
          .from("organizations").select("name, special_instructions").eq("id", organizationId).single();
        if (orgData) {
          setOrganizationName(orgData.name || "your business");
          setSpecialInstructions(orgData.special_instructions || "");
        }

        const { data, error } = await supabase
          .from("organization_settings")
          .select("language, voice_id, custom_greeting, vapi_assistant_id")
          .eq("organization_id", organizationId).single();
        if (error && error.code !== "PGRST116") throw error;

        if (data) {
          const lang = data.language || "en-US";
          setLanguage(lang);
          setVoiceId(migrateOldVoiceId(data.voice_id || getDefaultVoiceId()));
          setCustomGreeting(data.custom_greeting || getDefaultGreeting(lang, orgData?.name || "your business"));
          setAssistantId(data.vapi_assistant_id);
        } else {
          setCustomGreeting(getDefaultGreeting(language, orgData?.name || "your business"));
        }
        setTimeout(() => setDataLoaded(true), 100);
      } catch (error) {
        console.error("Error loading settings:", error);
        toast({ title: "Error loading settings", description: "Please try again later.", variant: "destructive" });
      } finally {
        setLoading(false);
      }
    }
    loadSettings();
  }, [organizationId, toast]);

  const resetGreeting = () => {
    setCustomGreeting(getDefaultGreeting(language, organizationName));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <SaveStatusIndicator status={status} syncStatus={syncStatus} />
      </div>

      {/* Voice & Language */}
      <Card>
        <CardHeader>
          <CardTitle>Voice & Language</CardTitle>
          <CardDescription>Choose the language and voice for your AI assistant</CardDescription>
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

      {/* Greeting */}
      <Card>
        <CardHeader>
          <CardTitle>Welcome Message</CardTitle>
          <CardDescription>The first message your AI sends to visitors</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="greeting">Custom Greeting</Label>
              <Button variant="ghost" size="sm" onClick={resetGreeting} className="h-8 text-xs">
                <RotateCcw className="mr-1 h-3 w-3" /> Reset to Default
              </Button>
            </div>
            <Textarea
              id="greeting"
              value={customGreeting}
              onChange={(e) => setCustomGreeting(e.target.value)}
              placeholder="Hi! Welcome to our website. How can I help you today?"
              rows={3}
            />
            <p className="text-xs text-muted-foreground">
              This is the first message visitors will see in the chat widget.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Special Instructions */}
      <Card>
        <CardHeader>
          <CardTitle>AI Behavior & Instructions</CardTitle>
          <CardDescription>Tell your AI how to handle specific situations</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="instructions">Special Instructions</Label>
            <Textarea
              id="instructions"
              value={specialInstructions}
              onChange={(e) => setSpecialInstructions(e.target.value)}
              placeholder="Examples:&#10;- Always suggest booking an appointment&#10;- Mention our current promotion for new visitors&#10;- Don't answer medical questions directly&#10;- Redirect pricing questions to the pricing page"
              rows={6}
            />
            <p className="text-xs text-muted-foreground">
              These instructions guide how your AI handles conversations.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
