"use client";

import React, { useState } from "react";
import { motion, useScroll, useMotionValueEvent, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useLocale } from "next-intl";
import { 
  Menu, 
  X, 
  ShieldCheck, 
  ChevronDown, 
  ChevronLeft,
  ChevronRight,
  ArrowLeft, 
  ArrowRight, 
  Wheat,
  Droplets,
  Sparkles,
  Tag,
  LayoutGrid
} from "lucide-react";
import ThemeToggle from "./ThemeToggle";
import LangSwitch from "./LangSwitch";

// ۱. فراخوانی تگ‌های فیلتر از سیستم مدیریت دسته‌بندی‌ها (برای منوی محصولات)
import { FILTER_GROUPS } from "@/lib/mockData";

// ۲. شبیه‌سازی دیتابیس مدیریت برندها (برای منوی مستقل برندها با قابلیت Slug)
const brandsDB = [
  { id: "m4", slug: "m4", faName: "ام فور", enName: "M4" },
  { id: "khandan", slug: "khandan", faName: "خندان", enName: "Khandan" },
  { id: "seven-sky", slug: "seven-sky", faName: "سون اسکای", enName: "Seven Sky" },
  { id: "nik", slug: "nik", faName: "نیک", enName: "Nik" },
  { id: "sadaf", slug: "sadaf", faName: "صدف", enName: "Sadaf" },
];

