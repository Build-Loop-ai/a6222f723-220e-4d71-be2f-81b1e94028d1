import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { motion, useInView } from "framer-motion";
import { useRef, useState } from "react";
import { MessageCircle } from "lucide-react";
import ContactDialog from "./ContactDialog";
import { useSiteConfigTransformed } from "@/hooks/useSiteConfig";

const FAQSection = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const [contactOpen, setContactOpen] = useState(false);
  const { config } = useSiteConfigTransformed();

  const faqs = [
    { question: "How does Greet work?", answer: "Greet crawls your website to learn about your business, services, and content. It then uses that knowledge to chat with visitors in real time — answering questions, recommending pages, and booking appointments. No manual training required." },
    { question: "Can the AI book appointments?", answer: "Yes! The AI integrates with Google Calendar. It checks availability, collects visitor info, confirms the booking, and sends notifications. Set buffer times, types, and duration rules." },
    { question: `What languages does ${config.name} support?`, answer: `${config.name} supports 22+ languages including English, Dutch, German, French, Spanish, and more. Auto-detects visitor language.` },
    { question: "How long does setup take?", answer: "Most businesses are live in under 5 minutes. Enter your URL, let the AI crawl, customize the widget, and embed one line of code." },
    { question: "How do I add the widget to my website?", answer: "Copy a one-line script tag from your dashboard and paste it into your HTML. Works with WordPress, Shopify, Wix, Squarespace, or custom sites." },
    { question: "What if the AI can't answer a question?", answer: "Set up fallback responses. The AI can suggest contacting you, display contact info, or collect details for a callback. It never makes up information." },
    { question: "Is my data secure?", answer: "All data encrypted in transit and at rest. GDPR compliant. We never share or sell your data. Conversation logs can be auto-deleted based on your retention policy." },
    { question: "Can I cancel anytime?", answer: `Yes — cancel with no fees. Retain access until end of billing period. ${config.trialDays}-day free trial to test everything first.` },
  ];

  return (
    <section id="faq" ref={ref} className="py-32 md:py-40 bg-background relative overflow-hidden">
      <div className="container mx-auto px-4 md:px-6 relative z-10">
        <div className="max-w-3xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={isInView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.8 }} className="mb-16">
            <div className="section-label mb-5">FAQ</div>
            <h2 className="font-display font-700 leading-[1.1] tracking-[-0.02em] text-foreground mb-5" style={{ fontSize: "clamp(36px, 5vw, 56px)" }}>
              Frequently asked <span className="text-gradient">questions</span>
            </h2>
            <p className="text-[17px] text-muted-foreground leading-relaxed">
              Everything you need to know about {config.name}.
            </p>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 30 }} animate={isInView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.8, delay: 0.2 }}>
            <Accordion type="single" collapsible className="space-y-3">
              {faqs.map((faq, idx) => (
                <AccordionItem
                  key={idx}
                  value={`item-${idx}`}
                  className="glass rounded-[20px] px-6 data-[state=open]:border-primary/20 transition-all duration-300"
                >
                  <AccordionTrigger className="text-left font-display font-600 text-foreground hover:text-primary py-6 text-base md:text-lg hover:no-underline tracking-[-0.01em]">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground pb-6 leading-relaxed">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </motion.div>

          {/* Contact */}
          <motion.div initial={{ opacity: 0, y: 30 }} animate={isInView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.8, delay: 0.4 }} className="mt-16">
            <div className="glass rounded-[20px] p-6 flex flex-col sm:flex-row items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <MessageCircle className="w-6 h-6 text-primary" />
              </div>
              <div className="text-center sm:text-left flex-1">
                <p className="font-display font-600 text-foreground">Still have questions?</p>
                <p className="text-sm text-muted-foreground">Our team is here to help.</p>
              </div>
              <button onClick={() => setContactOpen(true)} className="px-6 py-2.5 rounded-xl text-sm font-medium border border-foreground/10 text-foreground hover:border-foreground/20 transition-colors">
                Contact Support
              </button>
            </div>
          </motion.div>
        </div>
      </div>
      <ContactDialog open={contactOpen} onOpenChange={setContactOpen} />
    </section>
  );
};

export default FAQSection;
