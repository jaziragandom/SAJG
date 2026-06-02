"use client";

import React, { use } from "react";
import { useLocale } from "next-intl";
import { ArrowLeft, ArrowRight, PackageOpen } from "lucide-react";
import { motion, Variants } from "framer-motion";

// دیتای تستی (Mock)
const brandsDB = [
  { 
    id: "m4", 
    faName: "ام فور", enName: "M4", 
    faDesc: "برترین تولیدکننده نوشیدنی‌های انرژی‌زا با فرمولاسیون پیشرفته آلمان. ما در ام‌فور متعهد هستیم تا انرژی خالص و طبیعی را با بهترین طعم‌ها به شما هدیه دهیم. محصولات ما با استانداردهای جهانی تولید شده و برای ورزشکاران و افراد پرمشغله بهترین انتخاب است.", 
    enDesc: "Top producer of energy drinks with advanced German formulation. At M4, we are committed to providing you with pure, natural energy in the best flavors.", 
    heroImage: "https://placehold.co/1920x800/1e293b/ffffff?text=M4+Cinematic+Hero",
    logo: "https://placehold.co/400x400/f59e0b/ffffff?text=M4+Logo"
  },
  { 
    id: "khandan", 
    faName: "خندان", enName: "Khandan", 
    faDesc: "اسنک‌های خوشمزه و سالم برای تمام سنین. خندان نامی آشنا در تولید تنقلات باکیفیت است که از بهترین مواد اولیه، بدون مواد نگهدارنده مضر تهیه می‌شود. لبخند روی لب‌های شما، هدف اصلی ماست.", 
    enDesc: "Delicious and healthy snacks for all ages. Khandan is a familiar name in producing high-quality snacks made from the best raw materials.", 
    heroImage: "https://placehold.co/1920x800/7c2d12/ffffff?text=Khandan+Cinematic+Hero",
    logo: "https://placehold.co/400x400/ea580c/ffffff?text=Khandan+Logo"
  }
];

const productsDB = [
  { id: 101, brandId: "m4", faTitle: "انرژی‌زا مکس ۲۵۰ میل", enTitle: "Max Energy 250ml", category: "نوشیدنی انرژی‌زا", image: "https://placehold.co/300x400/fcd34d/ffffff?text=M4+Can" },
  { id: 102, brandId: "m4", faTitle: "انرژی‌زا زیرو ۳۳۰ میل", enTitle: "Zero Energy 330ml", category: "نوشیدنی انرژی‌زا", image: "https://placehold.co/300x400/fcd34d/ffffff?text=M4+Zero" },
  { id: 103, brandId: "khandan", faTitle: "چیپس نمکی ترد", enTitle: "Crispy Salty Chips", category: "اسنک و تنقلات", image: "https://placehold.co/300x400/fdba74/ffffff?text=Chips" },
  { id: 104, brandId: "khandan", faTitle: "پاپ‌کورن پنیری", enTitle: "Cheese Popcorn", category: "اسنک و تنقلات", image: "https://placehold.co/300x400/fdba74/ffffff?text=Popcorn" },
];

// استفاده از تایپ اختصاصی Variants برای رفع ارور تایپ‌اسکریپت
const containerVariants: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15 // فاصله زمانی بین ظاهر شدن هر کارت
    }
  }
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 40, scale: 0.95 },
  show: { opacity: 1, y: 0, scale: 1, transition: { type: "spring", stiffness: 100, damping: 15 } }
};

