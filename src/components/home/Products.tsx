"use client";

import Image from "next/image";
import React, { useRef, useState, useEffect } from "react";
import { motion, useInView } from "framer-motion";
import { useTranslations, useLocale } from "next-intl";
import { ArrowLeft, ArrowRight, Loader2 } from "lucide-react";
import Link from "next/link";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from "@/components/ui/carousel";
import { Card, CardContent } from "@/components/ui/card";
import GlobalLoading from "@/components/GlobalLoading";

// اکشن‌های اتصال به دیتابیس (محصولات و تنظیمات سایت)
import { getProducts } from "@/actions/product";
import { getSiteContent } from "@/actions/siteContent";

// دیتای تستی پشتیبان در صورت خالی بودن دیتابیس
const fallbackProducts = [
  { _id: "1", slug: "#", faTitle: "انرژی‌زا مکس", enTitle: "Max Energy", faDesc: "انفجار انرژی در هر قطره.", enDesc: "Burst of energy in every drop.", mainCat: "beverage", images: { main: "https://placehold.co/400x600/111827/ffffff?text=Energy" } },
  { _id: "2", slug: "#", faTitle: "آب پرتقال طبیعی", enTitle: "Natural Orange", faDesc: "۱۰۰٪ طبیعی و ارگانیک.", enDesc: "100% natural and organic.", mainCat: "beverage", images: { main: "https://placehold.co/400x600/f97316/ffffff?text=Orange" } },
  { _id: "3", slug: "#", faTitle: "چیپس نمکی", enTitle: "Salty Chips", faDesc: "ترد و خوشمزه.", enDesc: "Crispy and delicious.", mainCat: "snack", images: { main: "https://placehold.co/400x600/facc15/000000?text=Chips" } },
  { _id: "4", slug: "#", faTitle: "پفک پنیری", enTitle: "Cheese Curls", faDesc: "طعم واقعی پنیر.", enDesc: "Real cheese flavor.", mainCat: "snack", images: { main: "https://placehold.co/400x600/ef4444/ffffff?text=Curls" } },
];

const themeList = [
  "bg-gray-900 text-white border-gray-800",
  "bg-orange-500 text-white border-orange-400",
  "bg-yellow-400 text-gray-900 border-yellow-300",
  "bg-primary text-white border-primary",
  "bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white border-gray-200 dark:border-gray-700",
  "bg-emerald-600 text-white border-emerald-500",
  "bg-amber-900 text-white border-amber-800",
  "bg-rose-500 text-white border-rose-400"
];

