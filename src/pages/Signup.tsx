import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Mail, Lock, Eye, EyeOff, User, Building, Check } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { signupSchema } from "@/lib/validations";
import { z } from "zod";
import { useSiteConfigTransformed } from "@/hooks/useSiteConfig";
import { motion } from "framer-motion";

const Signup = () => {
  const navigate = useNavigate();
  const { signUp, signInWithGoogle, user, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const { config } = useSiteConfigTransformed();

  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    clinicName: "",
    agreeTerms: false,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (user && !authLoading) navigate("/auth/callback");
  }, [user, authLoading, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    try {
      const data = signupSchema.parse(formData);
      setIsLoading(true);
      const { error } = await signUp(data.email, data.password, data.fullName);
      if (error) {
        toast({
          variant: "destructive",
          title: error.message.includes("already registered") ? "Account exists" : "Sign up failed",
          description: error.message.includes("already registered")
            ? "An account with this email already exists. Please sign in instead."
            : error.message,
        });
        return;
      }
      sessionStorage.setItem("pendingClinicName", data.clinicName);
      toast({ title: "Account created!", description: "Let's set up your AI receptionist." });
      navigate("/onboarding");
    } catch (err) {
      if (err instanceof z.ZodError) {
        const fieldErrors: Record<string, string> = {};
        err.errors.forEach((error) => {
          if (error.path[0]) fieldErrors[error.path[0].toString()] = error.message;
        });
        setErrors(fieldErrors);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    const { error } = await signInWithGoogle();
    if (error) {
      toast({ variant: "destructive", title: "Google sign in failed", description: error.message });
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <span className="font-display text-2xl font-[800] tracking-tight text-gradient animate-pulse">
          greet
        </span>
      </div>
    );
  }

  const features = [
    "24/7 AI Receptionist",
    "Appointment Booking",
    "Call Transcripts",
    "Multi-language Support",
  ];

  return (
    <div className="min-h-screen flex bg-background grain-overlay relative overflow-hidden">
      {/* Ambient orbs */}
      <div className="absolute top-[-200px] right-[-100px] w-[500px] h-[500px] rounded-full bg-primary/[0.06] blur-[120px] animate-float pointer-events-none" />
      <div className="absolute bottom-[-150px] left-[-50px] w-[400px] h-[400px] rounded-full bg-cyan/[0.04] blur-[100px] animate-float-reverse pointer-events-none" />

      {/* Left panel – decorative */}
      <div className="hidden lg:flex flex-1 relative items-center justify-center p-12">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/4 -right-20 w-96 h-96 bg-primary/[0.08] rounded-full blur-[100px]" />
          <div className="absolute bottom-1/4 -left-20 w-80 h-80 bg-cyan/[0.06] rounded-full blur-[80px]" />
        </div>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="relative z-10 text-center max-w-md"
        >
          <span className="font-display text-6xl font-[800] tracking-tight text-gradient mb-4 block">
            greet
          </span>
          <h2 className="text-2xl font-display font-bold text-foreground mb-2">
            Start your{" "}
            <span className="text-gradient">{config.trialDays}-day free trial</span>
          </h2>
          <p className="text-muted-foreground font-body mb-10">
            No credit card required. Setup in 5 minutes. Cancel anytime.
          </p>

          <div className="grid grid-cols-1 gap-3 text-left">
            {features.map((feature, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + idx * 0.1 }}
                className="flex items-center gap-3 glass glass-sm px-4 py-3"
              >
                <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                  <Check className="w-3.5 h-3.5 text-primary" />
                </div>
                <span className="text-sm text-foreground/80 font-body">{feature}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Right panel – form */}
      <div className="flex-1 flex items-center justify-center p-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="w-full max-w-md"
        >
          {/* Logo */}
          <Link to="/" className="block mb-10">
            <span className="font-display text-3xl font-[800] tracking-tight text-gradient">
              greet
            </span>
          </Link>

          <div className="mb-8">
            <h1 className="text-3xl font-display font-bold text-foreground mb-2">
              Create your account
            </h1>
            <p className="text-muted-foreground font-body">
              Get started with your AI receptionist today
            </p>
          </div>

          {/* Google OAuth */}
          <Button
            variant="outline"
            size="lg"
            className="w-full mb-6 border-border/60 hover:border-border hover:bg-surface-2"
            onClick={handleGoogleSignIn}
            type="button"
          >
            <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
              <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            Continue with Google
          </Button>

          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border/40" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-3 text-muted-foreground font-mono tracking-widest text-[10px]">
                Or continue with
              </span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="fullName" className="text-foreground/80 font-body text-sm">Full Name</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="fullName"
                  type="text"
                  placeholder="John Smith"
                  className={`pl-10 bg-surface border-border/60 focus:border-primary/50 ${errors.fullName ? "border-destructive" : ""}`}
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  required
                />
              </div>
              {errors.fullName && <p className="text-sm text-destructive">{errors.fullName}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-foreground/80 font-body text-sm">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="you@business.com"
                  className={`pl-10 bg-surface border-border/60 focus:border-primary/50 ${errors.email ? "border-destructive" : ""}`}
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />
              </div>
              {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="clinicName" className="text-foreground/80 font-body text-sm">Business Name</Label>
              <div className="relative">
                <Building className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="clinicName"
                  type="text"
                  placeholder="Your Business Name"
                  className={`pl-10 bg-surface border-border/60 focus:border-primary/50 ${errors.clinicName ? "border-destructive" : ""}`}
                  value={formData.clinicName}
                  onChange={(e) => setFormData({ ...formData, clinicName: e.target.value })}
                  required
                />
              </div>
              {errors.clinicName && <p className="text-sm text-destructive">{errors.clinicName}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-foreground/80 font-body text-sm">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  className={`pl-10 pr-10 bg-surface border-border/60 focus:border-primary/50 ${errors.password ? "border-destructive" : ""}`}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
                  minLength={8}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && <p className="text-sm text-destructive">{errors.password}</p>}
            </div>

            <div className="flex items-start space-x-2 pt-2">
              <Checkbox
                id="terms"
                checked={formData.agreeTerms}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, agreeTerms: checked as boolean })
                }
              />
              <label htmlFor="terms" className="text-sm text-muted-foreground leading-tight font-body">
                I agree to the{" "}
                <Link to="/terms" className="text-primary hover:underline">Terms of Service</Link>{" "}
                and{" "}
                <Link to="/privacy" className="text-primary hover:underline">Privacy Policy</Link>
              </label>
            </div>
            {errors.agreeTerms && <p className="text-sm text-destructive">{errors.agreeTerms}</p>}

            <Button
              type="submit"
              variant="hero"
              size="lg"
              className="w-full"
              disabled={isLoading || !formData.agreeTerms}
            >
              {isLoading ? "Creating account..." : "Start Free Trial"}
            </Button>
          </form>

          <p className="mt-8 text-center text-sm text-muted-foreground font-body">
            Already have an account?{" "}
            <Link to="/login" className="text-primary font-medium hover:underline">
              Sign in
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default Signup;
