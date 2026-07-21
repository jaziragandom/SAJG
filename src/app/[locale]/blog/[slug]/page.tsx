"use client";

import GlobalLoading from "@/components/GlobalLoading";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useLocale } from "next-intl";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Clock, 
  Calendar, 
  User, 
  ArrowRight, 
  ArrowLeft,
  Share2, 
  Mail, 
  MessageCircle, 
  Heart, 
  Loader2, 
  CheckCircle2, 
  Reply, 
  ShieldCheck, 
  X, 
  Send, 
  Bookmark 
} from "lucide-react";
import { getBlogs } from "@/actions/blog";
import { submitComment, getApprovedComments } from "@/actions/communications";
import { subscribeToNewsletter } from "@/actions/newsletter";

// اضافه کردن آیکون‌های سفارشی برای شبکه‌های اجتماعی
const BrandWhatsapp = (props: any) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg>;
const BrandTelegram = (props: any) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" x2="11" y1="2" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>;
const BrandFacebook = (props: any) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>;


export default function BlogPostPage() {
  const params = useParams();
  const router = useRouter();
  const locale = useLocale();
  const isRtl = locale === 'fa';
  const slug = params?.slug as string;
  
  const [post, setPost] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // استیت‌های مربوط به سیستم کامنت‌گذاری درختی و چندسطحی
  const [approvedComments, setApprovedComments] = useState<any[]>([]);
  const [commentForm, setCommentForm] = useState({ 
    name: '', 
    email: '', 
    text: '' 
  });
  const [replyingTo, setReplyingTo] = useState<{ id: string; name: string } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [formMsg, setFormMsg] = useState({ type: '', text: '' });

  // استیت‌های تعاملی کاربر در صفحه مقاله
  const [liked, setLiked] = useState<boolean>(false);
  const [bookmarked, setBookmarked] = useState<boolean>(false);

  const [blogNlEmail, setBlogNlEmail] = useState("");
  const [blogNlLoading, setBlogNlLoading] = useState(false);
  const [blogNlMsg, setBlogNlMsg] = useState("");

  useEffect(() => {
    const fetchSinglePost = async () => {
      if (slug) {
        const res = await getBlogs({ 
          slug: slug, 
          status: "published" 
        });
        
        if (res.success && res.data && res.data.length > 0) {
          const currentPost = res.data[0];
          setPost(currentPost);
          
          const cmtRes = await getApprovedComments(currentPost._id);
          if (cmtRes.success && cmtRes.data) {
            setApprovedComments(cmtRes.data);
          }
        }
      }
      setIsLoading(false);
    };
    
    fetchSinglePost();
  }, [slug]);

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!commentForm.name || !commentForm.email || !commentForm.text) {
      setFormMsg({ 
        type: 'error', 
        text: isRtl ? 'پر کردن تمام فیلدها الزامی است.' : 'All fields are required.' 
      });
      return;
    }
    
    setIsSubmitting(true);
    setFormMsg({ type: '', text: '' });

    const res = await submitComment({ 
      name: commentForm.name,
      email: commentForm.email,
      text: commentForm.text,
      articleId: post._id,
      parentId: replyingTo ? replyingTo.id : "" 
    });

    if (res.success) {
      setFormMsg({ 
        type: 'success', 
        text: isRtl ? 'دیدگاه شما با موفقیت ثبت شد و پس از بررسی منتشر خواهد شد.' : 'Your comment was successfully submitted and will be published after review.' 
      });
      setCommentForm({ name: '', email: '', text: '' });
      setReplyingTo(null);
    } else {
      setFormMsg({ 
        type: 'error', 
        text: isRtl ? 'خطایی رخ داد. لطفاً دوباره تلاش کنید.' : 'An error occurred. Please try again.' 
      });
    }
    
    setIsSubmitting(false);
  };

  const handleBlogNewsletter = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!blogNlEmail || !blogNlEmail.includes("@")) return;
    setBlogNlLoading(true);
    setBlogNlMsg("");
    const res = await subscribeToNewsletter({
      email: blogNlEmail,
      source: `انتهای مقاله: ${isRtl ? post?.faTitle : post?.enTitle || "وبلاگ"}`,
      segment: "blog_health" 
    });
    setBlogNlLoading(false);
    if (res.success) {
      setBlogNlMsg(isRtl ? "عضویت شما با موفقیت انجام شد!" : "Successfully subscribed!");
      setBlogNlEmail("");
    } else {
      setBlogNlMsg(isRtl ? "خطایی رخ داد." : "An error occurred.");
    }
  };

  const customEase: [number, number, number, number] = [0.22, 1, 0.36, 1];

  const titleAnim = {
    initial: { opacity: 0, x: isRtl ? 80 : -80 },
    whileInView: { opacity: 1, x: 0 },
    viewport: { once: false, amount: 0.3 },
    transition: { 
      opacity: { duration: 0.4, delay: 0.1 }, 
      x: { duration: 1, ease: customEase, delay: 0.1 } 
    }
  };

  const badgeAnim = {
    initial: { opacity: 0, x: isRtl ? -50 : 50 },
    whileInView: { opacity: 1, x: 0 },
    viewport: { once: false, amount: 0.3 },
    transition: { 
      opacity: { duration: 0.4, delay: 0.3 }, 
      x: { duration: 1, ease: customEase, delay: 0.3 } 
    }
  };

  const detailsAnim = (index: number) => ({
    initial: { opacity: 0, y: 30 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: false, amount: 0.8 },
    transition: { 
      opacity: { duration: 0.3, delay: 0.5 + (index * 0.15) }, 
      y: { duration: 0.8, ease: customEase, delay: 0.5 + (index * 0.15) } 
    }
  });

  if (isLoading) {
    return <GlobalLoading />;
  }

  if (!post) {
    return (
      <div className="min-h-screen w-full flex flex-col items-center justify-center bg-transparent px-4">
        <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-4">
          {isRtl ? "مقاله‌ای با این آدرس یافت نشد!" : "Article not found!"}
        </h2>
        <button 
          onClick={() => router.push(`/${locale}/blog`)}
          className="bg-amber-400 text-gray-950 px-6 py-3 rounded-full font-black text-xs flex items-center gap-2 hover:bg-amber-500 transition-colors shadow-lg"
        >
          {isRtl ? <ArrowRight size={16} /> : <ArrowLeft size={16} />}
          {isRtl ? "بازگشت به مجله گندم" : "Back to Magazine"}
        </button>
      </div>
    );
  }

  const rootComments = approvedComments.filter(c => !c.parentId);
  const getReplies = (commentId: string) => approvedComments.filter(c => c.parentId === commentId);

  // تولید لینک‌های اشتراک‌گذاری
  const currentUrl = typeof window !== "undefined" ? window.location.href : "";
  const articleTitle = isRtl ? post.faTitle : post.enTitle;
  
  const shareText = isRtl
    ? `📰 ${articleTitle}\n\nمتن خلاصه: ${post.excerpt}\n\nلینک مقاله:`
    : `📰 ${articleTitle}\n\nSummary: ${post.excerpt}\n\nRead more:`;

  const encodedUrl = encodeURIComponent(currentUrl);
  const encodedTitle = encodeURIComponent(articleTitle);
  const encodedText = encodeURIComponent(shareText);

  // لینک‌های شبکه‌های اجتماعی
  const shareFacebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`;
  const shareTwitterUrl = `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`;
  const shareLinkedInUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`;
  const shareWhatsappUrl = `https://wa.me/?text=${encodedText}%0A${encodedUrl}`;
  const shareTelegramUrl = `https://t.me/share/url?url=${encodedUrl}&text=${encodedText}`;

  return (
    <main 
      className="min-h-screen bg-transparent pt-28 pb-24 px-6 md:px-12 max-w-6xl mx-auto" 
      dir={isRtl ? "rtl" : "ltr"}
    >
      <article className="max-w-4xl mx-auto">
        
        {/* سربرگ اطلاعات مقاله */}
        <div className="overflow-hidden py-2">
          <Link 
            href={`/${locale}/blog`} 
            className="inline-flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-amber-500 transition-colors mb-8"
          >
            {isRtl ? <ArrowRight size={16} /> : <ArrowLeft size={16} />} 
            {isRtl ? "بازگشت به مجله" : "Back to Magazine"}
          </Link>
          
          <motion.div 
            {...badgeAnim} 
            className="flex items-center justify-between gap-3 text-xs font-black text-amber-600 dark:text-amber-400 mb-4"
          >
            <span className="bg-amber-100 dark:bg-amber-500/10 px-3 py-1.5 rounded-md">
              {post.category === 'health' 
                ? (isRtl ? 'سبک زندگی و سلامت' : 'Health & Lifestyle')
                : post.category === 'news' 
                ? (isRtl ? 'اخبار گندم' : 'Gandum News')
                : (isRtl ? 'معرفی محصولات' : 'Products')}
            </span>
            
            <div className="flex items-center gap-2">
              <button 
                onClick={() => setLiked(!liked)} 
                className={`p-2 rounded-full transition-colors flex items-center gap-1 text-xs ${
                  liked 
                    ? 'bg-rose-500/10 text-rose-500 font-black' 
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-500 hover:text-rose-500'
                }`}
              >
                <Heart size={16} className={liked ? "fill-rose-500" : ""} />
                <span>{liked ? (isRtl ? 'پسندیدید' : 'Liked') : (isRtl ? 'پسندیدن' : 'Like')}</span>
              </button>
              
              <button 
                onClick={() => setBookmarked(!bookmarked)} 
                className={`p-2 rounded-full transition-colors ${
                  bookmarked 
                    ? 'bg-amber-500/10 text-amber-500' 
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-500 hover:text-amber-500'
                }`}
                title={isRtl ? "ذخیره مقاله" : "Save Article"}
              >
                <Bookmark size={16} className={bookmarked ? "fill-amber-500" : ""} />
              </button>
            </div>
          </motion.div>

          <motion.h1 
            {...titleAnim} 
            className="text-3xl md:text-5xl font-black text-gray-900 dark:text-white leading-tight mb-6"
          >
            {articleTitle}
          </motion.h1>

          <div className="flex flex-wrap items-center gap-6 text-sm font-bold text-gray-600 dark:text-gray-400 mb-10 pb-6 border-b border-gray-200/50 dark:border-gray-800/50 overflow-hidden">
            <motion.span {...detailsAnim(0)} className="flex items-center gap-2">
              <User size={16} className="text-gray-400"/> 
              {post.author || (isRtl ? "تیم تحریریه گندم" : "Editorial Team")}
            </motion.span>
            
            <motion.span {...detailsAnim(1)} className="flex items-center gap-2">
              <Calendar size={16} className="text-gray-400"/> 
              {post.createdAt ? new Date(post.createdAt).toLocaleDateString(isRtl ? 'fa-IR' : 'en-US') : (isRtl ? "امروز" : "Today")}
            </motion.span>
            
            <motion.span {...detailsAnim(2)} className="flex items-center gap-2">
              <Clock size={16} className="text-gray-400"/> 
              {post.readTime || (isRtl ? "۵ دقیقه" : "5 min")} {isRtl ? "مطالعه" : "read"}
            </motion.span>
          </div>
        </div>

        {/* تصویر شاخص مقاله */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.98, y: 40 }}
          whileInView={{ opacity: 1, scale: 1, y: 0 }}
          viewport={{ once: false, amount: 0.2 }}
          transition={{ 
            opacity: { duration: 0.5 }, 
            y: { duration: 1, ease: customEase }, 
            scale: { duration: 1, ease: customEase } 
          }}
          className="w-full h-64 md:h-128 rounded-[2.5rem] overflow-hidden mb-12 shadow-2xl border border-white/20 dark:border-gray-800/50 bg-white/10 dark:bg-gray-900/10 backdrop-blur-sm p-2"
        >
          <img 
            src={post.coverImage} 
            alt={articleTitle} 
            className="w-full h-full object-cover rounded-[2rem]" 
          />
        </motion.div>

        {/* محتوای اصلی مقاله */}
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

          {/* هشتگ‌ها و اشتراک‌گذاری در شبکه‌های اجتماعی */}
          <div className="mt-16 pt-8 border-t border-gray-200/50 dark:border-gray-800/50 flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex flex-wrap gap-2">
              {post.seo?.keywords ? (
                post.seo.keywords.split(',').map((kw: string, i: number) => (
                  <span 
                    key={i} 
                    className="text-xs font-bold text-gray-500 bg-gray-100/50 dark:bg-gray-800/50 px-3 py-1.5 rounded-md"
                  >
                    #{kw.trim()}
                  </span>
                ))
              ) : (
                <span className="text-xs font-bold text-gray-500 bg-gray-100/50 dark:bg-gray-800/50 px-3 py-1.5 rounded-md">
                  {isRtl ? "#جزیره_گندم" : "#Gandum_Island"}
                </span>
              )}
            </div>
            
            <div className="flex flex-wrap items-center gap-4">
              <span className="text-sm font-bold text-gray-500 flex items-center gap-2">
                <Share2 size={16}/> 
                {isRtl ? "اشتراک‌گذاری:" : "Share:"}
              </span>
              
              <div className="flex items-center gap-2">
                <a 
                  href={shareFacebookUrl} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="p-2.5 bg-blue-600/10 text-blue-600 rounded-full hover:bg-blue-600 hover:text-white transition-colors" 
                  title="Facebook"
                >
                  <BrandFacebook size={16} />
                </a>
                
                <a 
                  href={shareTwitterUrl} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="p-2.5 bg-sky-500/10 text-sky-500 rounded-full hover:bg-sky-500 hover:text-white transition-colors" 
                  title="Twitter"
                >
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    width="16" 
                    height="16" 
                    viewBox="0 0 24 24" 
                    fill="none" 
                    stroke="currentColor" 
                    strokeWidth="2" 
                    strokeLinecap="round" 
                    strokeLinejoin="round"
                  >
                    <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"/>
                  </svg>
                </a>
                
                <a 
                  href={shareWhatsappUrl} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="p-2.5 bg-green-500/10 text-green-500 rounded-full hover:bg-green-500 hover:text-white transition-colors" 
                  title="WhatsApp"
                >
                  <BrandWhatsapp size={16} />
                </a>

                <a 
                  href={shareTelegramUrl} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="p-2.5 bg-blue-400/10 text-blue-400 rounded-full hover:bg-blue-400 hover:text-white transition-colors" 
                  title="Telegram"
                >
                  <BrandTelegram size={16} />
                </a>

                <a 
                  href={shareLinkedInUrl} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="p-2.5 bg-blue-700/10 text-blue-700 rounded-full hover:bg-blue-700 hover:text-white transition-colors" 
                  title="LinkedIn"
                >
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    width="16" 
                    height="16" 
                    viewBox="0 0 24 24" 
                    fill="none" 
                    stroke="currentColor" 
                    strokeWidth="2" 
                    strokeLinecap="round" 
                    strokeLinejoin="round"
                  >
                    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/>
                    <rect width="4" height="12" x="2" y="9"/>
                    <circle cx="4" cy="4" r="2"/>
                  </svg>
                </a>
              </div>
            </div>
          </div>
        </motion.div>
      </article>

      {/* بخش تعاملی ثبت دیدگاه و گفتگوهای درختی */}
      <motion.div 
        id="comment-section"
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: false, amount: 0.1 }}
        transition={{ duration: 1, ease: customEase }}
        className="max-w-3xl mx-auto mt-16 bg-white/50 dark:bg-gray-950/50 backdrop-blur-xl border border-white/20 dark:border-gray-800/50 rounded-[2rem] p-8 md:p-10 shadow-lg"
      >
        <div className="flex items-center justify-between mb-8">
          <h3 className="text-xl font-black text-gray-900 dark:text-white flex items-center gap-2">
            <MessageCircle size={24} className="text-amber-500"/> 
            {isRtl ? "ثبت دیدگاه و پرسش" : "Leave a Comment"}
          </h3>
          
          {replyingTo && (
            <button 
              onClick={() => setReplyingTo(null)} 
              className="flex items-center gap-1.5 text-xs font-bold text-red-500 bg-red-500/10 px-3 py-1.5 rounded-xl hover:bg-red-500/20 transition-colors"
            >
              <X size={14} /> 
              {isRtl ? `انصراف از پاسخ به ${replyingTo.name}` : `Cancel reply to ${replyingTo.name}`}
            </button>
          )}
        </div>

        {replyingTo && (
          <div className="mb-4 p-3 bg-amber-400/10 border border-amber-400/30 rounded-xl text-xs font-bold text-amber-700 dark:text-amber-400 flex items-center gap-2">
            <Reply size={16} /> 
            {isRtl ? `در حال نوشتن پاسخ برای نظر کاربر: «${replyingTo.name}»` : `Replying to user: "${replyingTo.name}"`}
          </div>
        )}
        
        <form className="mb-12" onSubmit={handleCommentSubmit}>
          <div className="flex flex-col gap-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input 
                type="text" 
                value={commentForm.name} 
                onChange={e => setCommentForm({...commentForm, name: e.target.value})} 
                placeholder={isRtl ? "نام شما *" : "Your Name *"} 
                className="bg-white/50 dark:bg-gray-900/50 border border-gray-200/50 dark:border-gray-800/50 rounded-xl px-4 py-3 text-sm font-bold outline-none focus:border-amber-400 transition-colors" 
                required 
              />
              <input 
                type="email" 
                value={commentForm.email} 
                onChange={e => setCommentForm({...commentForm, email: e.target.value})} 
                placeholder={isRtl ? "ایمیل شما (منتشر نمی‌شود) *" : "Your Email (will not be published) *"} 
                className="bg-white/50 dark:bg-gray-900/50 border border-gray-200/50 dark:border-gray-800/50 rounded-xl px-4 py-3 text-sm font-bold outline-none focus:border-amber-400 transition-colors" 
                required 
              />
            </div>
            
            <textarea 
              value={commentForm.text} 
              onChange={e => setCommentForm({...commentForm, text: e.target.value})} 
              placeholder={replyingTo 
                ? (isRtl ? `پاسخ خود را به ${replyingTo.name} بنویسید...` : `Write your reply to ${replyingTo.name}...`) 
                : (isRtl ? "دیدگاه ارزشمند خود را درباره این مقاله بنویسید..." : "Write your thoughts on this article...")} 
              rows={4} 
              className="bg-white/50 dark:bg-gray-900/50 border border-gray-200/50 dark:border-gray-800/50 rounded-xl px-4 py-3 text-sm font-bold outline-none focus:border-amber-400 resize-none transition-colors"
              required
            ></textarea>
            
            <AnimatePresence>
              {formMsg.text && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }} 
                  animate={{ opacity: 1, height: 'auto' }} 
                  exit={{ opacity: 0, height: 0 }} 
                  className={`text-xs font-bold p-3 rounded-xl flex items-center gap-2 ${
                    formMsg.type === 'success' 
                      ? 'bg-emerald-500/10 text-emerald-600' 
                      : 'bg-red-500/10 text-red-500'
                  }`}
                >
                  {formMsg.type === 'success' ? (
                    <CheckCircle2 size={16} />
                  ) : (
                    <div className="w-2 h-2 rounded-full bg-red-500" />
                  )}
                  {formMsg.text}
                </motion.div>
              )}
            </AnimatePresence>

            <button 
              type="submit" 
              disabled={isSubmitting} 
              className="bg-amber-400 hover:bg-amber-500 text-gray-950 font-black px-6 py-3 rounded-xl transition-colors self-end text-sm flex items-center gap-2 disabled:opacity-50 shadow-md"
            >
              {isSubmitting ? (
                <Loader2 size={18} className="animate-spin" />
              ) : replyingTo ? (
                isRtl ? 'ارسال پاسخ' : 'Submit Reply'
              ) : (
                isRtl ? 'ارسال دیدگاه' : 'Submit Comment'
              )}
            </button>
          </div>
        </form>

        {/* لیست گفتگوها و پاسخ‌های درختی */}
        <div className="space-y-6">
          <h4 className="font-bold text-gray-500 mb-6 border-b border-gray-200/50 dark:border-gray-800/50 pb-3">
            {isRtl ? `نظرات کاربران (${approvedComments.length})` : `User Comments (${approvedComments.length})`}
          </h4>
          
          {rootComments.length > 0 ? (
            rootComments.map((comment: any, idx: number) => {
              const replies = getReplies(comment._id);
              
              return (
                <div key={idx} className="flex flex-col gap-3">
                  {/* کامنت اصلی */}
                  <div className="bg-white/60 dark:bg-gray-900/60 rounded-2xl p-5 border border-gray-100/80 dark:border-gray-800/80 shadow-xs">
                    <div className="flex justify-between items-center mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-amber-400/20 text-amber-600 rounded-full flex items-center justify-center font-black">
                          {comment.name ? comment.name.substring(0, 1) : "؟"}
                        </div>
                        <div>
                          <h4 className="text-sm font-black text-gray-900 dark:text-white">
                            {comment.name}
                          </h4>
                          <span className="text-[10px] font-bold text-gray-400">
                            {comment.createdAt ? new Date(comment.createdAt).toLocaleDateString(isRtl ? 'fa-IR' : 'en-US') : (isRtl ? "امروز" : "Today")}
                          </span>
                        </div>
                      </div>
                      
                      <button 
                        onClick={() => { 
                          setReplyingTo({ id: comment._id, name: comment.name });
                          document.getElementById('comment-section')?.scrollIntoView({ behavior: 'smooth' }); 
                        }} 
                        className="flex items-center gap-1 text-xs font-bold text-amber-500 hover:text-amber-600 transition-colors bg-amber-500/10 px-3 py-1.5 rounded-xl"
                      >
                        <Reply size={14} /> 
                        {isRtl ? "پاسخ" : "Reply"}
                      </button>
                    </div>
                    
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">
                      {comment.text}
                    </p>
                  </div>

                  {/* پاسخ‌های زیرمجموعه (Replies) */}
                  {replies.length > 0 && (
                    <div className={`px-6 md:px-10 border-amber-400/40 flex flex-col gap-3 mx-2 ${isRtl ? 'border-r-2' : 'border-l-2'}`}>
                      {replies.map((rep: any, rIdx: number) => (
                        <div 
                          key={rIdx} 
                          className={`rounded-2xl p-4 border transition-all ${
                            rep.isAdminReply 
                              ? 'bg-amber-400/15 border-amber-400/40 shadow-sm' 
                              : 'bg-white/40 dark:bg-gray-900/40 border-gray-100/50 dark:border-gray-800/50'
                          }`}
                        >
                          <div className="flex justify-between items-center mb-2">
                            <div className="flex items-center gap-2.5">
                              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-xs ${
                                rep.isAdminReply 
                                  ? 'bg-amber-400 text-gray-950 shadow-sm' 
                                  : 'bg-gray-200 dark:bg-gray-800 text-gray-500'
                              }`}>
                                {rep.isAdminReply ? <ShieldCheck size={16} /> : (rep.name ? rep.name.substring(0, 1) : "؟")}
                              </div>
                              <div>
                                <div className="flex items-center gap-1.5">
                                  <h4 className="text-xs font-black text-gray-900 dark:text-white">
                                    {rep.name}
                                  </h4>
                                  {rep.isAdminReply && (
                                    <span className="bg-amber-400 text-gray-950 text-[9px] font-black px-1.5 py-0.5 rounded shadow-2xs">
                                      {isRtl ? "پشتیبانی و مدیریت" : "Support"}
                                    </span>
                                  )}
                                </div>
                                <span className="text-[9px] font-bold text-gray-400">
                                  {rep.createdAt ? new Date(rep.createdAt).toLocaleDateString(isRtl ? 'fa-IR' : 'en-US') : (isRtl ? "امروز" : "Today")}
                                </span>
                              </div>
                            </div>
                            
                            <button 
                              onClick={() => { 
                                setReplyingTo({ id: comment._id, name: rep.name });
                                document.getElementById('comment-section')?.scrollIntoView({ behavior: 'smooth' }); 
                              }} 
                              className="flex items-center gap-1 text-[11px] font-bold text-gray-400 hover:text-amber-500 transition-colors"
                            >
                              <Reply size={12} /> 
                              {isRtl ? "پاسخ" : "Reply"}
                            </button>
                          </div>
                          
                          <p className="text-xs font-medium text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap mt-1">
                            {rep.text}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })
          ) : (
            <div className="text-center py-8">
              <p className="text-sm font-bold text-gray-500 dark:text-gray-400">
                {isRtl 
                  ? "هنوز دیدگاهی برای این مقاله ثبت نشده است. اولین نفری باشید که نظر می‌دهید!" 
                  : "No comments yet. Be the first to comment!"}
              </p>
            </div>
          )}
        </div>
      </motion.div>

      {/* بخش عضویت در خبرنامه باشگاه گندم */}
      <motion.div 
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: false, amount: 0.3 }}
        transition={{ duration: 1, ease: customEase }}
        className="max-w-4xl mx-auto mt-16 bg-linear-to-br from-amber-400 to-amber-500 rounded-[2.5rem] p-10 md:p-16 text-center shadow-2xl relative overflow-hidden"
      >
        <div className="relative z-10">
          <Mail size={48} className="mx-auto text-amber-900 mb-6 opacity-80" />
          <h3 className="text-3xl font-black text-amber-950 mb-4">
            {isRtl ? "به باشگاه گندم بپیوندید" : "Join Gandum Club"}
          </h3>
          <p className="text-amber-900/80 font-bold mb-8 max-w-md mx-auto">
            {isRtl ? "جدیدترین مقالات سلامت، اخبار افتتاحیه‌ها و تخفیف‌های ویژه را در ایمیل خود دریافت کنید." : "Get the latest health articles, news, and special discounts in your email."}
          </p>
          <form className="flex flex-col sm:flex-row gap-3 max-w-lg mx-auto" onSubmit={handleBlogNewsletter}>
            <input 
              type="email" 
              value={blogNlEmail}
              onChange={(e) => setBlogNlEmail(e.target.value)}
              placeholder={isRtl ? "آدرس ایمیل شما..." : "Your email address..."} 
              disabled={blogNlLoading}
              className="grow px-6 py-4 rounded-xl text-sm font-bold text-gray-900 outline-none border-2 border-transparent focus:border-amber-600/30 shadow-inner disabled:opacity-60" 
              dir="ltr" 
              required
            />
            <button 
              type="submit" 
              disabled={blogNlLoading}
              className="bg-amber-950 hover:bg-black text-white px-8 py-4 rounded-xl text-sm font-black transition-colors whitespace-nowrap shadow-xl flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
            >
              {blogNlLoading && <Loader2 size={16} className="animate-spin" />}
              <span>{blogNlLoading ? (isRtl ? "در حال ثبت..." : "Subscribing...") : (isRtl ? "عضویت رایگان" : "Free Subscription")}</span>
            </button>
          </form>
          {blogNlMsg && <p className="text-amber-950 font-black text-sm mt-3 bg-white/40 py-2 px-4 rounded-xl inline-block">{blogNlMsg}</p>}
        </div>
      </motion.div>
    </main>
  );
}