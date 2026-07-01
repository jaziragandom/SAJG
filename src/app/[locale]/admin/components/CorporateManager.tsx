"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Building2, Target, Users, Award, MapPin, CheckCircle2,
  Plus, Trash2, Edit3, Image as ImageIcon, Wand2, Loader2, Factory, X, BarChart, Film, ClipboardList, Eye,
  Music2, MessageSquare, Share2, Send, MessageCircle
} from "lucide-react";
import { getSiteContent, saveSiteContent } from "@/actions/siteContent";
import * as LucideIcons from "lucide-react";

// --- Custom Brand Icons ---
const BrandInstagram = (props: any) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg>;
const BrandFacebook = (props: any) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>;
const BrandTwitter = (props: any) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"/></svg>;
const BrandLinkedin = (props: any) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect width="4" height="12" x="2" y="9"/><circle cx="4" cy="4" r="2"/></svg>;
const BrandYoutube = (props: any) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2.5 7.1C2.5 7.1 2 9.4 2 12c0 2.6.5 4.9.5 4.9.3 1.1 1.2 2 2.3 2.3 2.6.5 7.2.5 7.2.5s4.6 0 7.2-.5c1.1-.3 2-1.2 2.3-2.3.5-2.3.5-4.9.5-4.9s-.5-2.6-.5-4.9c-.3-1.1-1.2-2-2.3-2.3-2.6-.5-7.2-.5-7.2-.5s-4.6 0-7.2.5C3.7 5.1 2.8 6 2.5 7.1z"/><path d="M9.8 15.5l6.4-3.5-6.4-3.5v7z"/></svg>;
const BrandAparat = (props: any) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/></svg>;

const DynamicIcon = ({ name, size = 24 }: { name: string, size?: number }) => {
  const IconComponent = (LucideIcons as any)[name] || LucideIcons.HelpCircle;
  return <IconComponent size={size} />;
};

// لیست کامل شبکه‌های اجتماعی با آیکن‌های مربوطه
const socialPlatformsList = [
  { id: 'whatsapp', label: 'واتس‌اپ (WhatsApp)', icon: <MessageCircle size={16} /> },
  { id: 'telegram', label: 'تلگرام (Telegram)', icon: <Send size={16} /> },
  { id: 'instagram', label: 'اینستاگرام (Instagram)', icon: <BrandInstagram size={16} /> },
  { id: 'facebook', label: 'فیسبوک (Facebook)', icon: <BrandFacebook size={16} /> },
  { id: 'twitter', label: 'توییتر (X)', icon: <BrandTwitter size={16} /> },
  { id: 'youtube', label: 'یوتیوب (YouTube)', icon: <BrandYoutube size={16} /> },
  { id: 'linkedin', label: 'لینکدین (LinkedIn)', icon: <BrandLinkedin size={16} /> },
  { id: 'tiktok', label: 'تیک‌تاک (TikTok)', icon: <Music2 size={16} /> },
  { id: 'aparat', label: 'آپارات (Aparat)', icon: <BrandAparat size={16} /> },
  { id: 'eitaa', label: 'ایتا (Eitaa)', icon: <MessageSquare size={16} /> },
  { id: 'rubika', label: 'روبیکا (Rubika)', icon: <Share2 size={16} /> }
];

interface CorporateManagerProps {
  currentSection: string;
}

