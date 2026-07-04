"use client";

import GlobalLoading from "@/components/GlobalLoading";
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence, Variants } from "framer-motion";
import { useLocale } from "next-intl";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import { 
  ArrowLeft, FileText, Download, Star, Package, Droplets, Sparkles, Scale, 
  Activity, ShieldCheck, Printer, X, Calendar, Hash, List, ArrowRight
} from "lucide-react";
import { getProducts } from "@/actions/product";
import { getCategories } from "@/actions/category";
import { getBrands } from "@/actions/brand";

export default function ProductDetailsPage() {
  const locale = useLocale();
  const isRtl = locale === 'fa';
  const params = useParams();
  const router = useRouter();
  
  const customEase: [number, number, number, number] = [0.22, 1, 0.36, 1];
  const [isDatasheetOpen, setIsDatasheetOpen] = useState(false);
  const [activeImageTab, setActiveImageTab] = useState<'main' | 'nutrition'>('main');
  
  const [isImgHovered, setIsImgHovered] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setHasLoaded(true), 700);
    return () => clearTimeout(timer);
  }, [activeImageTab]);

  const [productObj, setProductObj] = useState<any>(null);
  const [similarProducts, setSimilarProducts] = useState<any[]>([]);
  const [categoriesData, setCategoriesData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [catName, setCatName] = useState<string | null>(null);
  const [statusName, setStatusName] = useState<string | null>(null);
  const [brandObj, setBrandObj] = useState<any>(null);

  useEffect(() => {
    const fetchProductDetails = async () => {
      const identifier = (params?.id || params?.slug) as string; 
      if (!identifier) return;

      try {
        const [res, catsRes, brandsRes] = await Promise.all([
          getProducts({ status: 'all' }),
          getCategories(),
          getBrands()
        ]);
        
        if (catsRes?.success && catsRes.data) {
          setCategoriesData(catsRes.data);
        }

        if (res?.success && res.data) {
          const foundProduct = res.data.find((p: any) => 
            p.slug === identifier || String(p._id) === identifier
          );
          
          if (foundProduct) {
            setProductObj(foundProduct);

            if (brandsRes?.success && brandsRes.data) {
              const allBrands = brandsRes.data;
              const bId = foundProduct.brandId?._id || foundProduct.brandId || foundProduct.brand;
              const matchedBrand = allBrands.find((b: any) => 
                String(b._id) === String(bId) || 
                b.slug === String(bId) || 
                b.faName === String(bId) || 
                b.enName === String(bId)
              );
              if (matchedBrand) setBrandObj(matchedBrand);
            }

            const similars = res.data
              .filter((p: any) => 
                p._id !== foundProduct._id && 
                (p.mainCat === foundProduct.mainCat || p.category === foundProduct.category) &&
                p.status !== 'draft' 
              )
              .slice(0, 5);
            
            setSimilarProducts(similars);

            if (catsRes?.success && catsRes.data) {
              const allCats = catsRes.data;
              
              if (foundProduct.category) {
                const matchedCat = allCats.find((c: any) => c.slug === foundProduct.category);
                setCatName(matchedCat ? (isRtl ? matchedCat.faName : matchedCat.enName) : foundProduct.category);
              }
              
              if (foundProduct.status) {
                const matchedStatus = allCats.find((c: any) => c.slug === foundProduct.status);
                setStatusName(matchedStatus ? (isRtl ? matchedStatus.faName : matchedStatus.enName) : foundProduct.status);
              }
            }
          }
        }
      } catch (error) {
        console.error("Error fetching product details:", error);
      }
      
      setIsLoading(false);
    };

    fetchProductDetails();
  }, [params, isRtl]);

  if (isLoading) {
    return <GlobalLoading />;
  }

  if (!productObj) {
    return (
      <div className="min-h-screen w-full flex flex-col items-center justify-center bg-transparent px-4">
        <Package size={64} className="text-gray-300 dark:text-gray-800 mb-6" />
        <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-4">
          {isRtl ? "محصول مورد نظر یافت نشد!" : "Product not found!"}
        </h2>
        <button 
          onClick={() => router.push(`/${locale}/products`)}
          className="bg-amber-400 hover:bg-amber-500 text-gray-950 px-6 py-3 rounded-full font-black text-sm flex items-center gap-2 transition-colors"
        >
          <ArrowLeft size={16} className={isRtl ? "rotate-180" : ""} /> 
          {isRtl ? "بازگشت به ویترین محصولات" : "Back to Products"}
        </button>
      </div>
    );
  }

  const p: any = productObj;
  const pImg = p.images?.main || "https://placehold.co/400x400/png";
  const nutritionImage = p.images?.nutrition || p.specs?.nutritionImg || null;
  
  const activeBrand = brandObj || (p.brandId && typeof p.brandId === 'object' ? p.brandId : null);
  const pBrand = activeBrand 
    ? (isRtl ? (activeBrand.faName || activeBrand.enName) : (activeBrand.enName || activeBrand.faName))
    : (p.brand || (isRtl ? "نامشخص" : "Unknown"));

  const brandLogo = activeBrand 
    ? (isRtl ? (activeBrand.logoFa || activeBrand.logo || activeBrand.logoEn) : (activeBrand.logoEn || activeBrand.logo || activeBrand.logoFa))
    : "";

  const title = isRtl ? p.faTitle : (p.enTitle || p.faTitle);

  // وزن
  const pWeightVal = p.specs?.weight || p.weight || "";
  const weightCat = categoriesData.find(c => c.slug === pWeightVal || c.faName === pWeightVal || c._id === pWeightVal);
  const pWeight = weightCat ? (isRtl ? weightCat.faName : weightCat.enName) : (isRtl ? (p.specs?.weightFa || pWeightVal || "نامشخص") : (p.specs?.weightEn || pWeightVal || "N/A"));

  // طعم
  const pFlavorVal = p.specs?.flavor || p.flavor || "";
  const flavorCat = categoriesData.find(c => c.slug === pFlavorVal || c.faName === pFlavorVal || c._id === pFlavorVal);
  const pFlavor = flavorCat ? (isRtl ? flavorCat.faName : flavorCat.enName) : (isRtl ? (p.specs?.flavorFa || pFlavorVal || "نامشخص") : (p.specs?.flavorEn || pFlavorVal || "N/A"));

  // بسته‌بندی
  const pPackagingVal = p.specs?.packaging || p.packaging || "";
  const packCat = categoriesData.find(c => c.slug === pPackagingVal || c.faName === pPackagingVal || c._id === pPackagingVal);
  const pPackaging = packCat ? (isRtl ? packCat.faName : packCat.enName) : (isRtl ? (p.specs?.packagingFa || pPackagingVal || "نامشخص") : (p.specs?.packagingEn || pPackagingVal || "N/A"));

  const description = isRtl ? (p.faDesc || "توضیحاتی برای این محصول ثبت نشده است.") : (p.enDesc || "No description available for this product.");
  const ingredients = isRtl ? p.specs?.ingredientsFa : p.specs?.ingredientsEn;
  const shelfLife = isRtl ? p.specs?.shelfLifeFa : p.specs?.shelfLifeEn;
  const packCount = p.specs?.itemsPerPackage || p.packCount || (isRtl ? "نامشخص" : "N/A");

  const handlePrintDatasheet = () => {
    window.print();
  };

  const fadeUpItem: Variants = {
    hidden: { opacity: 0, y: 40 },
    show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: customEase } }
  };

  const staggerContainer: Variants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  return (
    <div className="w-full min-h-screen bg-transparent pb-24 pt-28 px-4 md:px-8" dir={isRtl ? "rtl" : "ltr"}>
      <div className="max-w-7xl mx-auto">
        
        <motion.button 
          initial={{ opacity: 0, x: isRtl ? 20 : -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, ease: customEase }}
          onClick={() => router.push(`/${locale}/products`)}
          className="flex items-center gap-2 text-xs font-black text-gray-500 hover:text-gray-900 dark:hover:text-white mb-8 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 px-4 py-2.5 rounded-full shadow-sm transition-colors"
        >
          <ArrowLeft size={14} className={isRtl ? "" : "rotate-180"} />
          <span>{isRtl ? "بازگشت به لیست محصولات" : "Back to Products"}</span>
        </motion.button>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          
          <motion.div 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: false, amount: 0.1 }}
            transition={{ duration: 0.5, ease: customEase }}
            className="lg:col-span-5 w-full sticky top-24 flex flex-col items-center justify-center min-h-100"
          >
            <div className="relative w-full h-87.5 md:h-112.5 lg:h-137.5 flex items-center justify-center select-none mb-6">
              <AnimatePresence mode="wait">
                {activeImageTab === 'main' ? (
                  <motion.div 
                    key="main-image"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3, ease: customEase }}
                    className="relative w-full h-full flex items-center justify-center bg-white dark:bg-gray-900/40 rounded-[2.5rem] border border-gray-200/60 dark:border-gray-800/50 shadow-xl overflow-hidden"
                  >
                    <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,var(--tw-gradient-stops))] from-amber-100/50 dark:from-amber-900/10 to-transparent rounded-[2.5rem] pointer-events-none" />
                    
                    <motion.img 
                      src={pImg} alt={`${title} - Back Left`}
                      initial={{ opacity: 0, scale: 0.5, rotate: 0, x: 0 }}
                      animate={{ 
                        opacity: isImgHovered ? 0.35 : 0.5, 
                        scale: isImgHovered ? 0.63 : 0.74, 
                        rotate: -18, 
                        x: isImgHovered ? -88 : -65 
                      }}
                      transition={{ 
                        duration: hasLoaded ? 0.35 : 0.8, 
                        delay: hasLoaded ? 0 : 0.5, 
                        ease: customEase 
                      }}
                      className="absolute w-[65%] h-[65%] object-contain z-10 blur-[2px] pointer-events-none select-none drop-shadow-lg"
                    />

                    <motion.img 
                      src={pImg} alt={`${title} - Back Right`}
                      initial={{ opacity: 0, scale: 0.5, rotate: 0, x: 0 }}
                      animate={{ 
                        opacity: isImgHovered ? 0.35 : 0.5, 
                        scale: isImgHovered ? 0.63 : 0.74, 
                        rotate: 18, 
                        x: isImgHovered ? 88 : 65 
                      }}
                      transition={{ 
                        duration: hasLoaded ? 0.35 : 0.8, 
                        delay: hasLoaded ? 0 : 0.5, 
                        ease: customEase 
                      }}
                      className="absolute w-[65%] h-[65%] object-contain z-10 blur-[2px] pointer-events-none select-none drop-shadow-lg"
                    />

                    <motion.img 
                      src={pImg} alt={title}
                      onMouseEnter={() => setIsImgHovered(true)}
                      onMouseLeave={() => setIsImgHovered(false)}
                      initial={{ opacity: 0.2, y: 25, scale: 0.82 }}
                      animate={{ 
                        opacity: 1, 
                        y: 0, 
                        scale: isImgHovered ? 1.06 : 1 
                      }}
                      transition={{ 
                        duration: hasLoaded ? 0.35 : 0.5, 
                        delay: 0, 
                        ease: customEase 
                      }}
                      className="relative w-[80%] h-[80%] object-contain z-20 drop-shadow-2xl cursor-pointer"
                    />

                    {p.isFeatured && (
                      <span className="absolute top-6 right-6 bg-amber-400 text-gray-900 text-xs font-black px-4 py-2 rounded-xl flex items-center gap-1 shadow-md z-30 pointer-events-none">
                        <Star size={14} className="fill-current" /> {isRtl ? "ویژه" : "Featured"}
                      </span>
                    )}
                  </motion.div>
                ) : (
                  <motion.div 
                    key="nutrition-image"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.3, ease: customEase }}
                    className="relative w-full h-full flex items-center justify-center bg-white dark:bg-gray-900 rounded-[2.5rem] border border-gray-200/60 dark:border-gray-800/60 p-4 shadow-inner"
                  >
                    {nutritionImage ? (
                      <img src={nutritionImage} alt="Nutrition Facts" className="w-full h-full object-contain z-20" />
                    ) : (
                      <div className="flex flex-col items-center justify-center text-gray-400 gap-3">
                        <FileText size={48} className="opacity-40" />
                        <span className="text-sm font-bold">{isRtl ? "جدول ارزش غذایی بارگذاری نشده است." : "Nutrition facts not uploaded."}</span>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="flex bg-gray-100 dark:bg-gray-800/80 p-1.5 rounded-[1.25rem] w-full max-w-sm mx-auto shadow-inner border border-gray-200/50 dark:border-gray-700/50">
              <button 
                onClick={() => setActiveImageTab('main')}
                className={`flex-1 py-3 rounded-xl text-xs font-black transition-all duration-300 ${activeImageTab === 'main' ? 'bg-white dark:bg-gray-900 shadow-md text-amber-500 scale-[1.02]' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}
              >
                {isRtl ? "تصویر محصول" : "Product Image"}
              </button>
              {nutritionImage && (
                <button 
                  onClick={() => setActiveImageTab('nutrition')}
                  className={`flex-1 py-3 rounded-xl text-xs font-black transition-all duration-300 ${activeImageTab === 'nutrition' ? 'bg-white dark:bg-gray-900 shadow-md text-amber-500 scale-[1.02]' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}
                >
                  {isRtl ? "ارزش غذایی" : "Nutrition Facts"}
                </button>
              )}
            </div>
          </motion.div>
          
          <div className="lg:col-span-7 w-full flex flex-col justify-center">
            
            <motion.div variants={staggerContainer} initial="hidden" whileInView="show" viewport={{ once: false, amount: 0.2 }} className="flex flex-col gap-4">
              
              <motion.div variants={fadeUpItem} className="flex flex-wrap items-center gap-3 mb-2">
                {brandLogo && (
                  <div className="bg-white dark:bg-gray-800 px-3 py-1 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 flex items-center">
                    <img src={brandLogo} alt="Brand Logo" className="h-6 w-auto max-w-24 object-contain" />
                  </div>
                )}
                <span className="text-xs font-black text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-500/10 px-3 py-1.5 rounded-xl border border-amber-200/30 dark:border-amber-500/20">
                  {isRtl ? "برند: " : "Brand: "} {pBrand}
                </span>
                
                {catName && (
                  <span className="text-xs font-bold text-gray-500 bg-gray-100 dark:bg-gray-800 px-3 py-1.5 rounded-xl">
                    {catName}
                  </span>
                )}
              </motion.div>

              <motion.h1 variants={fadeUpItem} className="text-3xl md:text-5xl font-black text-gray-900 dark:text-white leading-tight">
                {title}
              </motion.h1>
              
              <motion.p variants={fadeUpItem} className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed mt-2 border-r-2 border-amber-400 pr-4 whitespace-pre-wrap text-justify">
                {description}
              </motion.p>

            </motion.div>

            <motion.div variants={staggerContainer} initial="hidden" whileInView="show" viewport={{ once: false, amount: 0.1 }} className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-10">
              
              {pPackaging && (
                <motion.div variants={fadeUpItem} className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-2xl border border-gray-100 dark:border-gray-700 flex flex-col gap-2 hover:border-amber-400 transition-colors">
                  <Package className="text-amber-500" size={20} />
                  <div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase">{isRtl ? "بسته‌بندی" : "Packaging"}</p>
                    <p className="text-xs md:text-sm font-black text-gray-900 dark:text-white mt-0.5">{pPackaging}</p>
                  </div>
                </motion.div>
              )}

              {pWeight && (
                <motion.div variants={fadeUpItem} className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-2xl border border-gray-100 dark:border-gray-700 flex flex-col gap-2 hover:border-amber-400 transition-colors">
                  <Scale className="text-amber-500" size={20} />
                  <div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase">{isRtl ? "وزن / حجم" : "Weight"}</p>
                    <p className="text-xs md:text-sm font-black text-gray-900 dark:text-white mt-0.5" dir="ltr">{pWeight}</p>
                  </div>
                </motion.div>
              )}

              {packCount && (
                <motion.div variants={fadeUpItem} className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-2xl border border-gray-100 dark:border-gray-700 flex flex-col gap-2 hover:border-amber-400 transition-colors">
                  <Hash className="text-amber-500" size={20} />
                  <div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase">{isRtl ? "تعداد در بسته" : "Pack Count"}</p>
                    <p className="text-xs md:text-sm font-black text-gray-900 dark:text-white mt-0.5">{packCount}</p>
                  </div>
                </motion.div>
              )}

              {pFlavor && (
                <motion.div variants={fadeUpItem} className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-2xl border border-gray-100 dark:border-gray-700 flex flex-col gap-2 hover:border-amber-400 transition-colors">
                  <Droplets className="text-amber-500" size={20} />
                  <div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase">{isRtl ? "طعم و عصاره" : "Flavor"}</p>
                    <p className="text-xs md:text-sm font-black text-gray-900 dark:text-white mt-0.5">{pFlavor}</p>
                  </div>
                </motion.div>
              )}

              {shelfLife && (
                <motion.div variants={fadeUpItem} className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-2xl border border-gray-100 dark:border-gray-700 flex flex-col gap-2 hover:border-amber-400 transition-colors">
                  <Calendar className="text-amber-500" size={20} />
                  <div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase">{isRtl ? "تاریخ انقضا" : "Shelf Life"}</p>
                    <p className="text-xs md:text-sm font-black text-gray-900 dark:text-white mt-0.5">{shelfLife}</p>
                  </div>
                </motion.div>
              )}

              <motion.div variants={fadeUpItem} className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-2xl border border-gray-100 dark:border-gray-700 flex flex-col gap-2 hover:border-amber-400 transition-colors">
                <Activity className="text-amber-500" size={20} />
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase">{isRtl ? "وضعیت تأمین" : "Supply Status"}</p>
                  <p className="text-xs md:text-sm font-black text-emerald-500 mt-0.5">
                    {statusName || p.status || (isRtl ? "نامشخص" : "Unknown")}
                  </p>
                </div>
              </motion.div>

            </motion.div>

            {ingredients && (
              <motion.div variants={staggerContainer} initial="hidden" whileInView="show" viewport={{ once: false, amount: 0.2 }} className="mt-6">
                <motion.div variants={fadeUpItem} className="bg-white dark:bg-gray-900 p-5 border border-gray-200/60 dark:border-gray-800/60 rounded-2xl">
                  <div className="flex items-center gap-2 mb-2">
                    <List size={16} className="text-amber-500" />
                    <h4 className="text-xs font-black text-gray-900 dark:text-white">{isRtl ? "ترکیبات اصلی" : "Main Ingredients"}</h4>
                  </div>
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400 leading-relaxed whitespace-pre-wrap text-justify">
                    {ingredients}
                  </p>
                </motion.div>
              </motion.div>
            )}

            <motion.div variants={staggerContainer} initial="hidden" whileInView="show" viewport={{ once: false, amount: 0.5 }} className="mt-6">
              <motion.div variants={fadeUpItem} className="bg-amber-400/5 border border-amber-400/20 rounded-2xl p-4 flex items-start gap-3 mt-2">
                <ShieldCheck size={20} className="text-amber-500 shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-black text-gray-900 dark:text-gray-100">{isRtl ? "تضمین اصالت کالا و استانداردهای آزمایشگاهی" : "Authenticity & Quality Guarantee"}</p>
                  <p className="text-[11px] font-medium text-gray-500 dark:text-gray-400 mt-1 leading-relaxed">
                    {isRtl ? "این محصول با فرمولاسیون انحصاری برند و تحت نظارت کیفی واحد آزمایشگاه شرکت تولید شده است." : "Produced with exclusive formulation under strict laboratory quality control."}
                  </p>
                </div>
              </motion.div>
            </motion.div>

            <motion.div variants={staggerContainer} initial="hidden" whileInView="show" viewport={{ once: false, amount: 0.1 }} className="flex flex-col sm:flex-row items-center gap-4 mt-8 w-full">
              <motion.button 
                variants={fadeUpItem}
                type="button"
                onClick={() => setIsDatasheetOpen(true)}
                className="w-full sm:w-auto flex-1 bg-gray-900 dark:bg-white text-white dark:text-gray-900 hover:bg-amber-400 dark:hover:bg-amber-400 hover:text-gray-950 dark:hover:text-gray-950 px-6 py-4 rounded-2xl font-black text-sm flex items-center justify-center gap-3 shadow-lg shadow-gray-900/10 dark:shadow-black/20 transition-colors duration-300 group"
              >
                <FileText size={18} className="group-hover:rotate-6 transition-transform" />
                <span>{isRtl ? "مشاهده دیتاشیت فنی" : "View Technical Datasheet"}</span>
                <Download size={16} className="opacity-60" />
              </motion.button>
              
              <motion.button 
                variants={fadeUpItem}
                type="button"
                onClick={() => router.push(`/${locale}/about#contact`)}
                className="w-full sm:w-auto flex-1 bg-amber-400 hover:bg-amber-500 text-gray-950 px-6 py-4 rounded-2xl font-black text-sm flex items-center justify-center gap-3 shadow-lg shadow-amber-400/20 transition-colors duration-300 group"
              >
                <span>{isRtl ? "تماس با ما برای سفارش" : "Contact Us to Order"}</span>
                <ArrowLeft size={16} className={`${isRtl ? "rotate-180" : ""} group-hover:-translate-x-1 transition-transform`} />
              </motion.button>
            </motion.div>

          </div>
        </div>

        {similarProducts.length > 0 && (
          <div className="mt-24 pt-12 border-t border-gray-200/50 dark:border-gray-800/50">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-2xl font-black text-gray-900 dark:text-white flex items-center gap-3">
                <Sparkles className="text-amber-500" size={24} />
                {isRtl ? "محصولات مرتبط" : "Related Products"}
              </h3>
              <button onClick={() => router.push(`/${locale}/products`)} className="text-xs font-bold text-gray-500 hover:text-amber-500 flex items-center gap-1 transition-colors">
                {isRtl ? "مشاهده همه" : "View All"} <ArrowLeft size={14} className={isRtl ? "rotate-180" : ""} />
              </button>
            </div>

            <div className="flex flex-wrap justify-center items-stretch gap-4 md:gap-6">
              {similarProducts.map((simProd, index) => {
                const simTitle = isRtl ? simProd.faTitle : (simProd.enTitle || simProd.faTitle);
                const simBrand = isRtl ? (simProd.brandId?.faName || "") : (simProd.brandId?.enName || "");
                const simImg = simProd.images?.main || "https://placehold.co/400x400/png";
                
                const sWeightVal = simProd.specs?.weight || simProd.weight || "";
                const sWeightCat = categoriesData.find(c => c.slug === sWeightVal || c.faName === sWeightVal || c._id === sWeightVal);
                const simWeight = sWeightCat ? (isRtl ? sWeightCat.faName : sWeightCat.enName) : (isRtl ? (simProd.specs?.weightFa || sWeightVal) : (simProd.specs?.weightEn || sWeightVal));

                const subCatObj = categoriesData.find(c => c.slug === simProd.category);
                const simCatLabel = subCatObj ? (isRtl ? subCatObj.faName : subCatObj.enName) : simProd.category;

                const displayClass = index > 2 ? "hidden lg:flex" : "flex";

                return (
                  <motion.div
                    key={simProd._id}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: index * 0.1, ease: customEase }}
                    className={`${displayClass} flex-col w-full sm:w-[calc(50%-1rem)] md:w-[calc(33.333%-1rem)] lg:w-[calc(20%-1.2rem)] max-w-70 shrink-0`}
                  >
                    <a href={`/${locale}/products/${simProd.slug}`} className="flex flex-col h-full bg-white dark:bg-gray-900/40 rounded-[2rem] border border-gray-200/60 dark:border-gray-800/50 hover:border-amber-400 dark:hover:border-amber-500 hover:shadow-xl transition-all overflow-hidden group">  
                      <div className="relative h-48 shrink-0 w-full bg-linear-to-b from-gray-50/50 to-white dark:from-gray-800/30 dark:to-gray-900/30 flex items-center justify-center p-4">
                        <Image src={simImg} alt={simTitle} fill sizes="(max-width: 768px) 100vw, 20vw" className="object-contain p-4 group-hover:scale-110 group-hover:-translate-y-1 transition-transform duration-500 drop-shadow-md" />
                      </div>

                      <div className="p-4 flex flex-col grow bg-white dark:bg-transparent border-t border-gray-100 dark:border-gray-800/50">
                        <span className="text-[10px] font-black text-amber-600 bg-amber-50 dark:bg-amber-500/10 px-2 py-0.5 rounded-md w-fit mb-2">
                          {simBrand}
                        </span>
                        
                        <h4 className="text-sm font-black text-gray-900 dark:text-white leading-tight mb-1 group-hover:text-amber-500 transition-colors line-clamp-2">
                          {simTitle}
                        </h4>
                        <p className="text-[9px] font-bold text-gray-400 truncate mb-2">
                          {simCatLabel}
                        </p>
                        
                        <div className="mt-auto pt-3 flex justify-between items-center text-gray-400">
                          <span className="text-[10px] font-bold">{simWeight}</span>
                          <ArrowRight size={14} className={`${isRtl ? 'rotate-45' : '-rotate-45'} group-hover:text-amber-500 group-hover:rotate-0 transition-all`} />
                        </div>
                      </div>
                    </a>
                  </motion.div>
                );
              })}
            </div>
          </div>
        )}

      </div>

      <AnimatePresence>
        {isDatasheetOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-6 overflow-y-auto">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setIsDatasheetOpen(false)}
              className="fixed inset-0 bg-gray-950/40 backdrop-blur-md"
            />

            <motion.div 
              initial={{ opacity: 0, scale: 0.96, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 30 }}
              transition={{ duration: 0.5, ease: customEase }}
              className="relative w-full max-w-4xl bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-[2rem] shadow-2xl flex flex-col my-auto overflow-hidden print:border-none print:shadow-none print:bg-white print:text-black print:rounded-none"
            >
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-900 bg-gray-50 dark:bg-gray-900/50 print:hidden">
                <div className="flex items-center gap-2 text-gray-900 dark:text-white font-black text-sm">
                  <FileText size={18} className="text-amber-500" />
                  <span>{isRtl ? "پیش‌نمایش سند فنی رسمی (TDS)" : "Technical Datasheet Preview"}</span>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={handlePrintDatasheet} className="bg-gray-900 dark:bg-white hover:bg-amber-400 dark:hover:bg-amber-400 hover:text-gray-950 dark:hover:text-gray-950 text-white dark:text-gray-900 px-4 py-2 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-colors">
                    <Printer size={14} /> {isRtl ? "چاپ / PDF" : "Print / PDF"}
                  </button>
                  <button onClick={() => setIsDatasheetOpen(false)} className="p-2 text-gray-400 hover:text-red-500 bg-gray-100 dark:bg-gray-800 rounded-full transition-colors">
                    <X size={16} />
                  </button>
                </div>
              </div>

              <div className="p-8 md:p-12 bg-white text-gray-900 flex flex-col gap-8 overflow-y-auto max-h-[75vh] print:max-h-none print:p-0">
                
                <div className="flex justify-between items-center border-b-2 border-gray-900 pb-4">
                  <div className="flex flex-col gap-1">
                    <h3 className="text-xl font-black tracking-tight text-gray-950">{isRtl ? "شرکت صنعتی جزیره گندم" : "Wheat Island Co."}</h3>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Product Technical Datasheet (TDS)</p>
                  </div>
                  <div className="text-left">
                    <p className="text-[10px] font-bold text-gray-400">شناسه کالا: #00{p._id || p.id}9</p>
                    <p className="text-[10px] font-bold text-gray-400 mt-0.5">تاریخ صدور: {new Date().toLocaleDateString(isRtl ? 'fa-IR' : 'en-US')}</p>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-6 items-center bg-gray-50 p-6 rounded-2xl border border-gray-100">
                  <div className="col-span-2 flex flex-col gap-2">
                    <span className="text-[10px] font-bold text-amber-600 uppercase tracking-wide">{isRtl ? "شناسنامه فنی کالا" : "Product ID"}</span>
                    <h4 className="text-xl font-black text-gray-950">{title}</h4>
                  </div>
                  <div className="flex justify-end h-24 w-full">
                    <img src={pImg} alt={title} className="h-full object-contain mix-blend-multiply" />
                  </div>
                </div>

                <div className="flex flex-col gap-3">
                  <h5 className={`text-xs font-black text-gray-900 ${isRtl ? 'border-r-4 pr-2' : 'border-l-4 pl-2'} border-amber-400`}>
                    {isRtl ? "جدول مشخصات و پارامترهای فنی" : "Technical Parameters"}
                  </h5>
                  <div className="border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                    <table className={`w-full text-xs ${isRtl ? 'text-right' : 'text-left'} border-collapse`}>
                      <thead>
                        <tr className="bg-gray-100 text-gray-600 font-bold border-b border-gray-200">
                          <th className="px-4 py-3 w-1/3">{isRtl ? "نام پارامتر" : "Parameter"}</th>
                          <th className="px-4 py-3">{isRtl ? "مقدار / مشخصه" : "Value / Specs"}</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200 font-medium text-gray-700">
                        <tr>
                          <td className="px-4 py-3 font-bold text-gray-900">{isRtl ? "برند / دسته‌بندی" : "Brand / Category"}</td>
                          <td className="px-4 py-3 font-mono">{pBrand} - {catName || p.category || "-"}</td>
                        </tr>
                        <tr className="bg-gray-50/50">
                          <td className="px-4 py-3 font-bold text-gray-900">{isRtl ? "وزن خالص / حجم ظرف" : "Net Weight / Volume"}</td>
                          <td className="px-4 py-3 font-mono" dir="ltr">{pWeight}</td>
                        </tr>
                        <tr>
                          <td className="px-4 py-3 font-bold text-gray-900">{isRtl ? "بسته‌بندی / تعداد در کارتن" : "Packaging / Pack Count"}</td>
                          <td className="px-4 py-3">{pPackaging} - {packCount}</td>
                        </tr>
                        <tr className="bg-gray-50/50">
                          <td className="px-4 py-3 font-bold text-gray-900">{isRtl ? "طعم و عصاره پایه" : "Base Flavor"}</td>
                          <td className="px-4 py-3">{pFlavor}</td>
                        </tr>
                        <tr>
                          <td className="px-4 py-3 font-bold text-gray-900">{isRtl ? "ترکیبات اصلی" : "Main Ingredients"}</td>
                          <td className="px-4 py-3 leading-relaxed">{ingredients}</td>
                        </tr>
                        <tr className="bg-gray-50/50">
                          <td className="px-4 py-3 font-bold text-gray-900">{isRtl ? "تاریخ انقضا (ماندگاری)" : "Shelf Life"}</td>
                          <td className="px-4 py-3">{shelfLife}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="mt-auto pt-8 border-t border-dashed border-gray-300 flex justify-between items-center text-[10px] font-medium text-gray-400">
                  <p>{isRtl ? "تأیید شده توسط واحد کنترل کیفیت (QC) جزیره گندم" : "Approved by Wheat Island Quality Control (QC)"}</p>
                  <p className="text-left font-mono">www.wheat-island.com</p>
                </div>

              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}