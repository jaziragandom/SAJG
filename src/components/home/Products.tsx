"use client";
import React, { useRef, useState, useEffect } from "react";
import { motion, useInView } from "framer-motion"; 
import { useTranslations, useLocale } from "next-intl";
import { ArrowLeft, ArrowRight } from "lucide-react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from "@/components/ui/carousel";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const products = [
  { id: 1, key: "energy", theme: "bg-gray-900 text-white border-gray-800", badge: "best" },
  { id: 2, key: "orange", theme: "bg-orange-500 text-white border-orange-400", badge: "new" },
  { id: 3, key: "chips", theme: "bg-yellow-400 text-gray-900 border-yellow-300", badge: "popular" },
  { id: 4, key: "cheddar", theme: "bg-primary text-white border-primary", badge: "special" },
  { id: 5, key: "popcorn", theme: "bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white border-gray-200 dark:border-gray-700", badge: "" },
  { id: 6, key: "coffee", theme: "bg-gray-800 text-white border-gray-700", badge: "new" },
  { id: 7, key: "tea", theme: "bg-emerald-600 text-white border-emerald-500", badge: "popular" },
  { id: 8, key: "chocolate", theme: "bg-amber-900 text-white border-amber-800", badge: "best" },
  { id: 9, key: "biscuit", theme: "bg-yellow-100 dark:bg-yellow-900 text-yellow-900 dark:text-white border-yellow-200 dark:border-yellow-800", badge: "" },
  { id: 10, key: "cake", theme: "bg-rose-500 text-white border-rose-400", badge: "special" },
];

