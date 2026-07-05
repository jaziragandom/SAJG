"use client";

import React, { useState, useEffect } from "react";
import { motion, useScroll, useMotionValueEvent, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useLocale } from "next-intl";
import { 
  Menu, X, ShieldCheck, ChevronDown, ChevronLeft, ChevronRight,
  ArrowLeft, ArrowRight, Wheat, Droplets, Sparkles, Tag, LayoutGrid, Store
} from "lucide-react";
import ThemeToggle from "./ThemeToggle";
import LangSwitch from "./LangSwitch";
import { getNavbarData } from "@/actions/navbar";

interface NavbarProps {
  brands?: any[];
  categories?: any[];
  siteLogo?: string | null;
}

export default function Navbar({ 
  brands: initialBrands = [], 
  categories: initialCategories = [], 
  siteLogo: initialSiteLogo = null 
}: NavbarProps) {
  const locale = useLocale();
  const isRtl = locale === 'fa';

  const customEase: [number, number, number, number] = [0.22, 1, 0.36, 1];

  const [brands, setBrands] = useState<any[]>(initialBrands);
  const [categories, setCategories] = useState<any[]>(initialCategories);
  const [siteLogo, setSiteLogo] = useState<string | null>(initialSiteLogo);

  const { scrollY } = useScroll();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isHidden, setIsHidden] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  const [hoveredLink, setHoveredLink] = useState<string | null>(null);
  const [hoveredNestedLink, setHoveredNestedLink] = useState<string | null>(null);
  
  const [expandedMobileMenu, setExpandedMobileMenu] = useState<string | null>(null); 
  const [expandedNestedMobile, setExpandedNestedMobile] = useState<string | null>(null);

  // استیت برای مدیریت خطای لود عکس برندها در ناوبار
  const [imgError, setImgError] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const fetchNav = async () => {
      const res = await getNavbarData();
      if (res.success && res.data) {
        setBrands(res.data.brands || []);
        setCategories(res.data.categories || []);
        setSiteLogo(res.data.siteLogo || null);
      }
    };
    fetchNav();
  }, []);

  useMotionValueEvent(scrollY, "change", (latest) => {
    const previous = scrollY.getPrevious() ?? 0;
    if (latest > 50) setIsScrolled(true);
    else setIsScrolled(false);
    if (latest > 150 && latest > previous) setIsHidden(true); 
    else setIsHidden(false); 
  });

  // قفل کردن اسکرول صفحه اصلی هنگام باز بودن منوی موبایل
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMobileMenuOpen]);

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

  const mainCategories = categories.filter(c => c.iconName === 'main');

  const dynamicProductsMenu = mainCategories.map((mainCat, index) => {
    const subCats = categories.filter(c => c.parent === mainCat.slug || c.parent === mainCat._id);
    const icons = [<Droplets size={16} />, <Sparkles size={16} />, <Wheat size={16} />, <LayoutGrid size={16} />];
    const Icon = icons[index % icons.length];

    return {
      id: mainCat.slug,
      fa: mainCat.faName,
      en: mainCat.enName,
      icon: Icon,
      items: subCats,
      filterKey: "category"
    };
  });

  const productsNestedMenu = [
    ...dynamicProductsMenu,
    {
      id: "brands",
      fa: "برندها",
      en: "Brands",
      icon: <Tag size={16} />,
      items: brands, 
      filterKey: "brand"
    }
  ];

  const navLinks = [
    { key: "home", fa: "صفحه اصلی", en: "Home", href: `/${locale}` },
    { key: "products", fa: "محصولات", en: "Products", href: `/${locale}/products`, isProductsDropdown: true },
    { key: "brands", fa: "برندها", en: "Brands", href: `/${locale}/brands`, isBrandsMenu: true },
    { key: "gallery", fa: "گالری", en: "Gallery", href: `/${locale}/gallery` },
    { key: "blog", fa: "مجله گندم", en: "Blog", href: `/${locale}/blog` },
    { key: "about", fa: "درباره ما", en: "About Us", href: `/${locale}/about`, subLinks: [
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
      // در نمای موبایل، اگر منو باز باشد، ناوبار نباید هاید شود
      animate={{ y: (isHidden && !isMobileMenuOpen) ? "-100%" : 0 }}
      transition={{ duration: 0.35, ease: customEase }}
      className={`fixed top-0 left-0 w-full transition-all duration-500 ${isMobileMenuOpen ? "z-100" : "z-50"} ${
        isScrolled || isMobileMenuOpen
          ? "bg-white/80 dark:bg-gray-950/80 backdrop-blur-xl border-b border-gray-200/50 dark:border-gray-800/50 py-3 shadow-sm" 
          : "bg-white/40 dark:bg-gray-950/40 backdrop-blur-md border-b border-gray-200/20 dark:border-gray-800/20 py-5"
      }`}
    >
  
      <div className="container mx-auto px-4 md:px-8 flex items-center justify-between">
        
        <Link href={`/${locale}`} className="text-2xl font-black tracking-tighter flex items-center gap-3 z-50 group">
          {siteLogo ? (
            <img 
              src={siteLogo} 
              alt="Logo" 
              className="h-11 w-auto max-w-45 object-contain group-hover:scale-105 transition-transform duration-300" 
            />
          ) : (
            <span className="w-10 h-10 bg-amber-400 text-gray-900 rounded-xl flex items-center justify-center group-hover:scale-105 transition-transform duration-300">
              <Wheat size={24} strokeWidth={2.5} />
            </span>
          )}
          <span className="flex gap-1">
            {isRtl ? (
              <>
                <span className="text-gray-900 dark:text-white drop-shadow-sm transition-colors">جزیره</span>
                <span className="text-amber-400 drop-shadow-sm">گندم</span>
              </>
            ) : (
              <>
                <span className="text-gray-900 dark:text-white drop-shadow-sm transition-colors">JAZIRAH</span>
                <span className="text-amber-400 drop-shadow-sm">GANDUM</span>
              </>
            )}
          </span>
        </Link>

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

              {/* === منوی آبشاری محصولات و زیرمجموعه‌های آن === */}
              <AnimatePresence>
                {link.isProductsDropdown && hoveredLink === link.key && (
                  <motion.div
                    initial={{ opacity: 0, y: 15, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.98 }}
                    transition={{ duration: 0.3, ease: customEase }}
                    className="absolute top-full pt-4 rtl:right-0 rtl:left-auto ltr:left-0 ltr:right-auto w-64 cursor-default z-50"
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

                          <AnimatePresence>
                            {hoveredNestedLink === nested.id && nested.items.length > 0 && (
                              <motion.div
                                initial={{ opacity: 0, x: isRtl ? 10 : -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: isRtl ? 5 : -5 }}
                                transition={{ duration: 0.3, ease: customEase }}
                                // جهت‌دهی صحیح: فارسی به سمت چپ (right-full)، انگلیسی به راست (left-full)
                                className="absolute top-0 rtl:right-full rtl:mr-2 rtl:left-auto ltr:left-full ltr:ml-2 ltr:right-auto w-56 z-50"
                              >
                                <div className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-2xl border border-gray-100 dark:border-gray-800 rounded-2xl p-2 shadow-2xl flex flex-col gap-1">
                                  {nested.items.map((item: any, idx: number) => (
                                    <Link 
                                      key={idx} 
                                      href={`/${locale}/products?${nested.filterKey}=${encodeURIComponent(item.slug)}`}
                                      className="px-4 py-2 text-sm font-bold text-gray-600 dark:text-gray-300 hover:text-amber-600 dark:hover:text-amber-400 hover:bg-gray-50 dark:hover:bg-gray-800/50 rounded-xl transition-colors"
                                    >
                                      {isRtl ? item.faName : item.enName}
                                    </Link>
                                  ))}
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      ))}

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

              {/* === منوی آبشاری مستقل برندها با لوگوها === */}
              <AnimatePresence>
                {link.isBrandsMenu && hoveredLink === link.key && (
                  <motion.div
                    initial={{ opacity: 0, y: 15, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.98 }}
                    transition={{ duration: 0.3, ease: customEase }}
                    className="absolute top-full pt-4 rtl:right-0 rtl:left-auto ltr:left-0 ltr:right-auto w-56 cursor-default z-40"
                  >
                    <div className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-2xl border border-gray-100 dark:border-gray-800 rounded-3xl p-3 shadow-2xl flex flex-col gap-1">
                      
                      {brands.map((brand) => {
                        const brandId = brand._id || brand.slug;
                        const hasError = imgError?.[brandId];
                        
                        // جستجوی جامع برای پیدا کردن لینک عکس در ساختارهای مختلف دیتابیس
                        const currentLogo = 
                                (isRtl ? brand.logoFa : brand.logoEn) || 
                                brand.logo || 
                                brand.images?.logo || 
                                brand.images?.main || 
                                brand.image || 
                                brand.icon;
                        
                        return (
                          <Link 
                            key={brandId} 
                            href={`/${locale}/brands/${brand.slug}`}
                            className="flex items-center justify-between px-4 py-2 text-sm font-bold text-gray-600 dark:text-gray-300 hover:text-amber-500 dark:hover:text-amber-400 hover:bg-gray-50 dark:hover:bg-gray-800/50 rounded-xl transition-colors group"
                          >
                            {/* نام برند */}
                            <span>{isRtl ? brand.faName : brand.enName}</span>
                            
                            {/* لوگوی برند */}
                            <div className="w-6 h-6 shrink-0 flex items-center justify-center opacity-80 group-hover:opacity-100 transition-opacity">
                              {currentLogo && !hasError ? (
                                <img 
                                  src={currentLogo} 
                                  alt={isRtl ? brand.faName : brand.enName} 
                                  className="w-full h-full object-contain drop-shadow-sm"
                                  onError={(e) => {
                                    e.currentTarget.style.display = 'none';
                                    if (typeof setImgError === 'function') {
                                      setImgError(prev => ({ ...prev, [brandId]: true }));
                                    }
                                  }}
                                />
                              ) : (
                                <Store className="text-gray-400 dark:text-gray-500 w-full h-full p-0.5" />
                              )}
                            </div>
                          </Link>
                        );
                      })}

                      <div className="border-t border-gray-100 dark:border-gray-800 mt-2 pt-2">
                        <Link 
                          href={`/${locale}/brands`} 
                          className="px-4 py-3 text-xs font-bold text-amber-500 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-500/10 rounded-xl flex items-center gap-1 justify-center transition-colors"
                        >
                          {isRtl ? "مشاهده همه برندها" : "View all brands"}
                          {isRtl ? <ArrowLeft size={14} /> : <ArrowRight size={14} />}
                        </Link>
                      </div>

                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* === منوی آبشاری درباره ما === */}
              <AnimatePresence>
                {link.subLinks && hoveredLink === link.key && (
                  <motion.div
                    initial={{ opacity: 0, y: 15, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.98 }}
                    transition={{ duration: 0.3, ease: customEase }}
                    className="absolute top-full pt-4 rtl:right-0 rtl:left-auto ltr:left-0 ltr:right-auto w-60 cursor-default z-40"
                  >
                    <div className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-2xl border border-gray-100 dark:border-gray-800 rounded-3xl p-3 shadow-2xl flex flex-col gap-1">
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

        <button 
          className="md:hidden text-gray-900 dark:text-white z-50 p-2 bg-gray-100/50 dark:bg-gray-800/50 rounded-full backdrop-blur-md" 
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "100vh" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.4, ease: customEase }}
            className="md:hidden fixed top-18 left-0 w-full h-[calc(100vh-72px)] bg-white/95 dark:bg-gray-950/95 backdrop-blur-2xl border-t border-gray-100 dark:border-gray-800 shadow-2xl overflow-y-auto custom-scrollbar z-100"
          >
            <div className="flex flex-col px-6 py-8 gap-4 pb-24">
              <div className="flex flex-col gap-2">
                {navLinks.map((link, index) => (
                  <motion.div
                    initial={{ opacity: 0, x: isRtl ? 20 : -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.4, ease: customEase, delay: index * 0.05 }}
                    key={index}
                    className="flex flex-col"
                  >
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
                                
                                <AnimatePresence>
                                  {expandedNestedMobile === nested.id && (
                                    <motion.div 
                                      initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                                      className="overflow-hidden"
                                    >
                                      <div className="flex flex-col gap-1 px-4 py-2 border-l-2 rtl:border-l-0 rtl:border-r-2 border-amber-400/50 mr-4 rtl:mr-6 ltr:ml-6 mt-1 mb-2">
                                        {nested.items.map((item: any, idx: number) => (
                                          <Link 
                                            key={idx} 
                                            href={`/${locale}/products?${nested.filterKey}=${encodeURIComponent(item.slug)}`} 
                                            onClick={() => setIsMobileMenuOpen(false)} 
                                            className="text-sm font-bold text-gray-500 dark:text-gray-400 hover:text-amber-600 dark:hover:text-amber-400 py-2 flex items-center justify-between"
                                          >
                                            <span>{isRtl ? item.faName : item.enName}</span>
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

                      {expandedMobileMenu === link.key && link.isBrandsMenu && (
                        <motion.div 
                          initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.3, ease: customEase }}
                          className="overflow-hidden mb-2"
                        >
                          <div className="flex flex-col gap-2 py-3 px-4 bg-gray-50 dark:bg-gray-800/50 rounded-2xl border border-gray-100 dark:border-gray-800">
                            {brands.map((brand) => {
                              const brandId = brand._id || brand.slug;
                              const hasError = imgError?.[brandId];
                              
                              // جستجوی جامع برای نمای موبایل
                              const currentLogo = 
                                (isRtl ? brand.logoFa : brand.logoEn) || 
                                brand.logo || 
                                brand.images?.logo || 
                                brand.images?.main || 
                                brand.image || 
                                brand.icon;
                              
                              return (
                                <Link 
                                  key={brandId} 
                                  href={`/${locale}/brands/${brand.slug}`} 
                                  onClick={() => setIsMobileMenuOpen(false)} 
                                  className="text-sm font-bold text-gray-600 dark:text-gray-300 py-2 hover:text-amber-500 flex items-center justify-between group"
                                >
                                  <span>{isRtl ? brand.faName : brand.enName}</span>
                                  
                                  <div className="w-6 h-6 shrink-0 flex items-center justify-center opacity-80 group-hover:opacity-100 transition-opacity">
                                    {currentLogo && !hasError ? (
                                      <img 
                                        src={currentLogo} 
                                        alt={isRtl ? brand.faName : brand.enName} 
                                        className="w-full h-full object-contain"
                                        onError={(e) => {
                                          e.currentTarget.style.display = 'none';
                                          if (typeof setImgError === 'function') {
                                            setImgError(prev => ({ ...prev, [brandId]: true }));
                                          }
                                        }}
                                      />
                                    ) : (
                                      <Store className="text-gray-400 dark:text-gray-500 w-full h-full p-0.5" />
                                    )}
                                  </div>
                                </Link>
                              );
                            })}

                            <Link 
                               href={`/${locale}/brands`} 
                              onClick={() => setIsMobileMenuOpen(false)} 
                              className="text-xs font-black text-amber-500 py-2 mt-2 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between"
                             >
                              {isRtl ? "مشاهده همه برندها" : "View all brands"}
                              {isRtl ? <ArrowLeft size={14} /> : <ArrowRight size={14} />}
                            </Link>
                          </div>
                        </motion.div>
                      )}

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