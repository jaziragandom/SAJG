"use client";

import GlobalLoading from "@/components/GlobalLoading";
import React, { use, useState, useEffect } from "react";
import { useLocale } from "next-intl";
import { ArrowLeft, ArrowRight, PackageOpen, Loader2 } from "lucide-react";
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
        <Link href={`/${locale}/brands`} className="mt-6 text-amber-500 hover:underline">
          {isRtl ? "بازگشت به لیست برندها" : "Back to Brands"}
        </Link>
      </div>
    );
  }

  const brandName = isRtl ? brand.faName : (brand.enName || brand.faName);
  const brandDesc = isRtl ? brand.faDesc : (brand.enDesc || brand.faDesc);
  const logoToUse = isRtl ? (brand.logoFa || brand.logo) : (brand.logoEn || brand.logo);

  return (
    <main className="w-full bg-transparent min-h-screen pb-24" dir={isRtl ? "rtl" : "ltr"}>
      
      {/* 1. سکشن هیروی سینمایی برند - چسبیده به سقف مرورگر با ماسک گرادیانت */}
      <section className="relative w-full h-[50vh] md:h-[65vh] flex items-center justify-center">
        
        <motion.div 
          className="absolute inset-0 z-0 [-webkit-mask-image:linear-gradient(to_top,transparent_0%,black_25%,black_100%)] mask-[linear-gradient(to_top,transparent_0%,black_25%,black_100%)]"
          initial={{ scale: 1.1 }}
          animate={{ scale: 1 }}
          transition={{ duration: 10, ease: "easeOut" }}
        >
          {brand.heroImage && (
            <img 
              src={brand.heroImage} 
              alt={`${brandName} Hero`} 
              className="w-full h-full object-cover"
            />
          )}
        </motion.div>

        {/* محتوای روی هیرو */}
        <div className="relative z-10 container mx-auto px-6 flex flex-col items-center justify-center pt-24 md:pt-32">
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

      {/* 2. سکشن توضیحات برند - ارتفاع استاندارد و متناسب با طول متن */}
      <section className="container mx-auto px-6 pt-8 pb-4">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false, amount: 0.2 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="max-w-4xl mx-auto text-center"
        >
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-4 relative inline-block">
            {isRtl ? `درباره برند ${brandName}` : `About ${brandName}`}
            <motion.span 
              initial={{ width: 0 }}
              whileInView={{ width: "4rem" }}
              viewport={{ once: false }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="absolute -bottom-3 left-1/2 -translate-x-1/2 h-1 bg-amber-500 rounded-full"
            ></motion.span>
          </h2>
          <p className="text-lg md:text-xl text-gray-600 dark:text-gray-300 leading-relaxed text-center mt-6">
            {brandDesc || (isRtl ? "توضیحاتی ثبت نشده است." : "No description available.")}
          </p>
        </motion.div>
      </section>

      {/* 3. سکشن لیست محصولات برند */}
      <section className="bg-gray-50 dark:bg-gray-900/50 pt-10 pb-16 md:pt-16 md:pb-24 border-t border-gray-100 dark:border-gray-900 mt-6">
        <div className="container mx-auto px-6">
          <motion.div 
            initial={{ opacity: 0, x: isRtl ? 50 : -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: false }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="flex items-center justify-between mb-10"
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
                const title = isRtl ? product.faTitle : (product.enTitle || product.faTitle);
                
                const subCatObj = categoriesData.find(c => c.slug === product.category);
                const catLabel = subCatObj ? (isRtl ? subCatObj.faName : subCatObj.enName) : product.category;

                const imgUrl = product.images?.main || "https://placehold.co/400x400/transparent/0f172a?text=No+Image";

                return (
                  <motion.div 
                    key={product._id} 
                    variants={itemVariants}
                    className="bg-white dark:bg-gray-800 rounded-3xl p-6 shadow-sm hover:shadow-2xl transition-all duration-300 group border border-gray-100 dark:border-gray-700 flex flex-col"
                  >
                    <Link href={`/${locale}/products/${product.slug}`} className="block">
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