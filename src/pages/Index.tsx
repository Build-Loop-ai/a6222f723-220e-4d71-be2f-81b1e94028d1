import { Helmet } from "react-helmet";
import Navbar from "@/components/landing/Navbar";
import HeroSection from "@/components/landing/HeroSection";

import IntroSection from "@/components/landing/IntroSection";
import HowItWorks from "@/components/landing/HowItWorks";
import FeaturesSection from "@/components/landing/FeaturesSection";
import DemoSection from "@/components/landing/DemoSection";
import PricingSection from "@/components/landing/PricingSection";
import FAQSection from "@/components/landing/FAQSection";
import CTASection from "@/components/landing/CTASection";
import Footer from "@/components/landing/Footer";

const Index = () => {
  return (
    <div className="min-h-screen" style={{ background: "#050506", overflowX: "clip" }}>
      <Helmet>
        <title>Greet – AI Receptionist for Your Business</title>
        <meta name="description" content="Greet is an AI-powered virtual receptionist that answers calls, books appointments, and chats with your website visitors 24/7." />
        <meta property="og:title" content="Greet – AI Receptionist for Your Business" />
        <meta property="og:description" content="AI-powered virtual receptionist that answers calls, books appointments, and chats with visitors 24/7." />
        <meta property="og:type" content="website" />
        <link rel="canonical" href={window.location.origin} />
      </Helmet>
      <Navbar />
      <HeroSection />
      
      <IntroSection />
      <HowItWorks />
      <FeaturesSection />
      <DemoSection />
      <PricingSection />
      <FAQSection />
      <CTASection />
      <Footer />
    </div>
  );
};

export default Index;
