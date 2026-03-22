import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Mail, Lock, Eye, EyeOff, ArrowLeft, RefreshCw } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { loginSchema } from "@/lib/validations";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { useSiteConfigTransformed } from "@/hooks/useSiteConfig";
import { motion } from "framer-motion";

const Login = () => {
  const navigate = useNavigate();
  const { signIn, signInWithGoogle, user, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const { config } = useSiteConfigTransformed();

  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showResendConfirmation, setShowResendConfirmation] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);

  useEffect(() => {
    if (user && !authLoading) {
      navigate("/auth/callback");
    }
  }, [user, authLoading, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    try {
      const data = loginSchema.parse({ email, password });
      setIsLoading(true);
      const { error } = await signIn(data.email, data.password);
      if (error) {
        const isUnconfirmed = error.message.includes("Email not confirmed");
        if (isUnconfirmed) {
          setShowResendConfirmation(true);
          toast({
            variant: "destructive",
            title: "Email not confirmed",
            description: "Please check your inbox and confirm your email before signing in.",
          });
          return;
        }
        toast({
          variant: "destructive",
          title: error.message.includes("Invalid login credentials")
            ? "Invalid credentials"
            : "Sign in failed",
          description: error.message.includes("Invalid login credentials")
            ? "Please check your email and password and try again."
            : error.message,
        });
        return;
      }
      toast({ title: "Welcome back!", description: "You've been signed in successfully." });
      navigate("/auth/callback");
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

  const handleResendConfirmation = async () => {
    if (!email) return;
    setResendLoading(true);
    try {
      const { error } = await supabase.auth.resend({
        type: "signup",
        email,
        options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
      });
      if (error) throw error;
      toast({ title: "Confirmation email sent", description: "Please check your inbox." });
      setShowResendConfirmation(false);
    } catch (err: any) {
      toast({ variant: "destructive", title: "Failed to resend", description: err.message });
    } finally {
      setResendLoading(false);
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

  return (
    <>
      <Helmet>
        <title>Log In — Greet</title>
        <meta name="description" content="Sign in to your Greet dashboard to manage your AI receptionist." />
      </Helmet>
      <div className="min-h-screen flex relative overflow-hidden" style={{ background: "#050506" }}>
        {/* Ambient background orbs */}
        <div className="absolute top-[-30%] left-[-10%] w-[600px] h-[600px] rounded-full blur-[160px] pointer-events-none" style={{ background: "radial-gradient(circle, hsl(148 68% 52% / 0.12), transparent 70%)" }} />
        <div className="absolute bottom-[-20%] right-[-5%] w-[500px] h-[500px] rounded-full blur-[140px] pointer-events-none" style={{ background: "radial-gradient(circle, hsl(190 100% 44% / 0.08), transparent 70%)" }} />
        <div className="absolute top-[60%] left-[40%] w-[300px] h-[300px] rounded-full blur-[120px] pointer-events-none" style={{ background: "radial-gradient(circle, hsl(148 68% 52% / 0.05), transparent 70%)" }} />

        {/* Left panel – immersive brand showcase */}
        <div className="hidden lg:flex flex-1 relative items-center justify-center p-16">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
            className="relative z-10 max-w-lg"
          >
            <span className="font-display text-7xl font-[800] tracking-tight text-gradient mb-8 block">
              greet
            </span>
            <p className="text-[hsl(0_0%_100%/0.5)] text-lg font-body leading-relaxed mb-12">
              Your AI-powered receptionist that never sleeps. Answer calls, chat with visitors, and book appointments — all on autopilot.
            </p>

            {/* Testimonial glass card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.8 }}
              className="rounded-2xl border border-[hsl(0_0%_100%/0.06)] p-6"
              style={{ background: "hsl(0 0% 100% / 0.03)", backdropFilter: "blur(20px)" }}
            >
              <div className="flex gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <svg key={i} className="w-4 h-4 text-primary" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <p className="text-[hsl(0_0%_100%/0.7)] text-sm font-body leading-relaxed mb-4">
                "Greet has completely transformed how we handle customer inquiries. Our AI assistant
                handles 80% of calls autonomously — it's like having a receptionist that never takes a break."
              </p>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full flex items-center justify-center" style={{ background: "linear-gradient(135deg, hsl(148 68% 52% / 0.3), hsl(190 100% 44% / 0.3))" }}>
                  <span className="text-xs font-semibold text-primary">JM</span>
                </div>
                <div>
                  <p className="text-xs font-semibold text-[hsl(0_0%_100%/0.85)]">Dr. James Miller</p>
                  <p className="text-[10px] text-[hsl(0_0%_100%/0.4)] font-mono uppercase tracking-wider">Dental Practice Owner</p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>

        {/* Right panel – sign in form */}
        <div className="flex-1 flex items-center justify-center p-6 sm:p-10 relative z-10">
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, delay: 0.15 }}
            className="w-full max-w-[420px]"
          >
            <Link
              to="/"
              className="inline-flex items-center gap-2 text-[hsl(0_0%_100%/0.4)] hover:text-[hsl(0_0%_100%/0.7)] transition-colors mb-10"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="text-sm font-body">Back to home</span>
            </Link>

            {/* Logo mobile only */}
            <Link to="/" className="block mb-10 lg:hidden">
              <span className="font-display text-4xl font-[800] tracking-tight text-gradient">
                greet
              </span>
            </Link>

            <div className="mb-8">
              <h1 className="text-3xl sm:text-4xl font-display font-bold text-[hsl(0_0%_100%/0.95)] mb-2 tracking-tight">
                Welcome back
              </h1>
              <p className="text-[hsl(0_0%_100%/0.45)] font-body">
                Sign in to your dashboard
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

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-[hsl(0_0%_100%/0.6)] font-body text-sm">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[hsl(0_0%_100%/0.25)]" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@business.com"
                    className={`pl-10 h-12 bg-[hsl(0_0%_100%/0.04)] border-[hsl(0_0%_100%/0.08)] text-[hsl(0_0%_100%/0.9)] placeholder:text-[hsl(0_0%_100%/0.2)] focus:border-primary/50 focus:ring-primary/10 hover:border-[hsl(0_0%_100%/0.15)] ${errors.email ? "border-destructive" : ""}`}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className="text-[hsl(0_0%_100%/0.6)] font-body text-sm">Password</Label>
                  <Link to="/forgot-password" className="text-xs text-primary/80 hover:text-primary transition-colors font-body">
                    Forgot password?
                  </Link>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[hsl(0_0%_100%/0.25)]" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    className={`pl-10 pr-10 h-12 bg-[hsl(0_0%_100%/0.04)] border-[hsl(0_0%_100%/0.08)] text-[hsl(0_0%_100%/0.9)] placeholder:text-[hsl(0_0%_100%/0.2)] focus:border-primary/50 focus:ring-primary/10 hover:border-[hsl(0_0%_100%/0.15)] ${errors.password ? "border-destructive" : ""}`}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[hsl(0_0%_100%/0.25)] hover:text-[hsl(0_0%_100%/0.5)] transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {errors.password && <p className="text-sm text-destructive">{errors.password}</p>}
              </div>

              {showResendConfirmation && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-4 rounded-xl border border-primary/20 text-sm"
                  style={{ background: "hsl(148 68% 52% / 0.05)" }}
                >
                  <p className="text-[hsl(0_0%_100%/0.7)] mb-3">
                    Your email hasn't been confirmed yet. Check your inbox or resend the confirmation.
                  </p>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleResendConfirmation}
                    disabled={resendLoading}
                    className="gap-2 border-primary/30 text-primary hover:bg-primary/10"
                  >
                    <RefreshCw className={`w-3 h-3 ${resendLoading ? "animate-spin" : ""}`} />
                    {resendLoading ? "Sending..." : "Resend confirmation email"}
                  </Button>
                </motion.div>
              )}

              <Button
                type="submit"
                size="lg"
                className="w-full h-12 rounded-xl text-base font-semibold transition-all duration-300 hover:-translate-y-0.5"
                style={{
                  background: "linear-gradient(135deg, hsl(148 68% 52%), hsl(190 100% 44%))",
                  color: "#050506",
                  boxShadow: "0 0 30px hsl(148 68% 52% / 0.2)",
                }}
                disabled={isLoading}
              >
                {isLoading ? "Signing in..." : "Sign In"}
              </Button>
            </form>

            <p className="mt-8 text-center text-sm text-[hsl(0_0%_100%/0.4)] font-body">
              Don't have an account?{" "}
              <Link to="/signup" className="text-primary font-medium hover:text-primary/80 transition-colors">
                Start free trial
              </Link>
            </p>
          </motion.div>
        </div>
      </div>
    </>
  );
};

export default Login;
