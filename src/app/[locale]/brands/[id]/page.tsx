"use client";

import GlobalLoading from "@/components/GlobalLoading";
import React, { use, useState, useEffect } from "react";
import { useLocale } from "next-intl";
import { ArrowLeft, ArrowRight, PackageOpen, Loader2 } from "lucide-react";
import { motion, Variants } from "framer-motion";
import Link from "next/link";
import { getBrands } from "@/actions/brand";
import { getProducts } from "@/actions/product";

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
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      // 1. ابتدا دریافت برندها برای پیدا کردن برند مورد نظر از روی اسلاگ
      const brandsRes = await getBrands();
      if (brandsRes.success && brandsRes.data) {
        const foundBrand = brandsRes.data.find((b: any) => b.slug === brandSlug);
        
        if (foundBrand) {
          setBrand(foundBrand);
          
          // 2. دریافت محصولات منتشر شده‌ی متعلق به این برند
          // در اکشن محصولات شما، brandId.slug یا brandId._id در دسترس است
          const prodsRes = await getProducts({ status: 'published', brandId: foundBrand._id });
          if (prodsRes.success && prodsRes.data) {
            setBrandProducts(prodsRes.data);
          }
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
        <Link href={`/${locale}/brands`} className="mt-6 text-amber-500 hover:underline">
          {isRtl ? "بازگشت به لیست برندها" : "Back to Brands"}
        </Link>
      </div>
    );
  }

  const brandName = isRtl ? brand.faName : brand.enName;
  const brandDesc = isRtl ? brand.faDesc : brand.enDesc;
  const logoToUse = isRtl ? brand.logoFa : brand.logoEn;

  return (
    <main className="w-full bg-transparent min-h-screen pt-32 pb-24 overflow-hidden" dir={isRtl ? "rtl" : "ltr"}>
      
      {/* 1. سکشن هیروی سینمایی برند */}
      <section className="relative w-full h-[50vh] md:h-[65vh] flex items-center justify-center overflow-hidden">
        
        <motion.div 
          className="absolute inset-0 z-0 bg-gray-900"
          initial={{ scale: 1.1 }}
          animate={{ scale: 1 }}
          transition={{ duration: 10, ease: "easeOut" }}
        >
          {brand.heroImage && (
            <img 
              src={brand.heroImage} 
              alt={`${brandName} Hero`} 
              className="w-full h-full object-cover opacity-70"
            />
          )}
          <div className="absolute inset-0 bg-linear-to-t from-gray-950 via-gray-900/60 to-transparent"></div>
        </motion.div>

        {/* محتوای روی هیرو */}
        <div className="relative z-10 container mx-auto px-6 flex flex-col items-center justify-center mt-10">
          <motion.div 
            initial={{ opacity: 0, scale: 0.5, rotate: -15 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            transition={{ type: "spring", stiffness: 120, damping: 15, delay: 0.2 }}
            className="w-32 h-32 md:w-40 md:h-40 rounded-full bg-white dark:bg-gray-900 p-3 shadow-2xl mb-6 border-4 border-white/20 backdrop-blur-md flex items-center justify-center overflow-hidden"
          >
            {logoToUse && (
              <img 
                src={logoToUse} 
                alt={`${brandName} Logo`} 
                className="w-full h-full object-contain"
              />
            )}
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
            className="text-5xl md:text-7xl font-black text-white drop-shadow-2xl text-center"
          >
            {brandName}
          </motion.h1>
        </div>
      </section>

      {/* 2. سکشن توضیحات برند */}
      <section className="container mx-auto px-6 py-16 md:py-24 overflow-hidden">
        <motion.div 
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false, margin: "-100px" }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="max-w-4xl mx-auto text-center"
        >
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-8 relative inline-block">
            {isRtl ? `درباره برند ${brandName}` : `About ${brandName}`}
            <motion.span 
              initial={{ width: 0 }}
              whileInView={{ width: "4rem" }}
              viewport={{ once: false }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="absolute -bottom-3 left-1/2 -translate-x-1/2 h-1 bg-amber-500 rounded-full"
            ></motion.span>
          </h2>
          <p className="text-lg md:text-xl text-gray-600 dark:text-gray-300 leading-loose md:leading-loose text-center">
            {brandDesc || (isRtl ? "توضیحاتی ثبت نشده است." : "No description available.")}
          </p>
        </motion.div>
      </section>

      {/* 3. سکشن لیست محصولات برند */}
      <section className="bg-gray-50 dark:bg-gray-900/50 py-16 md:py-24 border-t border-gray-100 dark:border-gray-900">
        <div className="container mx-auto px-6">
          <motion.div 
            initial={{ opacity: 0, x: isRtl ? 50 : -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: false }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="flex items-center justify-between mb-12"
          >
            <div>
              <h2 className="text-3xl font-black text-gray-900 dark:text-white">
                {isRtl ? "محصولات این برند" : "Brand Products"}
              </h2>
              <p className="text-gray-500 mt-2 font-medium">
                {isRtl ? `تعداد ${brandProducts.length} محصول یافت شد.` : `${brandProducts.length} products found.`}
              </p>
            </div>
          </motion.div>

          {brandProducts.length > 0 ? (
            <motion.div 
              variants={containerVariants}
              initial="hidden"
              whileInView="show"
              viewport={{ once: false, margin: "-50px" }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8"
            >
              {brandProducts.map((product) => {
                const title = isRtl ? product.faTitle : product.enTitle;
                let catLabel = product.mainCat;
                if (product.mainCat === 'beverage') catLabel = isRtl ? 'نوشیدنی' : 'Beverage';
                if (product.mainCat === 'snack') catLabel = isRtl ? 'اسنک' : 'Snacks';
                if (product.mainCat === 'bakery') catLabel = isRtl ? 'کیک و بیسکویت' : 'Bakery';

                const imgUrl = product.images?.main || "https://placehold.co/400x400/transparent/0f172a?text=No+Image";

                return (
                  <motion.div 
                    key={product._id} 
                    variants={itemVariants}
                    className="bg-white dark:bg-gray-800 rounded-3xl p-6 shadow-sm hover:shadow-2xl transition-all duration-300 group border border-gray-100 dark:border-gray-700 flex flex-col"
                  >
                    <Link href={`/product/${product.slug}`} className="block">
                      <div className="w-full h-64 mb-6 relative overflow-hidden rounded-2xl bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
                        <img 
                          src={imgUrl} 
                          alt={title}
                          className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-500 drop-shadow-xl"
                        />
                      </div>
                      
                      <span className="text-xs font-bold text-amber-600 bg-amber-100 dark:bg-amber-500/10 px-3 py-1 rounded-full mb-3 inline-block">
                        {catLabel}
                      </span>
                      
                      <h3 className="text-lg font-black text-gray-900 dark:text-white mb-2 leading-tight">
                        {title}
                      </h3>
                      
                      <button className="mt-auto w-full flex items-center justify-center gap-2 py-3 bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-white hover:bg-amber-400 hover:text-gray-900 rounded-xl font-bold transition-colors group/btn">
                        <span>{isRtl ? "مشاهده محصول" : "View Product"}</span>
                        {isRtl ? <ArrowLeft size={16} className="group-hover/btn:-translate-x-1 transition-transform" /> : <ArrowRight size={16} className="group-hover/btn:translate-x-1 transition-transform" />}
                      </button>
                    </Link>
                  </motion.div>
                );
              })}
            </motion.div>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 text-gray-400">
              <PackageOpen size={64} className="mb-4 opacity-50" />
              <p className="text-lg font-bold">{isRtl ? "هنوز محصولی برای این برند ثبت نشده است." : "No products found for this brand yet."}</p>
            </div>
          )}
        </div>
      </section>

    </main>
  );
}