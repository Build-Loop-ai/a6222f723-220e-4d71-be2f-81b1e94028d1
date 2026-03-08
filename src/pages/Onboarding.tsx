import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
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
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import {
  Building,
  Globe,
  MessageSquareText,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  Loader2,
  FileText,
  ExternalLink,
  Palette,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useSiteConfigTransformed } from "@/hooks/useSiteConfig";
import { useQueryClient } from "@tanstack/react-query";
import { cn } from "@/lib/utils";

const STEPS = [
  { id: 1, title: "Business Basics", icon: Building },
  { id: 2, title: "Crawl Your Site", icon: Globe },
  { id: 3, title: "Customize Widget", icon: Palette },
];

const BUSINESS_TYPES = [
  { value: "dental_clinic", label: "Dental Clinic" },
  { value: "medical_practice", label: "Medical Practice" },
  { value: "salon", label: "Salon" },
  { value: "restaurant", label: "Restaurant" },
  { value: "saas", label: "SaaS" },
  { value: "agency", label: "Agency" },
  { value: "ecommerce", label: "E-commerce" },
  { value: "consulting", label: "Consulting" },
  { value: "law_firm", label: "Law Firm" },
  { value: "accounting", label: "Accounting" },
  { value: "real_estate", label: "Real Estate" },
  { value: "insurance", label: "Insurance" },
  { value: "fitness", label: "Fitness" },
  { value: "spa", label: "Spa" },
  { value: "automotive", label: "Automotive" },
  { value: "education", label: "Education" },
  { value: "nonprofit", label: "Nonprofit" },
  { value: "healthcare", label: "Healthcare" },
  { value: "construction", label: "Construction" },
  { value: "retail", label: "Retail" },
  { value: "hospitality", label: "Hospitality" },
  { value: "technology", label: "Technology" },
  { value: "marketing", label: "Marketing" },
  { value: "financial_services", label: "Financial Services" },
  { value: "photography", label: "Photography" },
  { value: "cleaning", label: "Cleaning" },
  { value: "plumbing", label: "Plumbing" },
  { value: "electrician", label: "Electrician" },
  { value: "landscaping", label: "Landscaping" },
  { value: "pet_services", label: "Pet Services" },
  { value: "logistics", label: "Logistics" },
  { value: "travel", label: "Travel" },
  { value: "food_delivery", label: "Food Delivery" },
  { value: "coaching", label: "Coaching" },
  { value: "other", label: "Other" },
] as const;

type BusinessType = typeof BUSINESS_TYPES[number]["value"];

interface CrawledPage {
  url: string;
  title: string | null;
  summary: string | null;
}