export default function BrandPage({ params }: { params: Promise<{ id: string }> }) {
  // باز کردن مقادیر Promise برای پارامترها (سازگار با Next.js 14/15)
  const resolvedParams = use(params);
  const brandId = resolvedParams.id;
  const locale = useLocale();
  const isRtl = locale === 'fa';

  const brand = brandsDB.find(b => b.id === brandId);
  
  if (!brand) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-950 pt-20">
        <h1 className="text-4xl font-black text-gray-800 dark:text-gray-200">برند پیدا نشد!</h1>
      </div>
    );
  }

  const brandProducts = productsDB.filter(p => p.brandId === brandId);
  const brandName = isRtl ? brand.faName : brand.enName;
  const brandDesc = isRtl ? brand.faDesc : brand.enDesc;

  return (
    <main className="w-full bg-transparent min-h-screen pt-32 pb-24 overflow-hidden" dir={isRtl ? "rtl" : "ltr"}>
      
      {/* 1. سکشن هیروی سینمایی برند */}
      <section className="relative w-full h-[50vh] md:h-[65vh] flex items-center justify-center overflow-hidden">
        
        {/* بک‌گراند با انیمیشن زومِ بسیار کند (Ken Burns effect) */}
        <motion.div 
          className="absolute inset-0 z-0"
          initial={{ scale: 1.1 }}
          animate={{ scale: 1 }}
          transition={{ duration: 10, ease: "easeOut" }}
        >
          <img 
            src={brand.heroImage} 
            alt={`${brandName} Hero`} 
            className="w-full h-full object-cover"
          />
          {/* اصلاح کلاس برای Tailwind v4 */}
          <div className="absolute inset-0 bg-linear-to-t from-gray-950 via-gray-900/60 to-transparent"></div>
        </motion.div>

        {/* محتوای روی هیرو */}
        <div className="relative z-10 container mx-auto px-6 flex flex-col items-center justify-center mt-10">
          <motion.div 
            initial={{ opacity: 0, scale: 0.5, rotate: -15 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            transition={{ type: "spring", stiffness: 120, damping: 15, delay: 0.2 }}
            className="w-32 h-32 md:w-40 md:h-40 rounded-full bg-white dark:bg-gray-900 p-2 shadow-2xl mb-6 border-4 border-white/20 backdrop-blur-md"
          >
            <img 
              src={brand.logo} 
              alt={`${brandName} Logo`} 
              className="w-full h-full object-contain rounded-full"
            />
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
            className="text-5xl md:text-7xl font-black text-white drop-shadow-2xl text-center"
          >
            {brandName}
          </motion.h1>
        </div>
      </section>

      {/* 2. سکشن توضیحات برند */}
      <section className="container mx-auto px-6 py-16 md:py-24 overflow-hidden">
        <motion.div 
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false, margin: "-100px" }} // با once: false انیمیشن با هر اسکرول اجرا می‌شود
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="max-w-4xl mx-auto text-center"
        >
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-8 relative inline-block">
            {isRtl ? `درباره برند ${brandName}` : `About ${brandName}`}
            <motion.span 
              initial={{ width: 0 }}
              whileInView={{ width: "4rem" }}
              viewport={{ once: false }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="absolute -bottom-3 left-1/2 -translate-x-1/2 h-1 bg-amber-500 rounded-full"
            ></motion.span>
          </h2>
          {/* حذف تداخل text-justify و text-center */}
          <p className="text-lg md:text-xl text-gray-600 dark:text-gray-300 leading-loose md:leading-loose text-center">
            {brandDesc}
          </p>
        </motion.div>
      </section>

      {/* 3. سکشن لیست محصولات با انیمیشن Staggered */}
      <section className="bg-gray-50 dark:bg-gray-900/50 py-16 md:py-24 border-t border-gray-100 dark:border-gray-900">
        <div className="container mx-auto px-6">
          <motion.div 
            initial={{ opacity: 0, x: isRtl ? 50 : -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: false }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="flex items-center justify-between mb-12"
          >
            <div>
              <h2 className="text-3xl font-black text-gray-900 dark:text-white">
                {isRtl ? "محصولات این برند" : "Brand Products"}
              </h2>
              <p className="text-gray-500 mt-2">
                {isRtl ? `تعداد ${brandProducts.length} محصول یافت شد.` : `${brandProducts.length} products found.`}
              </p>
            </div>
          </motion.div>

          {brandProducts.length > 0 ? (
            <motion.div 
              variants={containerVariants}
              initial="hidden"
              whileInView="show"
              viewport={{ once: false, margin: "-50px" }} // با هر اسکرول کارت‌ها دوباره لود می‌شوند
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8"
            >
              {brandProducts.map((product) => (
                <motion.div 
                  key={product.id} 
                  variants={itemVariants}
                  className="bg-white dark:bg-gray-800 rounded-3xl p-6 shadow-sm hover:shadow-2xl transition-all duration-300 group border border-gray-100 dark:border-gray-700"
                >
                  <div className="w-full h-64 mb-6 relative overflow-hidden rounded-2xl bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
                    <img 
                      src={product.image} 
                      alt={isRtl ? product.faTitle : product.enTitle}
                      className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-500 drop-shadow-xl"
                    />
                  </div>
                  
                  <span className="text-xs font-bold text-amber-600 bg-amber-100 dark:bg-amber-500/10 px-3 py-1 rounded-full mb-3 inline-block">
                    {product.category}
                  </span>
                  
                  <h3 className="text-lg font-black text-gray-900 dark:text-white mb-2 leading-tight">
                    {isRtl ? product.faTitle : product.enTitle}
                  </h3>
                  
                  <button className="mt-4 w-full flex items-center justify-center gap-2 py-3 bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-white hover:bg-amber-400 hover:text-gray-900 rounded-xl font-bold transition-colors group/btn">
                    <span>{isRtl ? "مشاهده محصول" : "View Product"}</span>
                    {isRtl ? <ArrowLeft size={16} className="group-hover/btn:-translate-x-1 transition-transform" /> : <ArrowRight size={16} className="group-hover/btn:translate-x-1 transition-transform" />}
                  </button>
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 text-gray-400">
              <PackageOpen size={64} className="mb-4 opacity-50" />
              <p className="text-lg font-bold">{isRtl ? "هنوز محصولی برای این برند ثبت نشده است." : "No products found for this brand yet."}</p>
            </div>
          )}
        </div>
      </section>

    </main>
  );
}