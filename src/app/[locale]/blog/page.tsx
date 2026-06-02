"use client";

import React, { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Clock, Calendar, ArrowUpLeft } from "lucide-react";
import { useLocale } from "next-intl";
import { MOCK_BLOG_POSTS } from "@/lib/mockData";

export default function BlogListPage() {
  const locale = useLocale();
  
  // استیت مدیریت فیلتر دسته‌بندی‌ها
  const [activeCategory, setActiveCategory] = useState("all");

  // لیست دسته‌بندی‌ها برای نمایش در دکمه‌های فیلتر
  const categories = [
    { id: "all", label: "همه مقالات" },
    { id: "health", label: "سبک زندگی و سلامت" },
    { id: "news", label: "اخبار گندم" },
    { id: "products", label: "معرفی محصولات" }
  ];

  // فیلتر کردن مقالات بر اساس انتشار و سپس بر اساس دسته‌بندی فعال
  const publishedPosts = MOCK_BLOG_POSTS.filter(p => p.status === "published");
  const filteredPosts = publishedPosts.filter(p => activeCategory === "all" || p.category === activeCategory);
  
  const featuredPost = filteredPosts[0];
  const otherPosts = filteredPosts.slice(1);

  // گراف سرعت ترمزدار (سریع در ابتدا، آرام در انتها)
  const customEase: [number, number, number, number] = [0.22, 1, 0.36, 1];

  // انیمیشن تایتل (از راست به چپ)
  const titleAnim = {
    initial: { opacity: 0, x: 80 },
    whileInView: { opacity: 1, x: 0 },
    viewport: { once: false, amount: 0.3, margin: "50px" },
    transition: { opacity: { duration: 0.4, delay: 0.1 }, x: { duration: 1, ease: customEase, delay: 0.1 } }
  };

  // انیمیشن توضیحات (از چپ به راست) - شروع با کمی تاخیر نسبت به تایتل
  const descAnim = {
    initial: { opacity: 0, x: -80 },
    whileInView: { opacity: 1, x: 0 },
    viewport: { once: false, amount: 0.3, margin: "50px" },
    transition: { opacity: { duration: 0.4, delay: 0.3 }, x: { duration: 1, ease: customEase, delay: 0.3 } }
  };

  // انیمیشن دکمه‌های فیلتر (از پایین به بالا) - بعد از توضیحات
  const filterAnim = {
    initial: { opacity: 0, y: 30 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: false, amount: 0.3, margin: "50px" },
    transition: { opacity: { duration: 0.4, delay: 0.5 }, y: { duration: 1, ease: customEase, delay: 0.5 } }
  };

  return (
    <main className="min-h-screen bg-transparent pt-32 pb-24 px-6 md:px-12 lg:px-20 max-w-6xl mx-auto" dir="rtl">
      
      {/* بخش هدر صفحه */}
      <div className="mb-16 text-center overflow-hidden py-4">
        <motion.h1 {...titleAnim} className="text-4xl md:text-6xl font-black text-gray-900 dark:text-white mb-4 tracking-tight">
          مجله گندم
        </motion.h1>
        <motion.p {...descAnim} className="text-gray-600 dark:text-gray-300 font-medium max-w-2xl mx-auto">
          داستان‌ها، اخبار و مقالات تخصصی از دنیای نوشیدنی‌ها و سبک زندگی سالم.
        </motion.p>

        {/* فیلتر دسته‌بندی‌ها */}
        <motion.div {...filterAnim} className="flex flex-wrap items-center justify-center gap-3 mt-8">
          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`px-5 py-2.5 rounded-full text-xs font-black transition-all duration-300 ${
                activeCategory === cat.id 
                  ? "bg-amber-400 text-gray-950 shadow-lg shadow-amber-400/20 scale-105" 
                  : "bg-white/50 dark:bg-gray-900/50 backdrop-blur-md border border-gray-200/50 dark:border-gray-800/50 text-gray-600 dark:text-gray-300 hover:bg-white dark:hover:bg-gray-800 hover:scale-105"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </motion.div>
      </div>

      {filteredPosts.length === 0 ? (
        <motion.div 
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} 
          className="py-20 text-center border-2 border-dashed border-gray-200/50 dark:border-gray-800/50 rounded-[2.5rem] bg-white/20 dark:bg-gray-900/20 backdrop-blur-xl"
        >
          <p className="text-gray-500 dark:text-gray-400 font-bold text-sm">مقاله‌ای در این دسته‌بندی یافت نشد.</p>
        </motion.div>
      ) : (
        <>
          {/* مقاله ویژه (Featured Article) */}
          {featuredPost && (
            <motion.div 
              key={`featured-${featuredPost.id}`} // اضافه کردن کلید برای اجرای مجدد انیمیشن هنگام تغییر فیلتر
              initial={{ opacity: 0, y: 60 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: false, amount: 0.2 }}
              transition={{ opacity: { duration: 0.4, delay: 0.2 }, y: { duration: 1, ease: customEase, delay: 0.2 } }}
              className="mb-12"
            >
              <Link href={`/${locale}/blog/${featuredPost.slug}`} className="group relative flex flex-col md:flex-row bg-white/60 dark:bg-gray-950/60 backdrop-blur-2xl border border-white/20 dark:border-gray-800/50 rounded-[2.5rem] overflow-hidden shadow-2xl hover:shadow-amber-500/10 transition-all duration-500">
                <div className="w-full md:w-3/5 h-64 md:h-112 relative overflow-hidden shrink-0">
                  <img src={featuredPost.coverImage} alt={featuredPost.faTitle} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out" />
                  <div className="absolute top-6 right-6 bg-amber-400 text-gray-950 text-xs font-black px-4 py-2 rounded-full shadow-lg">مقاله ویژه</div>
                </div>
                <div className="p-8 md:p-12 flex flex-col justify-center w-full">
                  <div className="flex items-center gap-4 text-xs font-bold text-gray-500 dark:text-gray-400 mb-4">
                    <span className="flex items-center gap-1.5"><Calendar size={14}/> {featuredPost.date}</span>
                    <span className="flex items-center gap-1.5"><Clock size={14}/> {featuredPost.readTime}</span>
                  </div>
                  <h2 className="text-2xl md:text-4xl font-black text-gray-900 dark:text-white mb-4 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors leading-tight">
                    {featuredPost.faTitle}
                  </h2>
                  <p className="text-gray-600 dark:text-gray-300 font-medium mb-8 line-clamp-3 leading-relaxed">
                    {featuredPost.excerpt}
                  </p>
                  <div className="mt-auto flex items-center gap-2 text-amber-600 dark:text-amber-400 font-black text-sm group-hover:gap-4 transition-all">
                    مطالعه کامل مقاله <ArrowUpLeft size={18} />
                  </div>
                </div>
              </Link>
            </motion.div>
          )}

          {/* گرید سایر مقالات */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {otherPosts.map((post, index) => (
              <motion.div 
                key={`grid-${post.id}`}
                initial={{ opacity: 0, y: 60 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: false, amount: 0.1, margin: "50px" }}
                transition={{ 
                  opacity: { duration: 0.4, delay: 0.1 + (index % 3) * 0.15 }, 
                  y: { duration: 1, ease: customEase, delay: 0.1 + (index % 3) * 0.15 } 
                }}
              >
                <Link href={`/${locale}/blog/${post.slug}`} className="flex flex-col h-full bg-white/60 dark:bg-gray-950/60 backdrop-blur-2xl border border-white/20 dark:border-gray-800/50 rounded-3xl overflow-hidden group hover:shadow-xl hover:-translate-y-1 transition-all duration-500">
                  <div className="h-48 relative overflow-hidden shrink-0">
                    <img src={post.thumbnailImage} alt={post.faTitle} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out" />
                    <div className="absolute top-4 right-4 bg-white/90 dark:bg-gray-900/90 backdrop-blur-md text-gray-900 dark:text-white text-[10px] font-black px-3 py-1.5 rounded-full">
                      {post.category === 'health' ? 'سلامت' : post.category === 'news' ? 'اخبار' : 'محصولات'}
                    </div>
                  </div>
                  <div className="p-6 flex flex-col grow">
                    <h3 className="text-lg font-black text-gray-900 dark:text-white mb-3 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors line-clamp-2 leading-snug">
                      {post.faTitle}
                    </h3>
                    <p className="text-xs text-gray-600 dark:text-gray-400 font-medium mb-6 line-clamp-2 leading-relaxed">
                      {post.excerpt}
                    </p>
                    <div className="mt-auto flex items-center justify-between text-[11px] font-bold text-gray-500 dark:text-gray-400 border-t border-gray-200/50 dark:border-gray-800/50 pt-4">
                      <span className="flex items-center gap-1.5"><Calendar size={14}/> {post.date}</span>
                      <span className="flex items-center gap-1.5"><Clock size={14}/> {post.readTime}</span>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </>
      )}
    </main>
  );
}