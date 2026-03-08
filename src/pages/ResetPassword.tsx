import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Lock, Eye, EyeOff, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useSiteConfigTransformed } from "@/hooks/useSiteConfig";
import { z } from "zod";
import { motion } from "framer-motion";

const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
  .regex(/[0-9]/, "Password must contain at least one number");

const ResetPassword = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { config } = useSiteConfigTransformed();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isValidSession, setIsValidSession] = useState(false);
  const [isCheckingSession, setIsCheckingSession] = useState(true);

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      const hashParams = new URLSearchParams(window.location.hash.substring(1));
      const accessToken = hashParams.get("access_token");
      const type = hashParams.get("type");
      if ((type === "recovery" && accessToken) || session) setIsValidSession(true);
      setIsCheckingSession(false);
    };
    checkSession();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    try {
      passwordSchema.parse(password);
      if (password !== confirmPassword) {
        setErrors({ confirmPassword: "Passwords don't match" });
        return;
      }
      setIsLoading(true);
      const { error } = await supabase.auth.updateUser({ password });
      if (error) {
        toast({ variant: "destructive", title: "Error", description: error.message });
        return;
      }
      setIsSuccess(true);
      toast({ title: "Password updated!", description: "Your password has been successfully reset." });
      setTimeout(() => navigate("/login"), 3000);
    } catch (err) {
      if (err instanceof z.ZodError) setErrors({ password: err.errors[0].message });
    } finally {
      setIsLoading(false);
    }
  };

  if (isCheckingSession) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <span className="font-display text-2xl font-[800] tracking-tight text-gradient animate-pulse">
          greet
        </span>
      </div>
    );
  }

  if (!isValidSession) {
    return (
      <div className="min-h-screen flex items-center justify-center p-8 bg-background grain-overlay relative overflow-hidden">
        <div className="absolute top-[-200px] left-1/3 w-[400px] h-[400px] rounded-full bg-primary/[0.06] blur-[120px] pointer-events-none" />
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md text-center relative z-10">
          <Link to="/" className="block mb-12">
            <span className="font-display text-3xl font-[800] tracking-tight text-gradient">greet</span>
          </Link>
          <h1 className="text-3xl font-display font-bold text-foreground mb-4">
            Invalid or expired link
          </h1>
          <p className="text-muted-foreground font-body mb-8">
            This password reset link is invalid or has expired. Please request a new one.
          </p>
          <Button asChild variant="hero" size="lg">
            <Link to="/forgot-password">Request New Link</Link>
          </Button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-8 bg-background grain-overlay relative overflow-hidden">
      <div className="absolute top-[-200px] left-1/3 w-[400px] h-[400px] rounded-full bg-primary/[0.06] blur-[120px] animate-float pointer-events-none" />
      <div className="absolute bottom-[-150px] right-1/4 w-[350px] h-[350px] rounded-full bg-cyan/[0.04] blur-[100px] animate-float-reverse pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md relative z-10"
      >
        {/* Logo */}
        <Link to="/" className="block mb-10">
          <span className="font-display text-3xl font-[800] tracking-tight text-gradient">
            greet
          </span>
        </Link>

        {isSuccess ? (
          <div className="text-center">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-3xl font-display font-bold text-foreground mb-2">
              Password updated!
            </h1>
            <p className="text-muted-foreground font-body mb-8">
              Your password has been successfully reset. Redirecting to login...
            </p>
          </div>
        ) : (
          <>
            <div className="mb-8">
              <h1 className="text-3xl font-display font-bold text-foreground mb-2">
                Set new password
              </h1>
              <p className="text-muted-foreground font-body">
                Enter your new password below.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="password" className="text-foreground/80 font-body text-sm">New Password</Label>
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

              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-foreground/80 font-body text-sm">Confirm Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="confirmPassword"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    className={`pl-10 bg-surface border-border/60 focus:border-primary/50 ${errors.confirmPassword ? "border-destructive" : ""}`}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                </div>
                {errors.confirmPassword && <p className="text-sm text-destructive">{errors.confirmPassword}</p>}
              </div>

              <div className="text-sm text-muted-foreground font-body glass glass-sm p-3">
                <p className="font-mono text-[10px] tracking-widest uppercase text-muted-foreground mb-2">Requirements</p>
                <ul className="space-y-1">
                  <li className={`flex items-center gap-2 ${password.length >= 8 ? "text-primary" : ""}`}>
                    <div className={`w-1.5 h-1.5 rounded-full ${password.length >= 8 ? "bg-primary" : "bg-muted-foreground/30"}`} />
                    At least 8 characters
                  </li>
                  <li className={`flex items-center gap-2 ${/[A-Z]/.test(password) ? "text-primary" : ""}`}>
                    <div className={`w-1.5 h-1.5 rounded-full ${/[A-Z]/.test(password) ? "bg-primary" : "bg-muted-foreground/30"}`} />
                    One uppercase letter
                  </li>
                  <li className={`flex items-center gap-2 ${/[0-9]/.test(password) ? "text-primary" : ""}`}>
                    <div className={`w-1.5 h-1.5 rounded-full ${/[0-9]/.test(password) ? "bg-primary" : "bg-muted-foreground/30"}`} />
                    One number
                  </li>
                </ul>
              </div>

              <Button type="submit" variant="hero" size="lg" className="w-full" disabled={isLoading}>
                {isLoading ? "Updating..." : "Update Password"}
              </Button>
            </form>
          </>
        )}
      </motion.div>
    </div>
  );
};

export default ResetPassword;
