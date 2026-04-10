import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Loader2, Building, Clock, Briefcase, Globe, Pencil, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BusinessHoursEditor } from "./BusinessHoursEditor";
import { ServicesEditor } from "./ServicesEditor";
import { CrawlProgressModal } from "./CrawlProgressModal";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Json } from "@/integrations/supabase/types";
import { useAutoSave } from "@/hooks/useAutoSave";
import { SaveStatusIndicator } from "@/components/ui/save-status";
import { Badge } from "@/components/ui/badge";

interface BusinessSettingsProps {
  organizationId: string;
}

interface Service {
  name: string;
  duration?: number;
  description?: string;
}

interface DayHours {
  isOpen: boolean;
  open: string;
  close: string;
}

interface BusinessHours {
  [day: string]: DayHours;
}

interface ExtractedData {
  business_name?: string | null;
  description?: string | null;
  phone?: string | null;
  address?: {
    street?: string | null;
    city?: string | null;
    postal_code?: string | null;
  } | null;
  business_hours?: BusinessHours | null;
  services?: Service[] | null;
  extracted_at?: string | null;
  source_url?: string | null;
}

/** Small badge showing whether a field was auto-detected or needs manual input */
function FieldSourceBadge({
  detected,
  fieldName,
}: {
  detected: boolean;
  fieldName: string;
}) {
  if (detected) {
    return (
      <Badge variant="outline" className="ml-2 text-[10px] font-normal gap-1 border-primary/30 text-primary bg-primary/5">
        <Globe className="w-3 h-3" />
        Auto-detected
      </Badge>
    );
  }
  return (
    <Badge variant="outline" className="ml-2 text-[10px] font-normal gap-1 border-muted-foreground/20 text-muted-foreground">
      <Pencil className="w-3 h-3" />
      Manual
    </Badge>
  );
}

