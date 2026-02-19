import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { motion, useInView } from "framer-motion";
import { useRef, useState } from "react";
import { MessageCircle } from "lucide-react";
import ContactDialog from "./ContactDialog";

const faqs = [
  { q: "How does Greet learn my website?", a: "Paste your URL and Greet automatically crawls your entire sitemap. It reads every page, product listing, FAQ, and piece of content. When your site updates, Greet re-crawls and stays current." },
  { q: "Can I use voice and chat together?", a: "Yes. Voice mode lives inside the same chat widget. Visitors can type or tap the microphone to switch to a spoken conversation. Same AI brain, two modes." },
  { q: "What about languages?", a: "Greet speaks 22+ languages fluently. It detects the visitor's language automatically and responds in kind." },
  { q: "Can I remove Greet branding?", a: "On the Agency plan, yes. Full white-label: your logo, your colors, your domain. Your clients never see Greet." },
  { q: "How fast is setup?", a: "Under 5 minutes. Paste your URL, customize the look, copy one line of code to your site. Done." },
  { q: "What if I want to add custom knowledge?", a: "Upload any PDF, document, or spreadsheet. Internal pricing, policies, anything. Greet learns it and can answer questions from it." },
  { q: "Is my data secure?", a: "All data encrypted in transit and at rest. GDPR compliant. We never share or sell your data. Conversation logs can be auto-deleted based on your retention policy." },
  { q: "Can I cancel anytime?", a: "Yes — cancel with no fees. Retain access until end of billing period. 14-day free trial to test everything first." },
];

const FAQSection = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const [contactOpen, setContactOpen] = useState(false);

  return (
    <section id="faq" ref={ref} className="py-32 md:py-44 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 pointer-events-none" style={{
        background: "linear-gradient(180deg, #070810 0%, #0A0B10 50%, #070810 100%)",
      }} />

      {/* Subtle green accent bottom */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] pointer-events-none" style={{
        background: "radial-gradient(ellipse, rgba(52,215,123,0.05) 0%, transparent 70%)",
      }} />

      {/* Top separator */}
      <div className="absolute top-0 left-0 right-0 h-px" style={{ background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.08), transparent)" }} />

      <div className="max-w-[860px] mx-auto px-6 md:px-12 relative z-10">
        <motion.div initial={{ opacity: 0, y: 30 }} animate={isInView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.8 }} className="mb-16">
          <div className="section-label mb-5">FAQ</div>
          <h2 className="font-display font-[700] leading-[1.1] tracking-[-0.02em] text-foreground" style={{ fontSize: "clamp(30px, 4vw, 36px)" }}>
            Questions? Answered.
          </h2>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 30 }} animate={isInView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.8, delay: 0.2 }}>
          <Accordion type="single" collapsible className="space-y-3">
            {faqs.map((faq, idx) => (
              <AccordionItem
                key={idx}
                value={`item-${idx}`}
                className="glass rounded-[20px] px-6 data-[state=open]:border-l-2 data-[state=open]:border-l-primary transition-all duration-300"
              >
                <AccordionTrigger className="text-left font-display font-[600] text-foreground hover:text-primary py-6 text-base hover:no-underline tracking-[-0.01em]">
                  {faq.q}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground pb-6 leading-relaxed">
                  {faq.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </motion.div>

        {/* Contact CTA */}
        <motion.div initial={{ opacity: 0, y: 30 }} animate={isInView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.8, delay: 0.4 }} className="mt-16">
          <div className="glass rounded-[20px] p-6 flex flex-col sm:flex-row items-center gap-4">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: "rgba(52,215,123,0.10)" }}>
              <MessageCircle className="w-6 h-6 text-primary" />
            </div>
            <div className="text-center sm:text-left flex-1">
              <p className="font-display font-[600] text-foreground">Still have questions?</p>
              <p className="text-sm text-muted-foreground">Our team is here to help.</p>
            </div>
            <button onClick={() => setContactOpen(true)} className="px-6 py-2.5 rounded-xl text-sm font-medium border border-foreground/10 text-foreground hover:border-foreground/20 transition-colors">
              Contact Support
            </button>
          </div>
        </motion.div>
      </div>
      <ContactDialog open={contactOpen} onOpenChange={setContactOpen} />
    </section>
  );
};

export default FAQSection;
