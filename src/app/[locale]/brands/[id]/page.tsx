"use client";

import GlobalLoading from "@/components/GlobalLoading";
import React, { use, useState, useEffect } from "react";
import { useLocale } from "next-intl";
import { ArrowLeft, ArrowRight, PackageOpen } from "lucide-react";
import { motion, Variants } from "framer-motion";
import Link from "next/link";
import { getBrandBySlug } from "@/actions/brand";
import { getProducts } from "@/actions/product";
import { getCategories } from "@/actions/category";

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.15 }
  }
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 40, scale: 0.95 },
  show: { opacity: 1, y: 0, scale: 1, transition: { type: "spring", stiffness: 100, damping: 15 } }
};

export default function BrandPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const brandSlug = resolvedParams.id;
  const locale = useLocale();
  const isRtl = locale === 'fa';

  const [brand, setBrand] = useState<any>(null);
  const [brandProducts, setBrandProducts] = useState<any[]>([]);
  const [categoriesData, setCategoriesData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const brandRes = await getBrandBySlug(brandSlug);
      
      if (brandRes.success && brandRes.data) {
        const foundBrand = brandRes.data;
        setBrand(foundBrand);
        
        const [prodsRes, catsRes] = await Promise.all([
            getProducts({ status: 'all' }),
            getCategories()
        ]);

        if (catsRes.success && catsRes.data) {
            setCategoriesData(catsRes.data);
        }

        if (prodsRes.success && prodsRes.data) {
          const bProducts = prodsRes.data.filter((p: any) => 
            (
                p.brandId?._id === foundBrand._id ||
                p.brandId?.slug === foundBrand.slug ||
                String(p.brandId?._id || p.brandId || p.brand) === String(foundBrand._id)
            ) && p.status !== 'draft'
          );
          setBrandProducts(bProducts);
        }
      }
      setIsLoading(false);
    };
    
    fetchData();
  }, [brandSlug]);

  if (isLoading) {
    return <GlobalLoading />;
  }

  if (!brand) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-950 pt-20">
        <h1 className="text-4xl font-black text-gray-800 dark:text-gray-200">
          {isRtl ? "برند پیدا نشد!" : "Brand not found!"}
        </h1>
        <Link href={`/${locale}/brands`} className="mt-6 text-amber-500 hover:underline font-bold">
          {isRtl ? "بازگشت به لیست برندها" : "Back to Brands"}
        </Link>
      </div>
    );
  }

  const brandName = isRtl ? brand.faName : (brand.enName || brand.faName);
  const sloganToUse = isRtl ? (brand.faSlogan || brand.enName || "") : (brand.enSlogan || brand.faSlogan || "");
  const logoToUse = isRtl ? (brand.logoFa || brand.logo) : (brand.logoEn || brand.logo);

  return (
    <main className="w-full bg-transparent min-h-screen pb-24" dir={isRtl ? "rtl" : "ltr"}>
      
      {/* 1. سکشن هیرو: ماسک صرفاً روی دیو تصویر پس‌زمینه اعمال شده و محتوای متنی خارج از ماسک است */}
      <section className="relative w-full h-64 sm:h-80 md:h-[50vh] lg:h-[60vh] flex items-end justify-center">
        
        {/* دیو پس‌زمینه کاور فوتو همراه با ماسک محوکننده پایینی */}
        <div className="absolute inset-0 z-0 overflow-hidden [-webkit-mask-image:linear-gradient(to_top,transparent_0%,black_25%,black_100%)] mask-[linear-gradient(to_top,transparent_0%,black_25%,black_100%)]">
          <motion.div 
            className="w-full h-full"
            initial={{ scale: 1.08 }}
            animate={{ scale: 1 }}
            transition={{ duration: 8, ease: "easeOut" }}
          >
            {brand.heroImage && (
              <img 
                src={brand.heroImage} 
                alt={`${brandName} Hero`} 
                className="w-full h-full object-cover object-center"
              />
            )}
          </motion.div>
          {/* گرادیانت تیره فقط روی تصویر کاور برای خوانایی بهتر */}
          <div className="absolute inset-0 bg-linear-to-t from-gray-950/80 via-gray-950/30 to-transparent pointer-events-none" />
        </div>

        {/* محتوای روی هیرو (لوگو، نام برند و شعار) - کاملاً خارج از لایه ماسک با z-index بالا */}
        <div className="relative z-30 container mx-auto px-6 pb-8 md:pb-12 flex flex-col sm:flex-row items-center justify-center sm:justify-start gap-6 pointer-events-auto">
          <motion.div 
            initial={{ opacity: 0, scale: 0.5, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 120, damping: 15, delay: 0.1 }}
            className="w-24 h-24 sm:w-32 sm:h-32 md:w-36 md:h-36 rounded-3xl bg-white dark:bg-gray-900 p-3 shadow-2xl border-2 border-white/20 backdrop-blur-md flex items-center justify-center shrink-0 overflow-hidden"
          >
            {logoToUse && (
              <img 
                src={logoToUse} 
                alt={`${brandName} Logo`} 
                className="w-full h-full object-contain"
              />
            )}
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
            className="text-center sm:text-start"
          >
            <h1 className="text-3xl sm:text-5xl md:text-6xl font-black text-white drop-shadow-[0_4px_12px_rgba(0,0,0,0.8)] tracking-tight">
              {brandName}
            </h1>
            {sloganToUse && (
              <p className="text-sm sm:text-base md:text-lg font-bold text-amber-400 mt-2 drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)]">
                {sloganToUse}
              </p>
            )}
          </motion.div>
        </div>
      </section>

      {/* 2. سکشن لیست محصولات برند */}
      <section className="bg-gray-50 dark:bg-gray-900/50 py-12 md:py-16 mt-4">
        <div className="container mx-auto px-6">
          <motion.div 
            initial={{ opacity: 0, x: isRtl ? 50 : -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: false }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-10"
          >
            <div>
              <h2 className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white">
                {isRtl ? "محصولات این برند" : "Brand Products"}
              </h2>
              <p className="text-xs sm:text-sm text-gray-500 mt-1 font-medium">
                {isRtl ? `تعداد ${brandProducts.length} محصول از این برند یافت شد.` : `${brandProducts.length} products found.`}
              </p>
            </div>
          </motion.div>

          {brandProducts.length > 0 ? (
            <motion.div 
              variants={containerVariants}
              initial="hidden"
              whileInView="show"
              viewport={{ once: false, margin: "-50px" }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8"
            >
              {brandProducts.map((product) => {
                const title = isRtl ? product.faTitle : (product.enTitle || product.faTitle);
                
                const subCatObj = categoriesData.find(c => c.slug === product.category);
                const catLabel = subCatObj ? (isRtl ? subCatObj.faName : subCatObj.enName) : product.category;

                const imgUrl = product.images?.main || "https://placehold.co/400x400/transparent/0f172a?text=No+Image";

                return (
                  <motion.div 
                    key={product._id} 
                    variants={itemVariants}
                    className="bg-white dark:bg-gray-800 rounded-3xl p-5 md:p-6 shadow-sm hover:shadow-xl transition-all duration-300 group border border-gray-100 dark:border-gray-700 flex flex-col"
                  >
                    <Link href={`/${locale}/products/${product.slug}`} className="block flex-col h-full">
                      <div className="w-full h-56 mb-5 relative overflow-hidden rounded-2xl bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
                        <img 
                          src={imgUrl} 
                          alt={title}
                          className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-500 drop-shadow-xl"
                        />
                      </div>
                      
                      <div className="mb-3">
                        <span className="text-[10px] font-bold text-amber-600 bg-amber-100 dark:bg-amber-500/10 px-2.5 py-1 rounded-full inline-block">
                          {catLabel}
                        </span>
                      </div>
                      
                      <h3 className="text-base sm:text-lg font-black text-gray-900 dark:text-white mb-4 leading-snug line-clamp-2">
                        {title}
                      </h3>
                      
                      <button className="mt-auto w-full flex items-center justify-center gap-2 py-3 bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-white hover:bg-amber-400 hover:text-gray-900 rounded-xl font-bold text-xs sm:text-sm transition-colors group/btn">
                        <span>{isRtl ? "مشاهده محصول" : "View Product"}</span>
                        {isRtl ? <ArrowLeft size={16} className="group-hover/btn:-translate-x-1 transition-transform" /> : <ArrowRight size={16} className="group-hover/btn:translate-x-1 transition-transform" />}
                      </button>
                    </Link>
                  </motion.div>
                );
              })}
            </motion.div>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 bg-white dark:bg-gray-800/40 rounded-3xl border border-gray-100 dark:border-gray-800 text-gray-400">
              <PackageOpen size={64} className="mb-4 opacity-50" />
              <p className="text-base font-bold">{isRtl ? "هنوز محصولی برای این برند ثبت نشده است." : "No products found for this brand yet."}</p>
            </div>
          )}
        </div>
      </section>

    </main>
  );
}