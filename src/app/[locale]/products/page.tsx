"use client";
import { useSearchParams } from "next/navigation";
import React, { useState, useMemo, useEffect, useRef } from "react";
import { motion, AnimatePresence, useScroll, useMotionValueEvent } from "framer-motion";
import { useLocale } from "next-intl";
import { 
  Search, Filter, X, Star, ArrowRight, CheckCircle2, ChevronDown, Package, Droplets, Sparkles, Tag, Activity, LayoutGrid
} from "lucide-react";
import { MOCK_PRODUCTS, MAIN_CATEGORIES, FILTER_GROUPS } from "../../../lib/mockData";

export default function ProductsPage() {
  const locale = useLocale();
  const isRtl = locale === 'fa';

  // --- گراف سرعت اختصاصی (مورف بسیار نرم و بدون پرش) ---
  const customEase: [number, number, number, number] = [0.22, 1, 0.36, 1];

  // --- ماشین وضعیت برای سناریوی ورود اولیه (ورود متوالی) ---
  const [introStage, setIntroStage] = useState("hidden");

  useEffect(() => {
    const runIntro = async () => {
      setIntroStage("titleIn");
      await new Promise(r => setTimeout(r, 400));
      setIntroStage("searchBoxIn");
      await new Promise(r => setTimeout(r, 400));
      setIntroStage("pillsIn");
    };
    runIntro();
  }, []);

  const isTitleIn = introStage !== "hidden";
  const isSearchBoxIn = isTitleIn && introStage !== "titleIn";
  const isPillsIn = isSearchBoxIn && introStage !== "searchBoxIn";

  // --- سیستم هوشمند اسکرول و هماهنگی با ناوبار ---
  // --- سیستم هوشمند اسکرول و چسبندگی مغناطیسی (Magnetic Snap) ---
  const { scrollY } = useScroll();
  const [isScrolled, setIsScrolled] = useState(false);
  const [scrollDirection, setScrollDirection] = useState<"up" | "down">("up");
  const isProgrammaticScroll = useRef(false);

  useMotionValueEvent(scrollY, "change", (current) => {
    if (isProgrammaticScroll.current) return; // در زمان اسکرول خودکار دخالت نکن
    
    const previous = scrollY.getPrevious() || 0;
    const diff = current - previous;
    
    if (Math.abs(diff) > 10) {
      if (diff > 0 && current > 60) setScrollDirection("down");
      else if (diff < 0) setScrollDirection("up");
    }

    // تعیین نقطه ماشه (Trigger Point) برای تغییر حالت
    if (current > 120 && !isScrolled) setIsScrolled(true);
    else if (current <= 120 && isScrolled) setIsScrolled(false);
  });

  // افکت اسکرول خودکار و نرم به سمت بالا و پایین
  useEffect(() => {
    if (!isSearchBoxIn) return; // در زمان لود اولیه صفحه اجرا نشود
    
    isProgrammaticScroll.current = true;
    if (isScrolled) {
      window.scrollTo({ top: 180, behavior: "smooth" }); // پرتاب نرم به زیر ناوبار
    } else {
      window.scrollTo({ top: 0, behavior: "smooth" }); // پرتاب نرم به بالای صفحه
    }
    
    // آزادسازی قفل اسکرول بعد از اتمام انیمیشن
    const timer = setTimeout(() => {
      isProgrammaticScroll.current = false;
    }, 600);
    return () => clearTimeout(timer);
  }, [isScrolled, isSearchBoxIn]);

  // --- استیت‌های جستجو و فیلتر ---
  const [searchQuery, setSearchQuery] = useState("");
  const [activeMainCat, setActiveMainCat] = useState("all");
  const [isMegaMenuOpen, setIsMegaMenuOpen] = useState(false);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [selectedBevTypes, setSelectedBevTypes] = useState<string[]>([]);
  const [selectedSnackTypes, setSelectedSnackTypes] = useState<string[]>([]);
  const [selectedPackaging, setSelectedPackaging] = useState<string[]>([]);
  const [selectedFlavors, setSelectedFlavors] = useState<string[]>([]);
  const [selectedWeights, setSelectedWeights] = useState<string[]>([]);
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);
  // --- دریافت پارامترهای فیلتر از URL (ارسال شده توسط ناوبار) ---
  const searchParams = useSearchParams();

  useEffect(() => {
    const brandQ = searchParams.get('brand');
    const bevTypeQ = searchParams.get('bevType');
    const snackTypeQ = searchParams.get('snackType');

    // اگر هیچ پارامتری در URL نبود، کاری انجام نده تا فیلترهای درون صفحه‌ای (مگامنو) به هم نریزند
    if (!brandQ && !bevTypeQ && !snackTypeQ) return;

    // ریست کردن تمام استیت‌های فیلتر و جایگزینی مطلق با مقدار جدید از ناوبار
    setSelectedBrands(brandQ ? [brandQ] : []);
    setSelectedBevTypes(bevTypeQ ? [bevTypeQ] : []);
    setSelectedSnackTypes(snackTypeQ ? [snackTypeQ] : []);
    
    // پاک کردن سایر فیلترهای متفرقه برای جلوگیری از تداخل
    setSelectedPackaging([]);
    setSelectedFlavors([]);
    setSelectedWeights([]);
    setSelectedStatuses([]);
    setSearchQuery(""); // پاک کردن سرچ متنی

    // تغییر اتوماتیک تب دسته‌بندی اصلی (قرص‌های بالای صفحه) هماهنگ با فیلتر ناوبار
    if (bevTypeQ) setActiveMainCat("beverage");
    else if (snackTypeQ) setActiveMainCat("snack");
    else if (brandQ) setActiveMainCat("all");

  }, [searchParams]);

  const headerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (headerRef.current && !headerRef.current.contains(event.target as Node)) {
        setIsMegaMenuOpen(false);
        setIsSearchFocused(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredProducts = useMemo(() => {
    return MOCK_PRODUCTS.filter((product) => {
      const matchSearch = product.faTitle.includes(searchQuery) || 
                          product.enTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          product.brand.includes(searchQuery);
      
      const matchMainCat = activeMainCat === "all" || product.mainCatId === activeMainCat;
      const matchBrand = selectedBrands.length === 0 || selectedBrands.includes(product.brand);
      const matchBevType = selectedBevTypes.length === 0 || (product.beverage_type && selectedBevTypes.includes(product.beverage_type));
      const matchSnackType = selectedSnackTypes.length === 0 || (product.snack_type && selectedSnackTypes.includes(product.snack_type));
      const matchPackage = selectedPackaging.length === 0 || selectedPackaging.includes(product.packaging);
      const matchFlavor = selectedFlavors.length === 0 || selectedFlavors.includes(product.flavor);
      const matchWeight = selectedWeights.length === 0 || (product.weight && selectedWeights.includes(product.weight));
      const matchStatus = selectedStatuses.length === 0 || (product.status && selectedStatuses.includes(product.status));

      return matchSearch && matchMainCat && matchBrand && matchBevType && matchSnackType && matchPackage && matchFlavor && matchWeight && matchStatus;
    });
  }, [searchQuery, activeMainCat, selectedBrands, selectedBevTypes, selectedSnackTypes, selectedPackaging, selectedFlavors, selectedWeights, selectedStatuses]);

  const handleToggleFilter = (type: string, value: string) => {
    if (type === "brand") setSelectedBrands(p => p.includes(value) ? p.filter(v => v !== value) : [...p, value]);
    if (type === "bevType") setSelectedBevTypes(p => p.includes(value) ? p.filter(v => v !== value) : [...p, value]);
    if (type === "snackType") setSelectedSnackTypes(p => p.includes(value) ? p.filter(v => v !== value) : [...p, value]);
    if (type === "pack") setSelectedPackaging(p => p.includes(value) ? p.filter(v => v !== value) : [...p, value]);
    if (type === "flavor") setSelectedFlavors(p => p.includes(value) ? p.filter(v => v !== value) : [...p, value]);
    if (type === "weight") setSelectedWeights(p => p.includes(value) ? p.filter(v => v !== value) : [...p, value]);
    if (type === "status") setSelectedStatuses(p => p.includes(value) ? p.filter(v => v !== value) : [...p, value]);
  };

  const clearAllFilters = () => {
    setSearchQuery("");
    setActiveMainCat("all");
    setSelectedBrands([]);
    setSelectedBevTypes([]);
    setSelectedSnackTypes([]);
    setSelectedPackaging([]);
    setSelectedFlavors([]);
    setSelectedWeights([]);
    setSelectedStatuses([]);
    setIsMegaMenuOpen(false);
  };

  const totalActiveFilters = selectedBrands.length + selectedBevTypes.length + selectedSnackTypes.length + 
                             selectedPackaging.length + selectedFlavors.length + selectedWeights.length + 
                             selectedStatuses.length + (activeMainCat !== "all" ? 1 : 0);

  const isExpanded = isSearchFocused || isMegaMenuOpen || searchQuery.length > 0;

  const getCategoryLabel = (id: string, defaultLabel: string) => {
    if (id === 'all') return isRtl ? 'همه محصولات' : 'All Products';
    if (id === 'beverage') return isRtl ? 'نوشیدنی‌ها' : 'Beverages';
    if (id === 'snack') return isRtl ? 'اسنک و تنقلات' : 'Snacks';
    if (id === 'bakery') return isRtl ? 'کیک و بیسکویت' : 'Bakery';
    return defaultLabel;
  };

  return (
    <main className="w-full pb-32" dir={isRtl ? "rtl" : "ltr"}>
      
      {/* --- منطقه تایتل و توضیحات --- */}
      <motion.div 
        animate={{ 
          opacity: isScrolled ? 0 : 1,
          y: isScrolled ? -20 : 0,
          pointerEvents: isScrolled ? "none" : "auto"
        }}
        transition={{ duration: 0.5, ease: customEase }}
        // اینجا پدینگ ثابت است تا پرش ایجاد نشود
        className="w-full pt-28 md:pt-36 pb-6 px-4 text-center bg-transparent flex flex-col items-center relative z-10"
      >

        <motion.h1 
          initial={false}
          animate={{ opacity: isTitleIn ? 1 : 0, x: isTitleIn ? 0 : (isRtl ? 40 : -40) }}
          transition={{ duration: 0.8, ease: customEase }}
          className="text-3xl md:text-5xl font-black text-gray-900 dark:text-white tracking-tight mb-3"
        >
          {isRtl ? "ویترین محصولات " : "Products of "}
          <span className="text-amber-500">{isRtl ? "جزیره گندم" : "Wheat Island"}</span>
        </motion.h1>
        
        <motion.p 
          initial={false}
          animate={{ opacity: isTitleIn ? 1 : 0, x: isTitleIn ? 0 : (isRtl ? -40 : 40) }}
          transition={{ duration: 0.8, ease: customEase, delay: 0.1 }}
          className="text-sm font-bold text-gray-500 dark:text-gray-400"
        >
          {isRtl ? "جستجو در بین ده‌ها محصول، برند و طعم متنوع" : "Search among dozens of products, brands, and flavors"}
        </motion.p>
      </motion.div>

      {/* --- منطقه سرچ‌بار و فیلترها (Sticky Header هوشمند) --- */}
      <div 
        ref={headerRef}
        // ۱. حل مشکل روی هم افتادن: بازگرداندن شرط scrollDirection برای فاصله از ناوبار
        className={`sticky w-full transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] px-4 md:px-8 z-50 ${
          isScrolled 
            ? `bg-white/95 dark:bg-gray-950/95 backdrop-blur-xl shadow-sm border-b border-gray-200/60 dark:border-gray-800/60 ${scrollDirection === 'up' ? 'top-16 lg:top-18 py-3' : 'top-0 py-3'}` 
            : 'top-16 lg:top-18 bg-transparent pb-4'
        }`}
      >
        <div className="mx-auto w-full flex flex-col items-center relative z-20">
          
          {/* ۲. حل مشکل انیمیشن: انتقال مورف به CSS بومی مرورگر */}
          <motion.div 
            initial={false}
            animate={{
              opacity: isSearchBoxIn ? 1 : 0,
              y: isSearchBoxIn ? 0 : 30
              // maxWidth و borderRadius از اینجا حذف شدند
            }}
            transition={{ duration: 0.6, ease: customEase }}
            // استفاده از کلاس‌های اختصاصی انتقال CSS فقط برای عرض و انحنا تا با Framer Motion تداخل نکند
            className={`relative flex items-center bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 mx-auto w-full focus-within:border-amber-400 focus-within:ring-2 focus-within:ring-amber-400/20 overflow-hidden transition-[max-width,border-radius,height,box-shadow] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
              isScrolled ? 'shadow-md' : 'shadow-lg'
            }`}
            // مدیریت عرض و انحنا توسط استایل خطی CSS 
            style={{ 
              height: isScrolled ? "56px" : "52px",
              maxWidth: isScrolled ? "100%" : "768px",
              borderRadius: isScrolled ? "1.25rem" : "9999px"
            }}
          >
            <div className={`px-4 text-gray-400 shrink-0 transition-all duration-500 ${isScrolled ? 'md:px-6' : ''}`}>
              <Search size={22} />
            </div>
            
            <div className="relative z-10 flex grow items-center h-full pr-1">
              <input 
                type="text" 
                value={searchQuery}
                onFocus={() => setIsSearchFocused(true)}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={isRtl ? "نام محصول، برند یا مشخصه خاصی را وارد کنید..." : "Search product, brand, or feature..."}
                className="grow bg-transparent border-none outline-none text-gray-900 dark:text-white text-sm md:text-base font-bold placeholder:text-gray-400 min-w-0"
              />

              <div className={`flex items-center gap-2 border-gray-200 dark:border-gray-700 h-8 ${isRtl ? 'border-r pr-3' : 'border-l pl-3'} shrink-0 ${isScrolled ? 'md:mx-2' : ''}`}>
                {totalActiveFilters > 0 && (
                  <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ duration: 0.3, ease: customEase }} className="flex items-center justify-center w-6 h-6 bg-amber-500 text-gray-900 rounded-full text-[10px] font-black">
                    {totalActiveFilters}
                  </motion.div>
                )}
                <button 
                  type="button"
                  onClick={() => setIsMegaMenuOpen(!isMegaMenuOpen)}
                  className={`flex items-center gap-1.5 px-3 py-2 md:px-4 mx-1 rounded-full font-black text-[11px] md:text-sm transition-all overflow-hidden ${
                    isMegaMenuOpen || totalActiveFilters > 0 
                      ? 'bg-amber-400 text-gray-900 shadow-sm' 
                      : 'bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200'
                  }`}
                >
                  <Filter size={14} className="shrink-0" /> 
                  <AnimatePresence mode="wait">
                    {isExpanded && (
                      <motion.span 
                        initial={{ opacity: 0, width: 0 }} animate={{ opacity: 1, width: "auto" }} exit={{ opacity: 0, width: 0 }}
                        transition={{ duration: 0.4, ease: customEase }}
                        className="whitespace-nowrap"
                      >
                        {isRtl ? "فیلتر پیشرفته" : "Advanced Filter"}
                      </motion.span>
                    )}
                  </AnimatePresence>
                  {isExpanded && <ChevronDown size={12} className={`shrink-0 transition-transform ${isMegaMenuOpen ? 'rotate-180' : ''}`} />}
                </button>
              </div>
            </div>
          </motion.div>

          {/* دکمه‌های زیرین (فقط وقتی اسکرول نشده است) */}
          <AnimatePresence>
            {!isScrolled && (
              <motion.div 
                initial={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0, transition: { duration: 0.3, ease: customEase } }}
                className="w-full overflow-hidden flex items-center justify-center pt-4"
              >
                <div className="flex items-center justify-between md:justify-center gap-1.5 md:gap-2 w-full">
                  {MAIN_CATEGORIES.map((cat, index) => (
                    <motion.button 
                      key={cat.id}
                      initial={{ opacity: 0, y: -20 }}
                      animate={{ opacity: isPillsIn ? 1 : 0, y: isPillsIn ? 0 : -20 }}
                      transition={{ duration: 0.5, ease: customEase, delay: isPillsIn ? index * 0.05 : 0 }}
                      type="button"
                      onClick={() => setActiveMainCat(cat.id)}
                      className={`flex-1 md:flex-none px-2 md:px-5 py-2.5 rounded-xl md:rounded-full text-[10px] sm:text-xs font-black transition-colors border text-center flex items-center justify-center whitespace-nowrap ${
                        activeMainCat === cat.id 
                          ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900 border-transparent shadow-md' 
                          : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-amber-400'
                      }`}
                    >
                      {getCategoryLabel(cat.id, cat.label)}
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* مگامنو دراپ‌داون */}
          <AnimatePresence>
            {isMegaMenuOpen && (
              <motion.div 
                initial={{ opacity: 0, y: -15, scale: 0.98 }} 
                animate={{ opacity: 1, y: 0, scale: 1 }} 
                exit={{ opacity: 0, y: -10, scale: 0.98 }}
                transition={{ duration: 0.4, ease: customEase }}
                className={`absolute top-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-2xl z-50 max-h-[75vh] overflow-y-auto custom-scrollbar transition-all duration-300 ${
                  isScrolled 
                    ? 'left-0 right-0 w-full rounded-b-[1.5rem] border-t-0 px-6 md:px-12 py-8 mt-2' 
                    : 'left-0 right-0 w-full max-w-6xl rounded-3xl mt-4 p-6 md:p-8'
                }`}
              >
                <div className="flex justify-between items-center mb-6 border-b border-gray-100 dark:border-gray-800 pb-4">
                  <h3 className="text-base font-black text-gray-900 dark:text-white flex items-center gap-2">
                    <Filter className="text-amber-500" size={18} /> {isRtl ? "پنل فیلترهای پیشرفته" : "Advanced Filters Panel"}
                  </h3>
                  <button type="button" onClick={clearAllFilters} className="text-xs font-black text-red-500 hover:text-red-600 bg-red-50 dark:bg-red-500/10 px-4 py-2 rounded-xl transition-colors flex items-center gap-1">
                    <X size={14}/> {isRtl ? "ریست کامل" : "Reset All"}
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
                  
                  {/* انتقال دسته‌بندی‌های اصلی به داخل مگامنو */}
                  <div className="flex flex-col gap-2">
                    <h4 className="text-xs font-black text-gray-400 flex items-center gap-1 mb-1 uppercase">
                      <LayoutGrid size={14} /> {isRtl ? "دسته‌بندی اصلی" : "Main Category"}
                    </h4>
                    <div className="flex flex-wrap gap-1.5">
                      {MAIN_CATEGORIES.map(cat => (
                        <button 
                          key={cat.id} 
                          onClick={() => setActiveMainCat(cat.id)} 
                          className={`px-3 py-1.5 rounded-lg border text-xs font-bold transition-colors ${
                            activeMainCat === cat.id 
                              ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900 border-transparent' 
                              : 'bg-transparent border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-amber-400'
                          }`}
                        >
                          {activeMainCat === cat.id && <CheckCircle2 size={12} className="inline mr-1"/>}
                          {getCategoryLabel(cat.id, cat.label)}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex flex-col gap-2">
                    <h4 className="text-xs font-black text-gray-400 flex items-center gap-1 mb-1 uppercase">
                      <Tag size={14} /> {isRtl ? "برندها" : "Brands"}
                    </h4>
                    <div className="flex flex-wrap gap-1.5">
                      {FILTER_GROUPS.brands.map(v => (
                        <button key={v} onClick={() => handleToggleFilter("brand", v)} className={`px-3 py-1.5 rounded-lg border text-xs font-bold transition-colors ${selectedBrands.includes(v) ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900 border-transparent' : 'bg-transparent border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-amber-400'}`}>
                          {selectedBrands.includes(v) && <CheckCircle2 size={12} className="inline mr-1"/>} {v}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex flex-col gap-2">
                    <h4 className="text-xs font-black text-gray-400 flex items-center gap-1 mb-1 uppercase">
                      <Droplets size={14} /> {isRtl ? "نوشیدنی" : "Beverages"}
                    </h4>
                    <div className="flex flex-wrap gap-1.5">
                      {FILTER_GROUPS.beverage_type.map(v => (
                        <button key={v} onClick={() => handleToggleFilter("bevType", v)} className={`px-3 py-1.5 rounded-lg border text-xs font-bold transition-colors ${selectedBevTypes.includes(v) ? 'bg-amber-400 border-transparent text-gray-950' : 'bg-transparent border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-amber-400'}`}>{v}</button>
                      ))}
                    </div>
                  </div>

                  <div className="flex flex-col gap-2">
                    <h4 className="text-xs font-black text-gray-400 flex items-center gap-1 mb-1 uppercase">
                      <Sparkles size={14} /> {isRtl ? "تنقلات" : "Snacks"}
                    </h4>
                    <div className="flex flex-wrap gap-1.5">
                      {FILTER_GROUPS.snack_type.map(v => (
                        <button key={v} onClick={() => handleToggleFilter("snackType", v)} className={`px-3 py-1.5 rounded-lg border text-xs font-bold transition-colors ${selectedSnackTypes.includes(v) ? 'bg-amber-400 border-transparent text-gray-950' : 'bg-transparent border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-amber-400'}`}>{v}</button>
                      ))}
                    </div>
                  </div>

                  <div className="flex flex-col gap-4">
                    <div className="flex flex-col gap-2">
                      <h4 className="text-xs font-black text-gray-400 flex items-center gap-1 uppercase">
                        <Package size={14} /> {isRtl ? "بسته‌بندی" : "Packaging"}
                      </h4>
                      <div className="flex flex-wrap gap-1.5">
                        {FILTER_GROUPS.packaging.map(v => (
                          <button key={v} onClick={() => handleToggleFilter("pack", v)} className={`px-3 py-1.5 rounded-lg border text-xs font-bold transition-colors ${selectedPackaging.includes(v) ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900 border-transparent' : 'bg-transparent border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-amber-400'}`}>{v}</button>
                        ))}
                      </div>
                    </div>
                    <div className="flex flex-col gap-2">
                      <h4 className="text-xs font-black text-gray-400 flex items-center gap-1 uppercase">
                        <Activity size={14} /> {isRtl ? "وضعیت" : "Status"}
                      </h4>
                      <div className="flex flex-wrap gap-1.5">
                        {FILTER_GROUPS.status.map(v => (
                          <button key={v} onClick={() => handleToggleFilter("status", v)} className={`px-3 py-1.5 rounded-lg border text-xs font-bold transition-colors ${selectedStatuses.includes(v) ? 'bg-emerald-500 border-transparent text-white' : 'bg-transparent border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-emerald-500'}`}>{v}</button>
                        ))}
                      </div>
                    </div>
                  </div>

                </div>

                <div className="mt-8 pt-4 border-t border-gray-100 dark:border-gray-800 flex justify-end gap-3">
                  <button onClick={() => setIsMegaMenuOpen(false)} className="bg-amber-400 hover:bg-amber-500 text-gray-900 px-8 py-3 rounded-xl font-black text-xs flex items-center gap-2 shadow-md transition-colors">
                    {isRtl ? `اعمال فیلترها (${filteredProducts.length} محصول)` : `Apply Filters (${filteredProducts.length} Products)`}
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

        </div>
      </div>

      {/* --- منطقه گرید کارت‌های محصولات --- */}
      <div className="container mx-auto max-w-7xl px-4 md:px-8 mt-8">
        {filteredProducts.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6 lg:gap-8">
            <AnimatePresence>
              {filteredProducts.map((product, index) => (
                <motion.div
                  initial={{ opacity: 0, y: 60 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: false, amount: 0.15 }}
                  transition={{ duration: 0.7, ease: customEase, delay: (index % 4) * 0.05 }}
                  key={product.id}
                  className="group flex flex-col h-full"
                >
                  <a href={`/${locale}/products/${product.id}`} className="flex flex-col h-full bg-white dark:bg-gray-900/40 rounded-[2rem] border border-gray-200/60 dark:border-gray-800/50 hover:border-amber-400 dark:hover:border-amber-500 hover:shadow-2xl hover:shadow-amber-400/10 transition-all overflow-hidden relative">
                    
                    <div className="relative aspect-4/3 w-full bg-linear-to-b from-gray-50/50 to-white dark:from-gray-800/30 dark:to-gray-900/30 p-6 flex items-center justify-center">
                      <img src={product.img} alt={product.faTitle} className="w-full h-full object-contain group-hover:scale-110 group-hover:-translate-y-1.5 transition-transform duration-700 ease-out drop-shadow-xl" />
                      
                      <div className="absolute top-4 right-4 flex flex-col gap-2">
                        {product.isFeatured && (
                          <span className="bg-amber-400 text-gray-900 text-[9px] font-black px-2.5 py-1 rounded-md flex items-center gap-1 shadow-sm">
                            <Star size={10} className="fill-current" /> {isRtl ? "ویژه" : "Featured"}
                          </span>
                        )}
                        {product.status === "توقف تولید" && (
                          <span className="bg-red-500 text-white text-[9px] font-black px-2.5 py-1 rounded-md shadow-sm">
                            {isRtl ? "توقف تولید" : "Discontinued"}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="p-4 md:p-5 flex flex-col grow bg-white dark:bg-transparent">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-[10px] font-black text-amber-600 bg-amber-50 dark:bg-amber-500/10 px-2 py-0.5 rounded-md">
                          {product.brand}
                        </span>
                        <span className="text-[10px] font-bold text-gray-400">
                          {product.weight}
                        </span>
                      </div>
                      
                      <h2 className="text-sm md:text-base font-black text-gray-900 dark:text-white leading-tight mb-1 group-hover:text-amber-500 transition-colors">
                        {isRtl ? product.faTitle : product.enTitle}
                      </h2>
                      <p className="text-[9px] md:text-xs font-mono text-gray-400 truncate mb-4">
                        {isRtl ? product.enTitle : product.faTitle}
                      </p>
                      
                      <div className="mt-auto pt-3 md:pt-4 flex justify-between items-center border-t border-gray-100 dark:border-gray-800/60">
                        <span className="text-[10px] md:text-xs font-bold text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300 transition-colors">
                          {isRtl ? "مشاهده جزئیات" : "View Details"}
                        </span>
                        <div className="w-6 h-6 md:w-8 md:h-8 rounded-full bg-gray-50 dark:bg-gray-800 flex items-center justify-center text-gray-400 group-hover:bg-amber-400 group-hover:text-gray-900 transition-colors shadow-sm">
                          <ArrowRight size={14} className={`${isRtl ? 'rotate-45' : '-rotate-45'} group-hover:rotate-0 transition-transform`} />
                        </div>
                      </div>
                    </div>

                  </a>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        ) : (
          <motion.div 
            initial={{ opacity: 0, y: 40 }} 
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false }}
            transition={{ duration: 0.6, ease: customEase }}
            className="w-full max-w-md mx-auto mt-20 text-center"
          >
            <div className="w-20 h-20 md:w-24 md:h-24 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-6">
              <Search size={32} className="text-gray-400" />
            </div>
            <h3 className="text-xl md:text-2xl font-black text-gray-900 dark:text-white mb-2">
              {isRtl ? "محصولی پیدا نشد!" : "No Products Found!"}
            </h3>
            <p className="text-xs md:text-sm text-gray-500 leading-relaxed mb-6">
              {isRtl ? "فیلترهای انتخاب شده بسیار محدود هستند یا عبارت جستجوی شما در سیستم موجود نیست." : "Selected filters are too restricted or the search query doesn't match."}
            </p>
            <button type="button" onClick={clearAllFilters} className="bg-gray-900 dark:bg-white text-white dark:text-gray-900 px-6 py-2.5 rounded-full font-black text-xs transition-transform hover:scale-105 shadow-md">
              {isRtl ? "پاک کردن فیلترها" : "Clear Filters"}
            </button>
          </motion.div>
        )}
      </div>
    </main>
  );
}