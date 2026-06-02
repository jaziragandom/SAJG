"use client";
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, CheckCircle2 } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";

export default function CTA() {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const locale = useLocale();
  const isRtl = locale === 'fa';
  const t = useTranslations("CTA");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitted(true);
  };

  return (
    <section className="py-10 md:py-12 bg-white dark:bg-gray-950 relative overflow-hidden">
      <div className="container mx-auto px-4 md:px-8">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: false, amount: 0.3 }}
          transition={{ duration: 0.6 }}
          className="bg-gray-900 dark:bg-gray-900 rounded-[3rem] p-10 md:p-16 relative overflow-hidden text-center shadow-2xl"
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-orange-500/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2 pointer-events-none" />

          <div className="relative z-10 max-w-2xl mx-auto">
            <AnimatePresence mode="wait">
              {!isSubmitted ? (
                <motion.div
                  key="form"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20, scale: 0.9 }}
                  transition={{ duration: 0.4 }}
                >
                  <h2 className="text-3xl md:text-5xl font-black text-white mb-6">
                    {t("title_part1")} <span className="text-amber-400">{t("title_part2")}</span> {t("title_part3")}
                  </h2>
                  <p className="text-gray-400 text-lg mb-10">
                    {t("description")}
                  </p>

                  <form onSubmit={handleSubmit} className="flex flex-col md:flex-row gap-4 justify-center">
                    <input 
                      type="text" 
                      placeholder={t("input_placeholder")}
                      required
                      className="w-full md:w-96 px-6 py-4 rounded-2xl bg-white/5 border border-white/10 text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-amber-400 transition-all"
                    />
                    <button 
                      type="submit"
                      className="flex items-center justify-center gap-2 px-8 py-4 bg-amber-400 hover:bg-amber-500 text-gray-900 rounded-2xl font-black transition-colors"
                    >
                      {t("button_text")}
                      <Send size={20} className={isRtl ? "rotate-180" : ""} />
                    </button>
                  </form>
                </motion.div>
              ) : (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ type: "spring", stiffness: 100, damping: 15 }}
                  className="flex flex-col items-center py-8"
                >
                  <div className="w-20 h-20 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mb-6">
                    <CheckCircle2 size={40} strokeWidth={2.5} />
                  </div>
                  <h3 className="text-2xl md:text-3xl font-black text-white mb-2">{t("success_title")}</h3>
                  <p className="text-gray-400 text-lg">{t("success_message")}</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </div>
    </section>
  );
}