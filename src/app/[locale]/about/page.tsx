"use client";

import React, { useState, useEffect, useRef } from "react";
import { useLocale } from "next-intl";
import { motion, AnimatePresence, useMotionValue, useSpring, useInView } from "framer-motion";
import * as LucideIcons from "lucide-react";
import { getSiteContent } from "@/actions/siteContent";
import { submitMessage, submitAgencyForm } from "@/actions/communications";
import { 
  Building2, Target, Users, Award, MapPin, Download, X, 
  Mail, Phone, ShieldCheck, MapPinned, MessageCircle, Send, Briefcase, CheckCircle2,
  Music2, MessageSquare, Share2, Loader2, Layers
} from "lucide-react";
import { 
  TbBrandWhatsapp, TbBrandInstagram, TbBrandFacebook, TbBrandTwitter, 
  TbBrandLinkedin, TbBrandYoutube, TbBrandTiktok, TbVideo, 
  TbMessageCircle, TbShare, TbBrandTelegram 
} from "react-icons/tb";

const DynamicIcon = ({ name, size = 36 }: { name: string, size?: number }) => {
  const IconComponent = (LucideIcons as any)[name] || LucideIcons.CheckCircle;
  return <IconComponent size={size} />;
};

const SocialIconResolver = ({ platform, value }: { platform: string, value: string }) => {
  let Icon: any = MessageCircle;
  let url = value;
  
  switch(platform) {
    case 'whatsapp': Icon = TbBrandWhatsapp; url = `https://wa.me/${value}`; break;
    case 'telegram': Icon = TbBrandTelegram; url = `https://t.me/${value}`; break;
    case 'instagram': Icon = TbBrandInstagram; url = `https://instagram.com/${value}`; break;
    case 'facebook': Icon = TbBrandFacebook; url = `https://facebook.com/${value}`; break;
    case 'twitter': Icon = TbBrandTwitter; url = `https://twitter.com/${value}`; break;
    case 'youtube': Icon = TbBrandYoutube; url = `https://youtube.com/@${value}`; break;
    case 'linkedin': Icon = TbBrandLinkedin; url = `https://linkedin.com/in/${value}`; break;
    case 'tiktok': Icon = TbBrandTiktok; url = `https://tiktok.com/@${value}`; break;
    case 'aparat': Icon = TbVideo; url = `https://aparat.com/${value}`; break;
    case 'eitaa': Icon = TbMessageCircle; url = `https://eitaa.com/${value}`; break;
    case 'rubika': Icon = TbShare; url = `https://rubika.ir/${value}`; break;
  }
  
  return (
    <a href={url} target="_blank" rel="noopener noreferrer" className="flex-1 flex justify-center py-2.5 hover:text-amber-400 transition-colors">
       <Icon size={22} />
    </a>
  );
};

function Counter({ value, title }: { value: number; title: string }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: false, margin: "-10%" });
  const [displayValue, setDisplayValue] = useState(0);
  const count = useMotionValue(0);
  const springValue = useSpring(count, { stiffness: 40, damping: 30, mass: 1 });
  useEffect(() => {
    if (isInView) count.set(value);
    else count.set(0);
  }, [isInView, count, value]);
  useEffect(() => {
    return springValue.on("change", (latest) => setDisplayValue(Math.floor(latest)));
  }, [springValue]);
  return (
    <div ref={ref} className="flex flex-col items-center justify-center py-4 px-4 bg-gray-50 dark:bg-gray-800/50 rounded-2xl border border-gray-100 dark:border-gray-700 hover:border-amber-400 transition-colors shadow-sm">
      <div className="flex items-center text-3xl md:text-4xl font-black mb-1 text-amber-500" dir="ltr">
        <span>+</span><span suppressHydrationWarning>{displayValue}</span>
      </div>
      <p className="text-gray-600 dark:text-gray-400 text-xs font-bold text-center mt-1 tracking-wide">{title}</p>
    </div>
  );
}

const fadeInUp = { hidden: { opacity: 0, y: 30 }, show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" as const } } };
const staggerContainer = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.2 } } };
const marqueeFA = { animate: { x: ["0%", "50%"], transition: { repeat: Infinity, duration: 360, ease: "linear" as const } } };
const marqueeEN = { animate: { x: ["0%", "-50%"], transition: { repeat: Infinity, duration: 360, ease: "linear" as const } } };
const marqueeRevFA = { animate: { x: ["50%", "0%"], transition: { repeat: Infinity, duration: 360, ease: "linear" as const } } };
const marqueeRevEN = { animate: { x: ["-50%", "0%"], transition: { repeat: Infinity, duration: 360, ease: "linear" as const } } };

