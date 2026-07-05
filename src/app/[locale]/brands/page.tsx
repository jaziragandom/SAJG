"use client";

import React, { useState, useEffect } from "react";
import { useLocale } from "next-intl";
import { ArrowLeft, ArrowRight, Store, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";
import { getBrands } from "@/actions/brand";

export default function BrandsPage() {
  const locale = useLocale();
  const isRtl = locale === 'fa';

  const [brands, setBrands] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const customEase: [number, number, number, number] = [0.22, 1, 0.36, 1];

  useEffect(() => {
    const fetchBrandsData = async () => {
      const res = await getBrands();
      if (res.success && res.data) {
        setBrands(res.data);
      }
      setIsLoading(false);
    };
    fetchBrandsData();
  }, []);

  return (
    <main 
      className="w-full bg-transparent min-h-screen pt-32 pb-24 overflow-hidden" 
      dir={isRtl ? "rtl" : "ltr"}
    >
      <div className="container mx-auto px-4 md:px-8">
        
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

        {isLoading ? (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="animate-spin text-amber-500" size={40} />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {brands.map((brand, index) => {
              const name = isRtl ? brand.faName : brand.enName;
              const desc = isRtl ? brand.faDesc : brand.enDesc;
              const logoToUse = isRtl ? (brand.logoFa || brand.logo) : (brand.logoEn || brand.logo);
              const color = brand.color || "from-gray-400 to-gray-600";

              return (
                <motion.div
                  key={brand._id}
                  initial={{ opacity: 0, y: 80 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: false, amount: 0.1 }}
                  transition={{ 
                    y: { duration: 0.8, ease: customEase, delay: index * 0.15 },
                    opacity: { duration: 0.3, ease: [0, 0, 1, 1], delay: index * 0.15 }
                  }}
                  className="bg-gray-50 dark:bg-gray-900/40 border border-gray-100 dark:border-gray-800/80 rounded-3xl p-8 flex flex-col items-center text-center group hover:border-amber-400 dark:hover:border-amber-400 transition-[border-color,box-shadow] duration-300 relative overflow-hidden shadow-xs hover:shadow-xl"
                >
                  <div 
                    className={`absolute -top-24 -right-24 w-48 h-48 rounded-full bg-linear-to-br ${color} opacity-0 group-hover:opacity-10 blur-2xl transition-opacity duration-500 pointer-events-none`} 
                  />

                  <div className="w-24 h-24 rounded-full bg-white dark:bg-gray-800 p-2 shadow-md border border-gray-100 dark:border-gray-700 group-hover:scale-105 group-hover:border-amber-400 transition-all duration-300 mb-6 overflow-hidden relative z-10 flex items-center justify-center">
                    {logoToUse ? (
                      <img 
                        src={logoToUse} 
                        alt={name} 
                        className="w-full h-full object-contain" 
                      />
                    ) : (
                      <Store className="text-gray-300" size={32} />
                    )}
                  </div>

                  <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-3 relative z-10">
                    {name}
                  </h2>
                  
                  <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400 leading-relaxed grow mb-8 font-medium px-2 relative z-10 line-clamp-3">
                    {desc || (isRtl ? "توضیحاتی برای این برند ثبت نشده است." : "No description available.")}
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
            
            {!isLoading && brands.length === 0 && (
              <div className="col-span-full py-12 text-center text-gray-400 font-bold">
                 {isRtl ? "هیچ برندی یافت نشد." : "No brands found."}
              </div>
            )}
          </div>
        )}

      </div>
    </main>
  );
}