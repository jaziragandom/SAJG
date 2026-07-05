"use client";

import GlobalLoading from "@/components/GlobalLoading";
import Image from "next/image";
import { useSearchParams, useRouter } from "next/navigation";
import React, { useState, useMemo, useEffect, useRef, Suspense } from "react";
import { motion, AnimatePresence, useScroll, useMotionValueEvent } from "framer-motion";
import { useLocale } from "next-intl";
import { Search, Star, ArrowRight, Loader2, X } from "lucide-react";
import { getProducts } from "@/actions/product";
import { getCategories } from "@/actions/category";

export default function ProductsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex justify-center items-center"><Loader2 className="animate-spin text-amber-500" size={40} /></div>}>
      <ProductsContent />
    </Suspense>
  );
}

function ProductsContent() {
  const locale = useLocale();
  const isRtl = locale === 'fa';
  const router = useRouter();
  const customEase: [number, number, number, number] = [0.22, 1, 0.36, 1];

  const [productsData, setProductsData] = useState<any[]>([]);
  const [categoriesData, setCategoriesData] = useState<any[]>([]);
  const [mainCategories, setMainCategories] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [searchQuery, setSearchQuery] = useState("");
  const [activeMainCat, setActiveMainCat] = useState("all");

  const searchParams = useSearchParams();
  const urlCategory = searchParams.get('category');
  const urlBrand = searchParams.get('brand');

  useEffect(() => {
    if (urlCategory) {
      setActiveMainCat(urlCategory);
    } else if (!urlBrand) {
      setActiveMainCat("all");
    }
  }, [urlCategory, urlBrand]);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      const [prodRes, catRes] = await Promise.all([
        getProducts({ status: 'all' }),
        getCategories()
      ]);
      
      if (prodRes.success) setProductsData(prodRes.data);
      if (catRes.success) {
        setCategoriesData(catRes.data);
        setMainCategories(catRes.data.filter((c: any) => c.iconName === 'main'));
      }
      setIsLoading(false);
    };
    fetchData();
  }, []);

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

  const { scrollY } = useScroll();
  const [isScrolled, setIsScrolled] = useState(false);
  const [scrollDirection, setScrollDirection] = useState<"up" | "down">("up");
  const isProgrammaticScroll = useRef(false);

  useMotionValueEvent(scrollY, "change", (current) => {
    if (isProgrammaticScroll.current) return;
    const previous = scrollY.getPrevious() || 0;
    const diff = current - previous;
    if (Math.abs(diff) > 10) {
      if (diff > 0 && current > 60) setScrollDirection("down");
      else if (diff < 0) setScrollDirection("up");
    }
    if (current > 120 && !isScrolled) setIsScrolled(true);
    else if (current <= 120 && isScrolled) setIsScrolled(false);
  });

  const filteredProducts = useMemo(() => {
    return productsData.filter((product) => {
      const searchTxt = searchQuery.toLowerCase();
      const matchSearch = 
        (product.faTitle && product.faTitle.includes(searchTxt)) || 
        (product.enTitle && product.enTitle.toLowerCase().includes(searchTxt)) ||
        (product.brandId?.faName && product.brandId.faName.includes(searchTxt)) ||
        (product.brandId?.enName && product.brandId.enName.toLowerCase().includes(searchTxt));
      
      const matchMainCat = activeMainCat === "all" || product.mainCat === activeMainCat || product.category === activeMainCat;
      const matchBrand = !urlBrand || product.brandId?.slug === urlBrand;

      return matchSearch && matchMainCat && matchBrand;
    });
  }, [searchQuery, activeMainCat, productsData, urlBrand]);

  const clearAllFilters = () => {
    setSearchQuery("");
    setActiveMainCat("all");
    router.push(`/${locale}/products`);
  };

  return (
    <main className="w-full pb-32" dir={isRtl ? "rtl" : "ltr"}>
      
      <motion.div 
        animate={{ opacity: isScrolled ? 0 : 1, y: isScrolled ? -20 : 0, pointerEvents: isScrolled ? "none" : "auto" }}
        transition={{ duration: 0.5, ease: customEase }}
        className="w-full pt-28 md:pt-36 pb-6 px-4 text-center bg-transparent flex flex-col items-center relative z-10"
      >
        <motion.h1 
          initial={false}
          animate={{ opacity: isTitleIn ? 1 : 0, x: isTitleIn ? 0 : (isRtl ? 40 : -40) }}
          transition={{ duration: 0.8, ease: customEase }}
          className="text-3xl md:text-5xl font-black text-gray-900 dark:text-white tracking-tight mb-3"
        >
          {isRtl ? "ویترین محصولات " : "Products of "}
          <span className="text-amber-500">{isRtl ? "جزیره گندم" : "Jazirah Gandum"}</span>
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

      <div 
        className={`sticky w-full transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] px-4 md:px-8 z-50 ${
          isScrolled 
            ? `bg-white/95 dark:bg-gray-950/95 backdrop-blur-xl shadow-sm border-b border-gray-200/60 dark:border-gray-800/60 ${scrollDirection === 'up' ? 'top-16 lg:top-18 py-3' : 'top-0 py-3'}` 
            : 'top-16 lg:top-18 bg-transparent pb-4'
        }`}
      >
        <div className="mx-auto w-full flex flex-col items-center relative z-20">
          
          <motion.div 
            initial={false}
            animate={{ opacity: isSearchBoxIn ? 1 : 0, y: isSearchBoxIn ? 0 : 30 }}
            transition={{ duration: 0.6, ease: customEase }}
            className={`relative flex items-center bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 mx-auto w-full focus-within:border-amber-400 focus-within:ring-2 focus-within:ring-amber-400/20 overflow-hidden transition-[max-width,border-radius,height,box-shadow] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${isScrolled ? 'shadow-md' : 'shadow-lg'}`}
            style={{ height: isScrolled ? "56px" : "52px", maxWidth: isScrolled ? "100%" : "768px", borderRadius: isScrolled ? "1.25rem" : "9999px" }}
          >
            <div className={`px-4 text-gray-400 shrink-0 transition-all duration-500 ${isScrolled ? 'md:px-6' : ''}`}>
              <Search size={22} />
            </div>
            
            <div className="relative z-10 flex grow items-center h-full pr-1">
              <input 
                type="text" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={isRtl ? "نام محصول یا برند را وارد کنید..." : "Search product or brand..."}
                className="grow bg-transparent border-none outline-none text-gray-900 dark:text-white text-sm md:text-base font-bold placeholder:text-gray-400 min-w-0"
              />
              
              {/* دکمه پاک کردن سرچ/فیلتر */}
              {(searchQuery || urlBrand) && (
                <button onClick={clearAllFilters} className="mr-2 ml-4 text-gray-400 hover:text-red-500">
                  <X size={18} />
                </button>
              )}
            </div>
          </motion.div>

          <AnimatePresence>
            {!isScrolled && (
              <motion.div initial={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0, transition: { duration: 0.3, ease: customEase } }} className="w-full overflow-hidden flex items-center justify-center pt-5">
                <div className="flex items-center justify-start md:justify-center gap-2 w-full overflow-x-auto custom-scrollbar pb-2 px-1">
                  
                  <motion.button 
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: isPillsIn ? 1 : 0, y: isPillsIn ? 0 : -20 }}
                    transition={{ duration: 0.5, ease: customEase }}
                    type="button"
                    onClick={() => { setActiveMainCat("all"); router.push(`/${locale}/products`); }}
                    className={`shrink-0 px-4 py-2.5 rounded-full text-[11px] sm:text-xs font-black transition-colors border text-center flex items-center justify-center whitespace-nowrap ${
                      activeMainCat === "all" ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900 border-transparent shadow-md' : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-amber-400'
                    }`}
                  >
                    {isRtl ? "همه محصولات" : "All Products"}
                  </motion.button>

                  {mainCategories.map((cat, index) => (
                    <motion.button 
                      key={cat.slug}
                      initial={{ opacity: 0, y: -20 }}
                      animate={{ opacity: isPillsIn ? 1 : 0, y: isPillsIn ? 0 : -20 }}
                      transition={{ duration: 0.5, ease: customEase, delay: isPillsIn ? (index + 1) * 0.05 : 0 }}
                      type="button"
                      onClick={() => { setActiveMainCat(cat.slug); router.push(`/${locale}/products`); }}
                      className={`shrink-0 px-4 py-2.5 rounded-full text-[11px] sm:text-xs font-black transition-colors border text-center flex items-center justify-center whitespace-nowrap ${
                        activeMainCat === cat.slug ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900 border-transparent shadow-md' : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-amber-400'
                      }`}
                    >
                      {isRtl ? cat.faName : cat.enName}
                    </motion.button>
                  ))}

                  {/* --- شروع کد جدید: دکمه داینامیک برای زیردسته‌های فیلتر شده (غیر از ۳ گروه اصلی) --- */}
                  {activeMainCat !== "all" && !mainCategories.some(c => c.slug === activeMainCat) && (() => {
                    const activeCatObj = categoriesData.find(c => c.slug === activeMainCat);
                    const label = activeCatObj ? (isRtl ? activeCatObj.faName : activeCatObj.enName) : activeMainCat;
                    return (
                      <motion.button
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        type="button"
                        onClick={() => { setActiveMainCat("all"); router.push(`/${locale}/products`); }}
                        className="shrink-0 px-3.5 py-2 rounded-full text-[11px] sm:text-xs font-black transition-all bg-amber-400 hover:bg-amber-500 text-gray-950 shadow-md flex items-center gap-1.5 whitespace-nowrap cursor-pointer"
                      >
                        <span>{label}</span>
                        <X size={14} className="stroke-3" />
                      </motion.button>
                    );
                  })()}

                  {/* --- دکمه داینامیک برای فیلتر برند (مثل برند خندان) --- */}
                  {urlBrand && (() => {
                    const foundProd = productsData.find(p => p.brandId?.slug === urlBrand);
                    const brandLabel = foundProd?.brandId ? (isRtl ? foundProd.brandId.faName : foundProd.brandId.enName) : urlBrand;
                    return (
                      <motion.button
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        type="button"
                        onClick={clearAllFilters}
                        className="shrink-0 px-3.5 py-2 rounded-full text-[11px] sm:text-xs font-black transition-all bg-amber-400 hover:bg-amber-500 text-gray-950 shadow-md flex items-center gap-1.5 whitespace-nowrap cursor-pointer"
                      >
                        <span>{isRtl ? `برند: ${brandLabel}` : `Brand: ${brandLabel}`}</span>
                        <X size={14} className="stroke-3" />
                      </motion.button>
                    );
                  })()}
                  {/* --- پایان کد جدید --- */}

                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <div className="container mx-auto max-w-7xl px-4 md:px-8 mt-8">
        
        {isLoading ? (
            <div className="w-full flex justify-center py-20">
                <Loader2 className="animate-spin text-amber-500" size={48} />
            </div>
        ) : filteredProducts.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6 lg:gap-8">
            <AnimatePresence>
              {filteredProducts.map((product, index) => {
                
                const title = isRtl ? product.faTitle : (product.enTitle || product.faTitle);
                const brandName = isRtl ? (product.brandId?.faName || "") : (product.brandId?.enName || product.brandId?.faName || "");
                const imgUrl = product.images?.main || "https://placehold.co/400x400/png";
                
                const weightVal = product.specs?.weight || product.weight || "";
                const weightCat = categoriesData.find(c => c.slug === weightVal || c.faName === weightVal || c._id === weightVal);
                const finalWeight = weightCat 
                    ? (isRtl ? weightCat.faName : weightCat.enName) 
                    : (isRtl ? (product.specs?.weightFa || weightVal) : (product.specs?.weightEn || weightVal));

                const subCatObj = categoriesData.find(c => c.slug === product.category);
                const catLabel = subCatObj ? (isRtl ? subCatObj.faName : subCatObj.enName) : product.category;

                return (
                    <motion.div
                    initial={{ opacity: 0, y: 60 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: false, amount: 0.15 }}
                    transition={{ duration: 0.7, ease: customEase, delay: (index % 4) * 0.05 }}
                    key={product._id}
                    className="group flex flex-col h-full"
                 >
                   <a href={`/${locale}/products/${product.slug}`} className="flex flex-col h-full bg-white dark:bg-gray-900/40 rounded-[2rem] border border-gray-200/60 dark:border-gray-800/50 hover:border-amber-400 dark:hover:border-amber-500 hover:shadow-2xl hover:shadow-amber-400/10 transition-all overflow-hidden relative">  
                            <div className="relative h-56 shrink-0 w-full bg-linear-to-b from-gray-50/50 to-white dark:from-gray-800/30 dark:to-gray-900/30 flex items-center justify-center">
                             <Image src={imgUrl} alt={title} fill sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw" className="object-contain p-6 group-hover:scale-110 group-hover:-translate-y-1.5 transition-transform duration-700 ease-out drop-shadow-xl" />

                            <div className="absolute top-4 right-4 flex flex-col gap-2">
                                {product.isFeatured && (
                                <span className="bg-amber-400 text-gray-900 text-[9px] font-black px-2.5 py-1 rounded-md flex items-center gap-1 shadow-sm">
                                    <Star size={10} className="fill-current" /> {isRtl ? "ویژه" : "Featured"}
                                </span>
                                )}
                            </div>
                            </div>

                            <div className="p-4 md:p-5 flex flex-col grow bg-white dark:bg-transparent">
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-[10px] font-black text-amber-600 bg-amber-50 dark:bg-amber-500/10 px-2 py-0.5 rounded-md">
                                {brandName}
                                </span>
                                <span className="text-[10px] font-bold text-gray-400" dir={isRtl ? "rtl" : "ltr"}>
                                {finalWeight}
                                </span>
                            </div>
                            
                            <h2 className="text-sm md:text-base font-black text-gray-900 dark:text-white leading-tight mb-1 group-hover:text-amber-500 transition-colors line-clamp-2">
                                {title}
                            </h2>
                            <p className="text-[9px] md:text-xs font-bold text-gray-400 truncate mb-4">
                                {catLabel}
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
                )
              })}
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
              {isRtl ? "محصولی با این مشخصات یافت نشد یا در حال حاضر ناموجود است." : "No products matching these specifications were found."}
            </p>
            <button type="button" onClick={clearAllFilters} className="bg-gray-900 dark:bg-white text-white dark:text-gray-900 px-6 py-2.5 rounded-full font-black text-xs transition-transform hover:scale-105 shadow-md">
              {isRtl ? "نمایش تمام محصولات" : "View All Products"}
            </button>
          </motion.div>
        )}
      </div>
    </main>
  );
}