import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { motion, useInView } from "framer-motion";
import { useRef, useState } from "react";
import { MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import ContactDialog from "./ContactDialog";
import { useSiteConfigTransformed } from "@/hooks/useSiteConfig";

const FAQSection = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const [contactOpen, setContactOpen] = useState(false);
  const { config } = useSiteConfigTransformed();

  const faqs = [
    {
      question: "How does the AI website assistant work?",
      answer:
        "Our AI crawls your website to learn about your business, services, and content. It then uses that knowledge to chat with visitors in real time — answering questions, recommending pages, and booking appointments. No manual training required.",
    },
    {
      question: "Can the AI actually book appointments?",
      answer:
        "Yes! The AI integrates with popular calendar systems like Google Calendar. It checks real-time availability, collects visitor information, confirms the booking, and sends confirmation notifications. You can set buffer times, appointment types, and duration rules.",
    },
    {
      question: `What languages does ${config.name} support?`,
      answer:
        `${config.name} supports 20+ languages including English, Dutch, German, French, Spanish, Portuguese, Italian, and more. The AI can automatically detect the visitor's language and respond accordingly, or you can set a primary language.`,
    },
    {
      question: "How long does setup take?",
      answer:
        "Most businesses are up and running in under 5 minutes. Just enter your website URL, let the AI crawl your content, customize the widget appearance, and embed a single line of code. No technical knowledge is required.",
    },
    {
      question: "How do I add the widget to my website?",
      answer:
        `Simply copy a one-line script tag from your ${config.name} dashboard and paste it into your website's HTML. It works with any website — WordPress, Shopify, Wix, Squarespace, or custom-built. You can also use the iframe embed option.`,
    },
    {
      question: "What happens if the AI can't answer a question?",
      answer:
        "You can set up fallback responses for any scenario. The AI can suggest contacting you directly, display your contact information, or collect the visitor's details for a callback. It will never make up information — it only answers from your website content.",
    },
    {
      question: "Is my data secure?",
      answer:
        "Yes, we take data security very seriously. All data is encrypted in transit and at rest. We're GDPR compliant, and we never share or sell your data. Conversation logs are securely stored and can be automatically deleted based on your retention policy.",
    },
    {
      question: "Can I cancel anytime?",
      answer:
        "Yes, you can cancel your subscription at any time with no cancellation fees. If you cancel, you'll retain access until the end of your billing period. We also offer a 14-day free trial so you can test everything before committing.",
    },
  ];

  return (
    <section id="faq" ref={ref} className="py-24 md:py-32 bg-background relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0">
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-muted/50 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-4 md:px-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-primary" />
            FAQ
          </span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-serif text-foreground mb-6">
            Frequently asked{" "}
            <span className="italic text-gradient">questions</span>
          </h2>
          <p className="text-lg text-muted-foreground">
            Everything you need to know about {config.name}. Can't find an answer?
            Contact our support team.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="max-w-3xl mx-auto"
        >
          <Accordion type="single" collapsible className="space-y-4">
            {faqs.map((faq, idx) => (
              <AccordionItem
                key={idx}
                value={`item-${idx}`}
                className="bg-card rounded-2xl px-6 border border-border/50 shadow-sm data-[state=open]:shadow-md data-[state=open]:border-primary/20 transition-all duration-300"
              >
                <AccordionTrigger className="text-left font-medium text-foreground hover:text-primary py-6 text-base md:text-lg hover:no-underline">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground pb-6 leading-relaxed">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </motion.div>

        {/* Contact CTA */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="text-center mt-16"
        >
          <div className="inline-flex flex-col sm:flex-row items-center gap-4 p-6 rounded-2xl bg-muted/50 border border-border/50">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
              <MessageCircle className="w-6 h-6 text-primary" />
            </div>
            <div className="text-center sm:text-left">
              <p className="font-medium text-foreground">Still have questions?</p>
              <p className="text-sm text-muted-foreground">Our team is here to help.</p>
            </div>
            <Button 
              variant="outline" 
              size="lg" 
              className="ml-0 sm:ml-4"
              onClick={() => setContactOpen(true)}
            >
              Contact Support
            </Button>
          </div>
        </motion.div>
      </div>
      
      <ContactDialog open={contactOpen} onOpenChange={setContactOpen} />
    </section>
  );
};

export default FAQSection;