export default function Products() {
  const t = useTranslations("Products");
  const locale = useLocale();
  const isRtl = locale === 'fa';

  const [productsData, setProductsData] = useState<any[]>(fallbackProducts);
  const [isLoading, setIsLoading] = useState(true);

  // استیت مربوط به تنظیمات داینامیک سکشن
  const [sectionSettings, setSectionSettings] = useState({
    faSubtitle: "", enSubtitle: "",
    faTitle: "", enTitle: "",
    displayType: "featured",
    maxItems: "8"
  });

  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);
  const [count, setCount] = useState(0);

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const sectionRef = useRef(null);
  const isSectionInView = useInView(sectionRef, { once: false, amount: 0.1 });
  const [isDominoDone, setIsDominoDone] = useState(false);

  // دریافت همزمان تنظیمات صفحه اصلی و محصولات بر اساس آن تنظیمات
  // دریافت همزمان تنظیمات صفحه اصلی و محصولات بر اساس آن تنظیمات
  useEffect(() => {
    const fetchData = async () => {
      const settingsRes = await getSiteContent("home_products_settings");
      let currentSettings = { displayType: "featured", maxItems: "8", faTitle: "", enTitle: "", faSubtitle: "", enSubtitle: "" };
      
      if (settingsRes?.data) {
        currentSettings = { ...currentSettings, ...settingsRes.data };
        setSectionSettings(currentSettings);
      }

      const filter: any = {}; 
      if (currentSettings.displayType === 'featured') {
        filter.isFeatured = true;
      }
      
      const productsRes = await getProducts(filter);
      let loadedProducts = fallbackProducts;

      if (productsRes.success && productsRes.data && productsRes.data.length > 0) {
        const limit = parseInt(currentSettings.maxItems) || 8;
        loadedProducts = productsRes.data.slice(0, limit);
        setProductsData(loadedProducts);
      }

      // ترفند پیش‌بارگذاری: نگه داشتن لودینگ تا دانلود اولین عکس محصول
      if (loadedProducts.length > 0 && loadedProducts[0].images?.main) {
        const img = new window.Image();
        img.src = loadedProducts[0].images.main;
        
        img.onload = () => {
          setTimeout(() => setIsLoading(false), 500);
        };
        
        img.onerror = () => {
          setIsLoading(false);
        };
      } else {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

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

  // پردازش تیترها برای ایجاد افکت رنگی روی کلمه آخر
  const fullTitle = isRtl ? (sectionSettings.faTitle || t("title_part1") + " " + t("title_part2")) : (sectionSettings.enTitle || t("title_part1") + " " + t("title_part2"));

  const titleWords = fullTitle.split(" ");
  const lastWord = titleWords.length > 1 ? titleWords.pop() : "";
  const restOfTitle = titleWords.join(" ");

  const subtitleText = isRtl ? (sectionSettings.faSubtitle || t("description")) : (sectionSettings.enSubtitle || t("description"));

  
return (
    <>
      {isLoading && <GlobalLoading />}
      <section ref={sectionRef} className="py-24 bg-gray-50 dark:bg-dark-card/30 relative overflow-hidden">      <div className="container mx-auto px-4 md:px-8">
        
        <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6 overflow-hidden">
          <div className="max-w-2xl">
            <motion.h2 
              initial={{ opacity: 0, x: isRtl ? 50 : -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: false, amount: 0.1 }}
              transition={{ duration: 0.8, ease: "easeOut", delay: 0 }}
              className="text-3xl md:text-5xl font-black text-gray-900 dark:text-white mb-4 leading-tight"
            >
              {restOfTitle} {lastWord && <span className="drop-shadow-md text-amber-500">{lastWord}</span>}
            </motion.h2>

            <motion.p 
              initial={{ opacity: 0, x: isRtl ? 50 : -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: false, amount: 0.1 }}
              transition={{ duration: 0.8, ease: "easeOut", delay: 0.15 }}
              className="text-gray-700 dark:text-gray-200 text-lg font-medium"
            >
              {subtitleText}
            </motion.p>
          </div>
          
          <Link href={`/${locale}/products`}>
            <motion.button 
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: false }}
              transition={{ duration: 0.8, ease: "easeOut", delay: 0.3 }}
              className="flex items-center gap-2 font-bold transition-colors group text-amber-500 hover:text-amber-600" 
            >
              {t("view_catalog")}
              {isRtl ? (
                <ArrowLeft className="w-5 h-5 transform group-hover:-translate-x-1 transition-transform" />
              ) : (
                <ArrowRight className="w-5 h-5 transform group-hover:translate-x-1 transition-transform" />
              )}
            </motion.button>
          </Link>
        </div>

        <div className="relative group px-4 md:px-12">
          <div dir={isRtl ? "rtl" : "ltr"}>
            <Carousel 
              setApi={setApi}
              opts={{ align: "start", loop: true, direction: isRtl ? "rtl" : "ltr" }} 
              className="w-full"
            >
              <div 
                className="w-full" 
                style={{ 
                  WebkitMaskImage: 'linear-gradient(to right, transparent, black 10%, black 90%, transparent)', 
                  maskImage: 'linear-gradient(to right, transparent, black 10%, black 90%, transparent)' 
                }}
              >
                <CarouselContent className="-ml-2 md:-ml-4 py-6">
                  {productsData.map((product, index) => {
                    const theme = themeList[index % themeList.length];
                    const title = isRtl ? product.faTitle : product.enTitle;
                    const desc = isRtl ? product.faDesc : product.enDesc;
                    const imgUrl = product.images?.main;
                    
                    let catLabel = product.mainCat;
                    if (product.mainCat === 'beverage') catLabel = isRtl ? 'نوشیدنی' : 'Beverage';
                    if (product.mainCat === 'snack') catLabel = isRtl ? 'اسنک' : 'Snacks';
                    if (product.mainCat === 'bakery') catLabel = isRtl ? 'کیک و بیسکویت' : 'Bakery';

                    return (
                      <CarouselItem key={product._id || index} className="pl-2 md:pl-4 md:basis-1/2 lg:basis-1/4">
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
                          <Link href={`/${locale}/products/${product._id}`} className="block h-full cursor-pointer">
                            <Card className="relative overflow-hidden h-100 flex flex-col justify-end p-6 border border-gray-800/60 bg-gray-950 transition-all duration-700 ease-out hover:shadow-[0_20px_40px_rgba(0,0,0,0.4)] hover:z-10 group/card">
                              
                              {imgUrl && (
                                <>
                                  {/* ۱. افکت هاله رنگی پشت عکس با کامپوننت Image */}
                                  <div className="absolute inset-0 w-full h-full z-0 overflow-hidden opacity-40 group-hover/card:opacity-60 transition-opacity duration-700">
                                    <Image 
                                      src={imgUrl} 
                                      alt="" 
                                      fill
                                      sizes="(max-width: 768px) 100vw, 50vw"
                                      aria-hidden="true"
                                      className="object-cover blur-[60px] scale-150 saturate-150" 
                                    />
                                  </div>
                                  
                                  {/* ۲. عکس اصلی محصول با کامپوننت Image */}
                                  <div className="absolute inset-0 w-full h-full z-10 overflow-hidden">
                                    <Image 
                                      src={imgUrl} 
                                      alt={title} 
                                      fill
                                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                                      className="object-contain transition-transform duration-700 group-hover/card:scale-110 drop-shadow-[0_20px_25px_rgba(0,0,0,0.8)] p-4 pb-28" 
                                    />
                                  </div>
                                </>
                              )}

                              <div className="absolute inset-0 bg-linear-to-t from-black/95 via-black/40 to-transparent z-10 pointer-events-none" />
                              
                              <CardContent className="relative z-20 p-0 text-white">
                                <span className="inline-block px-3 py-1 bg-white/10 backdrop-blur-md border border-white/10 rounded-full text-xs font-bold uppercase tracking-wider mb-3 shadow-sm">
                                  {catLabel}
                                </span>
                                <h3 className="text-2xl font-black mb-2 leading-tight drop-shadow-md">
                                  {title}
                                </h3>
                                <p className="text-sm text-gray-300 font-medium line-clamp-2 drop-shadow-sm">
                                  {desc}
                                </p>
                              </CardContent>
                            </Card>
                          </Link>
                        </motion.div>
                      </CarouselItem>
                    )
                  })}
                </CarouselContent>
              </div>
              
              <div className={`hidden md:flex absolute top-1/2 -translate-y-1/2 z-20 touch-none ${prevBtnPosition}`} onPointerDown={() => startPress('prev')} onPointerUp={stopPress} onPointerLeave={stopPress}>
                <CarouselPrevious className="relative inset-auto translate-y-0 h-12 w-12 border-2 border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 text-gray-900 dark:text-white hover:bg-amber-500 hover:text-white hover:border-amber-500 transition-colors shadow-xl btn-prev-carousel active:scale-[0.98] active:translate-y-0" />
              </div>
              
              <div className={`hidden md:flex absolute top-1/2 -translate-y-1/2 z-20 touch-none ${nextBtnPosition}`} onPointerDown={() => startPress('next')} onPointerUp={stopPress} onPointerLeave={stopPress}>
                <CarouselNext className="relative inset-auto translate-y-0 h-12 w-12 border-2 border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 text-gray-900 dark:text-white hover:bg-amber-500 hover:text-white hover:border-amber-500 transition-colors shadow-xl btn-next-carousel active:scale-[0.98] active:translate-y-0" />
              </div>

            </Carousel>
          </div>
        </div>

        <div className="flex justify-center mt-10" dir={isRtl ? "rtl" : "ltr"}>
          <motion.div 
            initial={{ width: 0, opacity: 0 }}
            whileInView={{ width: "100%", opacity: 1 }}
            viewport={{ once: false, amount: 0.1 }}
            transition={{ duration: 1, ease: "easeOut", delay: 0.3 }}
            className="max-w-md h-1.5 bg-gray-400/20 dark:bg-gray-600/20 rounded-full overflow-hidden shadow-inner flex items-center justify-center"
          >
             <motion.div
               className="h-full bg-amber-500 shadow-[0_0_10px_#f59e0b] rounded-full"
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
    </>
  );
}