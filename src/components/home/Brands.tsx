"use client";
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useTranslations, useLocale } from "next-intl";
import { ArrowLeft, ArrowRight, Zap, Loader2, Image as ImageIcon } from "lucide-react";
import Link from "next/link";
import { getBrands } from "@/actions/brand";

const fallbackBrands = [
  { _id: "1", faName: "ام‌فور", enName: "M4", faDesc: "انرژی و نشاط با محصولات ام‌فور", enDesc: "Energy and vitality", slug: "#", color: "from-orange-400 to-orange-600", fallbackIcon: Zap },
  { _id: "2", faName: "خندان", enName: "Khandan", faDesc: "لحظات شاد با تنقلات خندان", enDesc: "Happy moments with Khandan snacks", slug: "#", color: "from-red-500 to-rose-600", fallbackIcon: Zap },
  { _id: "3", faName: "شیک", enName: "Shik", faDesc: "طعم طبیعی میوه‌ها", enDesc: "Natural taste of fruits", slug: "#", color: "from-green-400 to-emerald-600", fallbackIcon: Zap },
];

export default function Brands() {
  const t = useTranslations("Brands");
  const locale = useLocale();
  const isRtl = locale === 'fa';

  const [brandsData, setBrandsData] = useState<any[]>(fallbackBrands);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchBrands = async () => {
      const res = await getBrands();
      if (res.success && res.data && res.data.length > 0) {
        setBrandsData(res.data.slice(0, 6)); 
      }
      setIsLoading(false);
    };
    fetchBrands();
  }, []);

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

        {isLoading ? (
          <div className="w-full flex justify-center py-12">
            <Loader2 className="animate-spin text-amber-500" size={40} />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {brandsData.map((brand, index) => {
              const name = isRtl ? brand.faName : brand.enName;
              // اصلاح متغیر desc برای فراخوانی شعار از دیتابیس
              const desc = isRtl ? (brand.faSlogan || brand.faDesc) : (brand.enSlogan || brand.enDesc);
              const logoToUse = isRtl ? brand.logoFa : brand.logoEn;
              const brandLink = brand.slug !== "#" ? `/${locale}/brands/${brand.slug}` : "#";
              
              const gradientColor = brand.color || "from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800";

              return (
                <motion.div
                  key={brand._id || index}
                  initial={{ opacity: 0, y: 50 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: false, amount: 0.1 }}
                  transition={{ 
                    y: { 
                      duration: 0.6, 
                      ease: "easeOut", 
                      delay: index * 0.1 
                    },
                    opacity: { 
                      duration: 0.15,
                      ease: "linear", 
                      delay: index * 0.1 
                    }
                  }}
                  className="group relative bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-3xl p-6 md:p-8 hover:shadow-2xl hover:shadow-amber-400/5 transition-shadow duration-300 overflow-hidden"
                >
                  {/* با تنظیم dir در این سطح، جایگاه لوگو و متون در زبان‌های مختلف به صورت خودکار جابجا می‌شود */}
                  <Link href={brandLink} className="block h-full cursor-pointer" dir={isRtl ? "rtl" : "ltr"}>
                    <div className="flex items-center gap-5 md:gap-6 relative z-10 h-full">
                      
                      {/* کادر بزرگ شده‌ی لوگو */}
                      <div className={`w-28 h-28 md:w-32 md:h-32 shrink-0 rounded-[2rem] bg-linear-to-br ${gradientColor} p-1 shadow-inner`}>
                        <div className="w-full h-full bg-white dark:bg-gray-950 rounded-[1.7rem] flex items-center justify-center overflow-hidden p-3 md:p-4">
                          {logoToUse ? (
                            <img src={logoToUse} alt={name} className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-300" />
                          ) : (
                            <ImageIcon className="text-gray-300 dark:text-gray-700" size={32} />
                          )}
                        </div>
                      </div>

                      {/* بلاک متون (راست‌چین در فارسی و چپ‌چین در انگلیسی) */}
                      <div className="flex flex-col justify-center items-start grow text-start">
                        <h3 className="text-2xl md:text-3xl font-black text-gray-900 dark:text-white group-hover:text-amber-500 transition-colors">
                          {name}
                        </h3>
                        <p className="text-gray-500 dark:text-gray-400 text-sm md:text-base font-medium line-clamp-2 mt-2 leading-relaxed">
                          {desc || (isRtl ? "توضیحاتی ثبت نشده است." : "No description available.")}
                        </p>
                        
                        {/* لینک زیر شعار */}
                        <div className="mt-4 md:mt-5 flex items-center gap-2 text-sm font-bold text-gray-400 group-hover:text-amber-500 transition-colors">
                          {t("view_brand")}
                          {isRtl ? (
                            <ArrowLeft size={16} className="transform group-hover:-translate-x-1 transition-transform" />
                          ) : (
                            <ArrowRight size={16} className="transform group-hover:translate-x-1 transition-transform" />
                          )}
                        </div>
                      </div>

                    </div>
                    
                    <div className="absolute inset-0 bg-linear-to-br from-amber-400/0 to-amber-400/0 group-hover:from-amber-400/5 group-hover:to-transparent transition-all duration-500 z-0 pointer-events-none" />
                  </Link>
                </motion.div>
              );
            })}
          </div>
        )}

      </div>
    </section>
  );
}