"use client";
import React, { useEffect, useRef, useState } from "react";
import { motion, useMotionValue, useSpring, useInView } from "framer-motion";
import { ShieldCheck, Leaf, Globe, Factory } from "lucide-react";
import { useTranslations, useLocale } from "next-intl";

function Counter({ value, title }: { value: number; title: string }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: false, margin: "-10%" });
  const [displayValue, setDisplayValue] = useState(0);

  const count = useMotionValue(0);
  const springValue = useSpring(count, { stiffness: 40, damping: 30, mass: 1 });

  useEffect(() => {
    if (isInView) {
      count.set(value);
    } else {
      count.set(0);
    }
  }, [isInView, count, value]);

  useEffect(() => {
    return springValue.on("change", (latest) => {
      setDisplayValue(Math.floor(latest));
    });
  }, [springValue]);

  return (
    // کاهش پدینگ به py-3 و کوچکتر شدن فونت‌ها برای ظرافت و ارتفاع کمترِ کارت
    <div ref={ref} className="flex flex-col items-center justify-center py-3 px-4 bg-white/10 backdrop-blur-md rounded-2xl shadow-xl border border-gray-200 dark:border-white/10">
      <div className="flex items-center text-3xl md:text-4xl font-black mb-1 drop-shadow-md" style={{ color: '#fdb82c' }}>
        <span suppressHydrationWarning>{displayValue}</span>
        <span>+</span>
      </div>
      <p className="text-gray-900 dark:text-white text-xs font-bold text-center tracking-wide">{title}</p>
    </div>
  );
}

export default function AboutFactory() {
  const t = useTranslations("AboutFactory");
  const locale = useLocale();
  const isRtl = locale === 'fa';

  const features = [
    { icon: Globe, title: t("features.global.title"), desc: t("features.global.desc") },
    { icon: Leaf, title: t("features.natural.title"), desc: t("features.natural.desc") },
    { icon: ShieldCheck, title: t("features.quality.title"), desc: t("features.quality.desc") },
    { icon: Factory, title: t("features.tech.title"), desc: t("features.tech.desc") },
  ];

  return (
    <section className="relative min-h-screen flex items-center justify-center bg-transparent py-24 overflow-hidden">
      <div className="container mx-auto px-4 md:px-8 relative z-10">
        
        {/* استفاده از items-stretch برای هم‌ارتفاع کردن کاملِ دو ستون */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:items-stretch items-center">

          {/* ستون متن (راست در فارسی) */}
          <div className="flex flex-col h-full">
            
            {/* بخش بالایی (بج و تایتل) */}
            <div className="mb-2 lg:mb-0">
              <motion.span 
                initial={{ opacity: 0, x: isRtl ? 50 : -50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: false, amount: 0.1 }}
                transition={{ duration: 0.8, ease: "easeOut", delay: 0 }}
                className="inline-block px-4 py-1.5 mb-6 text-xs font-bold text-gray-900 dark:text-white uppercase bg-white/10 rounded-full border border-gray-200 dark:border-white/10"
              >
                {t("badge")}
              </motion.span>
              
              <motion.h2 
                initial={{ opacity: 0, x: isRtl ? 50 : -50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: false, amount: 0.1 }}
                transition={{ duration: 0.8, ease: "easeOut", delay: 0.15 }}
                className="text-4xl md:text-5xl font-black text-gray-900 dark:text-white mb-6 leading-tight"
              >
                {t("title_part1")} <span className="text-gray-900 dark:text-white">{t("title_part2")}</span> و <span className="drop-shadow-md" style={{ color: '#fdb82c' }}>{t("title_part3")}</span>
              </motion.h2>
            </div>

            {/* بخش پایینی (توضیحات، آیکون‌ها و کارت‌های آمار) */}
            <div className="flex flex-col grow">
              <motion.p 
                initial={{ opacity: 0, x: isRtl ? 50 : -50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: false, amount: 0.1 }}
                transition={{ duration: 0.8, ease: "easeOut", delay: 0.3 }}
                className="text-lg text-gray-700 dark:text-gray-200 mb-8 leading-relaxed font-medium"
              >
                {t("description")}
              </motion.p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
                {features.map((feature, i) => {
                  const Icon = feature.icon;
                  return (
                    <motion.div 
                      key={i} 
                      initial={{ opacity: 0, x: isRtl ? 50 : -50 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: false, amount: 0.1 }}
                      transition={{ duration: 0.8, ease: "easeOut", delay: 0.45 + (i * 0.1) }}
                      className="flex gap-4"
                    >
                      <div className="shrink-0 w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center border border-gray-200 dark:border-white/10" style={{ color: '#fdb82c' }}>
                        <Icon size={22} />
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-900 dark:text-white mb-1">{feature.title}</h4>
                        <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed">{feature.desc}</p>
                      </div>
                    </motion.div>
                  );
                })}
              </div>

              {/* mt-auto کارت‌های آمار را دقیقاً به کفِ ستون می‌چسباند */}
              <div className="grid grid-cols-2 gap-4 mt-auto">
                <Counter value={150} title={t("stats.products")} />
                <Counter value={2500} title={t("stats.customers")} />
                <Counter value={85} title={t("stats.agents")} />
                <Counter value={12} title={t("stats.lines")} />
              </div>
            </div>

          </div>

          {/* ستون ویدیو (چپ در فارسی) */}
          <div className="flex flex-col h-100 lg:h-auto lg:pt-34.5">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, x: isRtl ? -50 : 50 }}
              whileInView={{ opacity: 1, scale: 1, x: 0 }}
              viewport={{ once: false, amount: 0.1 }}
              transition={{ duration: 0.8, ease: "easeOut", delay: 0.4 }}
              // flex-grow باعث می‌شود ویدیو دقیقاً تمامِ ارتفاعِ هم‌تراز با بخش توضیحات و آمار را پُر کند
              className="relative w-full grow flex"
            >
              <div className="absolute inset-0 bg-zinc-900 rounded-3xl overflow-hidden border border-white/20 shadow-2xl z-10 flex items-center justify-center group">
                <div className="absolute inset-0 bg-linear-to-tr from-black/70 to-transparent z-10" />
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?q=80&w=2070')] bg-cover bg-center mix-blend-overlay opacity-60 group-hover:scale-105 transition-transform duration-1000" />

                <div className="relative z-20 flex flex-col items-center cursor-pointer">
                  <div className="w-16 h-16 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white border border-white/30 transition-all">
                    <svg className="w-6 h-6 ml-1" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                  </div>
                  <span className="mt-4 font-bold text-white text-xs tracking-widest drop-shadow-md">{t("virtual_tour")}</span>
                </div>
              </div>
              <div className="absolute -bottom-4 -left-4 w-1/2 h-1/2 bg-gray-200/50 dark:bg-white/10 rounded-3xl -z-10" />
            </motion.div>
          </div>

        </div>
      </div>
    </section>
  );
}