export default function Products() {
  const t = useTranslations("Products");
  const locale = useLocale();
  const isRtl = locale === 'fa';
  
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);
  const [count, setCount] = useState(0);

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const sectionRef = useRef(null);
  const isSectionInView = useInView(sectionRef, { once: false, amount: 0.1 });
  const [isDominoDone, setIsDominoDone] = useState(false);

  useEffect(() => {
    if (isSectionInView) {
      const timer = setTimeout(() => setIsDominoDone(true), 2000);
      return () => clearTimeout(timer);
    } else {
      setIsDominoDone(false);
      if (api) api.scrollTo(0, true);
    }
  }, [isSectionInView, api]);

  useEffect(() => {
    if (!api) return;
    setCount(api.scrollSnapList().length);
    setCurrent(api.selectedScrollSnap());

    api.on("select", () => {
      setCurrent(api.selectedScrollSnap());
    });
  }, [api]);

  const startPress = (dir: 'next' | 'prev') => {
    timeoutRef.current = setTimeout(() => {
      intervalRef.current = setInterval(() => {
        const btn = document.querySelector(dir === 'next' ? '.btn-next-carousel' : '.btn-prev-carousel') as HTMLButtonElement;
        if (btn) btn.click();
      }, 150);
    }, 300);
  };

  const stopPress = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    if (intervalRef.current) clearInterval(intervalRef.current);
  };

  const prevBtnPosition = "left-[-1rem] lg:left-[-3rem] right-auto";
  const nextBtnPosition = "right-[-1rem] lg:right-[-3rem] left-auto";

  return (
    <section ref={sectionRef} className="py-24 bg-gray-50 dark:bg-dark-card/30 relative overflow-hidden">
      <div className="container mx-auto px-4 md:px-8">
        
        <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6 overflow-hidden">
          <div className="max-w-2xl">
            <motion.h2 
              initial={{ opacity: 0, x: isRtl ? 50 : -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: false, amount: 0.1 }}
              transition={{ duration: 0.8, ease: "easeOut", delay: 0 }}
              className="text-3xl md:text-5xl font-black text-gray-900 dark:text-white mb-4"
            >
              {t("title_part1")} <span className="drop-shadow-md text-amber-400">{t("title_part2")}</span>
            </motion.h2>

            <motion.p 
              initial={{ opacity: 0, x: isRtl ? 50 : -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: false, amount: 0.1 }}
              transition={{ duration: 0.8, ease: "easeOut", delay: 0.15 }}
              className="text-gray-700 dark:text-gray-200 text-lg"
            >
              {t("description")}
            </motion.p>
          </div>
          
          <motion.button 
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: false }}
            transition={{ duration: 0.8, ease: "easeOut", delay: 0.3 }}
            className="flex items-center gap-2 font-bold transition-colors group text-amber-400" 
          >
            {t("view_catalog")}
            {isRtl ? (
              <ArrowLeft className="w-5 h-5 transform group-hover:-translate-x-1 transition-transform" />
            ) : (
              <ArrowRight className="w-5 h-5 transform group-hover:translate-x-1 transition-transform" />
            )}
          </motion.button>
        </div>

        <div className="relative group px-4 md:px-12">
          <div dir={isRtl ? "rtl" : "ltr"}>
            <Carousel 
              setApi={setApi}
              opts={{ align: "start", loop: true, direction: isRtl ? "rtl" : "ltr" }} 
              className="w-full"
            >
              {/* اعمال ماسک گرادیانت به لبه‌های اسلایدر برای محو شدن سینمایی کارت‌ها */}
              <div 
                className="w-full" 
                style={{ 
                  WebkitMaskImage: 'linear-gradient(to right, transparent, black 10%, black 90%, transparent)', 
                  maskImage: 'linear-gradient(to right, transparent, black 10%, black 90%, transparent)' 
                }}
              >
                <CarouselContent className="-ml-2 md:-ml-4 py-6">
                  {products.map((product, index) => (
                    <CarouselItem key={product.id} className="pl-2 md:pl-4 md:basis-1/2 lg:basis-1/4">
                      <motion.div 
                        initial={{ opacity: 0, y: 80 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: false, amount: 0.2 }} 
                        transition={{ 
                          duration: 0.7, 
                          delay: !isDominoDone ? 0.45 + ((index % 4) * 0.15) : 0, 
                          ease: "easeOut" 
                        }}
                        className="p-1 h-full"
                      >
                        <Card className={`relative overflow-hidden h-100 flex flex-col justify-end p-6 border-2 transition-all duration-700 ease-out hover:shadow-2xl hover:z-10 ${product.theme}`}>
                          {product.badge && (
                            <div className="absolute top-6 right-6 z-20">
                              <Badge variant="secondary" className="bg-white/20 text-current backdrop-blur-md border-none px-3 py-1 text-sm font-bold shadow-lg">
                                {t(`badges.${product.badge}`)}
                              </Badge>
                            </div>
                          )}
                          <div className="absolute inset-0 bg-linear-to-t from-black/80 via-transparent to-transparent z-0" />
                          <CardContent className="relative z-10 p-0">
                            <span className="inline-block px-3 py-1 bg-black/20 backdrop-blur-sm rounded-full text-xs font-bold uppercase tracking-wider mb-3">
                              {t(`items.${product.key}.category`)}
                            </span>
                            <h3 className="text-2xl font-black mb-2 leading-tight">
                              {t(`items.${product.key}.title`)}
                            </h3>
                            <p className="text-sm opacity-90 font-medium">
                              {t(`items.${product.key}.desc`)}
                            </p>
                          </CardContent>
                        </Card>
                      </motion.div>
                    </CarouselItem>
                  ))}
                </CarouselContent>
              </div>
              
              <div className={`hidden md:flex absolute top-1/2 -translate-y-1/2 z-20 touch-none ${prevBtnPosition}`} onPointerDown={() => startPress('prev')} onPointerUp={stopPress} onPointerLeave={stopPress}>
                <CarouselPrevious className="relative inset-auto translate-y-0 h-12 w-12 border-2 border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 text-gray-900 dark:text-white hover:bg-red-600 hover:text-white hover:border-red-600 transition-colors shadow-xl btn-prev-carousel active:scale-[0.98] active:translate-y-0" />
              </div>
              
              <div className={`hidden md:flex absolute top-1/2 -translate-y-1/2 z-20 touch-none ${nextBtnPosition}`} onPointerDown={() => startPress('next')} onPointerUp={stopPress} onPointerLeave={stopPress}>
                <CarouselNext className="relative inset-auto translate-y-0 h-12 w-12 border-2 border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 text-gray-900 dark:text-white hover:bg-red-600 hover:text-white hover:border-red-600 transition-colors shadow-xl btn-next-carousel active:scale-[0.98] active:translate-y-0" />
              </div>

            </Carousel>
          </div>
        </div>

        {/* نوار پیشرفت یکپارچه با انیمیشن باز شدن از وسط و پس‌زمینه بسیار شفاف */}
        <div className="flex justify-center mt-10" dir={isRtl ? "rtl" : "ltr"}>
          <motion.div 
            initial={{ width: 0, opacity: 0 }}
            whileInView={{ width: "100%", opacity: 1 }}
            viewport={{ once: false, amount: 0.1 }}
            transition={{ duration: 1, ease: "easeOut", delay: 0.3 }}
            className="max-w-md h-1.5 bg-gray-400/20 dark:bg-gray-600/20 rounded-full overflow-hidden shadow-inner flex items-center justify-center"
          >
             <motion.div
               className="h-full bg-amber-400 shadow-[0_0_10px_#fdb82c] rounded-full"
               initial={{ width: "8px" }}
               animate={{ 
                 width: count > 0 ? (current === 0 ? "8px" : `${((current + 1) / count) * 100}%`) : "8px" 
               }}
               transition={{ duration: 0.5, ease: "easeInOut" }}
             />
          </motion.div>
        </div>

      </div>
    </section>
  );
}