export function BusinessSettings({ organizationId }: BusinessSettingsProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [dataLoaded, setDataLoaded] = useState(false);
  const [extractedData, setExtractedData] = useState<ExtractedData | null>(null);
  const [crawling, setCrawling] = useState(false);
  const [crawlModalOpen, setCrawlModalOpen] = useState(false);
  const crawlPromiseRef = useRef<Promise<any> | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    business_type: "",
    phone: "",
    website: "",
    timezone: "",
    description: "",
    address: {
      street: "",
      city: "",
      postal_code: "",
    },
  });

  const [businessHours, setBusinessHours] = useState<BusinessHours>({});
  const [services, setServices] = useState<Service[]>([]);

  const handleCrawlWebsite = useCallback(async () => {
    if (!formData.website) return;
    setCrawling(true);

    // Save website URL first
    await supabase
      .from("organizations")
      .update({ website: formData.website })
      .eq("id", organizationId);

    // Create promise that the modal will track
    const promise = supabase.functions
      .invoke("crawl-site", {
        body: { organizationId, websiteUrl: formData.website },
      })
      .then(({ data, error }) => {
        if (error) throw error;
        return data;
      });

    crawlPromiseRef.current = promise;
    setCrawlModalOpen(true);
  }, [formData.website, organizationId]);

  const handleCrawlComplete = useCallback(async () => {
    setCrawling(false);
    // Reload data from DB to pick up auto-populated fields
    try {
      const [orgRes, settingsRes] = await Promise.all([
        supabase
          .from("organizations")
          .select("*")
          .eq("id", organizationId)
          .single(),
        supabase
          .from("organization_settings")
          .select("business_hours, services, extracted_business_data")
          .eq("organization_id", organizationId)
          .maybeSingle(),
      ]);

      if (orgRes.data) {
        const org = orgRes.data;
        const addr = (org.address as any) || {};
        setFormData({
          name: org.name || "",
          business_type: org.business_type || "",
          phone: org.phone || "",
          website: org.website || "",
          timezone: org.timezone || "Europe/Amsterdam",
          description: org.description || "",
          address: {
            street: addr.street || "",
            city: addr.city || "",
            postal_code: addr.postal_code || "",
          },
        });
      }

      if (settingsRes.data) {
        setBusinessHours(
          (settingsRes.data.business_hours as unknown as BusinessHours) || {}
        );
        setServices(
          (settingsRes.data.services as unknown as Service[]) || []
        );
        if (settingsRes.data.extracted_business_data) {
          setExtractedData(
            settingsRes.data.extracted_business_data as unknown as ExtractedData
          );
        }
      }
    } catch (err) {
      console.error("Failed to reload after crawl:", err);
    }
  }, [organizationId]);

  const settingsData = useMemo(() => ({
    formData,
    businessHours,
    services,
  }), [formData, businessHours, services]);

  const saveToDatabase = useCallback(async (data: typeof settingsData) => {
    const { error: orgError } = await supabase
      .from("organizations")
      .update({
        name: data.formData.name,
        business_type: data.formData.business_type as any,
        phone: data.formData.phone,
        website: data.formData.website || null,
        timezone: data.formData.timezone,
        description: data.formData.description,
        address: data.formData.address as unknown as Json,
      })
      .eq("id", organizationId);

    if (orgError) throw orgError;

    const { error: settingsError } = await supabase
      .from("organization_settings")
      .update({
        business_hours: data.businessHours as unknown as Json,
        services: data.services as unknown as Json,
      })
      .eq("organization_id", organizationId);

    if (settingsError) throw settingsError;
  }, [organizationId]);

  const syncToVapi = useCallback(async () => {
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

  // Helper to check if a field value was provided by extraction
  const wasDetected = useCallback(
    (fieldPath: string): boolean => {
      if (!extractedData) return false;
      const parts = fieldPath.split(".");
      let val: unknown = extractedData;
      for (const p of parts) {
        if (val == null || typeof val !== "object") return false;
        val = (val as Record<string, unknown>)[p];
      }
      return val != null && val !== "" && val !== false;
    },
    [extractedData]
  );

  const hoursDetected = useMemo(() => {
    return !!(extractedData?.business_hours && Object.keys(extractedData.business_hours).length > 0);
  }, [extractedData]);

  const servicesDetected = useMemo(() => {
    return !!(extractedData?.services && extractedData.services.length > 0);
  }, [extractedData]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [orgRes, settingsRes] = await Promise.all([
          supabase
            .from("organizations")
            .select("*")
            .eq("id", organizationId)
            .single(),
          supabase
            .from("organization_settings")
            .select("business_hours, services, extracted_business_data")
            .eq("organization_id", organizationId)
            .maybeSingle(),
        ]);

        if (orgRes.data) {
          const org = orgRes.data;
          const addr = (org.address as any) || {};
          setFormData({
            name: org.name || "",
            business_type: org.business_type || "",
            phone: org.phone || "",
            website: org.website || "",
            timezone: org.timezone || "Europe/Amsterdam",
            description: org.description || "",
            address: {
              street: addr.street || "",
              city: addr.city || "",
              postal_code: addr.postal_code || "",
            },
          });
        }

        if (settingsRes.data) {
          setBusinessHours((settingsRes.data.business_hours as unknown as BusinessHours) || {});
          setServices((settingsRes.data.services as unknown as Service[]) || []);
          if (settingsRes.data.extracted_business_data) {
            setExtractedData(settingsRes.data.extracted_business_data as unknown as ExtractedData);
          }
        }

        setTimeout(() => setDataLoaded(true), 100);
      } catch (error) {
        console.error("Error fetching business data:", error);
        toast({
          title: "Error loading settings",
          description: "Please try again later.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    if (organizationId) {
      fetchData();
    }
  }, [organizationId, toast]);

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Source info banner */}
      {extractedData?.extracted_at && (
        <div className="flex items-center gap-3 px-5 py-4 rounded-2xl bg-primary/5 border-2 border-primary/15 text-sm text-muted-foreground">
          <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
            <Globe className="w-4 h-4 text-primary" />
          </div>
          <span>
            Some fields were auto-detected from{" "}
            <span className="font-semibold text-foreground">
              {extractedData.source_url
                ? new URL(extractedData.source_url).hostname
                : "your website"}
            </span>
            . You can edit any field to override.
          </span>
        </div>
      )}

      <div className="flex justify-end">
        <SaveStatusIndicator status={status} syncStatus={syncStatus} />
      </div>

      <Accordion type="multiple" defaultValue={["info", "hours", "services"]} className="space-y-4">
        {/* Basic Information */}
        <AccordionItem value="info" className="glass-card px-6 border-none">
          <AccordionTrigger className="hover:no-underline py-5">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center shrink-0">
                <Building className="w-5 h-5 text-primary" />
              </div>
              <div className="text-left">
                <div className="font-serif font-semibold text-[15px]">Basic Information</div>
                <div className="text-sm text-muted-foreground font-normal">
                  Name, address, and contact details
                </div>
              </div>
            </div>
          </AccordionTrigger>
          <AccordionContent className="pt-4 pb-6">
            <div className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4 items-end">
                <div className="space-y-2">
                  <div className="flex items-center min-h-[28px]">
                    <Label>Business Name</Label>
                  </div>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center min-h-[28px]">
                    <Label>Business Type</Label>
                    <FieldSourceBadge detected={wasDetected("business_type")} fieldName="business_type" />
                  </div>
                  <Select
                    value={formData.business_type}
                    onValueChange={(value) => setFormData({ ...formData, business_type: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select type..." />
                    </SelectTrigger>
                    <SelectContent className="max-h-64">
                      <SelectItem value="saas">SaaS</SelectItem>
                      <SelectItem value="agency">Agency</SelectItem>
                      <SelectItem value="ecommerce">E-commerce</SelectItem>
                      <SelectItem value="consulting">Consulting</SelectItem>
                      <SelectItem value="technology">Technology</SelectItem>
                      <SelectItem value="marketing">Marketing</SelectItem>
                      <SelectItem value="financial_services">Financial Services</SelectItem>
                      <SelectItem value="accounting">Accounting</SelectItem>
                      <SelectItem value="law_firm">Law Firm</SelectItem>
                      <SelectItem value="real_estate">Real Estate</SelectItem>
                      <SelectItem value="insurance">Insurance</SelectItem>
                      <SelectItem value="coaching">Coaching</SelectItem>
                      <SelectItem value="education">Education</SelectItem>
                      <SelectItem value="healthcare">Healthcare</SelectItem>
                      <SelectItem value="dental_clinic">Dental Clinic</SelectItem>
                      <SelectItem value="medical_practice">Medical Practice</SelectItem>
                      <SelectItem value="salon">Salon & Beauty</SelectItem>
                      <SelectItem value="spa">Spa & Wellness</SelectItem>
                      <SelectItem value="fitness">Fitness & Gym</SelectItem>
                      <SelectItem value="restaurant">Restaurant</SelectItem>
                      <SelectItem value="hospitality">Hospitality</SelectItem>
                      <SelectItem value="food_delivery">Food Delivery</SelectItem>
                      <SelectItem value="retail">Retail</SelectItem>
                      <SelectItem value="automotive">Automotive</SelectItem>
                      <SelectItem value="construction">Construction</SelectItem>
                      <SelectItem value="plumbing">Plumbing</SelectItem>
                      <SelectItem value="electrician">Electrician</SelectItem>
                      <SelectItem value="cleaning">Cleaning Services</SelectItem>
                      <SelectItem value="landscaping">Landscaping</SelectItem>
                      <SelectItem value="photography">Photography</SelectItem>
                      <SelectItem value="pet_services">Pet Services</SelectItem>
                      <SelectItem value="travel">Travel & Tourism</SelectItem>
                      <SelectItem value="logistics">Logistics</SelectItem>
                      <SelectItem value="nonprofit">Non-profit</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center">
                  <Label>Business Description</Label>
                  <FieldSourceBadge detected={wasDetected("description")} fieldName="description" />
                </div>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder={
                    !formData.description && !wasDetected("description")
                      ? "We couldn't find a description on your website. Add one to help your AI answer accurately."
                      : "Describe what your business does, your specialties, etc."
                  }
                  rows={3}
                />
                <p className="text-xs text-muted-foreground">
                  This helps the AI understand your business and answer questions accurately.
                </p>
              </div>

              <div className="grid md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center">
                    <Label>Street Address</Label>
                    <FieldSourceBadge detected={wasDetected("address.street")} fieldName="street" />
                  </div>
                  <Input
                    value={formData.address.street}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        address: { ...formData.address, street: e.target.value },
                      })
                    }
                    placeholder={
                      !formData.address.street && !wasDetected("address.street")
                        ? "Not found — fill in manually"
                        : "123 Main Street"
                    }
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center">
                    <Label>Postal Code</Label>
                    <FieldSourceBadge detected={wasDetected("address.postal_code")} fieldName="postal_code" />
                  </div>
                  <Input
                    value={formData.address.postal_code}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        address: { ...formData.address, postal_code: e.target.value },
                      })
                    }
                    placeholder={
                      !formData.address.postal_code && !wasDetected("address.postal_code")
                        ? "Not found — fill in manually"
                        : "1234 AB"
                    }
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center">
                    <Label>City</Label>
                    <FieldSourceBadge detected={wasDetected("address.city")} fieldName="city" />
                  </div>
                  <Input
                    value={formData.address.city}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        address: { ...formData.address, city: e.target.value },
                      })
                    }
                    placeholder={
                      !formData.address.city && !wasDetected("address.city")
                        ? "Not found — fill in manually"
                        : "Amsterdam"
                    }
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center">
                  <Label>Website URL</Label>
                </div>
                <div className="flex gap-2">
                  <Input
                    type="url"
                    value={formData.website}
                    onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                    placeholder="https://www.example.com"
                    className="flex-1"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    disabled={!formData.website || crawling}
                    onClick={handleCrawlWebsite}
                    className="gap-2 shrink-0"
                  >
                    {crawling ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <RefreshCw className="w-4 h-4" />
                    )}
                    {crawling ? "Crawling..." : "Crawl Website"}
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Enter your website URL and click "Crawl Website" to teach the AI about your business.
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center">
                    <Label>Contact Phone</Label>
                    <FieldSourceBadge detected={wasDetected("phone")} fieldName="phone" />
                  </div>
                  <Input
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder={
                      !formData.phone && !wasDetected("phone")
                        ? "Not found — fill in manually"
                        : "+31 20 123 4567"
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>Timezone</Label>
                  <Select
                    value={formData.timezone}
                    onValueChange={(value) => setFormData({ ...formData, timezone: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="America/New_York">America/New_York (EST)</SelectItem>
                      <SelectItem value="America/Chicago">America/Chicago (CST)</SelectItem>
                      <SelectItem value="America/Denver">America/Denver (MST)</SelectItem>
                      <SelectItem value="America/Los_Angeles">America/Los_Angeles (PST)</SelectItem>
                      <SelectItem value="America/Sao_Paulo">America/São Paulo (BRT)</SelectItem>
                      <SelectItem value="Europe/London">Europe/London (GMT)</SelectItem>
                      <SelectItem value="Europe/Amsterdam">Europe/Amsterdam (CET)</SelectItem>
                      <SelectItem value="Europe/Paris">Europe/Paris (CET)</SelectItem>
                      <SelectItem value="Europe/Berlin">Europe/Berlin (CET)</SelectItem>
                      <SelectItem value="Europe/Moscow">Europe/Moscow (MSK)</SelectItem>
                      <SelectItem value="Asia/Dubai">Asia/Dubai (GST)</SelectItem>
                      <SelectItem value="Asia/Kolkata">Asia/Kolkata (IST)</SelectItem>
                      <SelectItem value="Asia/Bangkok">Asia/Bangkok (ICT)</SelectItem>
                      <SelectItem value="Asia/Singapore">Asia/Singapore (SGT)</SelectItem>
                      <SelectItem value="Asia/Hong_Kong">Asia/Hong Kong (HKT)</SelectItem>
                      <SelectItem value="Asia/Tokyo">Asia/Tokyo (JST)</SelectItem>
                      <SelectItem value="Asia/Seoul">Asia/Seoul (KST)</SelectItem>
                      <SelectItem value="Australia/Sydney">Australia/Sydney (AEST)</SelectItem>
                      <SelectItem value="Pacific/Auckland">Pacific/Auckland (NZST)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Business Hours */}
        <AccordionItem value="hours" className="glass-card px-6 border-none">
          <AccordionTrigger className="hover:no-underline py-5">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center shrink-0">
                <Clock className="w-5 h-5 text-primary" />
              </div>
              <div className="text-left">
                <div className="font-serif font-semibold text-[15px] flex items-center">
                  Business Hours
                  <FieldSourceBadge detected={hoursDetected} fieldName="hours" />
                </div>
                <div className="text-sm text-muted-foreground font-normal">
                  {hoursDetected
                    ? "Auto-detected from your website — review and adjust if needed"
                    : Object.keys(businessHours).length === 0
                    ? "Not found on your website — add your hours so your AI can inform customers"
                    : "When your business is open"}
                </div>
              </div>
            </div>
          </AccordionTrigger>
          <AccordionContent className="pt-4 pb-6">
            <BusinessHoursEditor value={businessHours} onChange={setBusinessHours} />
          </AccordionContent>
        </AccordionItem>

        {/* Services */}
        <AccordionItem value="services" className="glass-card px-6 border-none">
          <AccordionTrigger className="hover:no-underline py-5">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center shrink-0">
                <Briefcase className="w-5 h-5 text-primary" />
              </div>
              <div className="text-left">
                <div className="font-serif font-semibold text-[15px] flex items-center">
                  Services
                  <FieldSourceBadge detected={servicesDetected} fieldName="services" />
                </div>
                <div className="text-sm text-muted-foreground font-normal">
                  {servicesDetected
                    ? "Auto-detected from your website — review and adjust if needed"
                    : services.length === 0
                    ? "Not found on your website — add services so your AI can help customers"
                    : "Services you offer and their durations"}
                </div>
              </div>
            </div>
          </AccordionTrigger>
          <AccordionContent className="pt-4 pb-6">
            <ServicesEditor value={services} onChange={setServices} />
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      <CrawlProgressModal
        open={crawlModalOpen}
        onClose={() => setCrawlModalOpen(false)}
        websiteUrl={formData.website}
        crawlPromise={crawlPromiseRef.current}
        onComplete={handleCrawlComplete}
      />
    </div>
  );
}
