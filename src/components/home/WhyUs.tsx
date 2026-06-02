"use client";
import React from "react";
import { motion } from "framer-motion";
import { ShieldCheck, LeafyGreen, Gem, Globe2 } from "lucide-react";
import { useTranslations } from "next-intl";

export default function WhyUs() {
  const t = useTranslations("WhyUs");

  const features = [
    { id: 1, title: t("features.feature1.title"), desc: t("features.feature1.desc"), icon: LeafyGreen },
    { id: 2, title: t("features.feature2.title"), desc: t("features.feature2.desc"), icon: Globe2 },
    { id: 3, title: t("features.feature3.title"), desc: t("features.feature3.desc"), icon: Gem },
    { id: 4, title: t("features.feature4.title"), desc: t("features.feature4.desc"), icon: ShieldCheck },
  ];

  return (
    <section className="py-10 md:py-16 bg-gray-50 dark:bg-dark-card/30 relative overflow-hidden">
      <div className="container mx-auto px-4 md:px-8">
        
        <div className="text-center mb-12">
          <motion.h2 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false, amount: 0.2 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="text-3xl md:text-5xl font-black text-gray-900 dark:text-white"
          >
            {t("title_part1")} <span className="text-amber-400">{t("title_part2")}</span>
          </motion.h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {features.map((feature, index) => (
            <motion.div
              key={feature.id}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: false, amount: 0.2 }}
              transition={{ duration: 0.5, delay: index * 0.15, ease: "easeOut" }}
              className="flex flex-col items-center text-center"
            >
              <div className="w-20 h-20 rounded-full bg-white dark:bg-gray-900 shadow-xl shadow-gray-200/50 dark:shadow-black/50 flex items-center justify-center mb-6 text-amber-500">
                <feature.icon strokeWidth={2} size={40} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">{feature.title}</h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed max-w-xs">{feature.desc}</p>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
}