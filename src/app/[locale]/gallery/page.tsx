"use client";

import React, { useState, useEffect, Suspense } from "react";
import { motion, AnimatePresence, Variants } from "framer-motion";
import { useLocale } from "next-intl";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { Play, Layers, Image as ImageIcon, X, Download, LayoutGrid, MonitorPlay, Sparkles, ListVideo } from "lucide-react";
import { MOCK_MEDIA } from "@/lib/mockData";

// =====================================================================
// ۱. کامپوننت اصلی محتوا (گالری) که تمام منطق در آن قرار دارد
// =====================================================================
function GalleryContent() {
  const locale = useLocale();
  const isRtl = locale === 'fa';
  const customEase: [number, number, number, number] = [0.22, 1, 0.36, 1];
  
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [activeFilter, setActiveFilter] = useState("all");
  const [selectedMedia, setSelectedMedia] = useState<any | null>(null);
  
  // استیت‌های لایت‌باکس و پلیر سینمایی
  const [currentAlbumIndex, setCurrentAlbumIndex] = useState(0);
  const [activeEpisode, setActiveEpisode] = useState(0); 
  const [isVideoEnded, setIsVideoEnded] = useState(false);

  // --- سیستم همگام‌سازی وضعیت با آدرس URL جهت به اشتراک‌گذاری لینک یکتا ---
  const updateUrlParams = (media: any | null, albumIdx: number, epIdx: number) => {
    if (typeof window === "undefined") return; // جلوگیری از کرش سرور در Next.js
    
    const params = new URLSearchParams(window.location.search);
    if (media) {
      params.set("mediaId", media.id.toString());
      if (media.type === 'album') {
        params.set("albumIdx", albumIdx.toString());
        params.delete("epIdx");
      } else if (media.type === 'playlist') {
        params.set("epIdx", epIdx.toString());
        params.delete("albumIdx");
      } else {
        params.delete("albumIdx");
        params.delete("epIdx");
      }
    } else {
      params.delete("mediaId");
      params.delete("albumIdx");
      params.delete("epIdx");
    }
    
    const queryString = params.toString();
    const newUrl = queryString ? `${pathname}?${queryString}` : pathname;
    window.history.pushState(null, '', newUrl);
  };

  // بررسی پارامترهای لینک هنگام لود اولیه صفحه
  useEffect(() => {
    const mediaId = searchParams.get("mediaId");
    if (mediaId) {
      const media = MOCK_MEDIA.find(m => m.id.toString() === mediaId);
      if (media) {
        setSelectedMedia(media);
        
        const albumIdx = searchParams.get("albumIdx");
        if (albumIdx) setCurrentAlbumIndex(Number(albumIdx));
        
        const epIdx = searchParams.get("epIdx");
        if (epIdx) setActiveEpisode(Number(epIdx));
      }
    }
  }, [searchParams]);

  const handleMediaSelect = (media: any) => {
    setSelectedMedia(media);
    setCurrentAlbumIndex(0);
    setActiveEpisode(0);
    updateUrlParams(media, 0, 0);
  };

  const closeModal = () => {
    setSelectedMedia(null);
    setCurrentAlbumIndex(0);
    setActiveEpisode(0);
    setIsVideoEnded(false);
    updateUrlParams(null, 0, 0);
  };

  const handleAlbumIndexChange = (idx: number) => {
    setCurrentAlbumIndex(idx);
    updateUrlParams(selectedMedia, idx, activeEpisode);
  };

  const handleEpisodeChange = (idx: number) => {
    setActiveEpisode(idx);
    setIsVideoEnded(false);
    updateUrlParams(selectedMedia, currentAlbumIndex, idx);
  };

  const filteredMedia = activeFilter === "all" ? MOCK_MEDIA : MOCK_MEDIA.filter(m => m.type === activeFilter);
  
  // --- انیمیشن کارت‌ها (مستقل برای هر کارت + اعمال Stagger تضمینی) ---
  const fadeUpItem: Variants = {
    hidden: { opacity: 0, y: 50 },
    show: (index: number) => {
      // این متغیر زمان تاخیر را محاسبه می‌کند. می‌توانید 0.25 را کم یا زیاد کنید
      const delayTime = (index % 4) * 0.1; 
      
      return {
        opacity: 1, 
        y: 0, 
        transition: { 
          // قرار دادن delay در داخل ویژگی‌ها برای اعمال قطعیِ تاخیر
          y: { duration: 0.7, ease: customEase, delay: delayTime },
          opacity: { duration: 0.28, ease: [0, 0, 1, 1], delay: delayTime }
        } 
      };
    }
  };

  // --- انیمیشن‌های هدر با همپوشانی (Overlap) بسیار نرم ---
  const fadeRightItem: Variants = {
    hidden: { opacity: 0, x: isRtl ? 60 : -60 },
    show: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.8, ease: customEase, delay: 0.0 } // شروع بلافاصله
    }
  };

  const fadeLeftItem: Variants = {
    hidden: { opacity: 0, x: isRtl ? -60 : 60 },
    show: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.8, ease: customEase, delay: 0.15 } // شروع کمی پس از تایتل
    }
  };

  const staggerFilters: Variants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.25 } // ریزش دکمه‌ها در اوج انیمیشن متون
    }
  };

  const fadeDownItem: Variants = {
    hidden: { opacity: 0, y: -20 },
    show: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: customEase } 
    }
  };

  return (
    <main className="w-full pb-32 pt-28 px-4 md:px-8" dir={isRtl ? "rtl" : "ltr"}>
      
      {/* کانتینر اصلی تایتل */}
      <motion.div 
        initial="hidden"
        whileInView="show"
        viewport={{ once: false, amount: 0.3 }}
        className="max-w-6xl mx-auto text-center mb-12 flex flex-col items-center overflow-hidden"
      >
        <motion.h1 variants={fadeRightItem} className="text-3xl md:text-5xl font-black text-gray-900 dark:text-white mb-4">
          {isRtl ? "مرکز " : "Media "}
          <span className="text-amber-500">{isRtl ? "رسانه و گالری" : "Center & Gallery"}</span>
        </motion.h1>
        
        <motion.p variants={fadeLeftItem} className="text-sm font-bold text-gray-500 dark:text-gray-400 mb-10">
          {isRtl ? "تیزرهای موشن‌گرافیک، پشت صحنه خط تولید و مستندات تصویری" : "Promotional teasers, production line behind-the-scenes, and visual assets"}
        </motion.p>

        {/* فیلترهای ناوبار گالری بر اساس نوع رسانه */}
        <motion.div 
          variants={staggerFilters}
          className="max-w-3xl mx-auto flex flex-nowrap justify-center items-center gap-2 overflow-x-auto custom-scrollbar pb-2 md:pb-0 w-full px-1"
        >
          {[
            { id: "all", label: isRtl ? "همه رسانه‌ها" : "All Media", icon: LayoutGrid },
            { id: "image", label: isRtl ? "تک عکس" : "Single Photo", icon: ImageIcon },
            { id: "album", label: isRtl ? "آلبوم تصاویر" : "Photo Album", icon: Layers },
            { id: "video", label: isRtl ? "تک ویدیو" : "Single Video", icon: Play },
            { id: "playlist", label: isRtl ? "ویدیو اپیزودی" : "Episodic Video", icon: ListVideo }
          ].map((filter) => {
            const Icon = filter.icon;
            return (
              <motion.button 
                variants={fadeDownItem}
                key={filter.id} 
                onClick={() => setActiveFilter(filter.id)}
                className={`flex items-center justify-center shrink-0 gap-2 p-3 md:px-5 md:py-2.5 rounded-full text-xs font-black transition-colors duration-300 ${activeFilter === filter.id ? 
                  'bg-gray-900 dark:bg-white text-white dark:text-gray-900 shadow-md scale-102' : 'bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-gray-600 dark:text-gray-400 hover:border-amber-400'}`}
              >
                <Icon size={16} className={activeFilter === filter.id ? "fill-current" : ""} />
                <span className="hidden md:inline-block">{filter.label}</span>
              </motion.button>
            );
          })}
        </motion.div>
      </motion.div>

      {/* گرید فوق‌پویا بنتو با اجرای کاملاً مستقل انیمیشن برای هر کارت */}
      <div className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 auto-rows-[240px] grid-flow-dense">
        <AnimatePresence mode="popLayout">
          {filteredMedia.map((media, index) => (
            <motion.div
              custom={index} // پاس دادن ایندکس برای اجرای تک‌تک کارت‌ها
              variants={fadeUpItem}
              initial="hidden"
              whileInView="show"
              viewport={{ once: false, amount: 0.12 }} 
              key={media.id}
              onClick={() => handleMediaSelect(media)}
              className={`relative rounded-[2rem] overflow-hidden cursor-pointer group shadow-xs hover:shadow-2xl hover:shadow-amber-400/10 transition-[box-shadow,border-color] duration-300 border border-gray-200/40 dark:border-gray-800/40 ${media.isFeatured ? 'sm:col-span-2 sm:row-span-2' : 'col-span-1 row-span-1'}`}
            >
              {/* افکت کارت‌های تودرتو عقب‌تر برای آلبوم‌ها */}
              {media.type === 'album' && (
                <>
                  <div className="absolute inset-2 bg-white/40 dark:bg-gray-900/40 rounded-[2rem] -z-20 transform translate-y-3 scale-92 border border-gray-200/30 dark:border-gray-800/30 transition-transform group-hover:translate-y-4"></div>
                  <div className="absolute inset-1 bg-white/70 dark:bg-gray-900/70 rounded-[2rem] -z-10 transform translate-y-1.5 scale-96 border border-gray-200/30 dark:border-gray-800/30 transition-transform group-hover:translate-y-2"></div>
                </>
              )}
              
              <img src={media.thumbnail} alt={media.faTitle} className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-103" />
              
              {/* ماسک گرادیانت سافت بر روی بنتو */}
              <div className="absolute inset-0 bg-linear-to-t from-gray-950/95 via-gray-950/20 to-transparent flex flex-col justify-end p-5 md:p-6">
                <div className="absolute top-4 right-4 bg-white/10 dark:bg-black/30 backdrop-blur-md p-2.5 rounded-full text-white border border-white/10 group-hover:bg-amber-400 group-hover:text-gray-950 transition-colors">
                  {media.type === 'video' || media.type === 'playlist' ? <Play size={16} className="fill-current" /> : media.type === 'album' ? <Layers size={16} /> : <ImageIcon size={16} />}
                </div>
                <span className="text-[9px] font-black text-amber-400 mb-1 uppercase tracking-wider">{media.category}</span>
                <h3 className={`font-black text-white ${media.isFeatured ? 'text-xl md:text-2xl' : 'text-sm'} leading-tight`}>
                  {isRtl ? media.faTitle : media.enTitle}
                </h3>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* --- لایت‌باکس بزرگ و حالت سینمایی (Theater Mode) برای ویدیوها و آلبوم‌ها --- */}
      <AnimatePresence>
        {selectedMedia && (
          <div className="fixed inset-0 z-100 flex items-center justify-center p-4 md:p-6">
            
            {/* بک‌گراند بلور کاملاً تیره */}
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} 
              onClick={closeModal} 
              className="fixed inset-0 bg-gray-950/85 backdrop-blur-xl cursor-pointer" 
            />
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.96, y: 25 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.96, y: 25 }} 
              transition={{ duration: 0.5, ease: customEase }}
              className="relative w-full max-w-6xl h-[85vh] md:h-[75vh] flex flex-col bg-black rounded-[2.5rem] overflow-hidden shadow-2xl border border-gray-800/80"
            >
              {/* دکمه کلوز شیشه‌ای آیفون‌استایل */}
              <button 
                onClick={closeModal} 
                className="absolute top-4 left-4 z-50 p-2.5 bg-black/40 text-white hover:bg-red-500 rounded-full transition-colors backdrop-blur-md border border-white/10"
              >
                <X size={18}/>
              </button>

              {/* ساختار ۱: آلبوم تصاویر تعاملی با نوار فیلم پایین صفحه */}
              {(selectedMedia.type === 'image' || selectedMedia.type === 'album') && (
                <div className="flex flex-col w-full h-full relative bg-gray-950">
                  <div className="flex-1 w-full flex items-center justify-center p-4 select-none">
                    <img 
                      src={selectedMedia.type === 'album' ? selectedMedia.items[currentAlbumIndex] : selectedMedia.imageUrl || selectedMedia.thumbnail} 
                      alt="HQ Asset" 
                      className="max-w-full max-h-full object-contain rounded-xl drop-shadow-[0_20px_40px_rgba(0,0,0,0.5)]" 
                    />
                  </div>
                  
                  {/* باکس هدر لایت‌باکس تصاویر */}
                  <div className="absolute top-0 right-0 p-6 bg-linear-to-b from-black/90 via-black/40 to-transparent w-full pointer-events-none">
                    <h2 className="text-lg md:text-xl font-black text-white pr-8">{isRtl ? selectedMedia.faTitle : selectedMedia.enTitle}</h2>
                    <a 
                      href={selectedMedia.type === 'album' ? selectedMedia.items[currentAlbumIndex] : selectedMedia.imageUrl || selectedMedia.thumbnail} 
                      download 
                      className="inline-flex items-center gap-1.5 mt-2 text-xs font-black text-amber-400 hover:text-amber-300 pointer-events-auto transition-colors"
                    >
                      <Download size={14}/> {isRtl ? "دانلود با کیفیت اورجینال" : "Download Original Quality"}
                    </a>
                  </div>

                  {/* نوار فیلم پایین (Filmstrip Carousel) برای آلبوم‌ها */}
                  {selectedMedia.type === 'album' && (
                    <div className="h-24 bg-black border-t border-gray-900/60 flex items-center px-4 gap-2 overflow-x-auto custom-scrollbar shrink-0 justify-center">
                      {selectedMedia.items.map((img: string, idx: number) => (
                        <button 
                          key={idx} 
                          onClick={() => handleAlbumIndexChange(idx)} 
                          className={`shrink-0 h-14 w-20 rounded-xl overflow-hidden border-2 transition-all ${currentAlbumIndex === idx ? 'border-amber-400 scale-102 opacity-100' : 'border-transparent opacity-40 hover:opacity-100'}`}
                        >
                          <img src={img} className="w-full h-full object-cover" alt="Thumb"/>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* ساختار ۲: پلیر ویدیویی چند اپیزودی همراه با سایدبار و انداسکرین پیشنهادات */}
              {(selectedMedia.type === 'video' || selectedMedia.type === 'playlist') && (
                <div className="flex flex-col md:flex-row w-full h-full bg-gray-950">
                  
                  {/* کانتینر اصلی پلیر */}
                  <div className="relative flex-1 bg-black flex flex-col justify-center">
                    <div className="w-full aspect-video md:flex-1 relative flex items-center justify-center bg-gray-900/40">
                      <MonitorPlay size={48} className="text-gray-800 animate-pulse" />
                      
                      {/* شبیه‌ساز پایان ویدیو */}
                      {!isVideoEnded && (
                        <button onClick={() => setIsVideoEnded(true)} className="absolute top-4 right-4 bg-black/60 text-white px-3 py-1.5 rounded-lg text-[10px] font-black border border-white/10 hover:bg-amber-400 hover:text-gray-950 transition-all">
                          شبیه‌سازی دکمه پایان ویدیو
                        </button>
                      )}

                      {/* --- اند‌اسکرین پیشنهادی کاملاً شبیه به یوتیوب (End-Screen System) --- */}
                      <AnimatePresence>
                        {isVideoEnded && (
                          <motion.div 
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-black/85 backdrop-blur-md flex flex-col items-center justify-center p-6 z-20"
                          >
                            <h3 className="text-white font-black text-sm md:text-base mb-4 flex items-center gap-2">
                              <Sparkles className="text-amber-400" size={16}/> {isRtl ? "ویدیوهای پیشنهادی بعدی جزیره گندم" : "Recommended Next Videos"}
                            </h3>
                            
                            <div className="grid grid-cols-2 gap-3 max-w-xl w-full">
                              {MOCK_MEDIA.filter(m => m.type === 'video').slice(0, 2).map(rec => (
                                <div 
                                  key={rec.id} 
                                  onClick={() => { setSelectedMedia(rec); setIsVideoEnded(false); updateUrlParams(rec, 0, 0); }} 
                                  className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden cursor-pointer hover:border-amber-400 transition-all group/rec"
                                >
                                  <div className="h-20 w-full relative">
                                    <img src={rec.thumbnail} className="w-full h-full object-cover opacity-70 group-hover/rec:opacity-100 transition-opacity" alt="rec"/>
                                  </div>
                                  <p className="text-white text-[11px] font-black p-2.5 truncate">{isRtl ? rec.faTitle : rec.enTitle}</p>
                                </div>
                              ))}
                            </div>
                            
                            <button onClick={() => setIsVideoEnded(false)} className="mt-6 text-xs font-bold text-gray-400 hover:text-white flex items-center gap-1 transition-colors">
                              <Play size={12}/> {isRtl ? "پخش مجدد این ویدیو" : "Replay Video"}
                            </button>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>

                  {/* سایدبار لیست اپیزودها (یوتیوب‌استایل - مخصوص ویدیوهای پلی‌لیست) */}
                  {selectedMedia.type === 'playlist' && (
                    <div className="w-full md:w-80 bg-gray-950 border-t md:border-t-0 md:border-r border-gray-900 flex flex-col h-1/2 md:h-full shrink-0">
                      <div className="p-4 border-b border-gray-900/60 bg-gray-900/10">
                        <h3 className="text-white font-black text-xs line-clamp-1">{isRtl ? selectedMedia.faTitle : selectedMedia.enTitle}</h3>
                        <p className="text-gray-500 text-[10px] font-bold mt-1 uppercase tracking-wider">{selectedMedia.items.length} Episodes</p>
                      </div>
                      
                      <div className="flex-1 overflow-y-auto custom-scrollbar p-2 flex flex-col gap-1">
                        {selectedMedia.items.map((ep: any, idx: number) => (
                          <button 
                            key={idx} 
                            onClick={() => handleEpisodeChange(idx)}
                            className={`flex items-center gap-3 p-2.5 rounded-xl text-right transition-colors ${activeEpisode === idx ? 'bg-gray-900 border border-gray-800' : 'hover:bg-gray-900/40'}`}
                          >
                            <div className="w-20 h-12 bg-gray-900 rounded-lg relative shrink-0 overflow-hidden border border-gray-800">
                              <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                                <Play size={14} className={activeEpisode === idx ? "text-amber-400 fill-amber-400" : "text-white"} />
                              </div>
                            </div>
                            <div className="flex flex-col min-w-0">
                              <span className={`text-xs font-black line-clamp-1 ${activeEpisode === idx ? 'text-amber-400' : 'text-gray-300'}`}>
                                {ep.title}
                              </span>
                              <span className="text-[10px] text-gray-500 font-bold mt-0.5">اپیزود {ep.ep}</span>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </main>
  );
}

// =====================================================================
// ۲. کامپوننت پوششی (Wrapper) - راه حل قطعی رفع خطای 404 در Next.js
// =====================================================================
export default function GalleryPage() {
  return (
    // قرار دادن محتوا در Suspense الزامی است چون از useSearchParams استفاده کرده‌ایم
    <Suspense fallback={<div className="min-h-screen w-full bg-gray-50 dark:bg-gray-950 flex items-center justify-center font-bold text-gray-500">در حال بارگذاری گالری...</div>}>
      <GalleryContent />
    </Suspense>
  );
}