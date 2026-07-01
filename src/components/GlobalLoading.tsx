"use client";

import React from "react";
import { motion } from "framer-motion";
import { useLocale } from "next-intl";

export default function Loading() {
  const locale = useLocale();
  const isRtl = locale === 'fa';

  // گراف سرعت انیمیشن برای حرکات بسیار روان (Cinematic Ease)
  const customEase: [number, number, number, number] = [0.22, 1, 0.36, 1];

  return (
    <div 
      className="fixed inset-0 z-9999 flex flex-col items-center justify-center bg-white/90 dark:bg-gray-950/90 backdrop-blur-2xl"
      dir={isRtl ? "rtl" : "ltr"}
    >
      {/* هاله نور متحرک (Glow Effect) پشت لوگو */}
      <motion.div
        animate={{ 
          scale: [1, 1.25, 1],
          opacity: [0.15, 0.35, 0.15] 
        }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        className="absolute w-56 h-56 bg-amber-400 blur-[70px] rounded-full pointer-events-none"
      />

      {/* کانتینر اصلی لوگوی SVG */}
      <motion.div 
        className="relative w-36 h-36 md:w-44 md:h-44 mb-8 z-10"
        animate={{ y: [0, -10, 0] }} // انیمیشن تعلیق در هوا
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
      >
        <motion.svg
          viewBox="0 0 425.2 425.2"
          className="w-full h-full drop-shadow-2xl"
          initial="hidden"
          animate="visible"
        >
          {/* بخش قرمز رنگ (پایه/موج) */}
          <motion.path
            d="M4.2,309.7c94.05,49.97,215.08-22.45,323.43-18,36.67,1.51,71.59,9.52,93.37,41.83-58.56-14.95-135.46-9.44-190.84,12.61,44.17-3.13,87.76-3.88,129.34,3.54-50.4,52.62-135.19,78.85-220.32,42.53,46.09,3.99,86.41-2.83,121.13-17.98-104.32,7.93-215.62,10.64-256.11-64.54h0Z"
            fill="#c7181e"
            fillRule="evenodd"
            clipRule="evenodd"
            variants={{
              hidden: { opacity: 0, y: 40, scale: 0.9 },
              visible: { 
                opacity: 1, 
                y: 0, 
                scale: 1, 
                transition: { duration: 1, ease: customEase } 
              }
            }}
          />
          
          {/* بخش طلایی رنگ (خوشه‌های گندم) */}
          <motion.path
            d="M233.32,127.47c-7.25-17.16-5.36-29.29,13.87-50.01,9.31,17.24,8.13,30.63-2.69,42.38-3.17,3.44-6.83,6.1-11.19,7.63h0ZM261.97,101.61c-4.64-18.04-.97-29.76,21.11-47.41,6.66,18.42,3.52,31.5-8.92,41.52-3.64,2.94-7.66,5.02-12.19,5.89ZM415.25,212.59c0-108.49-87.95-196.44-196.44-196.44S22.37,104.1,22.37,212.59c0,19.19,2.76,37.73,7.89,55.26.21.71.53,1.78.53,1.78,21.39-25.78,44.6-54.08,58.17-83.05,2.52-5.38,6.05-11.62,4.53-17.75-.76-3.06-2.58-4.87-4.75-5.14-5.21-.64-15.04,13.33-18.12,17.38-6.8,8.93-13.28,19.03-19.53,29.98-1.54-14.45,5.05-32.4,12.59-44.38,7.86-12.49,19.17-22.37,34.12-23.6,16.57-1.36,26.12,12.4,21.12,32.94-5.13,21.09-23.88,45.92-46.96,71.93,18.36-16.02,37.19-29.97,56.58-41.52-19.06,14.97-35.8,29.85-48.45,44.57,48.51-28.37,114.21-24.84,172.42-33.39,24.41-3.59,51.47-9.84,72.92-22.78,20.19-12.18,37.57-30.62,51.11-57.59-3.67,80.18-47.1,101.67-110.3,107.52-75.17,8.05-132.73-1.48-207.27,51.56,40.41-18.68,82.54-33.71,132.83-31.41-54.84,6.18-96.24,21.23-130.63,47.97,15.53,1.68,31.4,1.27,47.21-.32,38.11-3.82,76.13-13.94,113.56-21.94,62.52-13.37,129.21-20.13,175.39,4.16,1.45-3.19,3.31-7.65,4.59-10.93,8.6-22.09,13.33-46.13,13.33-71.26h0ZM204.89,156.24c-6.5-17.46-4.08-29.5,16.03-49.36,8.55,17.62,6.8,30.96-4.52,42.22-3.32,3.3-7.09,5.8-11.51,7.14ZM253.85,121.11c10.85-18.9,24.65-19.8,43.8-22.35-6.81,25.49-22.46,32.52-43.8,22.35ZM132.84,194.55c-4.42-15.22,4.95-29.36,30.09-42.29.18,6.33-.39,12.18-1.74,17.52-2.51,9.92-6.11,16.67-15.23,21.41-4.16,2.16-8.5,3.41-13.12,3.36ZM145.97,199.23c17.66-12.77,30.61-7.92,49.11-2.38-16.68,20.44-33.84,20.42-49.11,2.38ZM170.27,179.01c-4.25-18.14-.33-29.77,22.12-46.95,6.27,18.56,2.84,31.57-9.8,41.32-3.71,2.86-7.76,4.86-12.31,5.63ZM186.41,180.21c15.77-15.04,29.26-11.98,48.34-8.98-13.77,22.51-30.77,24.8-48.34,8.98ZM223.31,151.49c13.57-17.05,27.35-15.87,46.66-15.51-10.57,24.18-27.1,28.77-46.66,15.51Z"
            fill="#fdb92e"
            fillRule="evenodd"
            clipRule="evenodd"
            variants={{
              hidden: { opacity: 0, scale: 0.85, y: -20 },
              visible: { 
                opacity: 1, 
                scale: 1, 
                y: 0, 
                transition: { duration: 1, delay: 0.3, ease: customEase } 
              }
            }}
          />
        </motion.svg>
      </motion.div>

      {/* تایپوگرافی سینمایی */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: customEase, delay: 0.6 }}
        className="flex flex-col items-center gap-4 z-10"
      >
        <div className="flex gap-1.5 text-2xl md:text-3xl font-black tracking-widest">
          {isRtl ? (
            <>
              <span className="text-gray-900 dark:text-white drop-shadow-sm">جزیره</span>
              <span className="text-[#fdb92e] drop-shadow-sm">گندم</span>
            </>
          ) : (
            <>
              <span className="text-gray-900 dark:text-white drop-shadow-sm">JAZIREH</span>
              <span className="text-[#fdb92e] drop-shadow-sm">GANDUM</span>
            </>
          )}
        </div>

        {/* نقطه‌های متحرک و مینیمال (Loading Dots) */}
        <div className="flex gap-2 mt-1">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              animate={{ y: [0, -6, 0], opacity: [0.2, 1, 0.2] }}
              transition={{ 
                duration: 1.2, 
                repeat: Infinity, 
                delay: i * 0.2,
                ease: "easeInOut" 
              }}
              className="w-2.5 h-2.5 rounded-full bg-[#c7181e] shadow-sm"
            />
          ))}
        </div>
      </motion.div>
    </div>
  );
}