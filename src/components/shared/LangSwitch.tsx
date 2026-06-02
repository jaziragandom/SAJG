"use client";

import { useState, useRef, useEffect } from "react";
import { usePathname } from "next/navigation";
import { Globe, ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function LangSwitch() {
  const pathname = usePathname() || '/fa';
  const isEn = pathname.startsWith('/en');
  
  // وضعیت باز و بسته بودن منوی آبشاری
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // بستن منو وقتی کاربر بیرون از آن کلیک می‌کند
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const changeLanguage = (nextLocale: string) => {
    setIsOpen(false);
    
    // اگر کاربر روی زبانی که الان در آن هستیم کلیک کرد، هیچ کاری نکن
    if ((isEn && nextLocale === 'en') || (!isEn && nextLocale === 'fa')) return;

    // تغییر مسیر کاملاً ایمن و ضدِ باگ
    const currentPathWithoutLocale = pathname.replace(/^\/(fa|en)/, '');
    const newPath = `/${nextLocale}${currentPathWithoutLocale}`;
    
    // رفرش سخت‌افزاری مرورگر
    window.location.href = newPath;
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* دکمه اصلی روی ناوبار */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 rounded-full bg-gray-200 dark:bg-zinc-800 text-gray-900 dark:text-gray-100 hover:bg-primary hover:text-white transition-all font-bold text-sm cursor-pointer shadow-sm"
      >
        <Globe size={16} />
        <span className="mt-0.5 tracking-wider">{isEn ? "EN" : "FA"}</span>
        {/* فلشِ چرخان */}
        <ChevronDown 
          size={14} 
          className={`transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`} 
        />
      </button>

      {/* منوی آبشاری (با انیمیشن باز و بسته شدن) */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute top-full mt-2 left-0 md:left-auto md:right-0 w-36 bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 rounded-2xl shadow-xl overflow-hidden z-50"
          >
            <div className="flex flex-col py-2">
              <button
  onClick={() => changeLanguage("fa")}
  className={`px-4 py-2.5 text-sm font-bold text-start transition-colors flex items-center justify-between ${
    !isEn 
      ? "bg-gray-100 dark:bg-zinc-800 text-primary dark:text-white" 
      : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-zinc-800/70"
  }`}
>
  <span>فارسی</span>
  {!isEn && <span className="w-2 h-2 rounded-full bg-primary"></span>}
</button>

<button
  onClick={() => changeLanguage("en")}
  className={`px-4 py-2.5 text-sm font-bold text-start transition-colors flex items-center justify-between ${
    isEn 
      ? "bg-gray-100 dark:bg-zinc-800 text-primary dark:text-white" 
      : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-zinc-800/70"
  }`}
>
  <span>English</span>
  {isEn && <span className="w-2 h-2 rounded-full bg-primary"></span>}
</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}