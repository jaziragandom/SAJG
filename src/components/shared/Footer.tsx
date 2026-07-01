"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import { motion, AnimatePresence } from "framer-motion";
import { MapPin, Phone, Mail, Send, ArrowUp, Bot, X, Wheat } from "lucide-react";
import ChatWindow from "./ChatWindow";

interface FooterProps {
  siteLogo?: string | null;
  contactInfo?: {
    phone: string;
    email: string;
    faAddress: string;
    enAddress: string;
    wa: string;
    tg: string;
    fb: string;
    ig: string;
  };
  footerTexts?: {
    aboutFa: string;
    aboutEn: string;
    copyrightFa: string;
    copyrightEn: string;
  };
}

// دیکشنری محلی جایگزین برای جلوگیری از ارورهای next-intl
const localTranslations = {
  fa: {
    about_desc: "جزیره گندم، پیشگام در تولید و عرضه بهترین محصولات غذایی با کیفیت جهانی.",
    quick_links: "لینک‌های سریع",
    links: { about: "درباره ما", products: "محصولات", factory: "برند ها", agencies: "نمایندگی‌ها", blog: "مجله گندم" },
    contact_info: "ارتباط با ما",
    newsletter: { title: "خبرنامه", desc: "برای اطلاع از جدیدترین‌ها عضو شوید.", placeholder: "ایمیل شما..." },
    copyright: "تمامی حقوق برای گروه جزیره گندم محفوظ است.",
    
  },
  en: {
    about_desc: "Jazirah Gandum, a pioneer in producing and supplying the best food products.",
    quick_links: "Quick Links",
    links: { about: "About Us", products: "Products", factory: "Brands", agencies: "Agencies", blog: "Blog" },
    contact_info: "Contact Us",
    newsletter: { title: "Newsletter", desc: "Subscribe for the latest updates.", placeholder: "Your email..." },
    copyright: "All rights reserved.",
   
  }
};

