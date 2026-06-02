"use client";

import React, { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence, Variants } from "framer-motion";
import { useLocale } from "next-intl";
import { useParams, useRouter } from "next/navigation";
import { 
  ArrowLeft, FileText, Download, Star, Package, Droplets, Sparkles, Scale, 
  Activity, ShieldCheck, Printer, X, Calendar, Hash, Info, List
} from "lucide-react";

import { MOCK_PRODUCTS } from "../../../../lib/mockData";

export default function ProductDetailsPage() {
  const locale = useLocale();
  const isRtl = locale === 'fa';
  const params = useParams();
  const router = useRouter();
  
  // گراف سرعت استاندارد و ملایم اپل
  const customEase: [number, number, number, number] = [0.22, 1, 0.36, 1];
  
  const [isDatasheetOpen, setIsDatasheetOpen] = useState(false);
  const [animateSpecs, setAnimateSpecs] = useState(false);

  const productObj = useMemo(() => {
    return MOCK_PRODUCTS.find(p => p.id === Number(params.id));
  }, [params.id]);

  useEffect(() => {
    if (productObj) {
      setAnimateSpecs(true);
    }
  }, [productObj]);

  if (!productObj) {
    return (
      <div className="min-h-screen w-full flex flex-col items-center justify-center bg-transparent px-4">
        <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-4">
          {isRtl ? "محصول مورد نظر یافت نشد!" : "Product not found!"}
        </h2>
        <button 
          onClick={() => router.push(`/${locale}/products`)}
          className="bg-amber-400 text-gray-950 px-6 py-3 rounded-full font-black text-xs flex items-center gap-2"
        >
          <ArrowLeft size={16} className={isRtl ? "rotate-180" : ""} /> 
          {isRtl ? "بازگشت به ویترین محصولات" : "Back to Products"}
        </button>
      </div>
    );
  }

  const p: any = productObj;
  
  const description = isRtl ? (p.faDesc || "این محصول با استفاده از بهترین مواد اولیه و فرمولاسیون اختصاصی جزیره گندم تولید شده است. طراحی استاندارد و طعم بی‌نظیر این محصول، آن را به یکی از محبوب‌ترین انتخاب‌های مصرف‌کنندگان تبدیل کرده است.") : (p.enDesc || "This product is made using the finest ingredients and Wheat Island's exclusive formulation. Its standard design and unique flavor make it a favorite choice among consumers.");
  const ingredients = isRtl ? (p.faIngredients || "آب تصفیه شده، شکر، اسید سیتریک، طعم‌دهنده طبیعی، ویتامین ث، پایدارکننده.") : (p.enIngredients || "Purified water, Sugar, Citric acid, Natural flavors, Vitamin C, Stabilizer.");
  const shelfLife = isRtl ? (p.faShelfLife || "۶ ماه پس از تولید") : (p.enShelfLife || "6 Months after production");
  const packCount = p.packCount || (isRtl ? "۲۴ عدد در کارتن" : "24 pieces per box");
  const nutritionImage = p.nutritionImg || null;
  const categoryLabel = p.subCategory || p.category || (isRtl ? "عمومی" : "General");

  const handlePrintDatasheet = () => {
    window.print();
  };

  // --- تنظیمات انیمیشن‌های نوبتی با آپاسیتی سریع و حل ۱۶ ارور تایپ‌اسکریپت ---
  // استفاده از [0, 0, 1, 1] به جای "linear" برای رفع تضاد تایپ‌ها در TS
  const fadeUpItem: Variants = {
    hidden: { opacity: 0, y: 60 },
    show: { 
      opacity: 1, 
      y: 0, 
      transition: { 
        y: { duration: 0.8, ease: customEase },
        opacity: { duration: 0.3, ease: [0, 0, 1, 1] } 
      } 
    }
  };

  const staggerContainer: Variants = {
    hidden: { opacity: 0 },
    show: { 
      opacity: 1, 
      transition: { staggerChildren: 0.08, delayChildren: 0.1 } 
    }
  };

  return (
    <div className="w-full min-h-screen bg-transparent pb-24 pt-28 px-4 md:px-8" dir={isRtl ? "rtl" : "ltr"}>
      <div className="max-w-6xl mx-auto">
        
        {/* دکمه بازگشت */}
        <motion.button 
          initial={{ opacity: 0, x: isRtl ? 20 : -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, ease: customEase }}
          onClick={() => router.push(`/${locale}/products`)}
          className="flex items-center gap-2 text-xs font-black text-gray-500 hover:text-gray-900 dark:hover:text-white mb-8 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 px-4 py-2.5 rounded-full shadow-sm transition-colors"
        >
          <ArrowLeft size={14} className={isRtl ? "rotate-180" : ""} />
          <span>{isRtl ? "بازگشت به لیست محصولات" : "Back to Products"}</span>
        </motion.button>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          
          {/* ستون چپ: نمایش تصویر محصول (چیدمان ۳ بعدی لایه‌ای) */}
          <motion.div 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: false, amount: 0.1 }}
            transition={{ duration: 0.5, ease: customEase }}
            className="lg:col-span-5 w-full sticky top-24 flex flex-col items-center justify-center min-h-87.5 md:min-h-112.5"
          >
            <div className="relative w-full aspect-square flex items-center justify-center select-none">
              
              <motion.img 
                src={p.img} alt={isRtl ? p.faTitle : p.enTitle}
                initial={{ opacity: 0, x: 0, y: 0, scale: 0.8 }}
                whileInView={{ opacity: 0.35, x: -55, y: -12, scale: 0.84 }}
                viewport={{ once: false, amount: 0.1 }}
                transition={{ duration: 0.8, ease: customEase, delay: 0.35 }}
                className="absolute w-full h-full object-contain blur-[1.5px] brightness-90 dark:brightness-75 pointer-events-none z-10 select-none"
              />

              <motion.img 
                src={p.img} alt={isRtl ? p.faTitle : p.enTitle}
                initial={{ opacity: 0, x: 0, y: 0, scale: 0.8 }}
                whileInView={{ opacity: 0.35, x: 55, y: -12, scale: 0.84 }}
                viewport={{ once: false, amount: 0.1 }}
                transition={{ duration: 0.8, ease: customEase, delay: 0.35 }}
                className="absolute w-full h-full object-contain blur-[1.5px] brightness-90 dark:brightness-75 pointer-events-none z-10 select-none"
              />

              <motion.img 
                src={p.img} alt={isRtl ? p.faTitle : p.enTitle}
                initial={{ opacity: 0, y: 40, scale: 0.92 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                viewport={{ once: false, amount: 0.1 }}
                transition={{ duration: 0.7, ease: customEase, delay: 0.1 }}
                className="relative w-full h-full object-contain z-20 drop-shadow-[0_25px_25px_rgba(0,0,0,0.15)]"
              />

              <motion.div 
                initial={{ opacity: 0, scale: 0.6 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: false, amount: 0.1 }}
                transition={{ duration: 0.7, ease: customEase, delay: 0.1 }}
                className="absolute bottom-2 left-1/2 -translate-x-1/2 w-4/5 h-5 bg-black/10 dark:bg-black/35 blur-xl rounded-full z-0"
              />

              {p.isFeatured && (
                <motion.span 
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: false, amount: 0.1 }}
                  transition={{ duration: 0.5, ease: customEase, delay: 0.6 }}
                  className="absolute top-0 right-0 bg-amber-400 text-gray-900 text-[10px] font-black px-3 py-1.5 rounded-xl flex items-center gap-1 shadow-md z-30"
                >
                  <Star size={12} className="fill-current" /> {isRtl ? "ویژه" : "Featured"}
                </motion.span>
              )}
            </div>
          </motion.div>

          {/* ستون راست: اطلاعات و شناسنامه کامل محصول */}
          <div className="lg:col-span-7 w-full flex flex-col gap-6">
            
            {/* عناوین و دسته‌بندی (تکرار انیمیشن با اسکرول) */}
            <motion.div 
              variants={staggerContainer}
              initial="hidden"
              whileInView="show"
              viewport={{ once: false, amount: 0.2 }}
              className="flex flex-col gap-3"
            >
              <motion.div variants={fadeUpItem} className="flex flex-wrap items-center gap-2 mb-2">
                <span className="text-xs font-black text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-500/10 px-3 py-1.5 rounded-xl border border-amber-200/30 dark:border-amber-500/20">
                  {isRtl ? "برند: " : "Brand: "} {p.brand}
                </span>
                <span className="text-xs font-bold text-gray-500 bg-gray-100 dark:bg-gray-800 px-3 py-1.5 rounded-xl">
                  {categoryLabel}
                </span>
              </motion.div>

              <motion.h2 variants={fadeUpItem} className="text-2xl md:text-4xl font-black text-gray-900 dark:text-white leading-tight">
                {isRtl ? p.faTitle : p.enTitle}
              </motion.h2>
              <motion.p variants={fadeUpItem} className="text-sm md:text-base font-mono text-gray-400 dark:text-gray-500 tracking-wide">
                {isRtl ? p.enTitle : p.faTitle}
              </motion.p>
              <motion.p variants={fadeUpItem} className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed mt-2">
                {description}
              </motion.p>
            </motion.div>

            <div className="w-full h-px bg-gray-200 dark:bg-gray-800 my-1"></div>

            {/* گرید مشخصات فنی ۶ گانه (دانه دانه در اسکرول ریست می‌شود) */}
            <motion.div 
              variants={staggerContainer}
              initial="hidden"
              whileInView="show"
              viewport={{ once: false, amount: 0.1 }}
              className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-2"
            >
              <motion.div variants={fadeUpItem} className="bg-white dark:bg-gray-900 p-4 border border-gray-200/60 dark:border-gray-800/60 rounded-2xl flex flex-col gap-2 hover:border-amber-400 transition-colors">
                <Scale size={16} className="text-gray-400" />
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase">{isRtl ? "وزن / حجم" : "Weight / Volume"}</p>
                  <p className="text-xs md:text-sm font-black text-gray-900 dark:text-white mt-1">{p.weight}</p>
                </div>
              </motion.div>

              <motion.div variants={fadeUpItem} className="bg-white dark:bg-gray-900 p-4 border border-gray-200/60 dark:border-gray-800/60 rounded-2xl flex flex-col gap-2 hover:border-amber-400 transition-colors">
                <Sparkles size={16} className="text-gray-400" />
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase">{isRtl ? "طعم و عصاره" : "Flavor"}</p>
                  <p className="text-xs md:text-sm font-black text-gray-900 dark:text-white mt-1">{p.flavor}</p>
                </div>
              </motion.div>

              <motion.div variants={fadeUpItem} className="bg-white dark:bg-gray-900 p-4 border border-gray-200/60 dark:border-gray-800/60 rounded-2xl flex flex-col gap-2 hover:border-amber-400 transition-colors">
                <Package size={16} className="text-gray-400" />
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase">{isRtl ? "بسته‌بندی" : "Packaging"}</p>
                  <p className="text-xs md:text-sm font-black text-gray-900 dark:text-white mt-1">{p.packaging}</p>
                </div>
              </motion.div>

              <motion.div variants={fadeUpItem} className="bg-white dark:bg-gray-900 p-4 border border-gray-200/60 dark:border-gray-800/60 rounded-2xl flex flex-col gap-2 hover:border-amber-400 transition-colors">
                <Calendar size={16} className="text-gray-400" />
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase">{isRtl ? "تاریخ انقضا" : "Shelf Life"}</p>
                  <p className="text-xs md:text-sm font-black text-gray-900 dark:text-white mt-1">{shelfLife}</p>
                </div>
              </motion.div>

              <motion.div variants={fadeUpItem} className="bg-white dark:bg-gray-900 p-4 border border-gray-200/60 dark:border-gray-800/60 rounded-2xl flex flex-col gap-2 hover:border-amber-400 transition-colors">
                <Hash size={16} className="text-gray-400" />
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase">{isRtl ? "تعداد در بسته" : "Pack Count"}</p>
                  <p className="text-xs md:text-sm font-black text-gray-900 dark:text-white mt-1">{packCount}</p>
                </div>
              </motion.div>

              <motion.div variants={fadeUpItem} className="bg-white dark:bg-gray-900 p-4 border border-gray-200/60 dark:border-gray-800/60 rounded-2xl flex flex-col gap-2 hover:border-amber-400 transition-colors">
                <Activity size={16} className="text-gray-400" />
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase">{isRtl ? "وضعیت تأمین" : "Supply Status"}</p>
                  <p className="text-xs md:text-sm font-black text-emerald-500 mt-1">
                    {p.status === 'published' ? (isRtl ? 'موجود' : 'In Stock') : p.status}
                  </p>
                </div>
              </motion.div>
            </motion.div>

            {/* بخش ترکیبات (Ingredients) */}
            <motion.div 
              variants={staggerContainer}
              initial="hidden"
              whileInView="show"
              viewport={{ once: false, amount: 0.2 }}
            >
              <motion.div variants={fadeUpItem} className="bg-white dark:bg-gray-900 p-5 border border-gray-200/60 dark:border-gray-800/60 rounded-2xl">
                <div className="flex items-center gap-2 mb-2">
                  <List size={16} className="text-amber-500" />
                  <h4 className="text-xs font-black text-gray-900 dark:text-white">{isRtl ? "ترکیبات اصلی" : "Main Ingredients"}</h4>
                </div>
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400 leading-relaxed">
                  {ingredients}
                </p>
              </motion.div>
            </motion.div>

            {/* بخش جدول ارزش غذایی (Nutrition Facts Image) */}
            <motion.div 
              variants={staggerContainer}
              initial="hidden"
              whileInView="show"
              viewport={{ once: false, amount: 0.2 }}
            >
              <motion.div variants={fadeUpItem} className="mt-2">
                <div className="flex items-center gap-2 mb-3 px-1">
                  <Info size={16} className="text-gray-400" />
                  <h4 className="text-xs font-black text-gray-900 dark:text-white">{isRtl ? "جدول ارزش غذایی" : "Nutrition Facts"}</h4>
                </div>
                {nutritionImage ? (
                  <div className="w-full bg-white dark:bg-gray-900 p-2 rounded-2xl border border-gray-200/60 dark:border-gray-800/60">
                    <img src={nutritionImage} alt="Nutrition Facts" className="w-full h-auto rounded-xl object-contain" />
                  </div>
                ) : (
                  <div className="w-full h-32 bg-gray-50 dark:bg-gray-800/50 rounded-2xl border-2 border-dashed border-gray-200 dark:border-gray-700 flex flex-col items-center justify-center gap-2 text-gray-400">
                    <FileText size={24} className="opacity-50" />
                    <span className="text-xs font-bold">{isRtl ? "تصویر جدول ارزش غذایی هنوز بارگذاری نشده است." : "Nutrition facts image not uploaded yet."}</span>
                  </div>
                )}
              </motion.div>
            </motion.div>

            {/* گواهی کیفیت */}
            <motion.div 
              variants={staggerContainer}
              initial="hidden"
              whileInView="show"
              viewport={{ once: false, amount: 0.5 }}
            >
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

            {/* دکمه‌های اکشن (دیتاشیت و تماس) */}
