import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Mail, Lock, Eye, EyeOff, User, Building, Check, Zap, MessageSquare, Phone, Globe } from "lucide-react";
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
      toast({
        title: "Check your email!",
        description: "We've sent you a confirmation link. Please verify your email to continue.",
      });
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
      <div className="min-h-screen flex items-center justify-center" style={{ background: "#050506" }}>
        <span className="font-display text-2xl font-[800] tracking-tight text-gradient animate-pulse">
          greet
        </span>
      </div>
    );
  }

  const features = [
    { icon: Phone, label: "24/7 AI Voice Agent" },
    { icon: MessageSquare, label: "Smart Chat Widget" },
    { icon: Zap, label: "Instant Appointment Booking" },
    { icon: Globe, label: "22+ Language Support" },
  ];

  return (
    <>
      <Helmet>
        <title>Sign Up — Greet</title>
        <meta name="description" content="Create your Greet account and set up your AI receptionist in minutes." />
      </Helmet>
      <div className="min-h-screen flex relative overflow-hidden" style={{ background: "#050506" }}>
        {/* Ambient background orbs */}
        <div className="absolute top-[-25%] right-[-10%] w-[600px] h-[600px] rounded-full blur-[160px] pointer-events-none" style={{ background: "radial-gradient(circle, hsl(190 100% 44% / 0.1), transparent 70%)" }} />
        <div className="absolute bottom-[-25%] left-[-5%] w-[500px] h-[500px] rounded-full blur-[140px] pointer-events-none" style={{ background: "radial-gradient(circle, hsl(148 68% 52% / 0.1), transparent 70%)" }} />
        <div className="absolute top-[40%] right-[30%] w-[250px] h-[250px] rounded-full blur-[100px] pointer-events-none" style={{ background: "radial-gradient(circle, hsl(148 68% 52% / 0.04), transparent 70%)" }} />

        {/* Left panel – brand showcase */}
        <div className="hidden lg:flex flex-1 relative items-center justify-center p-16">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
            className="relative z-10 max-w-lg"
          >
            <span className="font-display text-7xl font-[800] tracking-tight text-gradient mb-6 block">
              greet
            </span>
            <h2 className="text-3xl font-display font-bold text-[hsl(0_0%_100%/0.9)] mb-2 tracking-tight">
              Start your{" "}
              <span className="text-gradient">{config.trialDays}-day free trial</span>
            </h2>
            <p className="text-[hsl(0_0%_100%/0.45)] text-lg font-body mb-12">
              No credit card required · Setup in 5 minutes · Cancel anytime
            </p>

            <div className="space-y-3">
              {features.map((feature, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 + idx * 0.1, duration: 0.6 }}
                  className="flex items-center gap-4 rounded-xl border border-[hsl(0_0%_100%/0.06)] px-5 py-4"
                  style={{ background: "hsl(0 0% 100% / 0.03)", backdropFilter: "blur(12px)" }}
                >
                  <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0" style={{ background: "linear-gradient(135deg, hsl(148 68% 52% / 0.15), hsl(190 100% 44% / 0.15))" }}>
                    <feature.icon className="w-4.5 h-4.5 text-primary" />
                  </div>
                  <span className="text-sm text-[hsl(0_0%_100%/0.75)] font-body font-medium">{feature.label}</span>
                </motion.div>
              ))}
            </div>

            {/* Trust signal */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1 }}
              className="mt-10 text-[hsl(0_0%_100%/0.25)] text-xs font-mono uppercase tracking-widest"
            >
              Trusted by 500+ businesses worldwide
            </motion.p>
          </motion.div>
        </div>

        {/* Right panel – sign up form */}
        <div className="flex-1 flex items-center justify-center p-6 sm:p-10 relative z-10">
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, delay: 0.15 }}
            className="w-full max-w-[420px]"
          >
            {/* Logo mobile only */}
            <Link to="/" className="block mb-8 lg:hidden">
              <span className="font-display text-4xl font-[800] tracking-tight text-gradient">
                greet
              </span>
            </Link>

            <div className="mb-8">
              <h1 className="text-3xl sm:text-4xl font-display font-bold text-[hsl(0_0%_100%/0.95)] mb-2 tracking-tight">
                Create your account
              </h1>
              <p className="text-[hsl(0_0%_100%/0.45)] font-body">
                Get your AI receptionist up and running in minutes
              </p>
            </div>

            {/* Google OAuth */}
            <Button
              variant="outline"
              size="lg"
              className="w-full mb-6 h-12 rounded-xl border-[hsl(0_0%_100%/0.1)] bg-[hsl(0_0%_100%/0.03)] text-[hsl(0_0%_100%/0.8)] hover:bg-[hsl(0_0%_100%/0.06)] hover:border-[hsl(0_0%_100%/0.15)] transition-all"
              onClick={handleGoogleSignIn}
              type="button"
            >
              <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              Continue with Google
            </Button>

            <div className="relative mb-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-[hsl(0_0%_100%/0.08)]" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="px-3 text-[hsl(0_0%_100%/0.3)] font-mono tracking-widest text-[10px]" style={{ background: "#050506" }}>
                  Or continue with email
                </span>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="fullName" className="text-[hsl(0_0%_100%/0.6)] font-body text-sm">Full Name</Label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[hsl(0_0%_100%/0.25)]" />
                    <Input
                      id="fullName"
                      type="text"
                      placeholder="John Smith"
                      className={`pl-10 h-12 bg-[hsl(0_0%_100%/0.04)] border-[hsl(0_0%_100%/0.08)] text-[hsl(0_0%_100%/0.9)] placeholder:text-[hsl(0_0%_100%/0.2)] focus:border-primary/50 focus:ring-primary/10 hover:border-[hsl(0_0%_100%/0.15)] ${errors.fullName ? "border-destructive" : ""}`}
                      value={formData.fullName}
                      onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                      required
                    />
                  </div>
                  {errors.fullName && <p className="text-xs text-destructive">{errors.fullName}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="clinicName" className="text-[hsl(0_0%_100%/0.6)] font-body text-sm">Business Name</Label>
                  <div className="relative">
                    <Building className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[hsl(0_0%_100%/0.25)]" />
                    <Input
                      id="clinicName"
                      type="text"
                      placeholder="Your Business"
                      className={`pl-10 h-12 bg-[hsl(0_0%_100%/0.04)] border-[hsl(0_0%_100%/0.08)] text-[hsl(0_0%_100%/0.9)] placeholder:text-[hsl(0_0%_100%/0.2)] focus:border-primary/50 focus:ring-primary/10 hover:border-[hsl(0_0%_100%/0.15)] ${errors.clinicName ? "border-destructive" : ""}`}
                      value={formData.clinicName}
                      onChange={(e) => setFormData({ ...formData, clinicName: e.target.value })}
                      required
                    />
                  </div>
                  {errors.clinicName && <p className="text-xs text-destructive">{errors.clinicName}</p>}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-[hsl(0_0%_100%/0.6)] font-body text-sm">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[hsl(0_0%_100%/0.25)]" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@business.com"
                    className={`pl-10 h-12 bg-[hsl(0_0%_100%/0.04)] border-[hsl(0_0%_100%/0.08)] text-[hsl(0_0%_100%/0.9)] placeholder:text-[hsl(0_0%_100%/0.2)] focus:border-primary/50 focus:ring-primary/10 hover:border-[hsl(0_0%_100%/0.15)] ${errors.email ? "border-destructive" : ""}`}
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                  />
                </div>
                {errors.email && <p className="text-xs text-destructive">{errors.email}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-[hsl(0_0%_100%/0.6)] font-body text-sm">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[hsl(0_0%_100%/0.25)]" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Min. 8 characters"
                    className={`pl-10 pr-10 h-12 bg-[hsl(0_0%_100%/0.04)] border-[hsl(0_0%_100%/0.08)] text-[hsl(0_0%_100%/0.9)] placeholder:text-[hsl(0_0%_100%/0.2)] focus:border-primary/50 focus:ring-primary/10 hover:border-[hsl(0_0%_100%/0.15)] ${errors.password ? "border-destructive" : ""}`}
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    required
                    minLength={8}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[hsl(0_0%_100%/0.25)] hover:text-[hsl(0_0%_100%/0.5)] transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {errors.password && <p className="text-xs text-destructive">{errors.password}</p>}
              </div>

              <div className="flex items-start space-x-2.5 pt-1">
                <Checkbox
                  id="terms"
                  checked={formData.agreeTerms}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, agreeTerms: checked as boolean })
                  }
                  className="border-[hsl(0_0%_100%/0.15)] data-[state=checked]:bg-primary data-[state=checked]:border-primary mt-0.5"
                />
                <label htmlFor="terms" className="text-sm text-[hsl(0_0%_100%/0.4)] leading-tight font-body">
                  I agree to the{" "}
                  <Link to="/terms" className="text-primary/80 hover:text-primary transition-colors">Terms</Link>{" "}
                  and{" "}
                  <Link to="/privacy" className="text-primary/80 hover:text-primary transition-colors">Privacy Policy</Link>
                </label>
              </div>
              {errors.agreeTerms && <p className="text-xs text-destructive">{errors.agreeTerms}</p>}

              <Button
                type="submit"
                size="lg"
                className="w-full h-12 rounded-xl text-base font-semibold transition-all duration-300 hover:-translate-y-0.5 mt-2"
                style={{
                  background: "linear-gradient(135deg, hsl(148 68% 52%), hsl(190 100% 44%))",
                  color: "#050506",
                  boxShadow: "0 0 30px hsl(148 68% 52% / 0.2)",
                }}
                disabled={isLoading || !formData.agreeTerms}
              >
                {isLoading ? "Creating account..." : "Start Free Trial"}
              </Button>
            </form>

            <p className="mt-8 text-center text-sm text-[hsl(0_0%_100%/0.4)] font-body">
              Already have an account?{" "}
              <Link to="/login" className="text-primary font-medium hover:text-primary/80 transition-colors">
                Sign in
              </Link>
            </p>
          </motion.div>
        </div>
      </div>
    </>
  );
};

export default Signup;