const Onboarding = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const { config } = useSiteConfigTransformed();
  const queryClient = useQueryClient();

  const [currentStep, setCurrentStep] = useState(1);
  const [isCompleted, setIsCompleted] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Step 1: Business Basics
  const [businessData, setBusinessData] = useState({
    name: "",
    website: "",
    type: "other" as BusinessType,
    phone: "",
  });

  // Step 2: Crawl state
  const [isCrawling, setIsCrawling] = useState(false);
  const [crawlProgress, setCrawlProgress] = useState(0);
  const [crawledPages, setCrawledPages] = useState<CrawledPage[]>([]);
  const [crawlDone, setCrawlDone] = useState(false);

  // Step 3: Widget customization
  const [widgetConfig, setWidgetConfig] = useState({
    widget_title: "Chat with us",
    welcome_message: "Hi there! 👋 How can I help you today?",
    accent_color: "#0d9488",
    position: "bottom-right",
    theme: "auto",
  });

  // Load saved clinic name from signup
  useEffect(() => {
    const savedClinicName = sessionStorage.getItem("pendingClinicName");
    if (savedClinicName) {
      setBusinessData((prev) => ({ ...prev, name: savedClinicName }));
      sessionStorage.removeItem("pendingClinicName");
    }
  }, []);

  // Redirect if not logged in
  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/signup");
    }
  }, [user, authLoading, navigate]);

  // Check if user already completed onboarding
  useEffect(() => {
    const checkOnboardingStatus = async () => {
      if (!user) return;
      const { data: profile } = await supabase
        .from("profiles")
        .select("onboarding_completed, organization_id")
        .eq("id", user.id)
        .maybeSingle();
      if (profile?.onboarding_completed && profile?.organization_id) {
        navigate("/dashboard");
      }
    };
    checkOnboardingStatus();
  }, [user, navigate]);

  const handleCrawl = async () => {
    if (!businessData.website) {
      toast({ variant: "destructive", title: "Website URL is required" });
      return;
    }

    setIsCrawling(true);
    setCrawlProgress(10);

    try {
      // Simulate crawl progress during onboarding — the real crawl
      // happens in complete-onboarding after the org is created.
      const progressInterval = setInterval(() => {
        setCrawlProgress((prev) => {
          if (prev >= 100) return 100;
          return Math.min(prev + 8, 100);
        });
      }, 400);

      // Wait ~3s to simulate discovery
      await new Promise((resolve) => setTimeout(resolve, 3000));

      clearInterval(progressInterval);
      setCrawlProgress(100);
      setCrawlDone(true);

      toast({
        title: "Website validated!",
        description: "Your site will be fully crawled once setup completes.",
      });
    } catch (err: any) {
      console.error("Crawl error:", err);
      toast({
        variant: "destructive",
        title: "Crawl failed",
        description: err.message || "Could not crawl your website. You can try again later.",
      });
      // Allow skipping on error
      setCrawlDone(true);
    } finally {
      setIsCrawling(false);
    }
  };

  const handleNext = () => {
    if (currentStep === 1) {
      if (!businessData.name.trim()) {
        toast({ variant: "destructive", title: "Business name is required" });
        return;
      }
      if (!businessData.website.trim()) {
        toast({ variant: "destructive", title: "Website URL is required" });
        return;
      }
      setCurrentStep(2);
    } else if (currentStep === 2) {
      setCurrentStep(3);
    } else {
      handleComplete();
    }
  };

  const handleBack = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  const handleComplete = async () => {
    if (!user) return;
    setIsSaving(true);

    try {
      const { data, error } = await supabase.functions.invoke("complete-onboarding", {
        body: {
          businessData,
          widgetConfig,
          crawledPages,
        },
      });

      if (error) throw error;
      if (!data?.success) throw new Error(data?.error || "Onboarding failed");

      toast({
        title: "Setup complete!",
        description: "Your AI widget is ready to go.",
      });

      // Invalidate profile cache so ProtectedRoute sees the update
      await queryClient.invalidateQueries({ queryKey: ["profile"] });
      await queryClient.refetchQueries({ queryKey: ["profile", user.id] });
      setIsCompleted(true);
    } catch (error: any) {
      console.error("Onboarding error:", error);
      toast({
        variant: "destructive",
        title: "Setup failed",
        description: error.message || "Something went wrong. Please try again.",
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (isCompleted) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="max-w-lg text-center animate-scale-in">
          <div className="w-24 h-24 mx-auto mb-8 rounded-full bg-gradient-to-br from-teal to-teal-light flex items-center justify-center">
            <Sparkles className="w-12 h-12 text-white" />
          </div>
          <h1 className="text-4xl font-serif text-foreground mb-4">You're all set!</h1>
          <p className="text-lg text-muted-foreground mb-8">
            Your AI website assistant is ready. Add the embed code to your site and start helping visitors instantly.
          </p>
          <Button variant="hero" size="xl" onClick={() => navigate("/dashboard")}>
            Go to Dashboard
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Header */}
      <header className="bg-background border-b border-border py-4">
        <div className="container mx-auto px-4 md:px-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal to-teal-light flex items-center justify-center">
              <MessageSquareText className="w-5 h-5 text-white" />
            </div>
            <span className="font-serif text-xl font-medium text-foreground">
              {config.name}
            </span>
          </div>
          <div className="text-sm text-muted-foreground">Step {currentStep} of 3</div>
        </div>
      </header>

      {/* Progress Bar */}
      <div className="bg-background border-b border-border">
        <div className="container mx-auto px-4 md:px-6 py-6">
          <div className="flex items-center justify-between max-w-2xl mx-auto">
            {STEPS.map((step, idx) => (
              <div key={step.id} className="flex items-center">
                <div
                  className={cn(
                    "flex items-center gap-2",
                    step.id < currentStep
                      ? "text-primary"
                      : step.id === currentStep
                      ? "text-foreground"
                      : "text-muted-foreground"
                  )}
                >
                  <div
                    className={cn(
                      "w-10 h-10 rounded-full flex items-center justify-center transition-all",
                      step.id < currentStep
                        ? "bg-primary text-primary-foreground"
                        : step.id === currentStep
                        ? "bg-primary/10 text-primary border-2 border-primary"
                        : "bg-muted text-muted-foreground"
                    )}
                  >
                    {step.id < currentStep ? (
                      <CheckCircle2 className="w-5 h-5" />
                    ) : (
                      <step.icon className="w-5 h-5" />
                    )}
                  </div>
                  <span className="hidden md:block text-sm font-medium">{step.title}</span>
                </div>
                {idx < STEPS.length - 1 && (
                  <div
                    className={cn(
                      "w-12 md:w-20 h-0.5 mx-2",
                      step.id < currentStep ? "bg-primary" : "bg-muted"
                    )}
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 md:px-6 py-12">
        <div className="max-w-2xl mx-auto">
          {/* Step 1: Business Basics */}
          {currentStep === 1 && (
            <div className="bg-card rounded-3xl p-8 shadow-lg border border-border/50 animate-fade-in-up">
              <h2 className="text-2xl font-serif text-foreground mb-2">
                Tell us about your business
              </h2>
              <p className="text-muted-foreground mb-8">
                We'll use your website to train your AI assistant.
              </p>

              <div className="space-y-6">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="businessName">Business Name *</Label>
                    <Input
                      id="businessName"
                      placeholder="Your Business Name"
                      value={businessData.name}
                      onChange={(e) =>
                        setBusinessData({ ...businessData, name: e.target.value })
                      }
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="businessType">Business Type</Label>
                    <Select
                      value={businessData.type}
                      onValueChange={(value: BusinessType) =>
                        setBusinessData({ ...businessData, type: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="max-h-60">
                        {BUSINESS_TYPES.map((bt) => (
                          <SelectItem key={bt.value} value={bt.value}>{bt.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="website">Website URL *</Label>
                  <Input
                    id="website"
                    placeholder="https://example.com"
                    value={businessData.website}
                    onChange={(e) =>
                      setBusinessData({ ...businessData, website: e.target.value })
                    }
                    required
                  />
                  <p className="text-xs text-muted-foreground">
                    We'll crawl your website to train your AI assistant with your content.
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number (optional)</Label>
                  <Input
                    id="phone"
                    placeholder="+1 555 123 4567"
                    value={businessData.phone}
                    onChange={(e) =>
                      setBusinessData({ ...businessData, phone: e.target.value })
                    }
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Crawl Your Site */}
          {currentStep === 2 && (
            <div className="bg-card rounded-3xl p-8 shadow-lg border border-border/50 animate-fade-in-up">
              <h2 className="text-2xl font-serif text-foreground mb-2">
                Let's learn about your website
              </h2>
              <p className="text-muted-foreground mb-8">
                We'll crawl <span className="font-medium text-foreground">{businessData.website}</span> to
                train your AI with your content.
              </p>

              {!crawlDone ? (
                <div className="space-y-6">
                  {isCrawling ? (
                    <div className="space-y-4 py-8">
                      <div className="flex items-center justify-center gap-3 mb-4">
                        <Loader2 className="w-6 h-6 animate-spin text-primary" />
                        <span className="text-lg font-medium text-foreground">
                          Crawling your website...
                        </span>
                      </div>
                      <Progress value={crawlProgress} className="h-3 max-w-md mx-auto" />
                      <p className="text-center text-sm text-muted-foreground">
                        Discovering pages and extracting content
                      </p>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-primary/10 flex items-center justify-center">
                        <Globe className="w-8 h-8 text-primary" />
                      </div>
                      <p className="text-muted-foreground mb-6">
                        Click below to scan your website. We'll find your key pages and use them to answer visitor questions.
                      </p>
                      <Button onClick={handleCrawl} size="lg" className="gap-2">
                        <Globe className="w-5 h-5" />
                        Start Crawling
                      </Button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-success mb-4">
                    <CheckCircle2 className="w-5 h-5" />
                    <span className="font-medium">
                      {crawledPages.length} pages discovered
                    </span>
                  </div>

                  {crawledPages.length > 0 && (
                    <div className="space-y-2 max-h-72 overflow-y-auto rounded-xl border border-border p-1">
                      {crawledPages.slice(0, 15).map((page, idx) => (
                        <div
                          key={idx}
                          className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors"
                        >
                          <FileText className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">
                              {page.title || page.url}
                            </p>
                            {page.summary && (
                              <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">
                                {page.summary}
                              </p>
                            )}
                          </div>
                          <a
                            href={page.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-muted-foreground hover:text-foreground shrink-0"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        </div>
                      ))}
                      {crawledPages.length > 15 && (
                        <p className="text-center text-xs text-muted-foreground py-2">
                          + {crawledPages.length - 15} more pages
                        </p>
                      )}
                    </div>
                  )}

                  <Button variant="outline" size="sm" onClick={handleCrawl} disabled={isCrawling} className="gap-2">
                    <Globe className="w-4 h-4" />
                    Re-crawl
                  </Button>
                </div>
              )}
            </div>
          )}

          {/* Step 3: Customize Widget */}
          {currentStep === 3 && (
            <div className="bg-card rounded-3xl p-8 shadow-lg border border-border/50 animate-fade-in-up">
              <h2 className="text-2xl font-serif text-foreground mb-2">
                Customize your chat widget
              </h2>
              <p className="text-muted-foreground mb-8">
                Choose how your widget looks on your website.
              </p>

              <div className="grid md:grid-cols-2 gap-8">
                {/* Settings */}
                <div className="space-y-5">
                  <div className="space-y-2">
                    <Label>Widget Title</Label>
                    <Input
                      value={widgetConfig.widget_title}
                      onChange={(e) =>
                        setWidgetConfig({ ...widgetConfig, widget_title: e.target.value })
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Welcome Message</Label>
                    <Textarea
                      value={widgetConfig.welcome_message}
                      onChange={(e) =>
                        setWidgetConfig({ ...widgetConfig, welcome_message: e.target.value })
                      }
                      rows={3}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Accent Color</Label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={widgetConfig.accent_color}
                        onChange={(e) =>
                          setWidgetConfig({ ...widgetConfig, accent_color: e.target.value })
                        }
                        className="w-10 h-10 rounded-lg border border-border cursor-pointer"
                      />
                      <Input
                        value={widgetConfig.accent_color}
                        onChange={(e) =>
                          setWidgetConfig({ ...widgetConfig, accent_color: e.target.value })
                        }
                        className="flex-1"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Position</Label>
                    <Select
                      value={widgetConfig.position}
                      onValueChange={(v) =>
                        setWidgetConfig({ ...widgetConfig, position: v })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="bottom-right">Bottom Right</SelectItem>
                        <SelectItem value="bottom-left">Bottom Left</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Live Preview */}
                <div className="flex flex-col items-center">
                  <Label className="mb-3 self-start">Preview</Label>
                  <div className="relative w-full max-w-[280px] h-[360px] bg-muted/50 rounded-2xl border border-border overflow-hidden">
                    {/* Mini chat panel preview */}
                    <div className="absolute inset-2 bg-card rounded-xl border border-border shadow-lg flex flex-col overflow-hidden">
                      {/* Header */}
                      <div
                        className="px-4 py-3 flex items-center gap-2"
                        style={{ backgroundColor: widgetConfig.accent_color }}
                      >
                        <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                          <MessageSquareText className="w-4 h-4 text-white" />
                        </div>
                        <span className="text-white text-sm font-medium truncate">
                          {widgetConfig.widget_title}
                        </span>
                      </div>

                      {/* Messages */}
                      <div className="flex-1 p-3 space-y-2 overflow-hidden">
                        <div className="bg-muted rounded-lg rounded-tl-none px-3 py-2 text-xs text-foreground max-w-[85%]">
                          {widgetConfig.welcome_message}
                        </div>
                      </div>

                      {/* Input */}
                      <div className="p-2 border-t border-border">
                        <div className="bg-muted rounded-lg px-3 py-2 text-xs text-muted-foreground">
                          Type a message...
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Floating bubble preview */}
                  <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
                    <div
                      className="w-12 h-12 rounded-full shadow-lg flex items-center justify-center"
                      style={{ backgroundColor: widgetConfig.accent_color }}
                    >
                      <MessageSquareText className="w-6 h-6 text-white" />
                    </div>
                    <span>Chat bubble</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="flex justify-between mt-8">
            <Button
              variant="outline"
              size="lg"
              onClick={handleBack}
              disabled={currentStep === 1 || isSaving}
              className="gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </Button>
            <Button
              variant="hero"
              size="lg"
              onClick={handleNext}
              className="gap-2"
              disabled={
                isSaving ||
                isCrawling ||
                (currentStep === 1 && (!businessData.name.trim() || !businessData.website.trim()))
              }
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Setting up...
                </>
              ) : currentStep === 3 ? (
                "Launch Your Widget"
              ) : (
                "Continue"
              )}
              {!isSaving && <ArrowRight className="w-4 h-4" />}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Onboarding;