export default function Navbar() {
  const locale = useLocale();
  const isRtl = locale === 'fa';

  // گراف سرعت استاندارد و ملایم (کاملاً بدون فنر)
  const customEase: [number, number, number, number] = [0.22, 1, 0.36, 1];

  const { scrollY } = useScroll();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isHidden, setIsHidden] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  // استیت‌های مربوط به انیمیشن‌های تعاملی دسکتاپ
  const [hoveredLink, setHoveredLink] = useState<string | null>(null);
  const [hoveredNestedLink, setHoveredNestedLink] = useState<string | null>(null);
  
  // استیت‌های منوی موبایل (چند سطحی)
  const [expandedMobileMenu, setExpandedMobileMenu] = useState<string | null>(null); 
  const [expandedNestedMobile, setExpandedNestedMobile] = useState<string | null>(null);

  // منطق اسکرول هوشمند
  useMotionValueEvent(scrollY, "change", (latest) => {
    const previous = scrollY.getPrevious() ?? 0;
    
    if (latest > 50) {
      setIsScrolled(true);
    } else {
      setIsScrolled(false);
    }

    if (latest > 150 && latest > previous) {
      setIsHidden(true); 
    } else {
      setIsHidden(false); 
    }
  });

  // تابع اسکرول نرم برای لینک‌های درون‌صفحه‌ای (Anchor Links) در صفحه درباره ما
  const handleAnchorClick = (e: React.MouseEvent<HTMLAnchorElement>, hash: string) => {
    if (typeof window !== "undefined" && window.location.pathname.includes('/about')) {
      e.preventDefault();
      const element = document.getElementById(hash);
      if (element) {
        const y = element.getBoundingClientRect().top + window.scrollY - 100;
        window.scrollTo({ top: y, behavior: 'smooth' });
        setIsMobileMenuOpen(false);
      }
    }
  };

  // ساختار منوی محصولات (استفاده از تگ‌های فیلتر برای هدایت به لیست محصولات)
  const productsNestedMenu = [
    {
      id: "beverage",
      fa: "نوشیدنی‌ها",
      en: "Beverages",
      icon: <Droplets size={16} />,
      items: FILTER_GROUPS.beverage_type,
      filterKey: "bevType"
    },
    {
      id: "snack",
      fa: "تنقلات",
      en: "Snacks",
      icon: <Sparkles size={16} />,
      items: FILTER_GROUPS.snack_type,
      filterKey: "snackType"
    },
    {
      id: "brands",
      fa: "برندها",
      en: "Brands",
      icon: <Tag size={16} />,
      items: FILTER_GROUPS.brands,
      filterKey: "brand"
    }
  ];

  // آرایه گسترده نوبار اصلی
  const navLinks = [
    { 
      key: "home", 
      fa: "صفحه اصلی",
      en: "Home",
      href: `/${locale}` 
    },
    { 
      key: "products", 
      fa: "محصولات",
      en: "Products",
      href: `/${locale}/products`,
      isProductsDropdown: true // منوی آبشاری تودرتو (عملکرد فیلتر)
    },
    { 
      key: "brands", 
      fa: "برندها",
      en: "Brands",
      href: `/${locale}/brands`, 
      isBrandsMenu: true // منوی مستقل برندها (عملکرد هدایت به صفحات اختصاصی)
    },
    { 
      key: "gallery", 
      fa: "گالری",
      en: "Gallery",
      href: `/${locale}/gallery` // صفحه جدید گالری
    },
    { 
      key: "blog", 
      fa: "مجله گندم",
      en: "Blog",
      href: `/${locale}/blog` 
    },
    { 
      key: "about", 
      fa: "درباره ما",
      en: "About Us",
      href: `/${locale}/about`,
      subLinks: [
        { id: "history", fa: "تاریخچه و معرفی", en: "History & About" },
        { id: "mission", fa: "ماموریت و چشم‌انداز", en: "Mission & Vision" },
        { id: "partners", fa: "شرکای تجاری ما", en: "Our Partners" },
        { id: "certificates", fa: "گواهینامه‌ها", en: "Certificates" },
        { id: "contact", fa: "تماس و نمایندگی‌ها", en: "Contact & Branches" }
      ]
    }
  ];

  return (
    <motion.header
      initial={false}
      animate={{ y: isHidden ? "-100%" : 0 }}
      transition={{ duration: 0.35, ease: customEase }}
      className={`fixed top-0 left-0 w-full z-50 transition-colors duration-500 ${
        isScrolled 
          ? "bg-white/80 dark:bg-gray-950/80 backdrop-blur-xl border-b border-gray-200/50 dark:border-gray-800/50 py-3 shadow-sm" 
          : "bg-transparent py-5"
      }`}
    >
      <div className="container mx-auto px-4 md:px-8 flex items-center justify-between">
        
        {/* لوگو */}
        <Link href={`/${locale}`} className="text-2xl font-black tracking-tighter flex items-center gap-2 z-50 group">
          <div className="w-10 h-10 bg-amber-400 text-gray-900 rounded-xl flex items-center justify-center group-hover:scale-105 transition-transform duration-300">
            <Wheat size={24} strokeWidth={2.5} />
          </div>
          <div className="flex gap-1">
            {isRtl ? (
              <>
                <span className="text-gray-900 dark:text-white drop-shadow-sm transition-colors">جزیره</span>
                <span className="text-amber-400 drop-shadow-sm">گندم</span>
              </>
            ) : (
              <>
                <span className="text-gray-900 dark:text-white drop-shadow-sm transition-colors">JAZIREH</span>
                <span className="text-amber-400 drop-shadow-sm">GANDOM</span>
              </>
            )}
          </div>
        </Link>

        {/* منوی دسکتاپ */}
        <nav className="hidden md:flex items-center gap-2">
          {navLinks.map((link) => (
            <div 
              key={link.key} 
              className="relative"
              onMouseEnter={() => setHoveredLink(link.key)}
              onMouseLeave={() => {
                setHoveredLink(null);
                setHoveredNestedLink(null);
              }}
            >
              {/* نشانگر هاور */}
              {hoveredLink === link.key && (
                <motion.div
                  layoutId="navbar-indicator"
                  className="absolute inset-0 bg-gray-100 dark:bg-gray-800/80 rounded-full z-0"
                  transition={{ duration: 0.3, ease: customEase }}
                />
              )}
              
              <Link 
                href={link.href}
                className="relative z-10 flex items-center gap-1 px-4 py-2 text-sm font-bold text-gray-700 dark:text-gray-200 hover:text-gray-900 dark:hover:text-white transition-colors"
              >
                {isRtl ? link.fa : link.en}
                {(link.isBrandsMenu || link.subLinks || link.isProductsDropdown) && (
                  <ChevronDown size={14} className={`transition-transform duration-300 ${hoveredLink === link.key ? "rotate-180" : ""}`} />
                )}
              </Link>

              {/* === ۱. منوی آبشاری تودرتو محصولات (عملکرد: فیلتر کردن) === */}
              <AnimatePresence>
                {link.isProductsDropdown && hoveredLink === link.key && (
                  <motion.div
                    initial={{ opacity: 0, y: 15, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.98 }}
                    transition={{ duration: 0.3, ease: customEase }}
                    className="absolute top-full pt-4 rtl:left-0 ltr:right-0 w-64 cursor-default z-50"
                  >
                    <div className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-2xl border border-gray-100 dark:border-gray-800 rounded-3xl p-3 shadow-2xl flex flex-col gap-1">
                      
                      {productsNestedMenu.map((nested) => (
                        <div 
                          key={nested.id}
                          className="relative"
                          onMouseEnter={() => setHoveredNestedLink(nested.id)}
                          onMouseLeave={() => setHoveredNestedLink(null)}
                        >
                          <div className={`flex items-center justify-between px-4 py-2.5 text-sm font-bold rounded-xl cursor-pointer transition-colors ${hoveredNestedLink === nested.id ? 'bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800/50'}`}>
                            <div className="flex items-center gap-2">
                              <span className="text-amber-500 opacity-70">{nested.icon}</span>
                              {isRtl ? nested.fa : nested.en}
                            </div>
                            {isRtl ? <ChevronLeft size={16} className="opacity-50" /> : <ChevronRight size={16} className="opacity-50" />}
                          </div>

                          {/* زیرمنوی آبشاری سطح دوم (لینک به فیلترها) */}
                          <AnimatePresence>
                            {hoveredNestedLink === nested.id && nested.items.length > 0 && (
                              <motion.div
                                initial={{ opacity: 0, x: isRtl ? 10 : -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: isRtl ? 5 : -5 }}
                                transition={{ duration: 0.3, ease: customEase }}
                                className="absolute top-2.5 rtl:right-full rtl:pr-2 ltr:left-full ltr:pl-2 w-56"
                              >
                                <div className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-2xl border border-gray-100 dark:border-gray-800 rounded-2xl p-2 shadow-2xl flex flex-col gap-1">
                                  {nested.items.map((item, idx) => (
                                    <Link 
                                      key={idx} 
                                      // ارسال مقدار فیلتر به عنوان Query Parameter
                                      href={`/${locale}/products?${nested.filterKey}=${encodeURIComponent(item)}`}
                                      className="px-4 py-2 text-sm font-bold text-gray-600 dark:text-gray-300 hover:text-amber-600 dark:hover:text-amber-400 hover:bg-gray-50 dark:hover:bg-gray-800/50 rounded-xl transition-colors"
                                    >
                                      {item}
                                    </Link>
                                  ))}
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      ))}

                      {/* گزینه تمام محصولات */}
                      <div className="border-t border-gray-100 dark:border-gray-800 mt-1 pt-1">
                        <Link 
                          href={`/${locale}/products`} 
                          className="flex items-center gap-2 px-4 py-3 text-sm font-black text-gray-900 dark:text-white hover:text-amber-600 dark:hover:text-amber-400 hover:bg-gray-50 dark:hover:bg-gray-800/50 rounded-xl transition-colors"
                        >
                          <LayoutGrid size={16} className="text-amber-500 opacity-70" />
                          {isRtl ? "تمام محصولات" : "All Products"}
                        </Link>
                      </div>

                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* === ۲. منوی آبشاری مستقل برندها (عملکرد: لینک به صفحات اختصاصی) === */}
              <AnimatePresence>
                {link.isBrandsMenu && hoveredLink === link.key && (
                  <motion.div
                    initial={{ opacity: 0, y: 15, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.98 }}
                    transition={{ duration: 0.3, ease: customEase }}
                    className="absolute top-full pt-4 right-0 w-48 cursor-default z-40"
                  >
                    <div className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-2xl border border-gray-100 dark:border-gray-800 rounded-2xl p-3 shadow-2xl flex flex-col gap-1">
                      
                      {/* لینک به صفحه اختصاصی هر برند با استفاده از Slug */}
                      {brandsDB.map((brand) => (
                        <Link 
                          key={brand.id} 
                          href={`/${locale}/brands/${brand.slug}`}
                          className="px-4 py-2.5 text-sm font-bold text-gray-600 dark:text-gray-300 hover:text-amber-500 dark:hover:text-amber-400 hover:bg-gray-50 dark:hover:bg-gray-800/50 rounded-xl transition-colors"
                        >
                          {isRtl ? brand.faName : brand.enName}
                        </Link>
                      ))}

                      {/* دکمه مشاهده لیست تمام برندها */}
                      <div className="border-t border-gray-100 dark:border-gray-800 mt-2 pt-2">
                        <Link 
                          href={`/${locale}/brands`} 
                          className="px-4 py-2 text-xs font-bold text-amber-500 hover:text-amber-600 flex items-center gap-1 justify-center"
                        >
                          {isRtl ? "مشاهده همه برندها" : "View all brands"}
                          {isRtl ? <ArrowLeft size={14} /> : <ArrowRight size={14} />}
                        </Link>
                      </div>

                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* === ۳. منوی آبشاری لنگری درباره ما === */}
              <AnimatePresence>
                {link.subLinks && hoveredLink === link.key && (
                  <motion.div
                    initial={{ opacity: 0, y: 15, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.98 }}
                    transition={{ duration: 0.3, ease: customEase }}
                    className="absolute top-full pt-4 right-0 w-60 cursor-default z-40"
                  >
                    <div className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-2xl border border-gray-100 dark:border-gray-800 rounded-2xl p-3 shadow-2xl flex flex-col gap-1">
                      {link.subLinks.map((sub) => (
                        <Link 
                          key={sub.id} 
                          href={`/${locale}/about#${sub.id}`} 
                          onClick={(e) => handleAnchorClick(e, sub.id)}
                          className="px-4 py-2.5 text-sm font-bold text-gray-600 dark:text-gray-300 hover:text-amber-500 dark:hover:text-amber-400 hover:bg-gray-50 dark:hover:bg-gray-800/50 rounded-xl transition-colors"
                        >
                          {isRtl ? sub.fa : sub.en}
                        </Link>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

            </div>
          ))}
        </nav>

        {/* دکمه‌های سمت چپ (تم، زبان و پنل ادمین) */}
        <div className="hidden md:flex items-center gap-3 z-50">
          <div className="flex items-center gap-1 bg-gray-100/50 dark:bg-gray-800/50 backdrop-blur-md rounded-full p-1 border border-gray-200/50 dark:border-gray-700/50">
            <ThemeToggle />
            <LangSwitch />
          </div>
          
          <Link 
            href={`/${locale}/admin/login`}
            className="flex items-center justify-center w-10 h-10 bg-red-600 text-white hover:bg-amber-400 hover:text-black rounded-full transition-all duration-300 shadow-lg hover:shadow-amber-400/50 hover:scale-105 active:scale-95"
          >
            <ShieldCheck size={20} />
          </Link>
        </div>

        {/* دکمه منوی موبایل */}
        <button 
          className="md:hidden text-gray-900 dark:text-white z-50 p-2 bg-gray-100/50 dark:bg-gray-800/50 rounded-full backdrop-blur-md" 
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* --- منوی موبایل (چند سطحی و آکاردئونی) --- */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.4, ease: customEase }}
            className="md:hidden absolute top-full left-0 w-full bg-white/95 dark:bg-gray-950/95 backdrop-blur-2xl border-t border-gray-100 dark:border-gray-800 shadow-2xl overflow-y-auto max-h-[85vh] custom-scrollbar"
          >
            <div className="flex flex-col px-6 py-8 gap-4">
              <div className="flex flex-col gap-2">
                {navLinks.map((link, index) => (
                  <motion.div
                    initial={{ opacity: 0, x: isRtl ? 20 : -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.4, ease: customEase, delay: index * 0.05 }}
                    key={index}
                    className="flex flex-col"
                  >
                    {/* لینک اصلی موبایل */}
                    <Link 
                      href={(link.isProductsDropdown || link.subLinks || link.isBrandsMenu) ? "#" : link.href}
                      className="text-xl font-black text-gray-900 dark:text-white hover:text-amber-500 flex items-center justify-between py-3"
                      onClick={(e) => {
                        if (link.isProductsDropdown || link.subLinks || link.isBrandsMenu) {
                          e.preventDefault();
                          setExpandedMobileMenu(expandedMobileMenu === link.key ? null : link.key);
                          setExpandedNestedMobile(null);
                        } else {
                          setIsMobileMenuOpen(false);
                        }
                      }}
                    >
                      {isRtl ? link.fa : link.en}
                      {(link.isProductsDropdown || link.isBrandsMenu || link.subLinks) && (
                        <ChevronDown size={18} className={`text-gray-400 transition-transform ${expandedMobileMenu === link.key ? 'rotate-180 text-amber-500' : ''}`} />
                      )}
                    </Link>

                    {/* زیرمنوی کشویی محصولات (دو سطحی - فیلتر سریع) */}
                    <AnimatePresence>
                      {expandedMobileMenu === link.key && link.isProductsDropdown && (
                        <motion.div 
                          initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.3, ease: customEase }}
                          className="overflow-hidden mb-2"
                        >
                          <div className="flex flex-col gap-2 py-2 px-3 bg-gray-50 dark:bg-gray-800/50 rounded-2xl border border-gray-100 dark:border-gray-800">
                            
                            {productsNestedMenu.map((nested) => (
                              <div key={nested.id} className="flex flex-col">
                                <button 
                                  onClick={() => setExpandedNestedMobile(expandedNestedMobile === nested.id ? null : nested.id)}
                                  className={`flex items-center justify-between py-3 px-3 text-sm font-bold rounded-xl transition-colors ${expandedNestedMobile === nested.id ? 'bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-400' : 'text-gray-700 dark:text-gray-300'}`}
                                >
                                  <div className="flex items-center gap-2">
                                    <span className={`${expandedNestedMobile === nested.id ? 'text-amber-500' : 'text-gray-400'}`}>{nested.icon}</span>
                                    {isRtl ? nested.fa : nested.en}
                                  </div>
                                  <ChevronDown size={14} className={`transition-transform ${expandedNestedMobile === nested.id ? 'rotate-180' : ''}`} />
                                </button>
                                
                                {/* سطح سوم آکاردئون (لینک به فیلترها) */}
                                <AnimatePresence>
                                  {expandedNestedMobile === nested.id && (
                                    <motion.div 
                                      initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                                      className="overflow-hidden"
                                    >
                                      <div className="flex flex-col gap-1 px-4 py-2 border-l-2 rtl:border-l-0 rtl:border-r-2 border-amber-400/50 mr-4 rtl:mr-6 ltr:ml-6 mt-1 mb-2">
                                        {nested.items.map((item, idx) => (
                                          <Link 
                                            key={idx} 
                                            href={`/${locale}/products?${nested.filterKey}=${encodeURIComponent(item)}`} 
                                            onClick={() => setIsMobileMenuOpen(false)} 
                                            className="text-sm font-bold text-gray-500 dark:text-gray-400 hover:text-amber-600 dark:hover:text-amber-400 py-2"
                                          >
                                            {item}
                                          </Link>
                                        ))}
                                      </div>
                                    </motion.div>
                                  )}
                                </AnimatePresence>
                              </div>
                            ))}

                            <div className="border-t border-gray-200 dark:border-gray-700 mt-1 pt-1 pb-1">
                              <Link 
                                href={`/${locale}/products`} 
                                onClick={() => setIsMobileMenuOpen(false)}
                                className="flex items-center gap-2 px-3 py-3 text-sm font-black text-gray-900 dark:text-white"
                              >
                                <LayoutGrid size={16} className="text-amber-500" />
                                {isRtl ? "تمام محصولات" : "All Products"}
                              </Link>
                            </div>

                          </div>
                        </motion.div>
                      )}

                      {/* زیرمنوی کشویی مستقل برندها (لینک به صفحات اختصاصی) */}
                      {expandedMobileMenu === link.key && link.isBrandsMenu && (
                        <motion.div 
                          initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.3, ease: customEase }}
                          className="overflow-hidden mb-2"
                        >
                          <div className="flex flex-col gap-2 py-3 px-4 bg-gray-50 dark:bg-gray-800/50 rounded-2xl border border-gray-100 dark:border-gray-800">
                            {brandsDB.map((brand) => (
                              <Link 
                                key={brand.id} 
                                href={`/${locale}/brands/${brand.slug}`} 
                                onClick={() => setIsMobileMenuOpen(false)} 
                                className="text-sm font-bold text-gray-600 dark:text-gray-300 py-2 hover:text-amber-500"
                              >
                                {isRtl ? brand.faName : brand.enName}
                              </Link>
                            ))}
                            <Link 
                              href={`/${locale}/brands`} 
                              onClick={() => setIsMobileMenuOpen(false)} 
                              className="text-xs font-black text-amber-500 py-2 mt-2 border-t border-gray-200 dark:border-gray-700"
                            >
                              {isRtl ? "مشاهده همه برندها" : "View all brands"}
                            </Link>
                          </div>
                        </motion.div>
                      )}

                      {/* زیرمنوی کشویی درباره ما */}
                      {expandedMobileMenu === link.key && link.subLinks && (
                        <motion.div 
                          initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.3, ease: customEase }}
                          className="overflow-hidden mb-2"
                        >
                          <div className="flex flex-col gap-2 py-3 px-4 bg-gray-50 dark:bg-gray-800/50 rounded-2xl border border-gray-100 dark:border-gray-800">
                            {link.subLinks.map((sub) => (
                              <Link 
                                key={sub.id} 
                                href={`/${locale}/about#${sub.id}`} 
                                onClick={(e) => handleAnchorClick(e, sub.id)} 
                                className="text-sm font-bold text-gray-600 dark:text-gray-300 py-2 hover:text-amber-500"
                              >
                                {isRtl ? sub.fa : sub.en}
                              </Link>
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                  </motion.div>
                ))}
              </div>
              
              <hr className="border-gray-100 dark:border-gray-800/50 my-2" />
              
              <div className="flex flex-col gap-6">
                <div className="flex justify-between items-center bg-gray-50 dark:bg-gray-900 p-4 rounded-2xl">
                  <span className="font-bold text-gray-600 dark:text-gray-300 text-sm">
                    {isRtl ? "تنظیمات کاربری" : "User Settings"}
                  </span>
                  <div className="flex gap-2">
                    <ThemeToggle />
                    <LangSwitch />
                  </div>
                </div>
          
                <Link 
                  href={`/${locale}/admin/login`} 
                  className="flex items-center justify-center gap-2 w-full py-4 bg-red-600 text-white hover:bg-amber-400 hover:text-black rounded-2xl font-black transition-all duration-300 shadow-lg shadow-red-600/20"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <ShieldCheck size={20} />
                  <span>{isRtl ? "ورود به پنل مدیریت" : "Admin Panel"}</span>
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}