"use client";

import React, { useEffect, useRef, useState } from "react";
import { motion, useMotionValue, useSpring, useInView } from "framer-motion";
import * as LucideIcons from "lucide-react";
import { useLocale } from "next-intl";
import { getSiteContent } from "@/actions/siteContent";

// --- کامپوننت رندر داینامیک آیکن ---
const DynamicIcon = ({ name, size = 36 }: { name: string, size?: number }) => {
  const IconComponent = (LucideIcons as any)[name] || LucideIcons.CheckCircle;
  return <IconComponent size={size} />;
};

// --- کامپوننت شمارنده (Counter) ---
function Counter({ value, title }: { value: number; title: string }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: false, margin: "-10%" });
  const [displayValue, setDisplayValue] = useState(0);
  const count = useMotionValue(0);
  const springValue = useSpring(count, { stiffness: 40, damping: 30, mass: 1 });

  useEffect(() => {
    if (isInView) count.set(value);
    else count.set(0);
  }, [isInView, count, value]);

  useEffect(() => {
    return springValue.on("change", (latest) => setDisplayValue(Math.floor(latest)));
  }, [springValue]);

  return (
    <div ref={ref} className="flex flex-col items-center justify-center py-4 px-4 bg-gray-50 dark:bg-gray-800/50 rounded-2xl border border-gray-100 dark:border-gray-700 hover:border-amber-400 transition-colors shadow-sm">
      <div className="flex items-center text-3xl md:text-4xl font-black mb-1 text-amber-500" dir="ltr">
        <span>+</span><span suppressHydrationWarning>{displayValue}</span>
      </div>
      <p className="text-gray-600 dark:text-gray-400 text-xs font-bold text-center mt-1 tracking-wide">{title}</p>
    </div>
  );
}

const fadeInUp = { hidden: { opacity: 0, y: 30 }, show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" as const } } };
const staggerContainer = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.2 } } };

export default function AboutFactory() {
  const locale = useLocale();
  const isRtl = locale === 'fa';

  // --- استیت‌های داینامیک ---
  const [introData, setIntroData] = useState<any>({});
  const [features, setFeatures] = useState<any[]>([]);
  const [stats, setStats] = useState<any[]>([]);
  
  // استیت برای کنترل پخش ویدیو
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);

  useEffect(() => {
    const fetchPageData = async () => {
      try {
        const [introRes, statsRes] = await Promise.all([
          getSiteContent('corporate_intro'),
          getSiteContent('corporate_stats')
        ]);

        if (introRes?.data) {
          setIntroData(introRes.data);
          setFeatures(introRes.data.features || []);
        }
        if (statsRes?.data) {
          setStats(statsRes.data.stats || []);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };
    fetchPageData();
  }, []);

  const handlePlayVideo = () => {
    if (introData?.videoUrl) {
      setIsVideoPlaying(true);
    } else {
      alert(isRtl ? "ویدیویی برای پخش آپلود نشده است." : "No video uploaded to play.");
    }
  };

  // تابع هوشمند برای دو رنگ کردن تیتر (کلمه آخر به رنگ نارنجی درمی‌آید)
  const renderHighlightedTitle = (title: string) => {
    if (!title) return null;
    const words = title.trim().split(" ");
    if (words.length <= 1) return <>{title}</>;
    const lastWord = words.pop();
    return (
      <>
        {words.join(" ")} <span className="text-amber-500 drop-shadow-md">{lastWord}</span>
      </>
    );
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center bg-transparent py-24 overflow-hidden" dir={isRtl ? "rtl" : "ltr"}>
      <div className="container mx-auto px-4 md:px-8 relative z-10 max-w-7xl">
        
        <motion.div variants={staggerContainer} initial="hidden" whileInView="show" viewport={{ once: false, amount: 0.1 }}>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:items-stretch items-center">
            
            {/* ستون متن و ویژگی‌ها */}
            <div className="flex flex-col h-full">
              <motion.div variants={fadeInUp} className="mb-6">
                <span className="inline-block px-4 py-1.5 mb-4 text-xs font-bold text-amber-700 bg-amber-400/20 rounded-full">
                  {isRtl ? introData.badgeFA : introData.badgeEN}
                </span>
                <h2 className="text-3xl md:text-4xl font-black text-gray-900 dark:text-white mb-5 leading-tight">
                  {renderHighlightedTitle(isRtl ? introData.titleFA : introData.titleEN)}
                </h2>
                <p className="text-base text-gray-600 dark:text-gray-400 leading-relaxed text-justify">
                  {isRtl ? introData.descFA : introData.descEN}
                </p>
              </motion.div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                {features.map((feature, i) => {
                  return (
                    <motion.div key={i} variants={fadeInUp} className="flex gap-3 items-center bg-white/50 dark:bg-gray-900/50 backdrop-blur-md border border-gray-100 dark:border-gray-800 p-4 rounded-2xl hover:border-amber-400 transition-colors">
                      <div className="shrink-0 w-12 h-12 bg-amber-400/10 rounded-xl flex items-center justify-center text-amber-500">
                        <DynamicIcon name={feature.icon} size={24} />
                      </div>
                      <div>
                        <h4 className="font-bold text-sm text-gray-900 dark:text-white mb-0.5">{isRtl ? feature.faTitle : feature.enTitle}</h4>
                        <p className="text-xs text-gray-500">{isRtl ? feature.descFA : feature.descEN}</p>
                      </div>
                    </motion.div>
                  );
                })}
              </div>

              {/* رندر داینامیک آمار از دیتابیس */}
              <div className="grid grid-cols-2 gap-4 mt-auto">
                {stats.map((s, i) => (<Counter key={i} value={Number(s.value)} title={isRtl ? s.faTitle : s.enTitle} />))}
              </div>
            </div>

            {/* ستون ویدیو */}
            <motion.div variants={fadeInUp} className="relative w-full h-96 lg:h-auto grow flex">
              <div className="absolute inset-0 bg-zinc-900 rounded-3xl overflow-hidden shadow-lg z-10 flex items-center justify-center group">
                
                {isVideoPlaying ? (
                  <video 
                    src={introData.videoUrl} 
                    controls 
                    autoPlay 
                    className="w-full h-full object-cover rounded-3xl"
                  />
                ) : (
                  <>
                    <div className="absolute inset-0 bg-linear-to-tr from-black/70 to-transparent z-10" />
                    <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?q=80&w=2070')] bg-cover bg-center opacity-70 group-hover:scale-105 transition-transform duration-1000" />
                    <div className="relative z-20 flex flex-col items-center cursor-pointer" onClick={handlePlayVideo}>
                      <div className="w-20 h-20 bg-white/20 hover:bg-amber-500 backdrop-blur-md rounded-full flex items-center justify-center text-white border border-white/30 transition-colors">
                        <svg className="w-8 h-8 ml-1" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                      </div>
                      <span className="mt-4 font-bold text-white text-sm tracking-widest drop-shadow-md">{isRtl ? "تور مجازی کارخانه" : "VIRTUAL TOUR"}</span>
                    </div>
                  </>
                )}
                
              </div>
            </motion.div>

          </div>
        </motion.div>
      </div>
    </section>
  );
}