export default function CorporateManager({ currentSection }: CorporateManagerProps) {
  const [translatingField, setTranslatingField] = useState<string | null>(null);
  const [isPageLoading, setIsPageLoading] = useState(true);

  // --- دیتای استاتیک ---
  const [introData, setIntroData] = useState({
    aboutFa: "", aboutEn: "", badgeFA: "", badgeEN: "",
    titleFA: "", titleEN: "", descFA: "", descEN: "", videoUrl: ""
  });

  const [strategyData, setStrategyData] = useState({
    missionFa: "", missionEn: "", visionFa: "", visionEn: "", qualityFa: "", qualityEn: ""
  });

  const [hqData, setHqData] = useState({
    faName: "", enName: "", phone: "", email: "", socials: [] as any[],
    faAddress: "", enAddress: "", mapUrl: ""
  });

  const [features, setFeatures] = useState<any[]>([]);
  const [visibility, setVisibility] = useState({ showPartners: true, showCerts: true });
  const [whyUs, setWhyUs] = useState<any[]>([]);
  const [stats, setStats] = useState<any[]>([]);
  const [partners, setPartners] = useState<any[]>([]);
  const [certificates, setCertificates] = useState<any[]>([]);
  const [branches, setBranches] = useState<any[]>([]);
  const [agencyRequests, setAgencyRequests] = useState<any[]>([]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState<"partner" | "cert" | "branch" | "why" | "stat" | "request_details" | "feature" | null>(null);
  const [tempFormData, setTempFormData] = useState<any>({});
  
  // استیت مربوط به اضافه کردن شبکه اجتماعی در فرم (شعب و دفتر مرکزی)
  const [newSocial, setNewSocial] = useState({ platform: 'instagram', value: '' });

  const iconOptions = [
    { value: "Globe", label: "کره زمین (Globe)" },
    { value: "Leaf", label: "برگ (Leaf)" },
    { value: "ShieldCheck", label: "سپر تیک‌دار (Shield)" },
    { value: "Factory", label: "کارخانه (Factory)" },
    { value: "Zap", label: "رعد و برق (Zap)" },
    { value: "Activity", label: "نمودار فعالیت (Activity)" },
    { value: "Users", label: "کاربران (Users)" },
    { value: "Star", label: "ستاره (Star)" }
  ];

  useEffect(() => {
    const fetchAllData = async () => {
      setIsPageLoading(true);
      const [introRes, strategyRes, statsRes, partnersRes, hqRes, agencyRes] = await Promise.all([
        getSiteContent('corporate_intro'),
        getSiteContent('corporate_strategy'),
        getSiteContent('corporate_stats'),
        getSiteContent('corporate_partners'),
        getSiteContent('corporate_hq'),
        getSiteContent('corporate_agency')
      ]);

      if (introRes?.data) {
        setIntroData(introRes.data);
        setFeatures(introRes.data.features || []);
      }
      if (strategyRes?.data) setStrategyData(strategyRes.data);
      if (statsRes?.data) {
        setStats(statsRes.data.stats || []);
        setWhyUs(statsRes.data.whyUs || []);
      }
      if (partnersRes?.data) {
        setVisibility(partnersRes.data.visibility || { showPartners: true, showCerts: true });
        setPartners(partnersRes.data.partners || []);
        setCertificates(partnersRes.data.certificates || []);
      }
      if (hqRes?.data) {
        let parsedHqData = hqRes.data.hqData || {};
        // مایگریشن: انتقال دیتای قدیمی شبکه‌های اجتماعی به آرایه جدید
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
        setBranches(parsedBranches);
      }
      if (agencyRes?.data) setAgencyRequests(agencyRes.data || []);

      setIsPageLoading(false);
    };
    fetchAllData();
  }, []);

  const handleTranslate = async (sourceText: string, fieldName: string, stateUpdater: any) => {
    if (!sourceText || !sourceText.trim()) return;
    setTranslatingField(fieldName);
    try {
      const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=fa&tl=en&dt=t&q=${encodeURIComponent(sourceText)}`;
      const res = await fetch(url);
      const data = await res.json();
      const translated = data[0].map((item: any) => item[0]).join('');
      stateUpdater((prev: any) => ({ ...prev, [fieldName]: translated }));
    } catch (error) {
      console.error("Translation error:", error);
      alert("خطا در ارتباط با سرور ترجمه.");
    } finally {
      setTranslatingField(null);
    }
  };

  const openModal = async (type: typeof modalType, item?: any) => {
    setModalType(type);
    if (item) {
      setTempFormData({ ...item });
    } else {
      setTempFormData({
        id: Date.now(), faName: "", enName: "", faTitle: "", enTitle: "", descFA: "", descEN: "", icon: "",
        value: "", phone: "", email: "", url: "", socials: [],
        faAddress: "", enAddress: "", mapUrl: "", logo: "", img: ""
      });
    }

    setNewSocial({ platform: 'instagram', value: '' });

    if (type === "request_details" && item && item.status === "pending") {
      const updatedRequests = agencyRequests.map(req => req.id === item.id ? { ...req, status: "reviewed" } : req);
      setAgencyRequests(updatedRequests);
      await saveSiteContent('corporate_agency', updatedRequests);
    }

    setIsModalOpen(true);
  };

  const saveDynamicItem = async () => {
    let success = false;
    if (modalType === "partner") {
      const newArr = partners.some(p => p.id === tempFormData.id) ? partners.map(p => p.id === tempFormData.id ? tempFormData : p) : [...partners, tempFormData];
      setPartners(newArr);
      const res = await saveSiteContent('corporate_partners', { visibility, partners: newArr, certificates });
      success = res.success;
    } else if (modalType === "cert") {
      const newArr = certificates.some(c => c.id === tempFormData.id) ? certificates.map(c => c.id === tempFormData.id ? tempFormData : c) : [...certificates, tempFormData];
      setCertificates(newArr);
      const res = await saveSiteContent('corporate_partners', { visibility, partners, certificates: newArr });
      success = res.success;
    } else if (modalType === "branch") {
      const newArr = branches.some(b => b.id === tempFormData.id) ? branches.map(b => b.id === tempFormData.id ? tempFormData : b) : [...branches, tempFormData];
      setBranches(newArr);
      const res = await saveSiteContent('corporate_hq', { hqData, branches: newArr });
      success = res.success;
    } else if (modalType === "why") {
      const newArr = whyUs.some(w => w.id === tempFormData.id) ? whyUs.map(w => w.id === tempFormData.id ? tempFormData : w) : [...whyUs, tempFormData];
      setWhyUs(newArr);
      const res = await saveSiteContent('corporate_stats', { stats, whyUs: newArr });
      success = res.success;
    } else if (modalType === "stat") {
      const newArr = stats.some(s => s.id === tempFormData.id) ? stats.map(s => s.id === tempFormData.id ? tempFormData : s) : [...stats, tempFormData];
      setStats(newArr);
      const res = await saveSiteContent('corporate_stats', { stats: newArr, whyUs });
      success = res.success;
    } else if (modalType === "feature") {
      const newArr = features.some(f => f.id === tempFormData.id) ? features.map(f => f.id === tempFormData.id ? tempFormData : f) : [...features, tempFormData];
      setFeatures(newArr);
      const res = await saveSiteContent('corporate_intro', { ...introData, features: newArr });
      success = res.success;
    }

    if (!success) alert("خطا در ذخیره‌سازی آیتم");
    setIsModalOpen(false);
  };

  const deleteItem = async (type: typeof modalType, id: number) => {
    if (confirm("آیا از حذف این مورد اطمینان دارید؟")) {
      if (type === "partner") {
        const newArr = partners.filter(p => p.id !== id);
        setPartners(newArr);
        await saveSiteContent('corporate_partners', { visibility, partners: newArr, certificates });
      } else if (type === "cert") {
        const newArr = certificates.filter(c => c.id !== id);
        setCertificates(newArr);
        await saveSiteContent('corporate_partners', { visibility, partners, certificates: newArr });
      } else if (type === "branch") {
        const newArr = branches.filter(b => b.id !== id);
        setBranches(newArr);
        await saveSiteContent('corporate_hq', { hqData, branches: newArr });
      } else if (type === "why") {
        const newArr = whyUs.filter(w => w.id !== id);
        setWhyUs(newArr);
        await saveSiteContent('corporate_stats', { stats, whyUs: newArr });
      } else if (type === "stat") {
        const newArr = stats.filter(s => s.id !== id);
        setStats(newArr);
        await saveSiteContent('corporate_stats', { stats: newArr, whyUs });
      } else if (type === "request_details") {
        const newArr = agencyRequests.filter(r => r.id !== id);
        setAgencyRequests(newArr);
        await saveSiteContent('corporate_agency', newArr);
      } else if (type === "feature") {
        const newArr = features.filter(f => f.id !== id);
        setFeatures(newArr);
        await saveSiteContent('corporate_intro', { ...introData, features: newArr });
      }
    }
  };

  const renderBilingualField = (
    labelFA: string, labelEN: string, keyFA: string, keyEN: string,
    state: any, setState: any, isTextarea = true
  ) => {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50 dark:bg-gray-800/50 p-4 rounded-2xl border border-gray-100 dark:border-gray-800">
        <div className="flex flex-col gap-2">
          <label className="text-xs font-bold text-gray-600 dark:text-gray-400">{labelFA}</label>
          {isTextarea ? (
            <textarea
              rows={3} value={state[keyFA] || ""}
              onChange={e => setState({ ...state, [keyFA]: e.target.value })}
              className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-sm outline-none focus:border-amber-400 resize-none"
            ></textarea>
          ) : (
            <input
              type="text" value={state[keyFA] || ""}
              onChange={e => setState({ ...state, [keyFA]: e.target.value })}
              className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-sm outline-none focus:border-amber-400"
            />
          )}
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-xs font-bold text-gray-600 dark:text-gray-400">{labelEN}</label>
          <div className="relative h-full">
            {isTextarea ? (
              <textarea
                rows={3} dir="ltr" value={state[keyEN] || ""}
                onChange={e => setState({ ...state, [keyEN]: e.target.value })}
                className="w-full h-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl py-3 pr-4 pl-12 text-sm outline-none focus:border-amber-400 font-mono resize-none"
              ></textarea>
            ) : (
              <input
                type="text" dir="ltr" value={state[keyEN] || ""}
                onChange={e => setState({ ...state, [keyEN]: e.target.value })}
                className="w-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl py-3 pr-4 pl-12 text-sm outline-none focus:border-amber-400 font-mono"
              />
            )}
            <button
              type="button"
              onClick={() => handleTranslate(state[keyFA], keyEN, setState)}
              disabled={translatingField === keyEN}
              className="absolute left-2 top-2 p-2 bg-amber-400/10 text-amber-600 hover:bg-amber-400 hover:text-gray-950 disabled:opacity-50 rounded-lg transition-colors"
              title="ترجمه خودکار به انگلیسی"
            >
              {translatingField === keyEN ? <Loader2 size={16} className="animate-spin" /> : <Wand2 size={16} />}
            </button>
          </div>
        </div>
      </div>
    );
  };

  // تابع هوشمند برای تمیز کردن و اعتبارسنجی مقادیر شبکه‌های اجتماعی
  const handleAddSocial = (targetState: any, setTargetState: any) => {
    if (!newSocial.value.trim()) return;
    
    let cleanVal = newSocial.value.trim();
    // اگر واتساپ باشد، فقط اعداد و + را نگه می‌دارد
    if (newSocial.platform === 'whatsapp') {
      cleanVal = cleanVal.replace(/[^0-9+]/g, '');
    } else {
      // برای بقیه پلتفرم‌ها، اگر کاربر لینک کامل را گذاشته بود، نام کاربری را استخراج می‌کند
      cleanVal = cleanVal.replace(/^(https?:\/\/)?(www\.)?([a-zA-Z0-9-]+\.[a-z]+)\//, '');
      cleanVal = cleanVal.replace(/^@/, '');
      cleanVal = cleanVal.split('?')[0]; // حذف پارامترهای اضافی مثل ?igshid=...
    }

    const updatedSocials = [...(targetState.socials || []), { platform: newSocial.platform, value: cleanVal }];
    setTargetState({ ...targetState, socials: updatedSocials });
    setNewSocial({ platform: 'instagram', value: '' });
  };

  const removeSocial = (index: number, targetState: any, setTargetState: any) => {
    const updatedSocials = [...(targetState.socials || [])];
    updatedSocials.splice(index, 1);
    setTargetState({ ...targetState, socials: updatedSocials });
  };

  const renderSocialManager = (targetState: any, setTargetState: any) => (
    <div className="flex flex-col gap-4 border border-gray-200 dark:border-gray-700 p-5 rounded-2xl bg-gray-50 dark:bg-gray-800">
      <label className="text-sm font-bold text-gray-700 dark:text-gray-300">مدیریت شبکه‌های اجتماعی</label>
      
      <div className="flex flex-col sm:flex-row gap-3">
        <select 
          value={newSocial.platform} 
          onChange={(e) => setNewSocial({ ...newSocial, platform: e.target.value })}
          className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-600 rounded-xl px-4 py-2 text-sm outline-none focus:border-amber-400"
        >
          {socialPlatformsList.map(p => <option key={p.id} value={p.id}>{p.label}</option>)}
        </select>
        <input 
          type="text" 
          dir="ltr"
          placeholder="آیدی، لینک یا شماره" 
          value={newSocial.value} 
          onChange={(e) => setNewSocial({ ...newSocial, value: e.target.value })}
          className="flex-1 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-600 rounded-xl px-4 py-2 text-sm font-mono outline-none focus:border-amber-400"
        />
        <button 
          type="button" 
          onClick={() => handleAddSocial(targetState, setTargetState)}
          className="bg-amber-400 hover:bg-amber-500 text-gray-900 px-6 py-2 rounded-xl font-bold transition-colors text-sm shrink-0"
        >
          افزودن
        </button>
      </div>

      {(targetState.socials || []).length > 0 && (
        <div className="flex flex-wrap gap-2 mt-2">
          {(targetState.socials || []).map((social: any, idx: number) => {
            const platformInfo = socialPlatformsList.find(p => p.id === social.platform);
            return (
              <div key={idx} className="flex items-center gap-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-600 px-3 py-1.5 rounded-lg shadow-sm">
                <span className="text-gray-500">{platformInfo?.icon}</span>
                <span className="text-xs font-mono" dir="ltr">{social.value}</span>
                <button type="button" onClick={() => removeSocial(idx, targetState, setTargetState)} className="text-red-400 hover:text-red-600 transition-colors ml-1 mr-2"><X size={14}/></button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );

  let headerTitle = "پروفایل جامع شرکت";
  let HeaderIcon = Building2;
  let headerDesc = "مدیریت اطلاعات و محتوای صفحات شرکت";

  if (currentSection === "history" || currentSection === "about_sec" || currentSection === "corporate_sec") {
    headerTitle = "تاریخچه، معرفی و کارخانه";
    HeaderIcon = Factory;
    headerDesc = "تنظیمات این بخش همزمان در «صفحه اصلی» و «درباره ما» اعمال می‌شود.";
  } else if (currentSection === "vision") {
    headerTitle = "ماموریت و چشم‌انداز";
    HeaderIcon = Target;
  } else if (currentSection === "stats") {
    headerTitle = "آمار و چرا ما";
    HeaderIcon = BarChart;
  } else if (currentSection === "partners") {
    headerTitle = "شرکا و گواهینامه‌ها";
    HeaderIcon = Award;
  } else if (currentSection === "branches") {
    headerTitle = "دفتر مرکزی و نمایندگی‌ها";
    HeaderIcon = MapPin;
  } else if (currentSection === "agency_forms") {
    headerTitle = "مدیریت فرمهای درخواست نمایندگی";
    HeaderIcon = ClipboardList;
    headerDesc = "صندوق پیام‌ها و درخواست‌های ارسالی از سمت کاربران سایت";
  }

  if (isPageLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="animate-spin text-amber-500" size={40} />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 pb-20 h-full">
      <div className="flex justify-between items-center bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 p-6 rounded-3xl shadow-sm">
        <div>
          <h1 className="text-2xl font-black text-gray-900 dark:text-white flex items-center gap-3">
            <HeaderIcon className="text-amber-500" size={28} /> {headerTitle}
          </h1>
          <p className="text-xs text-gray-500 mt-2 font-medium leading-relaxed">{headerDesc}</p>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-3xl overflow-hidden shadow-sm p-6">
        <AnimatePresence mode="wait">

          {(currentSection === "history" || currentSection === "about_sec" || currentSection === "corporate_sec") && (
            <motion.form
              key="intro"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              onSubmit={async e => {
                e.preventDefault();
                const res = await saveSiteContent('corporate_intro', { ...introData, features });
                if (res.success) alert("اطلاعات معرفی شرکت با موفقیت ذخیره شد!");
                else alert(res.error);
              }}
              className="flex flex-col gap-6"
            >
              <div className="flex items-center gap-2 mb-2 p-3 bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 rounded-xl border border-amber-100 dark:border-amber-800/50 text-xs font-bold">
                <Building2 size={16} /> <span>متن اصلی معرفی شرکت (نمایش در بالای صفحه درباره ما)</span>
              </div>

              {renderBilingualField("متن درباره ما (فارسی)", "About Us (English)", "aboutFa", "aboutEn", introData, setIntroData, true)}

              <div className="w-full h-px bg-gray-100 dark:bg-gray-800 my-4" />

              <div className="flex items-center gap-2 mb-2 p-3 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 rounded-xl border border-blue-100 dark:border-blue-800/50 text-xs font-bold">
                <Factory size={16} /> <span>تنظیمات سکشن ویدیوی تور مجازی (نمایش در صفحه اصلی و درباره ما)</span>
              </div>

              {renderBilingualField("بج (نشان کوچک بالای متن)", "Badge Text", "badgeFA", "badgeEN", introData, setIntroData, false)}
              {renderBilingualField("تیتر اصلی", "Main Title", "titleFA", "titleEN", introData, setIntroData, false)}
              {renderBilingualField("توضیحات معرفی کارخانه", "Factory Description", "descFA", "descEN", introData, setIntroData, true)}

              <div className="flex flex-col gap-2 bg-gray-50 dark:bg-gray-800/50 p-4 rounded-2xl border border-gray-100 dark:border-gray-800 mt-2">
                <label className="text-xs font-bold text-gray-600 dark:text-gray-400">آپلود ویدیوی پس‌زمینه (MP4)</label>
                <label className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-2xl h-32 flex flex-col items-center justify-center gap-3 bg-white hover:bg-gray-50 dark:bg-gray-900 dark:hover:bg-gray-800 cursor-pointer transition-colors group">
                  <input type="file" accept="video/mp4" className="hidden" onChange={async(e) => { 
                    const f = e.target.files?.[0]; 
                    if(!f) return;
                    if(introData.videoUrl) { 
                      await fetch('/api/upload', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ fileUrl: introData.videoUrl }) }).catch(e => console.error(e));
                    } 
                    const fd = new FormData();
                    fd.append('file', f); 
                    const r = await fetch('/api/upload', {method:'POST',body:fd}); 
                    const d = await r.json(); 
                    if(d.success) { setIntroData({...introData, videoUrl: d.url});
                      alert('ویدیو جدید آپلود و ویدیوی قبلی حذف شد!'); } 
                  }} />
                  {introData.videoUrl ? <span className="text-sm font-bold text-green-500">ویدیو آپلود شده است</span> : <Film size={32} className="text-gray-400 group-hover:text-blue-500 transition-colors" />}
                  <span className="text-sm font-bold text-gray-500 group-hover:text-blue-600">برای انتخاب و آپلود فایل ویدیویی از هاست خود کلیک کنید</span>
                </label>
              </div>

              {/* بخش مدیریت ویژگی‌های کارخانه */}
              <div className="border border-gray-200 dark:border-gray-800 rounded-3xl p-6 bg-gray-50/50 dark:bg-gray-800/30 mt-4">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    <Factory className="text-blue-500" size={20} /> ویژگی‌های کارخانه (چهار مستطیل)
                  </h3>
                  <button type="button" onClick={() => openModal("feature")} className="bg-gray-900 dark:bg-white text-white dark:text-gray-900 px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 hover:bg-blue-500 hover:text-white transition-colors">
                    <Plus size={16} /> افزودن ویژگی
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {features.map(f => (
                    <div key={f.id} className="bg-white dark:bg-gray-800 p-4 rounded-2xl flex justify-between items-center border border-gray-100 dark:border-gray-700 hover:border-blue-400 transition-colors shadow-sm">
                      <div>
                        <p className="text-sm font-bold text-gray-900 dark:text-white">{f.faTitle}</p>
                        <p className="text-xs text-gray-500 font-mono mt-1">{f.enTitle}</p>
                      </div>
                      <div className="flex gap-2">
                        <button type="button" onClick={() => openModal("feature", f)} className="p-1.5 bg-gray-50 dark:bg-gray-700 text-gray-500 hover:text-blue-500 rounded-lg transition-colors"><Edit3 size={16} /></button>
                        <button type="button" onClick={() => deleteItem("feature", f.id)} className="p-1.5 bg-gray-50 dark:bg-gray-700 text-gray-500 hover:text-red-500 rounded-lg transition-colors"><Trash2 size={16} /></button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-end pt-4">
                <button type="submit" className="bg-amber-400 hover:bg-amber-500 text-gray-950 px-8 py-3 rounded-xl font-bold flex items-center gap-2 transition-colors">
                  <CheckCircle2 size={18} /> ذخیره اطلاعات این بخش
                </button>
              </div>
            </motion.form>
          )}

          {currentSection === "vision" && (
            <motion.form
              key="strategy"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              onSubmit={async e => {
                e.preventDefault();
                const res = await saveSiteContent('corporate_strategy', strategyData);
                if (res.success) alert("استراتژی و چشم‌انداز ذخیره شد!");
                else alert(res.error);
              }}
              className="flex flex-col gap-6"
            >
              {renderBilingualField("ماموریت شرکت", "Mission", "missionFa", "missionEn", strategyData, setStrategyData, true)}
              {renderBilingualField("چشم‌انداز", "Vision", "visionFa", "visionEn", strategyData, setStrategyData, true)}
              {renderBilingualField("تعهد به کیفیت", "Quality Commitment", "qualityFa", "qualityEn", strategyData, setStrategyData, true)}

              <div className="flex justify-end pt-4">
                <button type="submit" className="bg-amber-400 hover:bg-amber-500 text-gray-950 px-8 py-3 rounded-xl font-bold flex items-center gap-2 transition-colors">
                  <CheckCircle2 size={18} /> ذخیره استراتژی
                </button>
              </div>
            </motion.form>
          )}

          {currentSection === "stats" && (
            <motion.div key="stats" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }} className="flex flex-col gap-8">
              <div className="border border-gray-200 dark:border-gray-800 rounded-3xl p-6 bg-gray-50/50 dark:bg-gray-800/30">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    <Award className="text-amber-500" size={20} /> کارت‌های «چرا جزیره گندم؟»
                  </h3>
                  <button onClick={() => openModal("why")} className="bg-gray-900 dark:bg-white text-white dark:text-gray-900 px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 hover:bg-amber-400 hover:text-gray-900 transition-colors">
                    <Plus size={16} /> افزودن دلیل
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {whyUs.map(w => (
                    <div key={w.id} className="bg-white dark:bg-gray-800 p-4 rounded-2xl flex justify-between items-center border border-gray-100 dark:border-gray-700 hover:border-amber-400 transition-colors shadow-sm">
                      <div>
                        <p className="text-sm font-bold text-gray-900 dark:text-white">{w.faTitle}</p>
                        <p className="text-xs text-gray-500 font-mono mt-1">{w.enTitle}</p>
                      </div>
                      <div className="flex gap-2">
                        <button onClick={() => openModal("why", w)} className="p-1.5 bg-gray-50 dark:bg-gray-700 text-gray-500 hover:text-amber-500 rounded-lg transition-colors"><Edit3 size={16} /></button>
                        <button onClick={() => deleteItem("why", w.id)} className="p-1.5 bg-gray-50 dark:bg-gray-700 text-gray-500 hover:text-red-500 rounded-lg transition-colors"><Trash2 size={16} /></button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="border border-gray-200 dark:border-gray-800 rounded-3xl p-6 bg-gray-50/50 dark:bg-gray-800/30">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    <BarChart className="text-amber-500" size={20} /> آمار و ارقام شرکت
                  </h3>
                  <button onClick={() => openModal("stat")} className="bg-gray-900 dark:bg-white text-white dark:text-gray-900 px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 hover:bg-amber-400 hover:text-gray-900 transition-colors">
                    <Plus size={16} /> افزودن آمار
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {stats.map(s => (
                    <div key={s.id} className="bg-white dark:bg-gray-800 p-4 rounded-2xl flex justify-between items-center border border-gray-100 dark:border-gray-700 hover:border-amber-400 transition-colors shadow-sm">
                      <div>
                        <p className="text-xl font-black text-amber-500" dir="ltr">{s.value}</p>
                        <p className="text-xs font-bold text-gray-900 dark:text-white mt-1">{s.faTitle}</p>
                      </div>
                      <div className="flex gap-2">
                        <button onClick={() => openModal("stat", s)} className="p-1.5 bg-gray-50 dark:bg-gray-700 text-gray-500 hover:text-amber-500 rounded-lg transition-colors"><Edit3 size={16} /></button>
                        <button onClick={() => deleteItem("stat", s.id)} className="p-1.5 bg-gray-50 dark:bg-gray-700 text-gray-500 hover:text-red-500 rounded-lg transition-colors"><Trash2 size={16} /></button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {currentSection === "partners" && (
            <motion.div key="partners" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }} className="flex flex-col gap-8">

              <div className="flex flex-wrap gap-6 bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800/30 p-5 rounded-2xl">
                <label className="flex items-center gap-3 cursor-pointer group">
                  <input
                    type="checkbox" checked={visibility.showPartners}
                    onChange={async e => {
                      const newVis = { ...visibility, showPartners: e.target.checked };
                      setVisibility(newVis);
                      await saveSiteContent('corporate_partners', { visibility: newVis, partners, certificates });
                    }}
                    className="hidden"
                  />
                  <div className={`w-12 h-6 rounded-full p-1 transition-colors ${visibility.showPartners ? 'bg-amber-500' : 'bg-gray-300 dark:bg-gray-700'}`}>
                    <div className={`w-4 h-4 bg-white rounded-full transition-transform ${visibility.showPartners ? 'translate-x-0 rtl:-translate-x-6' : 'translate-x-6 rtl:translate-x-0'}`} />
                  </div>
                  <span className="text-sm font-bold text-gray-800 dark:text-gray-200">نمایش بخش مشتریان در سایت</span>
                </label>

                <label className="flex items-center gap-3 cursor-pointer group">
                  <input
                    type="checkbox" checked={visibility.showCerts}
                    onChange={async e => {
                      const newVis = { ...visibility, showCerts: e.target.checked };
                      setVisibility(newVis);
                      await saveSiteContent('corporate_partners', { visibility: newVis, partners, certificates });
                    }}
                    className="hidden"
                  />
                  <div className={`w-12 h-6 rounded-full p-1 transition-colors ${visibility.showCerts ? 'bg-amber-500' : 'bg-gray-300 dark:bg-gray-700'}`}>
                    <div className={`w-4 h-4 bg-white rounded-full transition-transform ${visibility.showCerts ? 'translate-x-0 rtl:-translate-x-6' : 'translate-x-6 rtl:translate-x-0'}`} />
                  </div>
                  <span className="text-sm font-bold text-gray-800 dark:text-gray-200">نمایش بخش گواهینامه‌ها در سایت</span>
                </label>
              </div>

              <div className="border border-gray-200 dark:border-gray-800 rounded-3xl p-6 bg-gray-50/50 dark:bg-gray-800/30">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    <Users className="text-amber-500" size={20} /> لیست مشتریان و شرکا
                  </h3>
                  <button onClick={() => openModal("partner")} className="bg-gray-900 dark:bg-white text-white dark:text-gray-900 px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 hover:bg-amber-400 hover:text-gray-900 transition-colors">
                    <Plus size={16} /> افزودن شریک
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {partners.map(p => (
                    <div key={p.id} className="bg-white dark:bg-gray-800 p-4 rounded-2xl flex justify-between items-center border border-gray-100 dark:border-gray-700 hover:border-amber-400 transition-colors shadow-sm">
                      <div>
                        <p className="text-sm font-bold text-gray-900 dark:text-white">{p.faName}</p>
                        <p className="text-xs text-gray-500 font-mono mt-1">{p.enName}</p>
                      </div>
                      <div className="flex gap-2">
                        <button onClick={() => openModal("partner", p)} className="p-1.5 bg-gray-50 dark:bg-gray-700 text-gray-500 hover:text-amber-500 rounded-lg transition-colors"><Edit3 size={16} /></button>
                        <button onClick={() => deleteItem("partner", p.id)} className="p-1.5 bg-gray-50 dark:bg-gray-700 text-gray-500 hover:text-red-500 rounded-lg transition-colors"><Trash2 size={16} /></button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="border border-gray-200 dark:border-gray-800 rounded-3xl p-6 bg-gray-50/50 dark:bg-gray-800/30">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    <Award className="text-amber-500" size={20} /> گواهینامه‌ها و افتخارات
                  </h3>
                  <button onClick={() => openModal("cert")} className="bg-gray-900 dark:bg-white text-white dark:text-gray-900 px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 hover:bg-amber-400 hover:text-gray-900 transition-colors">
                    <Plus size={16} /> افزودن گواهینامه
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {certificates.map(c => (
                    <div key={c.id} className="bg-white dark:bg-gray-800 p-4 rounded-2xl flex justify-between items-center border border-gray-100 dark:border-gray-700 hover:border-amber-400 transition-colors shadow-sm">
                      <div>
                        <p className="text-sm font-bold text-gray-900 dark:text-white">{c.faName}</p>
                        <p className="text-xs text-gray-500 font-mono mt-1">{c.enName}</p>
                      </div>
                      <div className="flex gap-2">
                        <button onClick={() => openModal("cert", c)} className="p-1.5 bg-gray-50 dark:bg-gray-700 text-gray-500 hover:text-amber-500 rounded-lg transition-colors"><Edit3 size={16} /></button>
                        <button onClick={() => deleteItem("cert", c.id)} className="p-1.5 bg-gray-50 dark:bg-gray-700 text-gray-500 hover:text-red-500 rounded-lg transition-colors"><Trash2 size={16} /></button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </motion.div>
          )}

          {currentSection === "branches" && (
            <motion.div key="contact" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }} className="flex flex-col gap-8">

              <form onSubmit={async e => {
                e.preventDefault();
                const res = await saveSiteContent('corporate_hq', { hqData, branches });
                if (res.success) alert("اطلاعات دفتر مرکزی با موفقیت ذخیره شد!");
                else alert(res.error);
              }} className="border border-gray-200 dark:border-gray-800 rounded-3xl p-6 bg-gray-50/50 dark:bg-gray-800/30">
                <h3 className="font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                  <Building2 size={20} className="text-amber-500" /> اطلاعات دفتر مرکزی (HQ)
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-bold text-gray-600 dark:text-gray-400">نام دفتر (فارسی)</label>
                    <input type="text" value={hqData.faName} onChange={e => setHqData({ ...hqData, faName: e.target.value })} className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-sm outline-none focus:border-amber-400" />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-bold text-gray-600 dark:text-gray-400">HQ Name (English)</label>
                    <input type="text" dir="ltr" value={hqData.enName} onChange={e => setHqData({ ...hqData, enName: e.target.value })} className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-sm outline-none focus:border-amber-400 font-mono" />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-bold text-gray-600 dark:text-gray-400">تلفن پشتیبانی (Phone)</label>
                    <input type="text" dir="ltr" value={hqData.phone} onChange={e => setHqData({ ...hqData, phone: e.target.value })} className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-sm font-mono outline-none focus:border-amber-400" />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-bold text-gray-600 dark:text-gray-400">ایمیل (Email)</label>
                    <input type="email" dir="ltr" value={hqData.email} onChange={e => setHqData({ ...hqData, email: e.target.value })} className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-sm font-mono outline-none focus:border-amber-400" />
                  </div>
                  <div className="flex flex-col gap-2 col-span-full">
                    <label className="text-xs font-bold text-gray-600 dark:text-gray-400">لینک گوگل مپ</label>
                    <input type="url" dir="ltr" value={hqData.mapUrl} onChange={e => setHqData({ ...hqData, mapUrl: e.target.value })} className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-sm font-mono outline-none focus:border-amber-400" />
                  </div>
                </div>
                
                {/* مدریت داینامیک شبکه‌های اجتماعی دفتر مرکزی */}
                <div className="mb-6">
                   {renderSocialManager(hqData, setHqData)}
                </div>

                {renderBilingualField("آدرس دفتر مرکزی", "HQ Address", "faAddress", "enAddress", hqData, setHqData, true)}

                <div className="flex justify-end mt-6">
                  <button type="submit" className="bg-amber-400 hover:bg-amber-500 text-gray-950 px-8 py-3 rounded-xl font-bold flex items-center gap-2 transition-colors text-sm">
                    <CheckCircle2 size={18} /> ذخیره اطلاعات دفتر مرکزی
                  </button>
                </div>
              </form>

              <div className="border border-gray-200 dark:border-gray-800 rounded-3xl p-6 bg-gray-50/50 dark:bg-gray-800/30">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    <MapPin className="text-amber-500" size={20} /> لیست شعب و نمایندگی‌ها
                  </h3>
                  <button onClick={() => openModal("branch")} className="bg-gray-900 dark:bg-white text-white dark:text-gray-900 px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 hover:bg-amber-400 hover:text-gray-900 transition-colors">
                    <Plus size={16} /> افزودن شعبه
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {branches.map(b => (
                    <div key={b.id} className="bg-white dark:bg-gray-800 p-5 rounded-2xl flex justify-between items-start border border-gray-100 dark:border-gray-700 hover:border-amber-400 transition-colors shadow-sm">
                      <div className="flex flex-col gap-1">
                        <p className="text-base font-bold text-gray-900 dark:text-white">{b.faName}</p>
                        <p className="text-xs text-gray-500 font-mono">{b.enName}</p>
                        <p className="text-sm font-bold text-amber-600 dark:text-amber-500 font-mono mt-2" dir="ltr">{b.phone}</p>
                      </div>
                      <div className="flex gap-2">
                        <button onClick={() => openModal("branch", b)} className="p-2 bg-gray-50 dark:bg-gray-700 text-gray-500 hover:text-amber-500 rounded-lg transition-colors"><Edit3 size={16} /></button>
                        <button onClick={() => deleteItem("branch", b.id)} className="p-2 bg-gray-50 dark:bg-gray-700 text-gray-500 hover:text-red-500 rounded-lg transition-colors"><Trash2 size={16} /></button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </motion.div>
          )}

          {currentSection === "agency_forms" && (
            <motion.div key="agency" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }} className="flex flex-col gap-6">

              <div className="flex items-center gap-3 mb-2 p-4 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 rounded-2xl border border-green-100 dark:border-green-800/50 text-sm font-medium">
                <ClipboardList size={24} className="shrink-0" />
                <p>لیست فرم‌های «درخواست اخذ نمایندگی» که کاربران از صفحه درباره ما پر کرده‌اند. فرم‌های خوانده نشده با نشانگر زرد مشخص شده‌اند.</p>
              </div>

              <div className="grid grid-cols-1 gap-4">
                {agencyRequests.map(req => (
                  <div key={req.id} className={`p-5 rounded-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border transition-colors shadow-sm ${req.status === 'pending' ? 'bg-amber-50 dark:bg-amber-900/10 border-amber-200 dark:border-amber-800/30' : 'bg-gray-50 dark:bg-gray-800 border-gray-100 dark:border-gray-700'}`}>

                    <div className="flex items-center gap-4">
                      {req.status === 'pending' ? (
                        <div className="w-3 h-3 bg-amber-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(245,158,11,0.6)]"></div>
                      ) : (
                        <div className="w-3 h-3 bg-gray-300 dark:bg-gray-600 rounded-full"></div>
                      )}

                      <div>
                        <h4 className="font-bold text-gray-900 dark:text-white mb-1 flex items-center gap-2">
                          {req.name} <span className="text-xs font-mono text-gray-400" dir="ltr">({req.phone})</span>
                        </h4>
                        <p className="text-xs text-gray-500 flex items-center gap-2">
                          <MapPin size={12} /> {req.province} <span className="mx-2 opacity-30">|</span> <span>ثبت شده در: {req.date || "نامشخص"}</span>
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-2 w-full md:w-auto">
                      <button onClick={() => openModal("request_details", req)} className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:border-amber-400 hover:text-amber-500 rounded-xl transition-colors text-sm font-bold">
                        <Eye size={16} /> {req.status === 'pending' ? 'بررسی فرم' : 'مشاهده مجدد'}
                      </button>
                      <button onClick={() => deleteItem("request_details", req.id)} className="px-4 py-2.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-600 text-gray-400 hover:bg-red-50 hover:border-red-200 hover:text-red-500 rounded-xl transition-colors">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))}

                {agencyRequests.length === 0 && (
                  <div className="text-center py-12 text-gray-400 font-medium">هیچ درخواستی در حال حاضر وجود ندارد.</div>
                )}
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </div>

      {/* =========================================
          مُدال‌های افزودن/ویرایش و نمایش فرم نمایندگی 
      ========================================= */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-gray-950/70 backdrop-blur-sm cursor-pointer"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              className="relative w-full max-w-3xl bg-white dark:bg-gray-900 rounded-3xl shadow-2xl p-6 md:p-8 flex flex-col gap-6 max-h-[90vh] overflow-y-auto hide-scrollbar"
            >

              <div className="flex justify-between items-center border-b border-gray-100 dark:border-gray-800 pb-4">
                <h2 className="text-xl font-black text-gray-900 dark:text-white flex items-center gap-2">
                  {modalType === "branch" ? <MapPin className="text-amber-500" /> : modalType === "partner" ? <Users className="text-amber-500" /> : modalType === "request_details" ? <ClipboardList className="text-amber-500" /> : <Award className="text-amber-500" />}
                  {modalType === "request_details" ? "جزئیات درخواست نمایندگی" : tempFormData.id && tempFormData.id < Date.now() - 10000 ? "ویرایش اطلاعات" : "افزودن مورد جدید"}
                </h2>
                <button onClick={() => setIsModalOpen(false)} className="p-2 bg-gray-100 dark:bg-gray-800 text-gray-500 hover:bg-red-100 hover:text-red-500 rounded-full transition-colors"><X size={20} /></button>
              </div>

              <div className="flex flex-col gap-6">
                {modalType === "request_details" ? (
                  <div className="flex flex-col gap-5">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-2xl">
                        <span className="text-xs text-gray-500 block mb-1">نام و نام خانوادگی / شرکت</span>
                        <strong className="text-gray-900 dark:text-white">{tempFormData.name}</strong>
                      </div>
                      <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-2xl">
                        <span className="text-xs text-gray-500 block mb-1">شماره تماس (موبایل)</span>
                        <strong className="text-gray-900 dark:text-white font-mono" dir="ltr">{tempFormData.phone}</strong>
                      </div>
                      <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-2xl">
                        <span className="text-xs text-gray-500 block mb-1">استان و شهر محل فعالیت</span>
                        <strong className="text-gray-900 dark:text-white">{tempFormData.province}</strong>
                      </div>
                      <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-2xl">
                        <span className="text-xs text-gray-500 block mb-1">تاریخ ثبت درخواست</span>
                        <strong className="text-gray-900 dark:text-white">{tempFormData.date || "نامشخص"}</strong>
                      </div>
                    </div>
                    <div className="p-4 bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-800/30 rounded-2xl">
                      <span className="text-xs font-bold text-amber-600 dark:text-amber-500 block mb-3">توضیحات و رزومه متقاضی</span>
                      <p className="text-gray-800 dark:text-gray-300 leading-loose text-justify text-sm">
                        {tempFormData.message}
                      </p>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex flex-col gap-2">
                        <label className="text-xs font-bold text-gray-500">عنوان/نام (فارسی)</label>
                        <input type="text" value={tempFormData.faName || tempFormData.faTitle || ""} onChange={e => setTempFormData({ ...tempFormData, faName: e.target.value, faTitle: e.target.value })} className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-sm focus:border-amber-400 outline-none" />
                      </div>
                      <div className="flex flex-col gap-2">
                        <label className="text-xs font-bold text-gray-500">Title/Name (English)</label>
                        <div className="relative h-full">
                          <input type="text" dir="ltr" value={tempFormData.enName || tempFormData.enTitle || ""} onChange={e => setTempFormData({ ...tempFormData, enName: e.target.value, enTitle: e.target.value })} className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl py-3 pr-4 pl-12 text-sm focus:border-amber-400 outline-none font-mono" />
                          <button type="button" onClick={() => handleTranslate(tempFormData.faName || tempFormData.faTitle, tempFormData.enName !== undefined ? "enName" : "enTitle", setTempFormData)} disabled={translatingField === "enName" || translatingField === "enTitle"} className="absolute left-2 top-2 p-1.5 bg-white dark:bg-gray-700 text-amber-500 hover:bg-amber-400 hover:text-gray-950 disabled:opacity-50 rounded-lg transition-colors">
                            {translatingField ? <Loader2 size={16} className="animate-spin" /> : <Wand2 size={16} />}
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* فیلد انتخاب آیکن برای چرا ما و ویژگی کارخانه */}
                    {(modalType === "why" || modalType === "feature") && (
                      <div className="flex flex-col gap-3 col-span-full mt-2">
                        <label className="text-xs font-bold text-gray-500">انتخاب آیکن (Icon)</label>
                        <div className="grid grid-cols-4 sm:grid-cols-8 gap-3">
                          {iconOptions.map(opt => (
                            <button
                              key={opt.value}
                              type="button"
                              onClick={() => setTempFormData({ ...tempFormData, icon: opt.value })}
                              className={`flex flex-col items-center justify-center gap-2 p-3 rounded-2xl border transition-all ${
                                tempFormData.icon === opt.value 
                                  ? "bg-amber-100 border-amber-500 text-amber-600 dark:bg-amber-900/40 dark:border-amber-400 dark:text-amber-400 shadow-md scale-105" 
                                  : "bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700"
                              }`}
                              title={opt.label}
                            >
                              <DynamicIcon name={opt.value} size={28} />
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* فیلد توضیحات کوتاه برای ویژگی کارخانه */}
                    {modalType === "feature" && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 col-span-full">
                        <div className="flex flex-col gap-2">
                          <label className="text-xs font-bold text-gray-500">توضیح کوتاه (فارسی)</label>
                          <input type="text" value={tempFormData.descFA || ""} onChange={e => setTempFormData({ ...tempFormData, descFA: e.target.value })} className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-sm focus:border-amber-400 outline-none" />
                        </div>
                        <div className="flex flex-col gap-2">
                          <label className="text-xs font-bold text-gray-500">توضیح کوتاه (انگلیسی)</label>
                          <input type="text" dir="ltr" value={tempFormData.descEN || ""} onChange={e => setTempFormData({ ...tempFormData, descEN: e.target.value })} className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-sm focus:border-amber-400 outline-none font-mono" />
                        </div>
                      </div>
                    )}

                    {modalType === "stat" && (
                      <div className="flex flex-col gap-2">
                        <label className="text-xs font-bold text-gray-500">مقدار عددی آمار (مثلاً 50)</label>
                        <input type="text" dir="ltr" value={tempFormData.value || ""} onChange={e => setTempFormData({ ...tempFormData, value: e.target.value })} className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-sm focus:border-amber-400 outline-none w-1/2 font-mono" />
                      </div>
                    )}

                    {modalType === "branch" && (
                      <>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="flex flex-col gap-2"><label className="text-xs font-bold text-gray-600 dark:text-gray-400">تلفن شعبه</label><input type="text" dir="ltr" value={tempFormData.phone || ""} onChange={e => setTempFormData({ ...tempFormData, phone: e.target.value })} className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-sm focus:border-amber-400 outline-none font-mono" /></div>
                          <div className="flex flex-col gap-2"><label className="text-xs font-bold text-gray-600 dark:text-gray-400">ایمیل شعبه</label><input type="email" dir="ltr" value={tempFormData.email || ""} onChange={e => setTempFormData({ ...tempFormData, email: e.target.value })} className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-sm focus:border-amber-400 outline-none font-mono" /></div>
                          <div className="flex flex-col gap-2 col-span-full"><label className="text-xs font-bold text-gray-600 dark:text-gray-400">لینک گوگل مپ</label><input type="url" dir="ltr" value={tempFormData.mapUrl || ""} onChange={e => setTempFormData({ ...tempFormData, mapUrl: e.target.value })} className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-sm focus:border-amber-400 outline-none font-mono" /></div>
                        </div>
                        
                        <div className="mb-2 mt-2">
                           {renderSocialManager(tempFormData, setTempFormData)}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="flex flex-col gap-2">
                            <label className="text-xs font-bold text-gray-600 dark:text-gray-400">آدرس شعبه (فارسی)</label>
                            <textarea rows={2} value={tempFormData.faAddress || ""} onChange={e => setTempFormData({ ...tempFormData, faAddress: e.target.value })} className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-sm focus:border-amber-400 outline-none resize-none"></textarea>
                          </div>
                          <div className="flex flex-col gap-2">
                            <label className="text-xs font-bold text-gray-600 dark:text-gray-400">Branch Address (English)</label>
                            <div className="relative h-full">
                              <textarea rows={2} dir="ltr" value={tempFormData.enAddress || ""} onChange={e => setTempFormData({ ...tempFormData, enAddress: e.target.value })} className="w-full h-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl py-3 pr-4 pl-12 text-sm focus:border-amber-400 outline-none resize-none font-mono"></textarea>
                              <button type="button" onClick={() => handleTranslate(tempFormData.faAddress, "enAddress", setTempFormData)} disabled={translatingField === "enAddress"} className="absolute left-2 top-2 p-1.5 bg-white dark:bg-gray-700 text-amber-500 hover:bg-amber-400 hover:text-gray-950 disabled:opacity-50 rounded-lg transition-colors">
                                {translatingField === "enAddress" ? <Loader2 size={16} className="animate-spin" /> : <Wand2 size={16} />}
                              </button>
                            </div>
                          </div>
                        </div>
                      </>
                    )}

                    {modalType === "partner" && (
                      <div className="flex flex-col gap-2">
                        <label className="text-xs font-bold text-gray-600 dark:text-gray-400">لینک وب‌سایت شریک تجاری</label>
                        <input type="url" dir="ltr" value={tempFormData.url || ""} onChange={e => setTempFormData({ ...tempFormData, url: e.target.value })} className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-sm focus:border-amber-400 outline-none font-mono" placeholder="https://..." />
                      </div>
                    )}

                    {(modalType === "partner" || modalType === "cert") && (
                      <div className="flex flex-col gap-2">
                        <label className="text-xs font-bold text-gray-600 dark:text-gray-400">آپلود تصویر (Logo / Certificate)</label>
                        {tempFormData.logo && <img src={tempFormData.logo} alt="Preview" className="h-20 object-contain mx-auto" />}
                        <label className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-2xl h-32 flex flex-col items-center justify-center gap-3 bg-gray-50 hover:bg-gray-100 dark:bg-gray-800/50 cursor-pointer transition-colors group">
                          <input type="file" accept="image/png, image/jpeg" className="hidden" onChange={async(e) => { 
                            const f = e.target.files?.[0];
                            if(!f) return; 
                            if(tempFormData.logo) { 
                              await fetch('/api/upload', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ fileUrl: tempFormData.logo }) }).catch(e => console.error(e));
                            } 
                            const fd = new FormData();
                            fd.append('file', f); 
                            const r = await fetch('/api/upload', {method:'POST',body:fd}); 
                            const d = await r.json(); 
                            if(d.success) setTempFormData({...tempFormData, logo: d.url});
                          }} />
                          <ImageIcon size={32} className="text-gray-400 group-hover:text-amber-500 transition-colors" />
                          <span className="text-sm font-bold text-gray-500 group-hover:text-amber-600">برای انتخاب فایل تصویر کلیک کنید</span>
                        </label>
                      </div>
                    )}
                  </>
                )}
              </div>

              <div className="flex justify-end gap-3 pt-6 border-t border-gray-100 dark:border-gray-800">
                <button onClick={() => setIsModalOpen(false)} className="px-6 py-3 rounded-xl font-bold text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-sm">
                  {modalType === "request_details" ? "بستن پنجره" : "انصراف"}
                </button>
                {modalType !== "request_details" && (
                  <button onClick={saveDynamicItem} className="bg-amber-400 hover:bg-amber-500 text-gray-950 px-8 py-3 rounded-xl font-bold flex items-center gap-2 transition-all shadow-md text-sm">
                    <CheckCircle2 size={18} /> ثبت نهایی
                  </button>
                )}
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}