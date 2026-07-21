"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import Link from "next/link";
import { getHeroSlides } from "@/actions/hero";
import GlobalLoading from "@/components/GlobalLoading";

export default function Hero() {
  const locale = useLocale();
  const isRtl = locale === 'fa';
  const t = useTranslations("Hero");

  const [current, setCurrent] = useState(0);

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
      linkType: "product",
      faButtonText: "مشاهده محصول", enButtonText: "View Product",
      linkedProductSlug: "",
      floaters: [
        { id: 11, shape: "rounded-full", color: "bg-orange-400", size: "w-10 h-10 md:w-16 md:h-16", top: "15%", left: "10%", initY: -100, blur: "blur-[3px]", delay: 0.1, zIndex: "z-0", baseFloatX: 15, floatY: [0, 10, 0] },
        { id: 12, shape: "rounded-tl-full rounded-br-full", color: "bg-amber-300", size: "w-8 h-8 md:w-12 md:h-12", top: "75%", left: "85%", initY: 200, blur: "blur-md", delay: 0.3, zIndex: "z-0", baseFloatX: 10, floatY: [0, -15, 0] },
        { id: 13, shape: "rounded-tr-full rounded-bl-full rotate-45", color: "bg-orange-500", size: "w-12 h-12 md:w-20 md:h-20", top: "30%", left: "45%", initY: -150, blur: "blur-none", delay: 0.35, zIndex: "z-50", baseFloatX: 5, floatY: [0, 5, 0] },
        { id: 14, shape: "rounded-full", color: "bg-yellow-400", size: "w-6 h-6 md:w-10 md:h-10", top: "65%", left: "35%", initY: 250, blur: "blur-[1px]", delay: 0.5, zIndex: "z-50", baseFloatX: 8, floatY: [0, -5, 0] },
        { id: 15, shape: "rounded-tl-full rounded-br-full rotate-12", color: "bg-amber-500", size: "w-14 h-14 md:w-24 md:h-24", top: "10%", left: "70%", initY: -180, blur: "blur-[4px]", delay: 0.2, zIndex: "z-0", baseFloatX: -12, floatY: [0, 8, 0] },
        { id: 16, shape: "rounded-full", color: "bg-orange-300", size: "w-4 h-4 md:w-8 md:h-8", top: "85%", left: "20%", initY: 150, blur: "blur-sm", delay: 0.4, zIndex: "z-50", baseFloatX: -8, floatY: [0, -12, 0] },
        { id: 17, shape: "rounded-tr-full rounded-bl-full", color: "bg-yellow-300", size: "w-9 h-9 md:w-14 md:h-14", top: "50%", left: "15%", initY: -50, blur: "blur-[2px]", delay: 0.6, zIndex: "z-0", baseFloatX: 10, floatY: [0, -8, 0] },
        { id: 18, shape: "rounded-full", color: "bg-orange-600", size: "w-5 h-5 md:w-7 md:h-7", top: "45%", left: "80%", initY: 80, blur: "blur-[1px]", delay: 0.45, zIndex: "z-50", baseFloatX: -6, floatY: [0, 15, 0] },
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
      linkType: "product",
      faButtonText: "مشاهده محصول", enButtonText: "View Product",
      linkedProductSlug: "",
      floaters: [
        { id: 21, shape: "rounded-full", color: "bg-rose-400", size: "w-10 h-10 md:w-16 md:h-16", top: "20%", left: "85%", initY: -100, blur: "blur-[3px]", delay: 0.1, zIndex: "z-0", baseFloatX: -15, floatY: [0, -10, 0] },
        { id: 22, shape: "rounded-tl-full rounded-br-full rotate-45", color: "bg-red-500", size: "w-12 h-12 md:w-20 md:h-20", top: "40%", left: "50%", initY: -150, blur: "blur-none", delay: 0.35, zIndex: "z-50", baseFloatX: -5, floatY: [0, 6, 0] },
        { id: 23, shape: "rounded-tr-full rounded-bl-full", color: "bg-pink-300", size: "w-8 h-8 md:w-12 md:h-12", top: "75%", left: "40%", initY: 250, blur: "blur-[1px]", delay: 0.5, zIndex: "z-50", baseFloatX: 7, floatY: [0, -4, 0] },
        { id: 24, shape: "rounded-full", color: "bg-rose-600", size: "w-6 h-6 md:w-10 md:h-10", top: "15%", left: "25%", initY: -80, blur: "blur-sm", delay: 0.2, zIndex: "z-0", baseFloatX: 10, floatY: [0, 12, 0] },
        { id: 25, shape: "rounded-tl-full rounded-br-full -rotate-12", color: "bg-red-400", size: "w-14 h-14 md:w-24 md:h-24", top: "60%", left: "15%", initY: 180, blur: "blur-[4px]", delay: 0.4, zIndex: "z-0", baseFloatX: 12, floatY: [0, -8, 0] },
        { id: 26, shape: "rounded-full", color: "bg-pink-400", size: "w-5 h-5 md:w-8 md:h-8", top: "80%", left: "70%", initY: 100, blur: "blur-[2px]", delay: 0.6, zIndex: "z-50", baseFloatX: -8, floatY: [0, -10, 0] },
        { id: 27, shape: "rounded-tr-full rounded-bl-full rotate-90", color: "bg-rose-500", size: "w-9 h-9 md:w-14 md:h-14", top: "35%", left: "75%", initY: -120, blur: "blur-[1px]", delay: 0.25, zIndex: "z-50", baseFloatX: -6, floatY: [0, 8, 0] },
        { id: 28, shape: "rounded-full", color: "bg-red-300", size: "w-4 h-4 md:w-7 md:h-7", top: "50%", left: "30%", initY: 50, blur: "blur-[3px]", delay: 0.45, zIndex: "z-0", baseFloatX: 8, floatY: [0, -6, 0] },
      ]
    }
  ];

  const [slidesData, setSlidesData] = useState<any[]>(dynamicHeroSlides);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchSlides = async () => {
      const isHeroLoaded = sessionStorage.getItem('hero_loaded');
      if (isHeroLoaded) {
        setIsLoading(false);
      }

      let currentSlides = dynamicHeroSlides;

      try {
        const res = await getHeroSlides();
        if (res && res.success && Array.isArray(res.data) && res.data.length > 0) {
          currentSlides = res.data;
          setSlidesData(currentSlides);
        }
      } catch (error) {
        console.error("Error loading hero slides:", error);
      } finally {
        if (!isHeroLoaded) {
          const firstSlide = currentSlides[0];
          if (firstSlide && firstSlide.mainImage) {
            const img = new window.Image();
            img.src = firstSlide.mainImage;
            img.onload = () => {
              setTimeout(() => {
                sessionStorage.getItem('hero_loaded') || sessionStorage.setItem('hero_loaded', 'true');
                setIsLoading(false);
              }, 2500);
            };
            img.onerror = () => {
              setTimeout(() => {
                sessionStorage.getItem('hero_loaded') || sessionStorage.setItem('hero_loaded', 'true');
                setIsLoading(false);
              }, 2500);
            };
          } else {
            setTimeout(() => {
              sessionStorage.getItem('hero_loaded') || sessionStorage.setItem('hero_loaded', 'true');
              setIsLoading(false);
            }, 2500);
          }
        }
      }
    };

    fetchSlides();
  }, []);

  useEffect(() => {
    if (slidesData.length <= 1) return;
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % slidesData.length);
    }, 8000); 
    return () => clearInterval(timer);
  }, [slidesData.length, current]);

  const slide = slidesData[current] || slidesData[0];

  const titleText = isRtl ? slide.faTitle : slide.enTitle;
  const subtitleText = isRtl ? slide.faSubtitle : slide.enSubtitle;
  const descText = isRtl ? slide.faDesc : slide.enDesc;
  const buttonText = isRtl ? (slide.faButtonText || "مشاهده محصول") : (slide.enButtonText || "View Product");

  const titleFirstWord = titleText ? titleText.split(" ")[0] : "";
  const titleRest = titleText ? titleText.split(" ").slice(1).join(" ") : "";

  // منطق هوشمند تولید لینک دکمه بر اساس linkType
  let targetLink = `/${locale}/products`;
  if (slide.linkType === 'brand' && slide.linkedBrandSlug) {
    targetLink = `/${locale}/products?brand=${slide.linkedBrandSlug}`;
  } else if (slide.linkType === 'category' && slide.linkedCategorySlug) {
    targetLink = `/${locale}/products?category=${slide.linkedCategorySlug}`;
  } else if (slide.linkType === 'product' && slide.linkedProductSlug) {
    targetLink = `/${locale}/products/${slide.linkedProductSlug}`;
  }

  const fallbackPresets = [
    { top: "15%", left: "10%", initY: -100, baseFloatX: 15, floatY: [0, 10, 0] },
    { top: "75%", left: "85%", initY: 200, baseFloatX: 10, floatY: [0, -15, 0] },
    { top: "30%", left: "45%", initY: -150, baseFloatX: 5, floatY: [0, 5, 0] },
    { top: "65%", left: "35%", initY: 250, baseFloatX: 8, floatY: [0, -5, 0] },
    { top: "10%", left: "70%", initY: -180, baseFloatX: -12, floatY: [0, 8, 0] },
    { top: "85%", left: "20%", initY: 150, baseFloatX: -8, floatY: [0, -12, 0] },
    { top: "50%", left: "15%", initY: -50, baseFloatX: 10, floatY: [0, -8, 0] },
    { top: "45%", left: "80%", initY: 80, baseFloatX: -6, floatY: [0, 15, 0] },
  ];

  return (
    <>
      {isLoading && <GlobalLoading />}
      <section 
        className="relative w-full flex items-center justify-center overflow-hidden"
        style={{ height: "100svh", minHeight: "700px" }}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={current}
            className="container mx-auto px-4 md:px-8 w-full h-full flex flex-col-reverse md:flex-row items-center justify-between relative"
          >
            <div className="absolute inset-0 w-full h-full pointer-events-none overflow-hidden">
              {slide.floaters && slide.floaters.map((floater: any, index: number) => {
                const preset = fallbackPresets[index % fallbackPresets.length];
                const topPos = floater.top || preset.top;
                const leftPos = floater.left || preset.left;
                const initY = floater.initY || preset.initY;
                const floatY = floater.floatY || preset.floatY;
                const baseFloatX = floater.baseFloatX || preset.baseFloatX;
                const dynamicFloatX = [0, isRtl ? baseFloatX : -baseFloatX, 0];
                return (
                  <motion.div
                    key={floater.uniqueId || floater.id || index}
                    className={`absolute ${floater.zIndex || 'z-0'}`}
                    style={{ top: topPos, left: leftPos }}
                    initial={{ x: isRtl ? -1200 : 1200, y: initY, scale: 0, rotate: -180, opacity: 0 }}
                    animate={{ x: 0, y: 0, scale: 1, rotate: 0, opacity: 1 }}
                    exit={{ x: isRtl ? 1200 : -1200, y: initY * -1, scale: 0, rotate: 180, opacity: 0, transition: { duration: 0.3, delay: 0, ease: "easeIn" } }}
                    transition={{ type: "spring", stiffness: 60, damping: 14, delay: floater.delay || (index * 0.1) }}
                  >
                    <motion.div
                      className={`${floater.blur || 'blur-sm'} ${floater.opacity || 'opacity-80'}`}
                      animate={{
                        x: dynamicFloatX,
                        y: floatY,
                        rotate: [0, index % 2 === 0 ? 10 : -10, 0]
                      }}
                      transition={{
                        duration: 6 + (index % 4), 
                        repeat: Infinity,
                        ease: "easeInOut",
                        delay: (floater.delay || 0.1) + 0.5 
                      }}
                    >
                      {floater.url ? (
                        <img src={floater.url} className={`w-20 h-20 md:w-32 md:h-32 object-contain drop-shadow-xl ${floater.scale || ''}`} alt="" />
                      ) : (
                        <div className={`${floater.size} ${floater.color} ${floater.shape} shadow-lg border border-white/20`} />
                      )}
                    </motion.div>
                  </motion.div>
                );
              })}
            </div>

           
            <div 
              className="w-full md:w-[55%] h-[55%] min-h-100 md:h-full relative flex items-center justify-center mt-12 md:mt-0 z-40 pointer-events-none"
              style={{ 
                WebkitMaskImage: "linear-gradient(to bottom, black calc(100% - 70px), transparent 100%)",
                maskImage: "linear-gradient(to bottom, black calc(100% - 70px), transparent 100%)"
              }}
            >
              <div className="relative w-64 h-80 md:h-96 flex items-center justify-center">
                <motion.div
                  className="absolute w-44 md:w-52 h-64 md:h-80 origin-bottom"
                  initial={{ rotate: 0, x: 0, y: 0, opacity: 0, scale: 0.5 }}
                  animate={{ rotate: -15, x: -60, y: 15, opacity: 1, scale: 0.85 }}
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

                <motion.div
                  className="absolute w-44 md:w-52 h-64 md:h-80 origin-bottom"
                  initial={{ rotate: 0, x: 0, y: 0, opacity: 0, scale: 0.5 }}
                  animate={{ rotate: 15, x: 60, y: 15, opacity: 1, scale: 0.85 }}
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

                <motion.div
                  className="absolute z-50 origin-bottom w-56 md:w-80 h-80 md:h-112"
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

            <div className={`w-full md:w-[45%] h-[50%] md:h-full flex flex-col justify-center items-start ${isRtl ? 'text-right' : 'text-left'} z-30 pt-32 mt-12 md:pt-0 md:mt-0 relative`}>
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
                // اضافه شدن pr-2 و py-1 به کلاس‌ها برای حل مشکل بریدگی
                className="text-5xl md:text-7xl lg:text-8xl font-black text-gray-900 dark:text-white leading-[1.1] mb-6 tracking-tighter pr-2 py-1"
              >
                {titleFirstWord}{" "}
                {/* اضافه شدن pr-2 به این اسپَن برای جلوگیری از برش گرادیانت */}
                <span className={`text-transparent bg-clip-text bg-linear-to-r ${slide.color} pr-2`}>
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
                <Link href={targetLink} className="pointer-events-auto block">
                  <button className="flex items-center gap-2 px-8 py-4 bg-gray-900 dark:bg-white text-white dark:text-gray-900 hover:bg-amber-400 dark:hover:bg-amber-400 hover:text-black dark:hover:text-black rounded-2xl font-bold transition-all duration-300 shadow-xl hover:shadow-amber-400/30 group">
                    {buttonText}
                    {isRtl ? (
                      <ArrowLeft className="w-5 h-5 transform group-hover:-translate-x-2 transition-transform" />
                    ) : (
                      <ArrowRight className="w-5 h-5 transform group-hover:translate-x-2 transition-transform" />
                    )}
                  </button>
                </Link>
              </motion.div>
            </div>
          </motion.div>
        </AnimatePresence>

        <div 
          className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-linear-to-br ${slide.color} opacity-5 dark:opacity-10 blur-[100px] rounded-full z-0 pointer-events-none transition-colors duration-1000`}
          style={{ 
            width: "800px", height: "800px",
            WebkitMaskImage: "linear-gradient(to bottom, black 75%, transparent 100%)",
            maskImage: "linear-gradient(to bottom, black 75%, transparent 100%)"
          }}
        />

        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 pointer-events-auto">
          {slidesData.map((_, index) => (
            <button
              key={index}
              type="button"
              onClick={() => setCurrent(index)}
              className={`transition-all duration-500 rounded-full cursor-pointer hover:scale-110 active:scale-95 ${
                current === index 
                  ? "w-8 h-2.5 bg-amber-400 shadow-[0_0_10px_rgba(251,191,36,0.6)]" 
                  : "w-2.5 h-2.5 bg-gray-300 dark:bg-gray-700 hover:bg-amber-400 dark:hover:bg-amber-500/50"
              }`}
              aria-label={`برو به اسلاید ${index + 1}`}
            />
          ))}
        </div>
      </section>
    </>
  );
}