export default function Footer({ siteLogo = null, contactInfo, footerTexts }: FooterProps) {
  // شناسایی زبان به صورت ایمن بدون نیاز به Provider
  const pathname = usePathname();
  const isRtl = pathname?.startsWith('/fa') || false;
  const locale = isRtl ? 'fa' : 'en';
  
  // شبیه‌ساز تابع ترجمه
  const t = (key: string) => {
    const keys = key.split('.');
    let val: any = localTranslations[locale];
    for (const k of keys) { val = val?.[k]; }
    return val || key;
  };

  const router = useRouter();
  const { setTheme } = useTheme();

  const [showScrollTop, setShowScrollTop] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [messages, setMessages] = useState<any[]>([]);
  
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  // سیستم ایمن‌سازی اطلاعات تماس برای جلوگیری قاطع از ارورهای کنسول
  const safeContact = {
    phone: contactInfo?.phone || "+93 790 71 00 15",
    email: contactInfo?.email || "info@jazirah-gandum.com",
    faAddress: contactInfo?.faAddress || "دفتر مرکزی، جزیره گندم",
    enAddress: contactInfo?.enAddress || "HQ Office, Jazirah Gandom",
    wa: contactInfo?.wa || "#",
    tg: contactInfo?.tg || "#",
    fb: contactInfo?.fb || "#",
    ig: contactInfo?.ig || "#",
  };

  useEffect(() => {
    const savedChat = sessionStorage.getItem('visionbot_messages');
    const savedLang = sessionStorage.getItem('visionbot_lang');
    
    if (savedChat && savedLang === locale) {
      setMessages(JSON.parse(savedChat));
    } else {
      setMessages([
        {
          id: 1,
          text: isRtl 
            ? 'سلام! من دستیار هوشمند جزیره گندم هستم. امروز چطور می‌توانم کمکتان کنم؟' 
            : 'Hello! I am the Jazirah Gandum smart assistant. How can I help you today?',
          sender: 'bot',
        }
      ]);
      sessionStorage.setItem('visionbot_lang', locale);
    }
  }, [locale, isRtl]);

  useEffect(() => {
    if (messages.length > 0) {
      sessionStorage.setItem('visionbot_messages', JSON.stringify(messages));
    }
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isTyping) return;

    const userMsg = { id: Date.now(), text: input, sender: 'user' };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: [...messages, userMsg] }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Network Error');
      
      let finalReply = data.reply;

      if (finalReply.includes('[ACTION:THEME_DARK]')) {
        setTheme('dark');
        finalReply = finalReply.replace(/\[ACTION:THEME_DARK\]/g, '\n✨ **تم سایت تاریک شد!**');
      }
      if (finalReply.includes('[ACTION:THEME_LIGHT]')) {
        setTheme('light');
        finalReply = finalReply.replace(/\[ACTION:THEME_LIGHT\]/g, '\n✨ **تم سایت روشن شد!**');
      }

      const navMatch = finalReply.match(/\[NAVIGATE:(.*?)\]/);
      if (navMatch) {
        const targetPath = navMatch[1].trim();
        let finalPath = targetPath;
        if (targetPath.startsWith('/')) {
            const urlObj = new URL(targetPath, 'http://localhost');
            finalPath = `/${locale}${urlObj.pathname}${urlObj.search}${urlObj.hash}`;
        }
        router.push(finalPath);
        setIsChatOpen(false);
        finalReply = finalReply.replace(/\[NAVIGATE:.*?\]/g, '\n🚀 **در حال انتقال فوری به صفحه مورد نظر...**');
      }

      setMessages((prev) => [...prev, { id: Date.now() + 1, text: finalReply, sender: 'bot' }]);
    } catch (error) {
      console.error(error);
      setMessages((prev) => [...prev, { 
        id: Date.now() + 1, 
        text: isRtl ? "⚠️ متاسفانه در برقراری ارتباط با سرور مشکلی پیش آمد. [تلاش مجدد](retry)" : "⚠️ Connection error. [Retry](retry)", 
        sender: 'bot' 
      }]);
    } finally {
      setIsTyping(false);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isChatOpen]);

  useEffect(() => {
    if (isChatOpen) {
      const timeout = setTimeout(() => inputRef.current?.focus(), 100);
      return () => clearTimeout(timeout);
    }
  }, [isChatOpen]);

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 400);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.2 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <>
      <footer className="relative pt-16 md:pt-20 pb-8 md:pb-10 border-t-4 border-zinc-900 dark:border-white overflow-hidden select-none transition-colors duration-300">
        
        <div className="absolute inset-0 z-0 pointer-events-none">
          <svg className="w-full h-full object-cover dark:hidden" viewBox="0 0 1920 1080" preserveAspectRatio="none">
            <defs>
              <linearGradient id="footer-lg-light" x1="960" y1="1080" x2="960" y2="0" gradientUnits="userSpaceOnUse">
                <stop offset="0" stopColor="#fafae6"/><stop offset="1" stopColor="#ffc562"/>
              </linearGradient>
            </defs>
            <rect width="1920" height="1080" fill="url(#footer-lg-light)"/>
          </svg>
          <svg className="w-full h-full object-cover hidden dark:block" viewBox="0 0 1920 1080" preserveAspectRatio="none">
            <defs>
              <linearGradient id="footer-lg-dark" x1="-830" y1="131.53" x2="-830" y2="-948.47" gradientTransform="translate(1790 948.47)" gradientUnits="userSpaceOnUse">
                <stop offset="0" stopColor="#3c050f"/><stop offset="1" stopColor="#0a0000"/>
              </linearGradient>
            </defs>
            <rect width="1920" height="1080" transform="translate(1920 1080) rotate(180)" fill="url(#footer-lg-dark)"/>
          </svg>
        </div>

        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0 hidden dark:block">
          <div className="absolute top-[-20%] right-[-10%] w-125 h-125 bg-primary/5 rounded-full blur-[120px]" />
          <div className="absolute bottom-[-20%] left-[-10%] w-100 h-100 bg-accent/5 rounded-full blur-[120px]" />
        </div>

        <motion.div 
          className="container mx-auto px-4 md:px-8 relative z-10"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: false, amount: 0.1 }}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 md:gap-12 mb-12 md:mb-16">
            
            <motion.div variants={itemVariants} transition={{ type: "spring", stiffness: 100, damping: 15 }} className="flex flex-col gap-5 md:gap-6 items-start">
              
              <Link href={`/${locale}`} className="flex items-center gap-3 group">
                {siteLogo ? (
                  <img src={siteLogo} alt="Logo" className="h-11 w-auto max-w-45 object-contain group-hover:scale-105 transition-transform duration-300" />
                ) : (
                  <span className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/20">
                    <span className="text-white font-black text-xl">JG</span>
                  </span>
                )}
                <span className="font-black text-2xl text-zinc-900 dark:text-white tracking-tight">
                  {isRtl ? "جزیره گندم" : "Jazirah Gandum"}
                </span>
              </Link>

              <p className="text-zinc-700 dark:text-zinc-400 text-sm leading-relaxed text-start">
                {isRtl 
                  ? (footerTexts?.aboutFa || t("about_desc")) 
                  : (footerTexts?.aboutEn || t("about_desc"))}
              </p>
              <div className="flex items-center gap-4 mt-2">
                {/* شبکه‌های اجتماعی */}
                {safeContact.ig !== "#" && (
                  <motion.a whileHover={{ scale: 1.15, y: -4 }} whileTap={{ scale: 0.95 }} href={safeContact.ig.startsWith('http') ? safeContact.ig : `https://instagram.com/${safeContact.ig.replace('@','')}`} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-white flex items-center justify-center hover:bg-amber-400 hover:border-amber-400 hover:text-gray-950 transition-colors shadow-md">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
                  </motion.a>
                )}
                {safeContact.tg !== "#" && (
                  <motion.a whileHover={{ scale: 1.15, y: -4 }} whileTap={{ scale: 0.95 }} href={safeContact.tg.startsWith('http') ? safeContact.tg : `https://t.me/${safeContact.tg.replace('@','')}`} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-white flex items-center justify-center hover:bg-amber-400 hover:border-amber-400 hover:text-gray-950 transition-colors shadow-md">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
                  </motion.a>
                )}
                {safeContact.wa !== "#" && (
                  <motion.a whileHover={{ scale: 1.15, y: -4 }} whileTap={{ scale: 0.95 }} href={safeContact.wa.startsWith('http') ? safeContact.wa : `https://wa.me/${safeContact.wa.replace(/[^0-9]/g, '')}`} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-white flex items-center justify-center hover:bg-amber-400 hover:border-amber-400 hover:text-gray-950 transition-colors shadow-md">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path></svg>
                  </motion.a>
                )}
                {safeContact.fb !== "#" && (
                  <motion.a whileHover={{ scale: 1.15, y: -4 }} whileTap={{ scale: 0.95 }} href={safeContact.fb.startsWith('http') ? safeContact.fb : `https://facebook.com/${safeContact.fb}`} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-white flex items-center justify-center hover:bg-amber-400 hover:border-amber-400 hover:text-gray-950 transition-colors shadow-md">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path></svg>
                  </motion.a>
                )}
              </div>
            </motion.div>

            <motion.div variants={itemVariants} transition={{ type: "spring", stiffness: 100, damping: 15 }}>
              <h4 className="text-zinc-900 dark:text-white font-bold text-lg mb-4 md:mb-6 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-primary"></span>{t("quick_links")}
              </h4>
              <ul className="flex flex-col gap-3 text-sm">
                <li><Link href={`/${locale}/about`} className="text-zinc-700 dark:text-zinc-300 hover:text-primary dark:hover:text-accent transition-colors flex items-center gap-1.5"><span className="w-1 h-1 rounded-full bg-primary-500 dark:bg-white"></span>{t("links.about")}</Link></li>
                <li><Link href={`/${locale}/products`} className="text-zinc-700 dark:text-zinc-300 hover:text-primary dark:hover:text-accent transition-colors flex items-center gap-1.5"><span className="w-1 h-1 rounded-full bg-primary-500 dark:bg-white"></span>{t("links.products")}</Link></li>
                <li><Link href={`/${locale}/brands`} className="text-zinc-700 dark:text-zinc-300 hover:text-primary dark:hover:text-accent transition-colors flex items-center gap-1.5"><span className="w-1 h-1 rounded-full bg-primary-500 dark:bg-white"></span>{t("links.factory")}</Link></li>
                <li><Link href={`/${locale}/about#contact`} className="text-zinc-700 dark:text-zinc-300 hover:text-primary dark:hover:text-accent transition-colors flex items-center gap-1.5"><span className="w-1 h-1 rounded-full bg-primary-500 dark:bg-white"></span>{t("links.agencies")}</Link></li>
                <li><Link href={`/${locale}/blog`} className="text-zinc-700 dark:text-zinc-300 hover:text-primary dark:hover:text-accent transition-colors flex items-center gap-1.5"><span className="w-1 h-1 rounded-full bg-primary-500 dark:bg-white"></span>{t("links.blog")}</Link></li>
              </ul>
            </motion.div>

            <motion.div variants={itemVariants} transition={{ type: "spring", stiffness: 100, damping: 15 }}>
              <h4 className="text-zinc-900 dark:text-white font-bold text-lg mb-4 md:mb-6 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-primary"></span>{t("contact_info")}
              </h4>
              <ul className="flex flex-col gap-4 text-sm font-medium">
                <li className="flex items-start gap-3">
                  <MapPin size={18} className="text-primary shrink-0 mt-1" />
                  <a 
                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(isRtl ? safeContact.faAddress : safeContact.enAddress)}`} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="leading-relaxed text-zinc-700 dark:text-zinc-300 hover:text-primary dark:hover:text-white transition-colors"
                  >
                    {isRtl ? safeContact.faAddress : safeContact.enAddress}
                  </a>
                </li>
                <li className="flex items-center gap-3">
                  <Phone size={18} className="text-primary shrink-0" />
                  <a 
                    href={`tel:${safeContact.phone.replace(/[\s-]/g, '')}`} 
                    dir="ltr" 
                    className="text-zinc-700 dark:text-zinc-300 hover:text-primary dark:hover:text-white transition-colors"
                  >
                    {safeContact.phone}
                  </a>
                </li>
                <li className="flex items-center gap-3">
                  <Mail size={18} className="text-primary shrink-0" />
                  <a 
                    href={`mailto:${safeContact.email}`} 
                    dir="ltr" 
                    className="text-zinc-700 dark:text-zinc-300 hover:text-primary dark:hover:text-white transition-colors"
                  >
                    {safeContact.email}
                  </a>
                </li>
              </ul>
            </motion.div>

            <motion.div variants={itemVariants} transition={{ type: "spring", stiffness: 100, damping: 15 }}>
              <h4 className="text-zinc-900 dark:text-white font-bold text-lg mb-4 md:mb-6 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-primary"></span>{t("newsletter.title")}
              </h4>
              <p className="text-sm text-zinc-700 dark:text-zinc-400 mb-4 leading-relaxed">{t("newsletter.desc")}</p>
              <form className="relative" onSubmit={(e) => e.preventDefault()}>
                <input type="email" placeholder={t("newsletter.placeholder")} className="w-full bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-800 rounded-xl py-3 px-4 pr-12 text-sm text-zinc-900 dark:text-white focus:outline-none focus:border-primary transition-colors placeholder:text-zinc-400 dark:placeholder:text-zinc-500 shadow-sm" dir="ltr" />
                <button type="submit" className={`absolute ${isRtl ? "left-2" : "right-2"} top-2 w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-white hover:bg-primary-hover dark:bg-primary-500 dark:text-white dark:hover:bg-white dark:hover:text-primary-500 transition-colors duration-300`}>
                  <Send size={16} className={isRtl ? "-scale-x-100" : ""} />
                </button>
              </form>
            </motion.div>

          </div>

          <motion.div variants={itemVariants} className="pt-6 border-t border-zinc-300 dark:border-zinc-800/50 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-zinc-600 dark:text-zinc-500 font-bold">
            <p className="text-center md:text-start">
              {isRtl 
                ? (footerTexts?.copyrightFa || `© ${new Date().getFullYear()} گروه جزیره گندم. ${t("copyright")}`) 
                : (footerTexts?.copyrightEn || `© ${new Date().getFullYear()} Jazirah Gandum Group. ${t("copyright")}`)}
            </p>
          </motion.div>
        </motion.div>
      </footer>

      <div className={`fixed bottom-6 ${isRtl ? "right-6" : "left-6"} z-9999 flex flex-col items-start gap-3 pointer-events-none`}>
        <AnimatePresence>
          {isChatOpen && (
            <ChatWindow 
              isChatOpen={isChatOpen} setIsChatOpen={setIsChatOpen} messages={messages}
              input={input} setInput={setInput} handleSend={handleSend} isTyping={isTyping}
              messagesEndRef={messagesEndRef} inputRef={inputRef} isRtl={isRtl} router={router} locale={locale}
            />
          )}
        </AnimatePresence>

        <motion.div layout className={`flex gap-3 pointer-events-auto ${isChatOpen ? 'flex-row items-end' : 'flex-col items-center'}`}>
          <motion.button
            layout
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setIsChatOpen(!isChatOpen)}
            className="w-14 h-14 bg-linear-to-r from-amber-500 to-orange-600 text-white rounded-full flex items-center justify-center shadow-xl shadow-amber-500/20 shrink-0"
          >
            {isChatOpen ? <X size={24} /> : <Bot size={24} />}
          </motion.button>

          <AnimatePresence mode="popLayout">
            {showScrollTop && (
              <motion.button
                layout
                transition={{ type: "spring", stiffness: 400, damping: 25 }}
                initial={{ opacity: 0, scale: 0.5, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.5, y: 20 }}
                whileHover={{ scale: 1.1, y: -4 }}
                whileTap={{ scale: 0.9 }}
                onClick={scrollToTop}
                className="w-12 h-12 bg-primary hover:bg-primary-hover text-white dark:bg-primary-500 dark:text-white dark:hover:bg-white dark:hover:text-primary-500 rounded-full flex items-center justify-center shadow-xl shadow-primary/20 transition-colors duration-300 shrink-0"
              >
                <ArrowUp size={22} strokeWidth={2.5} />
              </motion.button>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </>
  );
}