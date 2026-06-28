"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useLocale } from "next-intl";
import { motion } from "framer-motion";
import { Clock, Calendar, User, ArrowRight, Share2, Mail, MessageCircle, Heart, Loader2 } from "lucide-react";

// اتصال به اکشن دیتابیس
import { getBlogs } from "@/actions/blog";

export default function BlogPostPage() {
  const params = useParams();
  const router = useRouter();
  const locale = useLocale();
  const slug = params?.slug as string;
  
  const [post, setPost] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  // فراخوانی مقاله بر اساس اسلاگ از دیتابیس
  useEffect(() => {
    const fetchSinglePost = async () => {
      if (slug) {
        const res = await getBlogs({ slug: slug, status: "published" });
        if (res.success && res.data && res.data.length > 0) {
          setPost(res.data[0]);
        }
      }
      setIsLoading(false);
    };
    fetchSinglePost();
  }, [slug]);

  const customEase: [number, number, number, number] = [0.22, 1, 0.36, 1];

  const titleAnim = {
    initial: { opacity: 0, x: 80 },
    whileInView: { opacity: 1, x: 0 },
    viewport: { once: false, amount: 0.3 },
    transition: { opacity: { duration: 0.4, delay: 0.1 }, x: { duration: 1, ease: customEase, delay: 0.1 } }
  };

  const badgeAnim = {
    initial: { opacity: 0, x: -50 },
    whileInView: { opacity: 1, x: 0 },
    viewport: { once: false, amount: 0.3 },
    transition: { opacity: { duration: 0.4, delay: 0.3 }, x: { duration: 1, ease: customEase, delay: 0.3 } }
  };

  const detailsAnim = (index: number) => ({
    initial: { opacity: 0, y: 30 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: false, amount: 0.8 },
    transition: { opacity: { duration: 0.3, delay: 0.5 + (index * 0.15) }, y: { duration: 0.8, ease: customEase, delay: 0.5 + (index * 0.15) } }
  });

  if (isLoading) {
    return (
      <div className="min-h-screen w-full flex flex-col items-center justify-center bg-transparent px-4">
        <Loader2 className="animate-spin text-amber-500 mb-4" size={40} />
        <p className="text-gray-500 font-bold">در حال بارگذاری مقاله...</p>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen w-full flex flex-col items-center justify-center bg-transparent px-4">
        <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-4">
          مقاله‌ای با این آدرس یافت نشد!
        </h2>
        <button 
          onClick={() => router.push(`/${locale}/blog`)}
          className="bg-amber-400 text-gray-950 px-6 py-3 rounded-full font-black text-xs flex items-center gap-2"
        >
          <ArrowRight size={16} /> 
          بازگشت به مجله گندم
        </button>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-transparent pt-28 pb-24 px-6 md:px-12 max-w-6xl mx-auto" dir="rtl">
      
      <article className="max-w-4xl mx-auto">
        <div className="overflow-hidden py-2">
          <Link href={`/${locale}/blog`} className="inline-flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-amber-500 transition-colors mb-8">
            <ArrowRight size={16} /> بازگشت به مجله
          </Link>
          
          <motion.div {...badgeAnim} className="flex items-center gap-3 text-xs font-black text-amber-600 dark:text-amber-400 mb-4">
            <span className="bg-amber-100 dark:bg-amber-500/10 px-3 py-1.5 rounded-md">
              {post.category === 'health' ? 'سبک زندگی و سلامت' : post.category === 'news' ? 'اخبار گندم' : 'معرفی محصولات'}
            </span>
          </motion.div>

          <motion.h1 {...titleAnim} className="text-3xl md:text-5xl font-black text-gray-900 dark:text-white leading-tight mb-6">
            {post.faTitle}
          </motion.h1>

          <div className="flex flex-wrap items-center gap-6 text-sm font-bold text-gray-600 dark:text-gray-400 mb-10 pb-6 border-b border-gray-200/50 dark:border-gray-800/50 overflow-hidden">
            <motion.span {...detailsAnim(0)} className="flex items-center gap-2"><User size={16} className="text-gray-400"/> {post.author}</motion.span>
            <motion.span {...detailsAnim(1)} className="flex items-center gap-2"><Calendar size={16} className="text-gray-400"/> {new Date(post.createdAt).toLocaleDateString('fa-IR')}</motion.span>
            <motion.span {...detailsAnim(2)} className="flex items-center gap-2"><Clock size={16} className="text-gray-400"/> {post.readTime} مطالعه</motion.span>
          </div>
        </div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.98, y: 40 }} 
          whileInView={{ opacity: 1, scale: 1, y: 0 }} 
          viewport={{ once: false, amount: 0.2 }}
          transition={{ opacity: { duration: 0.5 }, y: { duration: 1, ease: customEase }, scale: { duration: 1, ease: customEase } }}
          className="w-full h-64 md:h-128 rounded-[2.5rem] overflow-hidden mb-12 shadow-2xl border border-white/20 dark:border-gray-800/50 bg-white/10 dark:bg-gray-900/10 backdrop-blur-sm p-2"
        >
          <img src={post.coverImage} alt={post.faTitle} className="w-full h-full object-cover rounded-[2rem]" />
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 40 }} 
          whileInView={{ opacity: 1, y: 0 }} 
          viewport={{ once: false, amount: 0.1 }}
          transition={{ opacity: { duration: 0.4 }, y: { duration: 1, ease: customEase } }}
          className="max-w-3xl mx-auto bg-white/70 dark:bg-gray-950/70 backdrop-blur-xl border border-white/20 dark:border-gray-800/50 rounded-3xl p-8 md:p-12 shadow-lg"
        >
          <div 
            className="prose prose-lg dark:prose-invert prose-headings:font-black prose-p:font-medium prose-p:leading-relaxed prose-p:text-gray-700 dark:prose-p:text-gray-300 prose-a:text-amber-500 hover:prose-a:text-amber-600 max-w-none"
            dangerouslySetInnerHTML={{ __html: post.content }}
          />

          <div className="mt-16 pt-8 border-t border-gray-200/50 dark:border-gray-800/50 flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex gap-2">
              <span className="text-xs font-bold text-gray-500 bg-gray-100/50 dark:bg-gray-800/50 px-3 py-1.5 rounded-md">
                #{post.seo?.keywords ? post.seo.keywords.split(',')[0] : 'گندم'}
              </span>
            </div>
            
            <div className="flex items-center gap-4">
              <span className="text-sm font-bold text-gray-500 flex items-center gap-2"><Share2 size={16}/> اشتراک‌گذاری در:</span>
              <div className="flex gap-2">
                <button className="p-2 bg-blue-500/10 text-blue-600 rounded-full hover:bg-blue-500 hover:text-white transition-colors" title="لینکدین">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect width="4" height="12" x="2" y="9"/><circle cx="4" cy="4" r="2"/></svg>
                </button>
                <button className="p-2 bg-sky-500/10 text-sky-500 rounded-full hover:bg-sky-500 hover:text-white transition-colors" title="توییتر">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"/></svg>
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </article>

      <motion.div 
        initial={{ opacity: 0, y: 40 }} 
        whileInView={{ opacity: 1, y: 0 }} 
        viewport={{ once: false, amount: 0.1 }}
        transition={{ duration: 1, ease: customEase }}
        className="max-w-3xl mx-auto mt-16 bg-white/50 dark:bg-gray-950/50 backdrop-blur-xl border border-white/20 dark:border-gray-800/50 rounded-[2rem] p-8 md:p-10 shadow-lg"
      >
        <h3 className="text-xl font-black text-gray-900 dark:text-white mb-8 flex items-center gap-2">
          <MessageCircle size={24} className="text-amber-500"/> ثبت دیدگاه
        </h3>
        
        <form className="mb-10" onSubmit={(e) => e.preventDefault()}>
          <div className="flex flex-col gap-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input type="text" placeholder="نام شما" className="bg-white/50 dark:bg-gray-900/50 border border-gray-200/50 dark:border-gray-800/50 rounded-xl px-4 py-3 text-sm font-bold outline-none focus:border-amber-400" />
              <input type="email" placeholder="ایمیل شما (منتشر نمی‌شود)" className="bg-white/50 dark:bg-gray-900/50 border border-gray-200/50 dark:border-gray-800/50 rounded-xl px-4 py-3 text-sm font-bold outline-none focus:border-amber-400" />
            </div>
            <textarea placeholder="دیدگاه ارزشمند خود را درباره این مقاله بنویسید..." rows={4} className="bg-white/50 dark:bg-gray-900/50 border border-gray-200/50 dark:border-gray-800/50 rounded-xl px-4 py-3 text-sm font-bold outline-none focus:border-amber-400 resize-none"></textarea>
            <button className="bg-amber-400 hover:bg-amber-500 text-gray-950 font-black px-6 py-3 rounded-xl transition-colors self-end text-sm">
              ارسال دیدگاه
            </button>
          </div>
        </form>

        <div className="space-y-6">
          <div className="bg-white/40 dark:bg-gray-900/40 rounded-2xl p-5 border border-gray-100/50 dark:border-gray-800/50">
            <div className="flex justify-between items-center mb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gray-200 dark:bg-gray-800 rounded-full flex items-center justify-center text-gray-500 font-black">ک.م</div>
                <div>
                  <h4 className="text-sm font-black text-gray-900 dark:text-white">کاربر مهمان</h4>
                  <span className="text-[10px] font-bold text-gray-400">۲ ساعت پیش</span>
                </div>
              </div>
              <button className="text-gray-400 hover:text-red-500 transition-colors"><Heart size={16}/></button>
            </div>
            <p className="text-sm font-medium text-gray-600 dark:text-gray-300 leading-relaxed">
              مقاله بسیار مفید و کاملی بود. مخصوصا بخش مربوط به ترکیبات ویتامین‌ها خیلی خوب توضیح داده شده بود. ممنون از تحریریه جزیره گندم.
            </p>
          </div>
        </div>
      </motion.div>

      <motion.div 
        initial={{ opacity: 0, y: 40 }} 
        whileInView={{ opacity: 1, y: 0 }} 
        viewport={{ once: false, amount: 0.3 }}
        transition={{ duration: 1, ease: customEase }}
        className="max-w-4xl mx-auto mt-16 bg-linear-to-br from-amber-400 to-amber-500 rounded-[2.5rem] p-10 md:p-16 text-center shadow-2xl relative overflow-hidden"
      >
        <div className="relative z-10">
          <Mail size={48} className="mx-auto text-amber-900 mb-6 opacity-80" />
          <h3 className="text-3xl font-black text-amber-950 mb-4">به باشگاه گندم بپیوندید</h3>
          <p className="text-amber-900/80 font-bold mb-8 max-w-md mx-auto">جدیدترین مقالات سلامت، اخبار افتتاحیه‌ها و تخفیف‌های ویژه را در ایمیل خود دریافت کنید.</p>
          <form className="flex flex-col sm:flex-row gap-3 max-w-lg mx-auto" onSubmit={(e) => e.preventDefault()}>
            <input type="email" placeholder="آدرس ایمیل شما..." className="grow px-6 py-4 rounded-xl text-sm font-bold text-gray-900 outline-none border-2 border-transparent focus:border-amber-600/30 shadow-inner" dir="ltr" />
            <button type="submit" className="bg-amber-950 hover:bg-black text-white px-8 py-4 rounded-xl text-sm font-black transition-colors whitespace-nowrap shadow-xl">
              عضویت رایگان
            </button>
          </form>
        </div>
      </motion.div>

    </main>
  );
}