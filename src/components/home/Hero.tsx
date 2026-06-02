"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";

export default function Hero() {
  const locale = useLocale();
  const isRtl = locale === 'fa';
  const t = useTranslations("Hero");
  
  const [current, setCurrent] = useState(0);

  // دیتای شبیه‌سازی شده که دقیقاً ساختار خروجی پنل ادمین را دارد
  const dynamicHeroSlides = [
    {
      id: 1,
      faTitle: "انرژی بی‌نهایت", enTitle: "Infinite Energy",
      faSubtitle: "جدیدترین محصول", enSubtitle: "New Arrival",
      faDesc: "انفجار انرژی در هر قطره. با طعم بی‌نظیر و فرمولاسیون جدید برای روزهای پرکار شما.",
      enDesc: "Burst of energy in every drop. Unmatched taste and new formula for your busy days.",
      color: "from-amber-400 to-orange-600",
      mainImage: "https://placehold.co/400x600/transparent/f59e0b?text=Main+Product", 
      leftImage: "https://placehold.co/300x500/transparent/fcd34d?text=Side+Left",
      rightImage: "https://placehold.co/300x500/transparent/fbbf24?text=Side+Right",
      // بازگشت ۸ قطعه معلق با اَشکال نامنظم گرافیکی (CSS) تا زمان آپلود عکس واقعی
      floaters: [
        { id: 11, shape: "rounded-full", color: "bg-orange-400", size: "w-10 h-10 md:w-16 md:h-16", top: "15%", left: "10%", initY: -100, blur: "blur-[3px]", delay: 0.1, zIndex: "z-0", floatX: [0, isRtl ? 15 : -15, 0], floatY: [0, 10, 0] },
        { id: 12, shape: "rounded-tl-full rounded-br-full", color: "bg-amber-300", size: "w-8 h-8 md:w-12 md:h-12", top: "75%", left: "85%", initY: 200, blur: "blur-md", delay: 0.3, zIndex: "z-0", floatX: [0, isRtl ? 10 : -10, 0], floatY: [0, -15, 0] },
        { id: 13, shape: "rounded-tr-full rounded-bl-full rotate-45", color: "bg-orange-500", size: "w-12 h-12 md:w-20 md:h-20", top: "30%", left: "45%", initY: -150, blur: "blur-none", delay: 0.35, zIndex: "z-50", floatX: [0, isRtl ? 5 : -5, 0], floatY: [0, 5, 0] },
        { id: 14, shape: "rounded-full", color: "bg-yellow-400", size: "w-6 h-6 md:w-10 md:h-10", top: "65%", left: "35%", initY: 250, blur: "blur-[1px]", delay: 0.5, zIndex: "z-50", floatX: [0, isRtl ? 8 : -8, 0], floatY: [0, -5, 0] },
        { id: 15, shape: "rounded-tl-full rounded-br-full rotate-12", color: "bg-amber-500", size: "w-14 h-14 md:w-24 md:h-24", top: "10%", left: "70%", initY: -180, blur: "blur-[4px]", delay: 0.2, zIndex: "z-0", floatX: [0, isRtl ? -12 : 12, 0], floatY: [0, 8, 0] },
        { id: 16, shape: "rounded-full", color: "bg-orange-300", size: "w-4 h-4 md:w-8 md:h-8", top: "85%", left: "20%", initY: 150, blur: "blur-sm", delay: 0.4, zIndex: "z-50", floatX: [0, isRtl ? -8 : 8, 0], floatY: [0, -12, 0] },
        { id: 17, shape: "rounded-tr-full rounded-bl-full", color: "bg-yellow-300", size: "w-9 h-9 md:w-14 md:h-14", top: "50%", left: "15%", initY: -50, blur: "blur-[2px]", delay: 0.6, zIndex: "z-0", floatX: [0, isRtl ? 10 : -10, 0], floatY: [0, -8, 0] },
        { id: 18, shape: "rounded-full", color: "bg-orange-600", size: "w-5 h-5 md:w-7 md:h-7", top: "45%", left: "80%", initY: 80, blur: "blur-[1px]", delay: 0.45, zIndex: "z-50", floatX: [0, isRtl ? -6 : 6, 0], floatY: [0, 15, 0] },
      ]
    },
    {
      id: 2,
      faTitle: "طعم واقعی انار", enTitle: "Real Pomegranate",
      faSubtitle: "محصول ارگانیک", enSubtitle: "Organic Product",
      faDesc: "آب انار ۱۰۰٪ طبیعی بدون شکر افزوده. سرشار از آنتی‌اکسیدان برای سلامتی شما.",
      enDesc: "100% natural pomegranate juice with no added sugar. Rich in antioxidants.",
      color: "from-red-500 to-rose-700",
      mainImage: "https://placehold.co/400x600/transparent/e11d48?text=Main+Pomegranate",
      leftImage: "https://placehold.co/300x500/transparent/fda4af?text=Left",
      rightImage: "https://placehold.co/300x500/transparent/fb7185?text=Right",
      floaters: [
        { id: 21, shape: "rounded-full", color: "bg-rose-400", size: "w-10 h-10 md:w-16 md:h-16", top: "20%", left: "85%", initY: -100, blur: "blur-[3px]", delay: 0.1, zIndex: "z-0", floatX: [0, isRtl ? -15 : 15, 0], floatY: [0, -10, 0] },
        { id: 22, shape: "rounded-tl-full rounded-br-full rotate-45", color: "bg-red-500", size: "w-12 h-12 md:w-20 md:h-20", top: "40%", left: "50%", initY: -150, blur: "blur-none", delay: 0.35, zIndex: "z-50", floatX: [0, isRtl ? -5 : 5, 0], floatY: [0, 6, 0] },
        { id: 23, shape: "rounded-tr-full rounded-bl-full", color: "bg-pink-300", size: "w-8 h-8 md:w-12 md:h-12", top: "75%", left: "40%", initY: 250, blur: "blur-[1px]", delay: 0.5, zIndex: "z-50", floatX: [0, isRtl ? 7 : -7, 0], floatY: [0, -4, 0] },
        { id: 24, shape: "rounded-full", color: "bg-rose-600", size: "w-6 h-6 md:w-10 md:h-10", top: "15%", left: "25%", initY: -80, blur: "blur-sm", delay: 0.2, zIndex: "z-0", floatX: [0, isRtl ? 10 : -10, 0], floatY: [0, 12, 0] },
        { id: 25, shape: "rounded-tl-full rounded-br-full -rotate-12", color: "bg-red-400", size: "w-14 h-14 md:w-24 md:h-24", top: "60%", left: "15%", initY: 180, blur: "blur-[4px]", delay: 0.4, zIndex: "z-0", floatX: [0, isRtl ? 12 : -12, 0], floatY: [0, -8, 0] },
        { id: 26, shape: "rounded-full", color: "bg-pink-400", size: "w-5 h-5 md:w-8 md:h-8", top: "80%", left: "70%", initY: 100, blur: "blur-[2px]", delay: 0.6, zIndex: "z-50", floatX: [0, isRtl ? -8 : 8, 0], floatY: [0, -10, 0] },
        { id: 27, shape: "rounded-tr-full rounded-bl-full rotate-90", color: "bg-rose-500", size: "w-9 h-9 md:w-14 md:h-14", top: "35%", left: "75%", initY: -120, blur: "blur-[1px]", delay: 0.25, zIndex: "z-50", floatX: [0, isRtl ? -6 : 6, 0], floatY: [0, 8, 0] },
        { id: 28, shape: "rounded-full", color: "bg-red-300", size: "w-4 h-4 md:w-7 md:h-7", top: "50%", left: "30%", initY: 50, blur: "blur-[3px]", delay: 0.45, zIndex: "z-0", floatX: [0, isRtl ? 8 : -8, 0], floatY: [0, -6, 0] },
      ]
    }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % dynamicHeroSlides.length);
    }, 8000); 
    return () => clearInterval(timer);
  }, [dynamicHeroSlides.length]);

  const slide = dynamicHeroSlides[current];

  const titleText = isRtl ? slide.faTitle : slide.enTitle;
  const subtitleText = isRtl ? slide.faSubtitle : slide.enSubtitle;
  const descText = isRtl ? slide.faDesc : slide.enDesc;
  const titleFirstWord = titleText.split(" ")[0];
  const titleRest = titleText.split(" ").slice(1).join(" ");

  return (
    <section 
      className="relative w-full flex items-center justify-center overflow-hidden bg-white dark:bg-gray-950"
      style={{ height: "100svh", minHeight: "700px" }}
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={current}
          className="container mx-auto px-4 md:px-8 w-full h-full flex flex-col-reverse md:flex-row items-center justify-between relative"
        >
          
          {/* لایه پشت‌زمینه (بازگشت به اَشکال نامنظم CSS) */}
          <div className="absolute inset-0 w-full h-full pointer-events-none overflow-hidden">
            {slide.floaters.map((floater) => (
              <motion.div
                key={floater.id}
                className={`absolute ${floater.zIndex}`}
                style={{ top: floater.top, left: floater.left }}
                initial={{ x: isRtl ? -1200 : 1200, y: floater.initY, scale: 0, rotate: -180, opacity: 0 }}
                animate={{ x: 0, y: 0, scale: 1, rotate: 0, opacity: 1 }}
                exit={{ x: isRtl ? 1200 : -1200, y: floater.initY * -1, scale: 0, rotate: 180, opacity: 0, transition: { duration: 0.3, delay: 0, ease: "easeIn" } }}
                transition={{ type: "spring", stiffness: 60, damping: 14, delay: floater.delay }}
              >
                <motion.div
                  className={`${floater.blur}`}
                  animate={{
                    x: floater.floatX,
                    y: floater.floatY,
                    rotate: [0, floater.id % 2 === 0 ? 10 : -10, 0]
                  }}
                  transition={{
                    duration: 6 + (floater.id % 4), 
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: floater.delay + 0.5 
                  }}
                >
                  {/* رندر شکل‌های هندسی جذاب و رنگی */}
                  <div className={`${floater.size} ${floater.color} ${floater.shape} opacity-80 shadow-lg border border-white/20`} />
                </motion.div>
              </motion.div>
            ))}
          </div>

          <div className="w-full md:w-[55%] h-[50%] md:h-full relative flex items-center justify-center mt-12 md:mt-0 z-40 pointer-events-none">
            <div className="relative w-64 h-96 flex items-center justify-center">
              
              {/* محصول جانبی چپ */}
              <motion.div
                className="absolute w-52 h-80 origin-bottom"
                initial={{ rotate: 0, x: 0, y: 0, opacity: 0, scale: 0.5 }}
                animate={{ rotate: -15, x: -80, y: 15, opacity: 1, scale: 0.85 }}
                exit={{ rotate: 0, x: 0, y: 0, opacity: 0, scale: 0.5, transition: { duration: 0.2, delay: 0 } }}
                transition={{ type: "spring", stiffness: 90, damping: 14, delay: 0.2 }}
              >
                <motion.div
                  className="w-full h-full flex items-center justify-center"
                  animate={{ x: [0, -3, 0], y: [0, 3, 0], rotate: [0, -1, 0] }}
                  transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                >
                  <img 
                    src={slide.leftImage} 
                    alt="Side Product Left" 
                    className="w-full h-full object-contain drop-shadow-2xl brightness-90"
                    style={{ WebkitBoxReflect: "below -15px linear-gradient(to bottom, rgba(0,0,0,0.0), rgba(0,0,0,0.08))" }}
                  />
                </motion.div>
              </motion.div>

              {/* محصول جانبی راست */}
              <motion.div
                className="absolute w-52 h-80 origin-bottom"
                initial={{ rotate: 0, x: 0, y: 0, opacity: 0, scale: 0.5 }}
                animate={{ rotate: 15, x: 80, y: 15, opacity: 1, scale: 0.85 }}
                exit={{ rotate: 0, x: 0, y: 0, opacity: 0, scale: 0.5, transition: { duration: 0.2, delay: 0 } }}
                transition={{ type: "spring", stiffness: 90, damping: 14, delay: 0.25 }}
              >
                <motion.div
                  className="w-full h-full flex items-center justify-center"
                  animate={{ x: [0, 3, 0], y: [0, 3, 0], rotate: [0, 1, 0] }}
                  transition={{ duration: 5.5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                >
                  <img 
                    src={slide.rightImage} 
                    alt="Side Product Right" 
                    className="w-full h-full object-contain drop-shadow-2xl brightness-90"
                    style={{ WebkitBoxReflect: "below -15px linear-gradient(to bottom, rgba(0,0,0,0.0), rgba(0,0,0,0.08))" }}
                  />
                </motion.div>
              </motion.div>

              {/* محصول اصلی */}
              <motion.div
                className="absolute z-50 origin-bottom w-64 md:w-80 h-96 md:h-112"
                initial={{ opacity: 0, scale: 0.2, y: 50 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.2, y: -50, transition: { duration: 0.2, delay: 0 } }}
                transition={{ type: "spring", stiffness: 100, damping: 15 }}
              >
                <motion.div
                  className="w-full h-full flex flex-col items-center justify-center"
                  animate={{ y: [0, -8, 0] }}
                  transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                >
                  <img 
                    src={slide.mainImage} 
                    alt="Main Focus Product" 
                    className="w-full h-full object-contain drop-shadow-[0_25px_45px_rgba(0,0,0,0.4)]"
                    style={{ WebkitBoxReflect: "below -10px linear-gradient(to bottom, rgba(0,0,0,0.0), rgba(0,0,0,0.3))" }}
                  />
                </motion.div>
              </motion.div>

            </div>
          </div>

          <div className="w-full md:w-[45%] h-[50%] md:h-full flex flex-col justify-center items-start text-right z-30 pt-20 md:pt-0 relative">
            
            <motion.div
              initial={{ opacity: 0, x: isRtl ? 50 : -50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: isRtl ? -50 : 50, transition: { duration: 0.2, delay: 0 } }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              className="inline-block px-4 py-2 rounded-full bg-amber-400/10 text-amber-500 font-bold mb-6 backdrop-blur-sm border border-amber-400/20"
            >
              {subtitleText}
            </motion.div>
            
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20, transition: { duration: 0.2, delay: 0 } }}
              transition={{ duration: 0.5, delay: 0.1, ease: "easeOut" }}
              className="text-5xl md:text-7xl lg:text-8xl font-black text-gray-900 dark:text-white leading-[1.1] mb-6 tracking-tighter"
            >
              {titleFirstWord}{" "}
              <span className={`text-transparent bg-clip-text bg-linear-to-r ${slide.color}`}>
                {titleRest}
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20, transition: { duration: 0.2, delay: 0 } }}
              transition={{ duration: 0.5, delay: 0.2, ease: "easeOut" }}
              className="text-lg md:text-xl text-gray-600 dark:text-gray-300 mb-10 max-w-lg leading-relaxed font-medium"
            >
              {descText}
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20, transition: { duration: 0.2, delay: 0 } }}
              transition={{ duration: 0.5, delay: 0.3, ease: "easeOut" }}
              className="flex gap-4"
            >
              <button className="flex items-center gap-2 px-8 py-4 bg-gray-900 dark:bg-white text-white dark:text-gray-900 hover:bg-amber-400 dark:hover:bg-amber-400 hover:text-black dark:hover:text-black rounded-2xl font-bold transition-all duration-300 shadow-xl hover:shadow-amber-400/30 group pointer-events-auto">
                {t("view_products")}
                {isRtl ? (
                  <ArrowLeft className="w-5 h-5 transform group-hover:-translate-x-2 transition-transform" />
                ) : (
                  <ArrowRight className="w-5 h-5 transform group-hover:translate-x-2 transition-transform" />
                )}
              </button>
            </motion.div>

          </div>

        </motion.div>
      </AnimatePresence>

      <div 
        className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-linear-to-br ${slide.color} opacity-5 dark:opacity-10 blur-[100px] rounded-full z-0 pointer-events-none transition-colors duration-1000`}
        style={{ width: "800px", height: "800px" }}
      />

    </section>
  );
}