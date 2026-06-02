"use client";
import React from "react";
import { motion } from "framer-motion";
import { useTranslations, useLocale } from "next-intl";
import { ArrowLeft, ArrowRight, Zap, Coffee, Leaf, Droplets, Flame, Sparkles } from "lucide-react";

export default function Brands() {
  const t = useTranslations("Brands");
  const locale = useLocale();
  const isRtl = locale === 'fa';

  const brands = [
    { id: 1, name: t("items.brand1.name"), desc: t("items.brand1.desc"), icon: Zap, color: "text-orange-500", bg: "bg-orange-500/10" },
    { id: 2, name: t("items.brand2.name"), desc: t("items.brand2.desc"), icon: Flame, color: "text-amber-500", bg: "bg-amber-500/10" },
    { id: 3, name: t("items.brand3.name"), desc: t("items.brand3.desc"), icon: Sparkles, color: "text-yellow-500", bg: "bg-yellow-500/10" },
    { id: 4, name: t("items.brand4.name"), desc: t("items.brand4.desc"), icon: Leaf, color: "text-emerald-500", bg: "bg-emerald-500/10" },
    { id: 5, name: t("items.brand5.name"), desc: t("items.brand5.desc"), icon: Coffee, color: "text-stone-600", bg: "bg-stone-500/10" },
    { id: 6, name: t("items.brand6.name"), desc: t("items.brand6.desc"), icon: Droplets, color: "text-cyan-500", bg: "bg-cyan-500/10" },
  ];

  return (
    <section className="py-24 bg-white dark:bg-gray-950 relative overflow-hidden">
      <div className="container mx-auto px-4 md:px-8">
        
        <div className="text-center mb-16">
          <motion.h2 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false, amount: 0.1 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1], delay: 0 }}
            className="text-4xl md:text-5xl font-black text-gray-900 dark:text-white mb-4"
          >
            {t("title_part1")} <span className="text-amber-400">{t("title_part2")}</span>
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false, amount: 0.1 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1], delay: 0.15 }}
            className="text-gray-600 dark:text-gray-400 text-lg max-w-2xl mx-auto"
          >
            {t("description")}
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {brands.map((brand, index) => (
            <motion.div
              key={brand.id}
              // فاصله شروع بیشتر (100 پیکسل) تا شتاب اولیه بهتر دیده شود
              initial={{ opacity: 0, y: 100 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: false, amount: 0.1 }}
              // استفاده از منحنی ریاضی خاص: سرعت انفجاری در شروع و فرود بسیار نرم در پایان
              transition={{ duration: 0.8, delay: index * 0.1, ease: [0.16, 1, 0.3, 1] }}
              className="group relative bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-3xl p-8 hover:shadow-2xl hover:shadow-amber-400/5 transition-shadow duration-300 overflow-hidden opacity-0"
            >
              <div className="flex items-center gap-4 mb-6 relative z-10">
                <div className={`w-16 h-16 rounded-2xl ${brand.bg} ${brand.color} flex items-center justify-center`}>
                  <brand.icon strokeWidth={2.5} size={32} />
                </div>
                <div>
                  <h3 className="text-2xl font-black text-gray-900 dark:text-white">{brand.name}</h3>
                  <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">{brand.desc}</p>
                </div>
              </div>
              
              <div className="mt-8 flex justify-end relative z-10">
                <button className="flex items-center gap-2 text-sm font-bold text-gray-400 group-hover:text-amber-500 transition-colors">
                  {t("view_brand")}
                  {isRtl ? <ArrowLeft size={16} /> : <ArrowRight size={16} />}
                </button>
              </div>

              <div className="absolute inset-0 bg-linear-to-br from-amber-400/0 to-amber-400/0 group-hover:from-amber-400/5 group-hover:to-transparent transition-all duration-500 z-0" />
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
}