<motion.div 
  variants={staggerContainer}
  initial="hidden"
  whileInView="show"
  viewport={{ once: false, amount: 0.1 }}
  className="flex flex-col sm:flex-row items-center gap-4 mt-4 w-full"
>
  <motion.button 
    variants={fadeUpItem}
    type="button"
    onClick={() => setIsDatasheetOpen(true)}
   
    className="w-full sm:w-auto flex-1 bg-gray-900 dark:bg-white text-white dark:text-gray-900 hover:bg-amber-400 dark:hover:bg-amber-400 hover:text-gray-950 dark:hover:text-gray-950 px-6 py-4 rounded-2xl font-black text-sm flex items-center justify-center gap-3 shadow-lg shadow-gray-900/10 dark:shadow-black/20 transition-colors duration-300 group"
  >
    <FileText size={18} className="group-hover:rotate-6 transition-transform" />
    <span>{isRtl ? "دانلود دیتاشیت" : "Download Datasheet"}</span>
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

      </div>

      {/* --- پاپ‌آپ تمام‌صفحه دیتاشیت گرافیکی --- */}
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
              {/* هدر کنترل پنل */}
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

              {/* کادر داخلی سند چاپی */}
              <div className="p-8 md:p-12 bg-white text-gray-900 flex flex-col gap-8 overflow-y-auto max-h-[75vh] print:max-h-none print:p-0">
                
                {/* سربرگ */}
                <div className="flex justify-between items-center border-b-2 border-gray-900 pb-4">
                  <div className="flex flex-col gap-1">
                    <h3 className="text-xl font-black tracking-tight text-gray-950">{isRtl ? "شرکت صنعتی جزیره گندم" : "Wheat Island Co."}</h3>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Product Technical Datasheet (TDS)</p>
                  </div>
                  <div className="text-left">
                    <p className="text-[10px] font-bold text-gray-400">شناسه کالا: #00{p.id}9</p>
                    <p className="text-[10px] font-bold text-gray-400 mt-0.5">تاریخ صدور: {new Date().toLocaleDateString(isRtl ? 'fa-IR' : 'en-US')}</p>
                  </div>
                </div>

                {/* ردیف اول */}
                <div className="grid grid-cols-3 gap-6 items-center bg-gray-50 p-6 rounded-2xl border border-gray-100">
                  <div className="col-span-2 flex flex-col gap-2">
                    <span className="text-[10px] font-bold text-amber-600 uppercase tracking-wide">{isRtl ? "شناسنامه فنی کالا" : "Product ID"}</span>
                    <h4 className="text-xl font-black text-gray-950">{isRtl ? p.faTitle : p.enTitle}</h4>
                    <p className="text-xs font-mono text-gray-400 mt-0.5">{isRtl ? p.enTitle : p.faTitle}</p>
                  </div>
                  <div className="flex justify-end h-24 w-full">
                    <img src={p.img} alt={p.faTitle} className="h-full object-contain mix-blend-multiply" />
                  </div>
                </div>

                {/* جدول داده‌ها */}
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
                          <td className="px-4 py-3 font-mono">{p.brand} - {categoryLabel}</td>
                        </tr>
                        <tr className="bg-gray-50/50">
                          <td className="px-4 py-3 font-bold text-gray-900">{isRtl ? "وزن خالص / حجم ظرف" : "Net Weight / Volume"}</td>
                          <td className="px-4 py-3 font-mono">{p.weight}</td>
                        </tr>
                        <tr>
                          <td className="px-4 py-3 font-bold text-gray-900">{isRtl ? "بسته‌بندی / تعداد در کارتن" : "Packaging / Pack Count"}</td>
                          <td className="px-4 py-3">{p.packaging} - {packCount}</td>
                        </tr>
                        <tr className="bg-gray-50/50">
                          <td className="px-4 py-3 font-bold text-gray-900">{isRtl ? "طعم و عصاره پایه" : "Base Flavor"}</td>
                          <td className="px-4 py-3">{p.flavor}</td>
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

                {/* پانویس */}
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