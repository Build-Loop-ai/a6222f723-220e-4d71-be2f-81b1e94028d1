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
      <div className="min-h-screen flex items-center justify-center bg-background">
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
      <div className="min-h-screen flex bg-background grain-overlay relative overflow-hidden">
      {/* Ambient orbs */}
      <div className="absolute top-[-200px] left-[-100px] w-[500px] h-[500px] rounded-full bg-primary/[0.06] blur-[120px] animate-float pointer-events-none" />
      <div className="absolute bottom-[-150px] right-[-50px] w-[400px] h-[400px] rounded-full bg-cyan/[0.04] blur-[100px] animate-float-reverse pointer-events-none" />

      {/* Left panel – decorative */}
      <div className="hidden lg:flex flex-1 relative items-center justify-center p-12">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/4 -left-20 w-96 h-96 bg-primary/[0.08] rounded-full blur-[100px]" />
          <div className="absolute bottom-1/4 right-10 w-80 h-80 bg-cyan/[0.06] rounded-full blur-[80px]" />
        </div>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="relative z-10 text-center max-w-md"
        >
          <span className="font-display text-6xl font-[800] tracking-tight text-gradient mb-6 block">
            greet
          </span>
          <p className="text-muted-foreground text-lg font-body">
            Your website, speaking.
          </p>
          <div className="mt-10 glass glass-sm p-6 text-left">
            <p className="text-foreground/80 text-sm font-body leading-relaxed">
              "Greet has completely transformed how we handle customer inquiries. Our AI assistant
              handles 80% of calls autonomously."
            </p>
            <div className="mt-4 flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                <span className="text-xs font-semibold text-primary">JM</span>
              </div>
              <div>
                <p className="text-xs font-semibold text-foreground/90">Dr. James Miller</p>
                <p className="text-[11px] text-muted-foreground font-mono uppercase tracking-wider">Dental Practice Owner</p>
              </div>
            </div>
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
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-8"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm font-body">Back to home</span>
          </Link>

          {/* Logo */}
          <Link to="/" className="block mb-10">
            <span className="font-display text-3xl font-[800] tracking-tight text-gradient">
              greet
            </span>
          </Link>

          <div className="mb-8">
            <h1 className="text-3xl font-display font-bold text-foreground mb-2">
              Welcome back
            </h1>
            <p className="text-muted-foreground font-body">
              Sign in to your account to continue
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
              <Label htmlFor="email" className="text-foreground/80 font-body text-sm">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="you@business.com"
                  className={`pl-10 bg-surface border-border/60 focus:border-primary/50 ${errors.email ? "border-destructive" : ""}`}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-foreground/80 font-body text-sm">Password</Label>
                <Link to="/forgot-password" className="text-xs text-primary hover:underline font-body">
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  className={`pl-10 pr-10 bg-surface border-border/60 focus:border-primary/50 ${errors.password ? "border-destructive" : ""}`}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
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

            {showResendConfirmation && (
              <div className="p-3 rounded-lg bg-muted border border-border/60 text-sm">
                <p className="text-foreground/80 mb-2">
                  Your email hasn't been confirmed yet. Check your inbox or resend the confirmation.
                </p>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleResendConfirmation}
                  disabled={resendLoading}
                  className="gap-2"
                >
                  <RefreshCw className={`w-3 h-3 ${resendLoading ? "animate-spin" : ""}`} />
                  {resendLoading ? "Sending..." : "Resend confirmation email"}
                </Button>
              </div>
            )}

            <Button type="submit" variant="hero" size="lg" className="w-full" disabled={isLoading}>
              {isLoading ? "Signing in..." : "Sign In"}
            </Button>
          </form>

          <p className="mt-8 text-center text-sm text-muted-foreground font-body">
            Don't have an account?{" "}
            <Link to="/signup" className="text-primary font-medium hover:underline">
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
