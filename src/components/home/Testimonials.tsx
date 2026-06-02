"use client";
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Quote } from "lucide-react";
import { useTranslations } from "next-intl";

export default function Testimonials() {
  const t = useTranslations("Testimonials");
  const [current, setCurrent] = useState(0);

  const testimonials = [
    { id: 1, text: t("items.item1.text"), author: t("items.item1.author"), role: t("items.item1.role") },
    { id: 2, text: t("items.item2.text"), author: t("items.item2.author"), role: t("items.item2.role") },
    { id: 3, text: t("items.item3.text"), author: t("items.item3.author"), role: t("items.item3.role") },
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [testimonials.length]);

  return (
    <section className="py-10 md:py-12 bg-amber-400 dark:bg-gray-900 relative overflow-hidden">
      <div className="container mx-auto px-4 md:px-8 relative z-10 flex flex-col items-center">
        
        <Quote className="text-black/10 dark:text-white/5 w-32 h-32 absolute top-10 transform -translate-y-1/2 z-0" />
        
        <div 
          className="w-full max-w-4xl flex items-center justify-center text-center relative z-10"
          style={{ minHeight: "250px" }}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={current}
              initial={{ opacity: 0, y: 20, filter: "blur(4px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              exit={{ opacity: 0, y: -20, filter: "blur(4px)" }}
              transition={{ duration: 0.5 }}
              className="flex flex-col items-center"
            >
              <p className="text-2xl md:text-4xl font-black text-gray-900 dark:text-white leading-snug md:leading-normal mb-8">
                "{testimonials[current].text}"
              </p>
              <div className="flex flex-col items-center gap-1">
                <span className="text-lg font-bold text-gray-900 dark:text-white">{testimonials[current].author}</span>
                <span className="text-sm font-medium text-gray-800/70 dark:text-gray-400">{testimonials[current].role}</span>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="flex gap-2 mt-8">
          {testimonials.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrent(index)}
              className={`h-1.5 rounded-full transition-all duration-300 ${current === index ? "w-8 bg-gray-900 dark:bg-white" : "w-2 bg-gray-900/30 hover:bg-gray-900/50 dark:bg-white/30 dark:hover:bg-white/50"}`}
            />
          ))}
        </div>

      </div>
    </section>
  );
}