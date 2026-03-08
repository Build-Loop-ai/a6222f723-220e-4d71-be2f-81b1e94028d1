import { useState } from "react";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Mail, ArrowLeft, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useSiteConfigTransformed } from "@/hooks/useSiteConfig";
import { z } from "zod";
import { motion } from "framer-motion";

const emailSchema = z.string().email("Please enter a valid email address");

const ForgotPassword = () => {
  const { toast } = useToast();
  const { config } = useSiteConfigTransformed();

  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      emailSchema.parse(email);
      setIsLoading(true);
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (resetError) {
        toast({ variant: "destructive", title: "Error", description: resetError.message });
        return;
      }
      setIsSuccess(true);
      toast({ title: "Email sent!", description: "Check your inbox for password reset instructions." });
    } catch (err) {
      if (err instanceof z.ZodError) setError(err.errors[0].message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>Reset Password — Greet</title>
        <meta name="description" content="Reset your Greet account password." />
      </Helmet>
      <div className="min-h-screen flex items-center justify-center p-8 bg-background grain-overlay relative overflow-hidden">
      {/* Ambient orbs */}
      <div className="absolute top-[-200px] left-1/3 w-[400px] h-[400px] rounded-full bg-primary/[0.06] blur-[120px] animate-float pointer-events-none" />
      <div className="absolute bottom-[-150px] right-1/4 w-[350px] h-[350px] rounded-full bg-cyan/[0.04] blur-[100px] animate-float-reverse pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md relative z-10"
      >
        <Link
          to="/login"
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm font-body">Back to login</span>
        </Link>

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
              Check your email
            </h1>
            <p className="text-muted-foreground font-body mb-8">
              We've sent a password reset link to <strong className="text-foreground">{email}</strong>
            </p>
            <p className="text-sm text-muted-foreground font-body">
              Didn't receive the email?{" "}
              <button onClick={() => setIsSuccess(false)} className="text-primary font-medium hover:underline">
                Try again
              </button>
            </p>
          </div>
        ) : (
          <>
            <div className="mb-8">
              <h1 className="text-3xl font-display font-bold text-foreground mb-2">
                Reset your password
              </h1>
              <p className="text-muted-foreground font-body">
                Enter your email and we'll send you a link to reset your password.
              </p>
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
                    className={`pl-10 bg-surface border-border/60 focus:border-primary/50 ${error ? "border-destructive" : ""}`}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                {error && <p className="text-sm text-destructive">{error}</p>}
              </div>

              <Button type="submit" variant="hero" size="lg" className="w-full" disabled={isLoading}>
                {isLoading ? "Sending..." : "Send Reset Link"}
              </Button>
            </form>

            <p className="mt-8 text-center text-sm text-muted-foreground font-body">
              Remember your password?{" "}
              <Link to="/login" className="text-primary font-medium hover:underline">
                Sign in
              </Link>
            </p>
          </>
        )}
      </motion.div>
    </div>
    </>
  );
};

export default ForgotPassword;
