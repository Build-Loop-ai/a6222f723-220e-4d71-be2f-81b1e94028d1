import { motion, useScroll, useTransform } from "framer-motion";
import { useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Quote } from "lucide-react";
import { useSiteConfigTransformed } from "@/hooks/useSiteConfig";

const TestimonialsSection = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const { config } = useSiteConfigTransformed();

  const { scrollYProgress } = useScroll({ target: containerRef, offset: ["start end", "end start"] });
  const opacity = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0, 1, 1, 0]);

  const testimonials = [
    {
      quote: `${config.name} has completely transformed how we engage with website visitors. We went from losing 40% of leads to capturing nearly every one. The ROI was positive within a week.`,
      author: "Dr. Sarah van den Berg",
      role: "Owner & Lead Dentist",
      clinic: "Amsterdam Dental Care",
      metric: "40%",
      metricLabel: "more leads captured",
      image: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=200&h=200&fit=crop&crop=face",
    },
    {
      quote: "My staff used to spend hours answering the same questions. Now the AI handles it all on the website. Visitors get instant answers and we get more bookings.",
      author: "Michael de Vries",
      role: "Practice Manager",
      clinic: "Rotterdam Family Dentistry",
      metric: "3x",
      metricLabel: "more bookings",
      image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&h=200&fit=crop&crop=face",
    },
    {
      quote: "I was skeptical about chatbots, but this is different. It actually knows our services and answers intelligently. Visitors love it.",
      author: "Dr. Emma Jansen",
      role: "Founder",
      clinic: "SmileBright Utrecht",
      metric: "92%",
      metricLabel: "visitor satisfaction",
      image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&h=200&fit=crop&crop=face",
    },
  ];

  const next = () => setActiveIndex((p) => (p + 1) % testimonials.length);
  const prev = () => setActiveIndex((p) => (p - 1 + testimonials.length) % testimonials.length);

  return (
    <section ref={containerRef} className="relative py-32 md:py-40 bg-background overflow-hidden">
      <div className="container mx-auto px-4 md:px-6 relative z-10">
        {/* Header */}
        <div className="max-w-3xl mb-16 md:mb-24">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="section-label mb-5">Testimonials</motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="font-display font-700 leading-[1.1] tracking-[-0.02em] text-foreground"
            style={{ fontSize: "clamp(36px, 5vw, 56px)" }}
          >
            Loved by <span className="text-gradient">{config.socialProof.customerCount} {config.socialProof.customerLabel}</span>
          </motion.h2>
        </div>

        {/* Main */}
        <div className="max-w-5xl mx-auto relative">
          {/* Nav */}
          <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 md:-translate-x-16 z-10">
            <button onClick={prev} className="w-12 h-12 rounded-full glass flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors">
              <ChevronLeft className="w-5 h-5" />
            </button>
          </div>
          <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 md:translate-x-16 z-10">
            <button onClick={next} className="w-12 h-12 rounded-full glass flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors">
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          <motion.div key={activeIndex} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <div className="grid md:grid-cols-5 gap-8 md:gap-12 items-center">
              {/* Metric */}
              <div className="md:col-span-2">
                <div className="glass rounded-[28px] p-8 md:p-12 text-center" style={{ background: "linear-gradient(135deg, hsl(148 68% 52% / 0.08) 0%, hsl(190 100% 44% / 0.05) 100%)" }}>
                  <motion.div initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.2 }}>
                    <div className="font-display font-800 text-gradient mb-2" style={{ fontSize: "clamp(48px, 7vw, 72px)" }}>
                      {testimonials[activeIndex].metric}
                    </div>
                    <div className="text-muted-foreground text-sm font-mono tracking-wider uppercase text-[10px]">
                      {testimonials[activeIndex].metricLabel}
                    </div>
                  </motion.div>
                </div>
              </div>

              {/* Quote */}
              <div className="md:col-span-3 space-y-8">
                <div className="relative">
                  <Quote className="absolute -top-4 -left-4 w-8 h-8 text-primary/20" />
                  <blockquote className="text-xl md:text-2xl lg:text-3xl text-foreground leading-relaxed font-display font-500 tracking-[-0.01em]">
                    {testimonials[activeIndex].quote}
                  </blockquote>
                </div>
                <div className="flex items-center gap-4">
                  <img src={testimonials[activeIndex].image} alt={testimonials[activeIndex].author} className="w-14 h-14 rounded-full object-cover ring-4 ring-background shadow-lg" />
                  <div>
                    <div className="font-medium text-foreground text-lg">{testimonials[activeIndex].author}</div>
                    <div className="text-muted-foreground">{testimonials[activeIndex].role}</div>
                    <div className="text-primary text-sm">{testimonials[activeIndex].clinic}</div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Dots */}
          <div className="flex justify-center gap-2 mt-12">
            {testimonials.map((_, idx) => (
              <button key={idx} onClick={() => setActiveIndex(idx)} className={`h-2 rounded-full transition-all duration-300 ${idx === activeIndex ? "w-8 bg-primary" : "w-2 bg-foreground/10 hover:bg-foreground/20"}`} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