export default function AboutPage() {
  const locale = useLocale();
  const isRtl = locale === 'fa';
  const [selectedCert, setSelectedCert] = useState<string | null>(null);
  const [isAgencyModalOpen, setIsAgencyModalOpen] = useState(false);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  
  // دیتای داینامیک
  const [introData, setIntroData] = useState<any>({});
  const [strategyData, setStrategyData] = useState<any>({});
  const [features, setFeatures] = useState<any[]>([]);
  const [whyUsList, setWhyUsList] = useState<any[]>([]);
  const [stats, setStats] = useState<any[]>([]);
  const [partnersList, setPartnersList] = useState<any[]>([]);
  const [certificatesList, setCertificatesList] = useState<any[]>([]);
  const [visibility, setVisibility] = useState({ showPartners: true, showCerts: true });
  const [hqData, setHqData] = useState<any>({ socials: [] });
  const [branchesList, setBranchesList] = useState<any[]>([]);

  // استیت‌های فرم تماس با ما
  const [contactForm, setContactForm] = useState({ name: "", email: "", message: "" });
  const [isSending, setIsSending] = useState(false);

  // استیت‌های فرم درخواست اخذ نمایندگی
  const [agencyForm, setAgencyForm] = useState({ name: "", phone: "", city: "", experience: "", description: "" });
  const [isSubmittingAgency, setIsSubmittingAgency] = useState(false);

  useEffect(() => {
    const fetchPageData = async () => {
      try {
        const [introRes, strategyRes, statsRes, partnersRes, hqRes] = await Promise.all([
          getSiteContent('corporate_intro'),
          getSiteContent('corporate_strategy'),
          getSiteContent('corporate_stats'),
          getSiteContent('corporate_partners'),
          getSiteContent('corporate_hq')
        ]);

        if (introRes?.data) {
          setIntroData(introRes.data);
          setFeatures(introRes.data.features || []);
        }
        if (strategyRes?.data) setStrategyData(strategyRes.data);
        if (statsRes?.data) {
          setWhyUsList(statsRes.data.whyUs || []);
          setStats(statsRes.data.stats || []);
        }
        if (partnersRes?.data) {
          setVisibility(partnersRes.data.visibility || { showPartners: true, showCerts: true });
          setPartnersList(partnersRes.data.partners || []);
          setCertificatesList(partnersRes.data.certificates || []);
        }
        if (hqRes?.data) {
          let parsedHqData = hqRes.data.hqData || {};
          if (!parsedHqData.socials) {
             parsedHqData.socials = [];
             if (parsedHqData.wa) parsedHqData.socials.push({ platform: 'whatsapp', value: parsedHqData.wa });
             if (parsedHqData.tg) parsedHqData.socials.push({ platform: 'telegram', value: parsedHqData.tg });
             if (parsedHqData.ig) parsedHqData.socials.push({ platform: 'instagram', value: parsedHqData.ig });
             if (parsedHqData.fb) parsedHqData.socials.push({ platform: 'facebook', value: parsedHqData.fb });
          }
          setHqData(parsedHqData);
          
          let parsedBranches = hqRes.data.branches || [];
          parsedBranches = parsedBranches.map((b: any) => {
            if (!b.socials) {
              b.socials = [];
              if (b.wa) b.socials.push({ platform: 'whatsapp', value: b.wa });
              if (b.tg) b.socials.push({ platform: 'telegram', value: b.tg });
            }
            return b;
          });
          setBranchesList(parsedBranches);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };
    fetchPageData();
  }, []);

  const downloadVCF = (contact: any) => {
    const name = isRtl ? contact.faName : contact.enName;
    const address = isRtl ? contact.faAddress : contact.enAddress;
    const vcfData = `BEGIN:VCARD\nVERSION:3.0\nFN:${name}\nTEL:${contact.phone}\nEMAIL:${contact.email || ""}\nADR:;;${address};;;;\nEND:VCARD`;
    const blob = new Blob([vcfData], { type: "text/vcard" });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `${name}.vcf`);
    document.body.appendChild(link); link.click(); document.body.removeChild(link);
  };

  const handlePlayVideo = () => {
    if (introData?.videoUrl) {
      setIsVideoPlaying(true);
    } else {
      alert(isRtl ? "ویدیویی برای پخش آپلود نشده است." : "No video uploaded to play.");
    }
  };

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactForm.name || !contactForm.message) {
      alert(isRtl ? "لطفاً نام و پیام خود را وارد کنید." : "Please enter your name and message.");
      return;
    }
    setIsSending(true);
    const res = await submitMessage({
      name: contactForm.name,
      email: contactForm.email || "no-email@provided.com",
      text: contactForm.message,
      subject: "فرم عمومی درباره ما"
    });
    setIsSending(false);
    if (res.success) {
      alert(isRtl ? "پیام شما با موفقیت ارسال شد و در اسرع وقت پاسخ داده خواهد شد." : "Message sent successfully.");
      setContactForm({ name: "", email: "", message: "" });
    } else {
      alert(isRtl ? "خطایی رخ داد. لطفاً مجدداً تلاش فرمایید." : "Error sending message.");
    }
  };

  const handleAgencySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!agencyForm.name || !agencyForm.phone || !agencyForm.city) {
      alert(isRtl ? "لطفاً فیلدهای ضروری (نام، شماره تماس و ولایت/شهر) را پر کنید." : "Please fill required fields.");
      return;
    }
    setIsSubmittingAgency(true);
    const res = await submitAgencyForm(agencyForm);
    setIsSubmittingAgency(false);
    if (res.success) {
      alert(isRtl ? "درخواست شما با موفقیت ثبت شد و به زودی بررسی خواهد شد." : "Request submitted successfully.");
      setAgencyForm({ name: "", phone: "", city: "", experience: "", description: "" });
      setIsAgencyModalOpen(false);
    } else {
      alert(isRtl ? "خطایی در ثبت درخواست رخ داد." : "Error submitting request.");
    }
  };

  const renderHighlightedTitle = (title: string) => {
    if (!title) return null;
    const words = title.trim().split(" ");
    if (words.length <= 1) return <>{title}</>;
    const lastWord = words.pop();
    return (
      <>
        {words.join(" ")} <span className="text-amber-500 drop-shadow-md">{lastWord}</span>
      </>
    );
  };

  const dupPartners = partnersList.length > 0 ? Array(30).fill(partnersList).flat() : [];
  const dupCerts = certificatesList.length > 0 ? Array(30).fill(certificatesList).flat() : [];

  return (
    <main className="w-full bg-transparent min-h-screen pt-28 pb-16 overflow-hidden" dir={isRtl ? "rtl" : "ltr"}>
      <div className="container mx-auto px-4 md:px-8 max-w-7xl flex flex-col gap-12">
        
        {/* ۱. معرفی شرکت */}
        <motion.div variants={staggerContainer} initial="hidden" whileInView="show" viewport={{ once: false, amount: 0.2 }} className="scroll-mt-28 flex flex-col items-center text-center">
          <motion.div variants={fadeInUp} className="p-3 bg-amber-400/10 rounded-2xl mb-4 mx-auto w-max"><Building2 size={40} className="text-amber-500" /></motion.div>
          <motion.h1 variants={fadeInUp} className="text-3xl md:text-5xl font-black text-gray-900 dark:text-white mb-6">{isRtl ? "درباره جزیره گندم" : "About Jazirah Gandum"}</motion.h1>
          <motion.p variants={fadeInUp} className="text-lg text-gray-600 dark:text-gray-400 leading-relaxed max-w-4xl mx-auto text-justify md:text-center mb-8">
            {isRtl ? introData.aboutFa : introData.aboutEn}
          </motion.p>
          
          <motion.div variants={fadeInUp} className="flex flex-col sm:flex-row items-center gap-4 w-full justify-center">
             <button 
                type="button"
                onClick={() => {
                   window.dispatchEvent(new Event('openCatalogModal'));
                }}
                className="w-full sm:w-auto bg-gray-900 dark:bg-white text-white dark:text-gray-900 hover:bg-amber-400 dark:hover:bg-amber-400 hover:text-gray-950 dark:hover:text-gray-950 px-8 py-4 rounded-2xl font-black text-sm flex items-center justify-center gap-3 shadow-lg transition-colors duration-300 group"
              >
                <Layers size={20} className="group-hover:scale-110 transition-transform" />
                <span>{isRtl ? "ساخت و دریافت کاتالوگ" : "Generate Catalog"}</span>
              </button>
              
              <a 
                href={introData.profilePdfUrl || "/company-profile.pdf"} 
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto bg-amber-400 hover:bg-amber-500 text-gray-950 px-8 py-4 rounded-2xl font-black text-sm flex items-center justify-center gap-3 shadow-lg shadow-amber-400/20 transition-colors duration-300 group"
              >
                <Download size={20} className="group-hover:-translate-y-1 transition-transform" />
                <span>{isRtl ? "دانلود پروفایل کمپنی" : "Download Company Profile"}</span>
              </a>
          </motion.div>
        </motion.div>

        {/* ۲. ماموریت و چشم‌انداز */}
        <motion.div variants={staggerContainer} initial="hidden" whileInView="show" viewport={{ once: false, amount: 0.2 }} className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <motion.div variants={fadeInUp} className="bg-white/50 dark:bg-gray-900/50 backdrop-blur-md border border-gray-100 dark:border-gray-800 p-8 rounded-3xl flex flex-col md:flex-row gap-5 hover:border-amber-400 transition-colors">
            <Target size={36} className="text-amber-500 shrink-0" />
            <div>
              <h2 className="text-xl font-black text-gray-900 dark:text-white mb-2">{isRtl ? "ماموریت ما" : "Our Mission"}</h2>
              <p className="text-base text-gray-600 dark:text-gray-400 leading-relaxed text-justify">{isRtl ? strategyData.missionFa : strategyData.missionEn}</p>
            </div>
          </motion.div>
          <motion.div variants={fadeInUp} className="bg-white/50 dark:bg-gray-900/50 backdrop-blur-md border border-gray-100 dark:border-gray-800 p-8 rounded-3xl flex flex-col md:flex-row gap-5 hover:border-amber-400 transition-colors">
            <Users size={36} className="text-amber-500 shrink-0" />
            <div>
              <h2 className="text-xl font-black text-gray-900 dark:text-white mb-2">{isRtl ? "چشم‌انداز ما" : "Our Vision"}</h2>
              <p className="text-base text-gray-600 dark:text-gray-400 leading-relaxed text-justify">{isRtl ? strategyData.visionFa : strategyData.visionEn}</p>
            </div>
          </motion.div>
        </motion.div>

        {/* ۳. تعهد به کیفیت */}
        <motion.div variants={staggerContainer} initial="hidden" whileInView="show" viewport={{ once: false, amount: 0.1 }} className="text-center bg-white/50 dark:bg-gray-900/50 backdrop-blur-md border border-gray-100 dark:border-gray-800 p-8 rounded-3xl">
          <motion.div variants={fadeInUp} className="mx-auto w-max p-4 bg-amber-400/10 rounded-full mb-4 text-amber-500"><ShieldCheck size={36} /></motion.div>
          <motion.h2 variants={fadeInUp} className="text-2xl font-black text-gray-900 dark:text-white mb-4">{isRtl ? "تعهد به کیفیت" : "Commitment to Quality"}</motion.h2>
          <motion.p variants={fadeInUp} className="text-base text-gray-600 dark:text-gray-400 leading-relaxed max-w-4xl mx-auto">{isRtl ? strategyData.qualityFa : strategyData.qualityEn}</motion.p>
        </motion.div>

        <hr className="border-dashed border-gray-200 dark:border-gray-800 my-4" />

        {/* ۴. کارخانه، آمار و ویدیو */}
        <motion.div variants={staggerContainer} initial="hidden" whileInView="show" viewport={{ once: false, amount: 0.1 }} className="scroll-mt-28">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:items-stretch items-center">
            <div className="flex flex-col h-full">
              <motion.div variants={fadeInUp} className="mb-6">
                <span className="inline-block px-4 py-1.5 mb-4 text-xs font-bold text-amber-700 bg-amber-400/20 rounded-full">{isRtl ? introData.badgeFA : introData.badgeEN}</span>
                <h2 className="text-3xl md:text-4xl font-black text-gray-900 dark:text-white mb-5 leading-tight">
                  {renderHighlightedTitle(isRtl ? introData.titleFA : introData.titleEN)}
                </h2>
                <p className="text-base text-gray-600 dark:text-gray-400 leading-relaxed text-justify">{isRtl ? introData.descFA : introData.descEN}</p>
              </motion.div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                {features.map((feature, i) => (
                  <motion.div key={i} variants={fadeInUp} className="flex gap-3 items-center bg-white/50 dark:bg-gray-900/50 backdrop-blur-md border border-gray-100 dark:border-gray-800 p-4 rounded-2xl hover:border-amber-400 transition-colors">
                    <div className="shrink-0 w-12 h-12 bg-amber-400/10 rounded-xl flex items-center justify-center text-amber-500">
                      <DynamicIcon name={feature.icon} size={24} />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-gray-900 dark:text-white mb-0.5">{isRtl ? feature.faTitle : feature.enTitle}</h4>
                      <p className="text-xs text-gray-500">{isRtl ? feature.descFA : feature.descEN}</p>
                    </div>
                  </motion.div>
                ))}
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-auto">
                {stats.map((s, i) => (<Counter key={i} value={Number(s.value)} title={isRtl ? s.faTitle : s.enTitle} />))}
              </div>
            </div>

            <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: false, amount: 0.1 }} transition={{ duration: 0.5, ease: "easeOut", delay: 0.2 }} className="relative w-full h-96 lg:h-auto grow flex">
              <div className="absolute inset-0 bg-zinc-900 rounded-3xl overflow-hidden shadow-lg z-10 flex items-center justify-center group">
                {introData?.videoUrl ? (
                  <>
                    <video 
                      src={introData.videoUrl} 
                      controls={isVideoPlaying}
                      autoPlay={isVideoPlaying}
                      className="w-full h-full object-cover rounded-3xl"
                    />
                    {!isVideoPlaying && (
                      <>
                        <div className="absolute inset-0 bg-black/40 z-10 transition-opacity group-hover:bg-black/50" />
                        <div className="absolute z-20 flex flex-col items-center cursor-pointer" onClick={handlePlayVideo}>
                          <div className="w-20 h-20 bg-white/20 hover:bg-amber-500 backdrop-blur-md rounded-full flex items-center justify-center text-white border border-white/30 transition-colors">
                            <svg className="w-8 h-8 ml-1" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                          </div>
                          <span className="mt-4 font-bold text-white text-sm tracking-widest drop-shadow-md">{isRtl ? "تور مجازی کارخانه" : "VIRTUAL TOUR"}</span>
                        </div>
                      </>
                    )}
                  </>
                ) : (
                  <>
                    <div className="absolute inset-0 bg-linear-to-tr from-black/70 to-transparent z-10" />
                    <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?q=80&w=2070')] bg-cover bg-center opacity-70 group-hover:scale-105 transition-transform duration-1000" />
                    <div className="relative z-20 flex flex-col items-center cursor-pointer" onClick={handlePlayVideo}>
                      <div className="w-20 h-20 bg-white/20 hover:bg-amber-500 backdrop-blur-md rounded-full flex items-center justify-center text-white border border-white/30 transition-colors">
                        <svg className="w-8 h-8 ml-1" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                      </div>
                      <span className="mt-4 font-bold text-white text-sm tracking-widest drop-shadow-md">{isRtl ? "تور مجازی کارخانه" : "VIRTUAL TOUR"}</span>
                    </div>
                  </>
                )}
              </div>
            </motion.div>
          </div>
        </motion.div>

        {/* ۵. چرا جزیره گندم؟ */}
        <motion.div variants={staggerContainer} initial="hidden" whileInView="show" viewport={{ once: false, amount: 0.1 }}>
          <motion.h2 variants={fadeInUp} className="text-2xl font-black text-gray-900 dark:text-white mb-6 text-center">{isRtl ? "چرا جزیره گندم؟" : "Why Jazirah Gandum?"}</motion.h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {whyUsList.map(item => (
              <motion.div key={item.id} variants={fadeInUp} className="bg-amber-400/5 border border-amber-400/20 p-6 rounded-3xl flex flex-col items-center text-center gap-4 text-amber-700 dark:text-amber-400 hover:bg-amber-400/10 transition-colors">
                <div className="p-4 bg-amber-400/20 rounded-full">
                  <DynamicIcon name={item.icon} size={36} />
                </div>
                <span className="font-bold text-lg">{isRtl ? item.faTitle : item.enTitle}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>

        <hr className="border-dashed border-gray-200 dark:border-gray-800 my-4" />

        {/* ۶. مشتریان و شرکا */}
        {visibility.showPartners && (
          <motion.div variants={staggerContainer} initial="hidden" whileInView="show" viewport={{ once: false, amount: 0.1 }}>
            <motion.h2 variants={fadeInUp} className="text-2xl font-black text-gray-900 dark:text-white mb-8 flex items-center justify-center gap-2"><Users className="text-amber-500" size={28}/> {isRtl ? "مشتریان معتبر و شرکای ما" : "Our Partners"}</motion.h2>
            <motion.div variants={fadeInUp} className="relative w-full overflow-hidden flex items-center" style={{ maskImage: 'linear-gradient(to right, transparent, black 10%, black 90%, transparent)', WebkitMaskImage: 'linear-gradient(to right, transparent, black 10%, black 90%, transparent)' }}>
              <motion.div animate={isRtl ? marqueeFA.animate : marqueeEN.animate} className="flex w-max gap-6 py-2">
                {dupPartners.map((partner, idx) => (
                  <a key={idx} href={partner.url} target="_blank" rel="noopener noreferrer" className="relative w-40 shrink-0 flex flex-col items-center justify-center transition-all group/card py-2 gap-2">
                    <img src={partner.logo} alt={isRtl ? partner.faName : partner.enName} className="max-w-24 max-h-10 opacity-60 group-hover/card:opacity-100 transition-opacity grayscale group-hover/card:grayscale-0 mb-1" />
                    <span className="text-sm font-bold text-gray-800 dark:text-gray-200 text-center">{isRtl ? partner.faName : partner.enName}</span>
                    <span className={`text-xs text-gray-500 text-center ${isRtl ? 'font-mono' : ''}`}>{isRtl ? partner.enName : partner.faName}</span>
                  </a>
                ))}
              </motion.div>
            </motion.div>
          </motion.div>
        )}

        {/* ۷. گواهینامه‌ها */}
        {visibility.showCerts && (
          <motion.div variants={staggerContainer} initial="hidden" whileInView="show" viewport={{ once: false, amount: 0.1 }} className="mt-8">
            <motion.h2 variants={fadeInUp} className="text-2xl font-black text-gray-900 dark:text-white mb-8 flex items-center justify-center gap-2"><Award className="text-amber-500" size={28}/> {isRtl ? "گواهینامه‌ها و افتخارات" : "Certificates & Awards"}</motion.h2>
            <motion.div variants={fadeInUp} className="relative w-full overflow-hidden flex items-center" style={{ maskImage: 'linear-gradient(to right, transparent, black 10%, black 90%, transparent)', WebkitMaskImage: 'linear-gradient(to right, transparent, black 10%, black 90%, transparent)' }}>
              <motion.div animate={isRtl ? marqueeRevFA.animate : marqueeRevEN.animate} className="flex w-max gap-6 py-2">
                {dupCerts.map((cert, idx) => (
                  <div key={idx} onClick={() => setSelectedCert(cert.logo)} className="w-32 h-44 shrink-0 bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm rounded-2xl border border-gray-100 dark:border-gray-800 p-2 cursor-pointer hover:border-amber-400 hover:scale-105 transition-all">
                    <img src={cert.logo} alt={cert.faName} className="w-full h-full object-cover rounded-xl" />
                  </div>
                ))}
              </motion.div>
            </motion.div>
          </motion.div>
        )}

        <hr className="border-dashed border-gray-200 dark:border-gray-800 my-4" />

        {/* ۸. تماس با ما */}
        <motion.div id="contact" variants={staggerContainer} initial="hidden" whileInView="show" viewport={{ once: false, amount: 0.1 }} className="scroll-mt-28">
          <motion.h2 variants={fadeInUp} className="text-3xl font-black text-gray-900 dark:text-white mb-10 text-center">{isRtl ? "تماس با ما" : "Contact Us"}</motion.h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <motion.div variants={fadeInUp} className="bg-white/50 dark:bg-gray-900/50 backdrop-blur-md border border-gray-100 dark:border-gray-800 p-8 rounded-3xl h-full flex flex-col justify-between">
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">{isRtl ? "ارسال پیام عمومی" : "Send a Message"}</h3>
                <form className="flex flex-col gap-5" onSubmit={handleContactSubmit}>
                  <input type="text" value={contactForm.name} onChange={e => setContactForm({...contactForm, name: e.target.value})} placeholder={isRtl ? "نام کامل شما" : "Full Name"} className="w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-5 py-4 focus:border-amber-400 outline-none" />
                  <input type="email" value={contactForm.email} onChange={e => setContactForm({...contactForm, email: e.target.value})} placeholder={isRtl ? "آدرس ایمیل" : "Email Address"} className="w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-5 py-4 focus:border-amber-400 outline-none" />
                  <textarea rows={5} value={contactForm.message} onChange={e => setContactForm({...contactForm, message: e.target.value})} placeholder={isRtl ? "پیام خود را بنویسید..." : "Your Message..."} className="w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-5 py-4 focus:border-amber-400 outline-none resize-none"></textarea>
                  <button type="submit" disabled={isSending} className="w-full bg-amber-400 hover:bg-amber-500 text-gray-900 py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-colors mt-2 text-lg disabled:opacity-70">
                    {isSending ? <Loader2 size={20} className="animate-spin" /> : <Send size={20} className={isRtl ? "transform -scale-x-100" : ""} />} 
                    {isRtl ? (isSending ? "در حال ارسال..." : "ارسال پیام") : (isSending ? "Sending..." : "Send Message")}
                  </button>
                </form>
              </div>
            </motion.div>
            <motion.div variants={fadeInUp} className="bg-gray-900 text-white border border-gray-800 p-8 rounded-3xl relative overflow-hidden flex flex-col justify-between h-full">
              <div className="absolute top-0 left-0 w-48 h-48 bg-amber-400/10 blur-3xl rounded-full pointer-events-none"></div>
              <div className="relative z-10">
                <h3 className="text-2xl font-black text-amber-400 mb-8 flex items-center gap-3"><Building2 size={28}/> {isRtl ? hqData.faName : hqData.enName}</h3>
                <div className="flex flex-col gap-6 mb-10">
                  <a href={`tel:${hqData.phone}`} className="flex items-center gap-4 text-gray-300 hover:text-amber-400 transition-colors group">
                     <div className="p-3 bg-white/10 rounded-xl group-hover:bg-amber-400 group-hover:text-gray-900 transition-colors"><Phone size={20}/></div>
                     <bdi dir="ltr" className="font-mono font-medium text-xl">{hqData.phone}</bdi>
                  </a>
                  <a href={`mailto:${hqData.email}`} className="flex items-center gap-4 text-gray-300 hover:text-amber-400 transition-colors group">
                     <div className="p-3 bg-white/10 rounded-xl group-hover:bg-amber-400 group-hover:text-gray-900 transition-colors"><Mail size={20}/></div>
                     <span className="font-mono text-base">{hqData.email}</span>
                  </a>
                  <a href={hqData.mapUrl} target="_blank" rel="noopener noreferrer" className="flex items-start gap-4 text-gray-300 hover:text-amber-400 transition-colors group">
                     <div className="p-3 bg-white/10 rounded-xl group-hover:bg-amber-400 group-hover:text-gray-900 transition-colors shrink-0"><MapPinned size={20}/></div>
                     <span className="text-base leading-relaxed mt-1">{isRtl ? hqData.faAddress : hqData.enAddress}</span>
                  </a>
                </div>
              </div>
              <div className="relative z-10 w-full flex justify-between items-center bg-white/5 p-2 rounded-2xl border border-white/10 backdrop-blur-md overflow-x-auto hide-scrollbar">
                {(hqData.socials || []).map((social: any, idx: number) => (
                   <SocialIconResolver key={idx} platform={social.platform} value={social.value} />
                ))}
                <a href={hqData.mapUrl} target="_blank" rel="noopener noreferrer" className="flex-1 flex justify-center py-2.5 hover:text-amber-400 transition-colors"><MapPin size={22}/></a>
                <button onClick={() => downloadVCF(hqData)} className="md:hidden flex-1 flex justify-center py-2.5 text-amber-400 hover:text-white transition-colors"><Download size={22}/></button>
              </div>
            </motion.div>
          </div>
        </motion.div>

        {/* ۹. نمایندگی‌های ما */}
        <motion.div id="branches" variants={staggerContainer} initial="hidden" whileInView="show" viewport={{ once: false, amount: 0.1 }} className="scroll-mt-28 mt-8">
          <motion.h2 variants={fadeInUp} className="text-2xl font-black text-gray-900 dark:text-white mb-8 text-center">{isRtl ? "نمایندگی‌های ما" : "Our Branches"}</motion.h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
            {branchesList.map((branch) => (
              <motion.div key={branch.id} variants={fadeInUp} className="bg-white/50 dark:bg-gray-900/50 backdrop-blur-md border border-gray-100 dark:border-gray-800 p-8 rounded-3xl flex flex-col justify-between hover:border-amber-400 transition-colors">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-3"><div className="p-2 bg-amber-400 text-gray-900 rounded-xl"><Building2 size={20}/></div>{isRtl ? branch.faName : branch.enName}</h3>
                <div className="flex flex-col gap-5 mb-8">
                  <a href={`tel:${branch.phone}`} className="flex items-center gap-4 text-gray-600 dark:text-gray-400 hover:text-amber-500 transition-colors group">
                     <div className="p-2 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 group-hover:border-amber-500"><Phone size={18}/></div>
                     <bdi dir="ltr" className="font-mono text-base font-bold">{branch.phone}</bdi>
                  </a>
                  <a href={branch.mapUrl} target="_blank" rel="noopener noreferrer" className="flex items-start gap-4 text-gray-600 dark:text-gray-400 hover:text-amber-500 transition-colors group">
                     <div className="p-2 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 group-hover:border-amber-500 shrink-0"><MapPinned size={18}/></div>
                     <span className="text-sm leading-relaxed mt-1">{isRtl ? branch.faAddress : branch.enAddress}</span>
                  </a>
                </div>
                <div className="w-full flex justify-between items-center bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-2.5 rounded-2xl text-gray-500 overflow-x-auto hide-scrollbar">
                  <a href={`mailto:${branch.email}`} className="flex-1 flex justify-center py-2 hover:text-amber-500 transition-colors"><Mail size={20}/></a>
                  {(branch.socials || []).map((social: any, idx: number) => (
                     <SocialIconResolver key={idx} platform={social.platform} value={social.value} />
                  ))}
                  <a href={branch.mapUrl} target="_blank" rel="noopener noreferrer" className="flex-1 flex justify-center py-2 hover:text-amber-500 transition-colors"><MapPin size={20}/></a>
                  <button onClick={() => downloadVCF(branch)} className="md:hidden flex-1 flex justify-center py-2 text-amber-500 transition-colors"><Download size={20}/></button>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="flex justify-center mt-4">
            <motion.button 
              variants={fadeInUp}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsAgencyModalOpen(true)} 
              className="bg-amber-400 hover:bg-amber-500 text-gray-950 px-8 py-4 rounded-2xl font-black flex items-center gap-3 transition-colors shadow-lg text-lg"
            >
              <Briefcase size={24} />
              {isRtl ? "فرم درخواست اخذ نمایندگی" : "Agency Request Form"}
            </motion.button>
          </div>
        </motion.div>
      </div>

      <AnimatePresence>
        {isAgencyModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsAgencyModalOpen(false)} className="absolute inset-0 bg-gray-950/80 backdrop-blur-md cursor-pointer" />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="relative z-10 max-w-2xl w-full bg-white dark:bg-gray-900 rounded-[2rem] shadow-2xl p-6 md:p-10 max-h-[90vh] overflow-y-auto hide-scrollbar">
              <button onClick={() => setIsAgencyModalOpen(false)} className="absolute top-6 right-6 w-10 h-10 bg-gray-100 dark:bg-gray-800 text-gray-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full flex items-center justify-center transition-colors">
                <X size={20} />
              </button>
              <div className="text-center mb-8 mt-4">
                <div className="inline-flex p-4 bg-amber-400/10 text-amber-500 rounded-full mb-4"><Briefcase size={32} /></div>
                <h3 className="text-2xl font-black text-gray-900 dark:text-white mb-2">{isRtl ? "درخواست اخذ نمایندگی" : "Agency Request Form"}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">{isRtl ? "لطفاً اطلاعات خود را با دقت وارد کنید تا کارشناسان ما با شما تماس بگیرند." : "Please enter your details carefully."}</p>
              </div>
              <form className="grid grid-cols-1 md:grid-cols-2 gap-5" onSubmit={handleAgencySubmit}>
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-bold text-gray-600 dark:text-gray-400">{isRtl ? "نام و نام خانوادگی / نام شرکت *" : "Full Name / Company *"}</label>
                  <input type="text" value={agencyForm.name} onChange={e => setAgencyForm({...agencyForm, name: e.target.value})} className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 focus:border-amber-400 outline-none" required />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-bold text-gray-600 dark:text-gray-400">{isRtl ? "شماره تماس (موبایل) *" : "Phone Number *"}</label>
                  <input type="text" dir="ltr" value={agencyForm.phone} onChange={e => setAgencyForm({...agencyForm, phone: e.target.value})} className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 focus:border-amber-400 outline-none font-mono" required />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-bold text-gray-600 dark:text-gray-400">{isRtl ? "ولایت و شهر محل فعالیت *" : "Province / City *"}</label>
                  <input type="text" value={agencyForm.city} onChange={e => setAgencyForm({...agencyForm, city: e.target.value})} className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 focus:border-amber-400 outline-none" required />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-bold text-gray-600 dark:text-gray-400">{isRtl ? "میزان سابقه پخش و توزیع (سال)" : "Years of Experience"}</label>
                  <input type="text" dir="ltr" value={agencyForm.experience} onChange={e => setAgencyForm({...agencyForm, experience: e.target.value})} className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 focus:border-amber-400 outline-none font-mono" />
                </div>
                <div className="flex flex-col gap-2 md:col-span-2">
                  <label className="text-xs font-bold text-gray-600 dark:text-gray-400">{isRtl ? "توضیحات تکمیلی و امکانات (متراژ گدام، موتر پخش و...)" : "Additional Details"}</label>
                  <textarea rows={4} value={agencyForm.description} onChange={e => setAgencyForm({...agencyForm, description: e.target.value})} className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 focus:border-amber-400 outline-none resize-none"></textarea>
                </div>
                <button type="submit" disabled={isSubmittingAgency} className="w-full md:col-span-2 bg-amber-400 hover:bg-amber-500 text-gray-900 py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 transition-all mt-2 shadow-md disabled:opacity-70">
                  {isSubmittingAgency ? <Loader2 size={20} className="animate-spin" /> : <CheckCircle2 size={20} />}
                  {isRtl ? (isSubmittingAgency ? "در حال ثبت..." : "ثبت نهایی درخواست") : (isSubmittingAgency ? "Submitting..." : "Submit Request")}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {selectedCert && (
          <div className="fixed inset-0 flex items-center justify-center p-4 z-50">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSelectedCert(null)} className="absolute inset-0 bg-gray-950/80 backdrop-blur-md cursor-pointer" />
            <motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }} className="relative z-10 max-w-md w-full bg-white dark:bg-gray-900 p-2 rounded-3xl shadow-2xl">
              <button onClick={() => setSelectedCert(null)} className="absolute -top-4 -right-4 w-10 h-10 bg-red-500 text-white rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform"><X size={20} /></button>
              <img src={selectedCert} alt="Certificate" className="w-full h-auto object-contain rounded-2xl" />
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </main>
  );
}