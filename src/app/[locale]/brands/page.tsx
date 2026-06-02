"use client";

import React from "react";
import { useLocale } from "next-intl";
import { ArrowLeft, ArrowRight, Store } from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";

const brandsDB = [
  { 
    id: "m4", 
    slug: "m4", 
    faName: "ام فور", 
    enName: "M4", 
    faDesc: "برترین تولیدکننده نوشیدنی‌های انرژی‌زا با فرمولاسیون پیشرفته آلمان.", 
    enDesc: "Top producer of energy drinks with advanced German formulation.", 
    logo: "https://placehold.co/400x400/f59e0b/ffffff?text=M4+Logo",
    color: "from-amber-400 to-orange-600"
  },
  { 
    id: "khandan", 
    slug: "khandan", 
    faName: "خندان", 
    enName: "Khandan", 
    faDesc: "اسنک‌های خوشمزه و سالم تهیه شده از بهترین مواد اولیه برای تمام سنین.", 
    enDesc: "Delicious and healthy snacks made from the best raw materials for all ages.", 
    logo: "https://placehold.co/400x400/ea580c/ffffff?text=Khandan+Logo",
    color: "from-orange-500 to-rose-700"
  },
  { 
    id: "seven-sky", 
    slug: "seven-sky", 
    faName: "سون اسکای", 
    enName: "Seven Sky", 
    faDesc: "آبمیوه‌های طبیعی و گازدار با طراوت بی‌نظیر و ارگانیک.", 
    enDesc: "Natural and carbonated juices with unmatched freshness and organic ingredients.", 
    logo: "https://placehold.co/400x400/10b981/ffffff?text=Seven+Sky",
    color: "from-emerald-400 to-teal-600"
  }
];

export default function BrandsPage() {
  const locale = useLocale();
  const isRtl = locale === 'fa';
  
  // گراف سرعت استاندارد و ملایم (اضافه شده)
  const customEase: [number, number, number, number] = [0.22, 1, 0.36, 1];
  
  // ... بقیه کدها

  return (
    <main 
      className="w-full bg-transparent min-h-screen pt-32 pb-24 overflow-hidden" 
      dir={isRtl ? "rtl" : "ltr"}
    >
      <div className="container mx-auto px-4 md:px-8">
        
        {/* هدر صفحه (انیمیشن‌ها حفظ شدند) */}
        <div className="text-center max-w-2xl mx-auto mb-20">
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: false }}
            transition={{ type: "spring", duration: 0.5 }}
            className="w-12 h-12 bg-amber-400/10 text-amber-500 rounded-2xl flex items-center justify-center mx-auto mb-4"
          >
            <Store size={24} />
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false }}
            transition={{ duration: 0.6 }}
            className="text-4xl md:text-5xl font-black text-gray-900 dark:text-white tracking-tight"
          >
            {isRtl ? "برندهای زیرمجموعه جزیره" : "Island Sub-Brands"}
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="text-gray-500 dark:text-gray-400 mt-4 font-medium text-sm md:text-base leading-relaxed"
          >
            {isRtl 
              ? "کشف دنیایی از طعم‌ها و کیفیت برتر در قالب برندهای اختصاصی و بین‌المللی ما" 
              : "Discover a world of flavors and premium quality across our exclusive and global brands"}
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {brandsDB.map((brand, index) => {
            
            const name = isRtl ? brand.faName : brand.enName;
            const desc = isRtl ? brand.faDesc : brand.enDesc;

            return (
              <motion.div
                key={brand.id}
                initial={{ opacity: 0, y: 80 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: false, amount: 0.1 }}
                
                transition={{ 
                  y: { duration: 0.8, ease: customEase, delay: index * 0.15 },
                  opacity: { duration: 0.3, ease: [0, 0, 1, 1], delay: index * 0.15 }
                }}
                className="bg-gray-50 dark:bg-gray-900/40 border border-gray-100 dark:border-gray-800/80 rounded-3xl p-8 flex flex-col items-center text-center group hover:border-amber-400 dark:hover:border-amber-400 transition-[border-color,box-shadow] duration-300 relative overflow-hidden shadow-xs hover:shadow-xl"
              >
                
                {/* هاله رنگی پس‌زمینه کارت هنگام هاور */}
                <div 
                  className={`absolute -top-24 -right-24 w-48 h-48 rounded-full bg-linear-to-br ${brand.color} opacity-0 group-hover:opacity-5 blur-2xl transition-opacity duration-500 pointer-events-none`} 
                />

                {/* لوگو گرد برند */}
                <div className="w-24 h-24 rounded-full bg-white dark:bg-gray-800 p-1.5 shadow-md border border-gray-100 dark:border-gray-700 group-hover:scale-105 group-hover:border-amber-400 transition-all duration-300 mb-6 overflow-hidden relative z-10">
                  <img 
                    src={brand.logo} 
                    alt={name} 
                    className="w-full h-full object-contain rounded-full" 
                  />
                </div>

                <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-3 relative z-10">
                  {name}
                </h2>
                
                <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400 leading-relaxed grow mb-8 font-medium px-2 relative z-10">
                  {desc}
                </p>

                <Link 
                  href={`/${locale}/brands/${brand.slug}`}
                  className="w-full flex items-center justify-center gap-2 py-3.5 bg-white dark:bg-gray-800 text-gray-900 dark:text-white hover:bg-amber-400 hover:text-gray-950 dark:hover:bg-amber-400 dark:hover:text-gray-950 font-bold text-sm rounded-2xl border border-gray-200/60 dark:border-gray-700/50 shadow-xs transition-all group/btn relative z-10"
                >
                  <span>{isRtl ? "ورود به صفحه برند" : "View Brand Page"}</span>
                  {isRtl ? (
                    <ArrowLeft size={16} className="group-hover/btn:-translate-x-1 transition-transform" />
                  ) : (
                    <ArrowRight size={16} className="group-hover/btn:translate-x-1 transition-transform" />
                  )}
                </Link>
                
              </motion.div>
            );
          })}
        </div>

      </div>
    </main>
  );
}