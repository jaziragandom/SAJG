"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Building2, Target, Users, Award, MapPin, CheckCircle2, 
  Plus, Trash2, Edit3, Image as ImageIcon, Wand2, Loader2, Factory, X, BarChart, Video, ClipboardList, Eye
} from "lucide-react";

interface CorporateManagerProps {
  currentSection: string;
}

export default function CorporateManager({ currentSection }: CorporateManagerProps) {
  const [translatingField, setTranslatingField] = useState<string | null>(null);

  // --- دیتای استاتیک ---
  const [introData, setIntroData] = useState({
    aboutFa: "شرکت جزیره گندم با بیش از دو دهه تجربه...", 
    aboutEn: "Jazireh Gandom Company...",
    badgeFA: "افتخار ملی، کیفیت جهانی", 
    badgeEN: "National Pride, Global Quality",
    titleFA: "تولید با استاندارد آلمان", 
    titleEN: "German Quality Standard",
    descFA: "ما در جزیره گندم...", 
    descEN: "At Jazireh Gandom...",
    videoUrl: ""
  });

  const [strategyData, setStrategyData] = useState({ 
    missionFa: "تأمین محصولات باکیفیت...", 
    missionEn: "Providing high-quality...", 
    visionFa: "تبدیل شدن به قطب تولید...", 
    visionEn: "Becoming the largest hub...",
    qualityFa: "ما در جزیره گندم، کیفیت را نه یک مزیت، بلکه یک الزام می‌دانیم...", 
    qualityEn: "At Jazireh Gandom, we consider quality..."
  });

  const [hqData, setHqData] = useState({ 
    faName: "دفتر مرکزی", 
    enName: "Headquarters", 
    phone: "+93 790 71 00 15", 
    email: "info@jazirahgandum.com", 
    wa: "93790710015", 
    tg: "jazirehgandom", 
    fb: "jazirehgandom", 
    ig: "jazirehgandom", 
    faAddress: "هرات، جاده بهزاد", 
    enAddress: "Tehran, Trade Tower", 
    mapUrl: "https://maps.google.com" 
  });
  
  // --- دیتای داینامیک و تیک‌های نمایش ---
  const [visibility, setVisibility] = useState({ 
    showPartners: true, 
    showCerts: true 
  });
  
  const [whyUs, setWhyUs] = useState<any[]>([
    { id: 1, faTitle: "فرمولاسیون آلمانی", enTitle: "German Formula" }
  ]);
  
  const [stats, setStats] = useState<any[]>([
    { id: 1, faTitle: "محصول متنوع", enTitle: "Diverse Products", value: "50" }
  ]);
  
  const [partners, setPartners] = useState<any[]>([
    { id: 1, faName: "شرکت آلفا", enName: "Alpha Co", logo: "", url: "https://alpha.com" }
  ]);
  
  const [certificates, setCertificates] = useState<any[]>([
    { id: 1, faName: "ایزو ۹۰۰۱", enName: "ISO 9001", img: "" }
  ]);
  
  const [branches, setBranches] = useState<any[]>([
    { 
      id: 1, 
      faName: "نمایندگی کابل", 
      enName: "Kabul Branch", 
      phone: "+93 79 522 4882", 
      email: "kabul@jazirehgandom.com", 
      wa: "93795224882", 
      tg: "jg_kabul", 
      faAddress: "کابل، شهر نو", 
      enAddress: "Kabul, Share naq", 
      mapUrl: "https://maps.google.com" 
    }
  ]);
  
  const [agencyRequests, setAgencyRequests] = useState<any[]>([
    { 
      id: 101, 
      name: "علی احمدی (پخش امید)", 
      phone: "+93 79 522 4882", 
      province: "هرات، جاده بهزاد", 
      message: "۵ سال سابقه پخش گرم مواد غذایی، دارای هنگر ۵۰۰ متری.", 
      date: "۱۴۰۲/۰۶/۱۵", 
      status: "pending" 
    },
    { 
      id: 102, 
      name: "شرکت نوین پخش", 
      phone: "+93 79 522 4882", 
      province: "فراه", 
      message: "درخواست عاملیت فروش محصولات انرژی‌زا.", 
      date: "۱۴۰۲/۰۶/۱۲", 
      status: "reviewed" 
    },
  ]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState<"partner" | "cert" | "branch" | "why" | "stat" | "request_details" | null>(null);
  const [tempFormData, setTempFormData] = useState<any>({});

  // تابع جادویی ترجمه با استفاده از Google Translate
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

  const openModal = (type: typeof modalType, item?: any) => {
    setModalType(type);
    if (item) {
      setTempFormData({ ...item });
    } else {
      setTempFormData({ 
        id: Date.now(), 
        faName: "", 
        enName: "", 
        faTitle: "", 
        enTitle: "", 
        value: "", 
        phone: "", 
        email: "", 
        wa: "", 
        tg: "", 
        url: "", 
        faAddress: "", 
        enAddress: "", 
        mapUrl: "", 
        logo: "", 
        img: "" 
      });
    }
    
    // وقتی مدیر روی مشاهده فرم کلیک می‌کند، وضعیت آن به بررسی شده تغییر کند
    if(type === "request_details" && item && item.status === "pending") {
      setAgencyRequests(prev => prev.map(req => req.id === item.id ? { ...req, status: "reviewed" } : req));
    }
    
    setIsModalOpen(true);
  };

  const saveDynamicItem = () => {
    if (modalType === "partner") {
      setPartners(prev => prev.some(p => p.id === tempFormData.id) ? prev.map(p => p.id === tempFormData.id ? tempFormData : p) : [...prev, tempFormData]);
    } else if (modalType === "cert") {
      setCertificates(prev => prev.some(c => c.id === tempFormData.id) ? prev.map(c => c.id === tempFormData.id ? tempFormData : c) : [...prev, tempFormData]);
    } else if (modalType === "branch") {
      setBranches(prev => prev.some(b => b.id === tempFormData.id) ? prev.map(b => b.id === tempFormData.id ? tempFormData : b) : [...prev, tempFormData]);
    } else if (modalType === "why") {
      setWhyUs(prev => prev.some(w => w.id === tempFormData.id) ? prev.map(w => w.id === tempFormData.id ? tempFormData : w) : [...prev, tempFormData]);
    } else if (modalType === "stat") {
      setStats(prev => prev.some(s => s.id === tempFormData.id) ? prev.map(s => s.id === tempFormData.id ? tempFormData : s) : [...prev, tempFormData]);
    }
    setIsModalOpen(false);
  };

  const deleteItem = (type: typeof modalType, id: number) => {
    if (confirm("آیا از حذف این مورد اطمینان دارید؟")) {
      if (type === "partner") {
        setPartners(prev => prev.filter(p => p.id !== id));
      } else if (type === "cert") {
        setCertificates(prev => prev.filter(c => c.id !== id));
      } else if (type === "branch") {
        setBranches(prev => prev.filter(b => b.id !== id));
      } else if (type === "why") {
        setWhyUs(prev => prev.filter(w => w.id !== id));
      } else if (type === "stat") {
        setStats(prev => prev.filter(s => s.id !== id));
      } else if (type === "request_details") {
        setAgencyRequests(prev => prev.filter(r => r.id !== id));
      }
    }
  };

  // تابع کمکی برای ساخت فیلدهای متنی دوزبانه به صورت خوانا و استاندارد
  const renderBilingualField = (
    labelFA: string, 
    labelEN: string, 
    keyFA: string, 
    keyEN: string, 
    state: any, 
    setState: any, 
    isTextarea = true
  ) => {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50 dark:bg-gray-800/50 p-4 rounded-2xl border border-gray-100 dark:border-gray-800">
        
        {/* فیلد فارسی */}
        <div className="flex flex-col gap-2">
          <label className="text-xs font-bold text-gray-600 dark:text-gray-400">
            {labelFA}
          </label>
          {isTextarea ? (
            <textarea 
              rows={3} 
              value={state[keyFA] || ""} 
              onChange={e => setState({ ...state, [keyFA]: e.target.value })} 
              className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-sm outline-none focus:border-amber-400 resize-none"
            ></textarea>
          ) : (
            <input 
              type="text" 
              value={state[keyFA] || ""} 
              onChange={e => setState({ ...state, [keyFA]: e.target.value })} 
              className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-sm outline-none focus:border-amber-400" 
            />
          )}
        </div>

        {/* فیلد انگلیسی به همراه دکمه ترجمه جادویی */}
        <div className="flex flex-col gap-2">
          <label className="text-xs font-bold text-gray-600 dark:text-gray-400">
            {labelEN}
          </label>
          <div className="relative h-full">
            {isTextarea ? (
              <textarea 
                rows={3} 
                dir="ltr" 
                value={state[keyEN] || ""} 
                onChange={e => setState({ ...state, [keyEN]: e.target.value })} 
                className="w-full h-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl py-3 pr-4 pl-12 text-sm outline-none focus:border-amber-400 font-mono resize-none"
              ></textarea>
            ) : (
              <input 
                type="text" 
                dir="ltr" 
                value={state[keyEN] || ""} 
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

  // تعیین عنوان و آیکون هدر بر اساس سایدبار
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

  return (
    <div className="flex flex-col gap-6 pb-20 h-full">
      
      {/* هدر داینامیک متصل به سایدبار */}
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
          
          {/* =========================================
              ۱. فرم تاریخچه و ویدیو 
          ========================================= */}
          {(currentSection === "history" || currentSection === "about_sec" || currentSection === "corporate_sec") && (
            <motion.form 
              key="intro" 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }} 
              onSubmit={e => { e.preventDefault(); alert("ذخیره شد!"); }} 
              className="flex flex-col gap-6"
            >
              <div className="flex items-center gap-2 mb-2 p-3 bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 rounded-xl border border-amber-100 dark:border-amber-800/50 text-xs font-bold">
                <Building2 size={16}/> <span>متن اصلی معرفی شرکت (نمایش در بالای صفحه درباره ما)</span>
              </div>
              
              {renderBilingualField("متن درباره ما (فارسی)", "About Us (English)", "aboutFa", "aboutEn", introData, setIntroData, true)}

              <div className="w-full h-px bg-gray-100 dark:bg-gray-800 my-4" />

              <div className="flex items-center gap-2 mb-2 p-3 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 rounded-xl border border-blue-100 dark:border-blue-800/50 text-xs font-bold">
                <Factory size={16}/> <span>تنظیمات سکشن ویدیوی تور مجازی (نمایش در صفحه اصلی و درباره ما)</span>
              </div>
              
              {renderBilingualField("بج (نشان کوچک بالای متن)", "Badge Text", "badgeFA", "badgeEN", introData, setIntroData, false)}
              {renderBilingualField("تیتر اصلی", "Main Title", "titleFA", "titleEN", introData, setIntroData, false)}
              {renderBilingualField("توضیحات معرفی کارخانه", "Factory Description", "descFA", "descEN", introData, setIntroData, true)}
              
              <div className="flex flex-col gap-2 bg-gray-50 dark:bg-gray-800/50 p-4 rounded-2xl border border-gray-100 dark:border-gray-800 mt-2">
                <label className="text-xs font-bold text-gray-600 dark:text-gray-400">آپلود ویدیوی پس‌زمینه (MP4)</label>
                <label className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-2xl h-32 flex flex-col items-center justify-center gap-3 bg-white hover:bg-gray-50 dark:bg-gray-900 dark:hover:bg-gray-800 cursor-pointer transition-colors group">
                  <input 
                    type="file" 
                    accept="video/mp4" 
                    className="hidden" 
                    onChange={(e) => { if(e.target.files && e.target.files[0]) { alert(`ویدیوی ${e.target.files[0].name} آماده آپلود در هاست شماست.`); } }} 
                  />
                  <Video size={32} className="text-gray-400 group-hover:text-blue-500 transition-colors" />
                  <span className="text-sm font-bold text-gray-500 group-hover:text-blue-600">برای انتخاب و آپلود فایل ویدیویی از هاست خود کلیک کنید</span>
                </label>
              </div>

              <div className="flex justify-end pt-4">
                <button type="submit" className="bg-amber-400 hover:bg-amber-500 text-gray-950 px-8 py-3 rounded-xl font-bold flex items-center gap-2 transition-colors">
                  <CheckCircle2 size={18} /> ذخیره اطلاعات این بخش
                </button>
              </div>
            </motion.form>
          )}

          {/* =========================================
              ۲. فرم استراتژی 
          ========================================= */}
          {currentSection === "vision" && (
            <motion.form 
              key="strategy" 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }} 
              onSubmit={e => { e.preventDefault(); alert("ذخیره شد!"); }} 
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

          {/* =========================================
              ۳. فرم آمار و چرا ما 
          ========================================= */}
          {currentSection === "stats" && (
            <motion.div key="stats" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col gap-8">
              
              <div className="border border-gray-200 dark:border-gray-800 rounded-3xl p-6 bg-gray-50/50 dark:bg-gray-800/30">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    <Award className="text-amber-500" size={20}/> کارت‌های «چرا جزیره گندم؟»
                  </h3>
                  <button onClick={() => openModal("why")} className="bg-gray-900 dark:bg-white text-white dark:text-gray-900 px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 hover:bg-amber-400 dark:hover:bg-amber-400 transition-colors">
                    <Plus size={16}/> افزودن دلیل
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
                        <button onClick={() => openModal("why", w)} className="p-1.5 bg-gray-50 dark:bg-gray-700 text-gray-500 hover:text-amber-500 rounded-lg transition-colors"><Edit3 size={16}/></button>
                        <button onClick={() => deleteItem("why", w.id)} className="p-1.5 bg-gray-50 dark:bg-gray-700 text-gray-500 hover:text-red-500 rounded-lg transition-colors"><Trash2 size={16}/></button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="border border-gray-200 dark:border-gray-800 rounded-3xl p-6 bg-gray-50/50 dark:bg-gray-800/30">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    <BarChart className="text-amber-500" size={20}/> آمار و ارقام شرکت
                  </h3>
                  <button onClick={() => openModal("stat")} className="bg-gray-900 dark:bg-white text-white dark:text-gray-900 px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 hover:bg-amber-400 dark:hover:bg-amber-400 transition-colors">
                    <Plus size={16}/> افزودن آمار
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
                        <button onClick={() => openModal("stat", s)} className="p-1.5 bg-gray-50 dark:bg-gray-700 text-gray-500 hover:text-amber-500 rounded-lg transition-colors"><Edit3 size={16}/></button>
                        <button onClick={() => deleteItem("stat", s.id)} className="p-1.5 bg-gray-50 dark:bg-gray-700 text-gray-500 hover:text-red-500 rounded-lg transition-colors"><Trash2 size={16}/></button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </motion.div>
          )}

          {/* =========================================
              ۴. فرم شرکا و گواهینامه‌ها 
          ========================================= */}
          {currentSection === "partners" && (
            <motion.div key="partners" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col gap-8">
              
              <div className="flex flex-wrap gap-6 bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800/30 p-5 rounded-2xl">
                <label className="flex items-center gap-3 cursor-pointer group">
                  <input 
                    type="checkbox" 
                    checked={visibility.showPartners} 
                    onChange={e => setVisibility({...visibility, showPartners: e.target.checked})} 
                    className="hidden" 
                  />
                  <div className={`w-12 h-6 rounded-full p-1 transition-colors ${visibility.showPartners ? 'bg-amber-500' : 'bg-gray-300 dark:bg-gray-700'}`}>
                    <div className={`w-4 h-4 bg-white rounded-full transition-transform ${visibility.showPartners ? 'translate-x-0 rtl:-translate-x-6' : 'translate-x-6 rtl:translate-x-0'}`} />
                  </div>
                  <span className="text-sm font-bold text-gray-800 dark:text-gray-200">نمایش بخش مشتریان در سایت</span>
                </label>

                <label className="flex items-center gap-3 cursor-pointer group">
                  <input 
                    type="checkbox" 
                    checked={visibility.showCerts} 
                    onChange={e => setVisibility({...visibility, showCerts: e.target.checked})} 
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
                    <Users className="text-amber-500" size={20}/> لیست مشتریان و شرکا
                  </h3>
                  <button onClick={() => openModal("partner")} className="bg-gray-900 dark:bg-white text-white dark:text-gray-900 px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 hover:bg-amber-400 dark:hover:bg-amber-400 transition-colors">
                    <Plus size={16}/> افزودن شریک
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
                        <button onClick={() => openModal("partner", p)} className="p-1.5 bg-gray-50 dark:bg-gray-700 text-gray-500 hover:text-amber-500 rounded-lg transition-colors"><Edit3 size={16}/></button>
                        <button onClick={() => deleteItem("partner", p.id)} className="p-1.5 bg-gray-50 dark:bg-gray-700 text-gray-500 hover:text-red-500 rounded-lg transition-colors"><Trash2 size={16}/></button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="border border-gray-200 dark:border-gray-800 rounded-3xl p-6 bg-gray-50/50 dark:bg-gray-800/30">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    <Award className="text-amber-500" size={20}/> گواهینامه‌ها و افتخارات
                  </h3>
                  <button onClick={() => openModal("cert")} className="bg-gray-900 dark:bg-white text-white dark:text-gray-900 px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 hover:bg-amber-400 dark:hover:bg-amber-400 transition-colors">
                    <Plus size={16}/> افزودن گواهینامه
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
                        <button onClick={() => openModal("cert", c)} className="p-1.5 bg-gray-50 dark:bg-gray-700 text-gray-500 hover:text-amber-500 rounded-lg transition-colors"><Edit3 size={16}/></button>
                        <button onClick={() => deleteItem("cert", c.id)} className="p-1.5 bg-gray-50 dark:bg-gray-700 text-gray-500 hover:text-red-500 rounded-lg transition-colors"><Trash2 size={16}/></button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </motion.div>
          )}

          {/* =========================================
              ۵. فرم شعب و تماس 
          ========================================= */}
          {currentSection === "branches" && (
            <motion.div key="contact" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col gap-8">
              
              <form onSubmit={e => { e.preventDefault(); alert("ذخیره شد!"); }} className="border border-gray-200 dark:border-gray-800 rounded-3xl p-6 bg-gray-50/50 dark:bg-gray-800/30">
                <h3 className="font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                  <Building2 size={20} className="text-amber-500"/> اطلاعات دفتر مرکزی (HQ)
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-bold text-gray-600 dark:text-gray-400">نام دفتر (فارسی)</label>
                    <input type="text" value={hqData.faName} onChange={e => setHqData({...hqData, faName: e.target.value})} className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-sm outline-none focus:border-amber-400" />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-bold text-gray-600 dark:text-gray-400">HQ Name (English)</label>
                    <input type="text" dir="ltr" value={hqData.enName} onChange={e => setHqData({...hqData, enName: e.target.value})} className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-sm outline-none focus:border-amber-400 font-mono" />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-bold text-gray-600 dark:text-gray-400">تلفن پشتیبانی (Phone)</label>
                    <input type="text" dir="ltr" value={hqData.phone} onChange={e => setHqData({...hqData, phone: e.target.value})} className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-sm font-mono outline-none focus:border-amber-400" />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-bold text-gray-600 dark:text-gray-400">ایمیل (Email)</label>
                    <input type="email" dir="ltr" value={hqData.email} onChange={e => setHqData({...hqData, email: e.target.value})} className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-sm font-mono outline-none focus:border-amber-400" />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-bold text-gray-600 dark:text-gray-400">شماره واتس‌اپ</label>
                    <input type="text" dir="ltr" placeholder="989120000000" value={hqData.wa} onChange={e => setHqData({...hqData, wa: e.target.value})} className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-sm font-mono outline-none focus:border-amber-400" />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-bold text-gray-600 dark:text-gray-400">آیدی تلگرام</label>
                    <input type="text" dir="ltr" placeholder="jazirehgandom" value={hqData.tg} onChange={e => setHqData({...hqData, tg: e.target.value})} className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-sm font-mono outline-none focus:border-amber-400" />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-bold text-gray-600 dark:text-gray-400">آیدی اینستاگرام</label>
                    <input type="text" dir="ltr" value={hqData.ig} onChange={e => setHqData({...hqData, ig: e.target.value})} className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-sm font-mono outline-none focus:border-amber-400" />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-bold text-gray-600 dark:text-gray-400">لینک گوگل مپ</label>
                    <input type="url" dir="ltr" value={hqData.mapUrl} onChange={e => setHqData({...hqData, mapUrl: e.target.value})} className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-sm font-mono outline-none focus:border-amber-400" />
                  </div>
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
                    <MapPin className="text-amber-500" size={20}/> لیست شعب و نمایندگی‌ها
                  </h3>
                  <button onClick={() => openModal("branch")} className="bg-gray-900 dark:bg-white text-white dark:text-gray-900 px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 hover:bg-amber-400 dark:hover:bg-amber-400 transition-colors">
                    <Plus size={16}/> افزودن شعبه
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {branches.map(b => (
                    <div key={b.id} className="bg-white dark:bg-gray-800 p-5 rounded-2xl flex justify-between items-start border border-gray-100 dark:border-gray-700 hover:border-amber-400 transition-colors shadow-sm">
                      <div className="flex flex-col gap-1">
                        <p className="text-base font-bold text-gray-900 dark:text-white">{b.faName}</p>
                        <p className="text-xs text-gray-500 font-mono">{b.enName}</p>
                        <p className="text-sm font-bold text-amber-600 dark:text-amber-500 font-mono mt-2">{b.phone}</p>
                      </div>
                      <div className="flex gap-2">
                        <button onClick={() => openModal("branch", b)} className="p-2 bg-gray-50 dark:bg-gray-700 text-gray-500 hover:text-amber-500 rounded-lg transition-colors"><Edit3 size={16}/></button>
                        <button onClick={() => deleteItem("branch", b.id)} className="p-2 bg-gray-50 dark:bg-gray-700 text-gray-500 hover:text-red-500 rounded-lg transition-colors"><Trash2 size={16}/></button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
            </motion.div>
          )}

          {/* =========================================
              ۶. صندوق درخواست‌های نمایندگی 
          ========================================= */}
          {currentSection === "agency_forms" && (
            <motion.div key="agency" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col gap-6">
              
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
                          {req.name} <span className="text-xs font-mono text-gray-400">({req.phone})</span>
                        </h4>
                        <p className="text-xs text-gray-500 flex items-center gap-2">
                          <MapPin size={12}/> {req.province} <span className="mx-2 opacity-30">|</span> <span>ثبت شده در: {req.date}</span>
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-2 w-full md:w-auto">
                      <button onClick={() => openModal("request_details", req)} className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:border-amber-400 hover:text-amber-500 rounded-xl transition-colors text-sm font-bold">
                        <Eye size={16}/> {req.status === 'pending' ? 'بررسی فرم' : 'مشاهده مجدد'}
                      </button>
                      <button onClick={() => deleteItem("request_details", req.id)} className="px-4 py-2.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-600 text-gray-400 hover:bg-red-50 hover:border-red-200 hover:text-red-500 rounded-xl transition-colors">
                        <Trash2 size={16}/>
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
              onClick={() => setIsModalOpen(false)} 
              className="absolute inset-0 bg-gray-950/70 backdrop-blur-sm cursor-pointer" 
            />
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }} 
              animate={{ opacity: 1, scale: 1, y: 0 }} 
              exit={{ opacity: 0, scale: 0.95, y: 20 }} 
              className="relative w-full max-w-3xl bg-white dark:bg-gray-900 rounded-3xl shadow-2xl p-6 md:p-8 flex flex-col gap-6 max-h-[90vh] overflow-y-auto hide-scrollbar"
            >
              
              <div className="flex justify-between items-center border-b border-gray-100 dark:border-gray-800 pb-4">
                <h2 className="text-xl font-black text-gray-900 dark:text-white flex items-center gap-2">
                  {modalType === "branch" ? <MapPin className="text-amber-500"/> : modalType === "partner" ? <Users className="text-amber-500"/> : modalType === "request_details" ? <ClipboardList className="text-amber-500"/> : <Award className="text-amber-500"/>}
                  {modalType === "request_details" ? "جزئیات درخواست نمایندگی" : tempFormData.id && tempFormData.id < Date.now() - 10000 ? "ویرایش اطلاعات" : "افزودن مورد جدید"}
                </h2>
                <button onClick={() => setIsModalOpen(false)} className="p-2 bg-gray-100 dark:bg-gray-800 text-gray-500 hover:bg-red-100 hover:text-red-500 rounded-full transition-colors"><X size={20}/></button>
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
                        <strong className="text-gray-900 dark:text-white">{tempFormData.date}</strong>
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
                        <input type="text" value={tempFormData.faName || tempFormData.faTitle || ""} onChange={e => setTempFormData({...tempFormData, faName: e.target.value, faTitle: e.target.value})} className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-sm focus:border-amber-400 outline-none" />
                      </div>
                      <div className="flex flex-col gap-2">
                        <label className="text-xs font-bold text-gray-500">Title/Name (English)</label>
                        <div className="relative h-full">
                          <input type="text" dir="ltr" value={tempFormData.enName || tempFormData.enTitle || ""} onChange={e => setTempFormData({...tempFormData, enName: e.target.value, enTitle: e.target.value})} className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl py-3 pr-4 pl-12 text-sm focus:border-amber-400 outline-none font-mono" />
                          <button type="button" onClick={() => handleTranslate(tempFormData.faName || tempFormData.faTitle, tempFormData.enName !== undefined ? "enName" : "enTitle", setTempFormData)} disabled={translatingField === "enName" || translatingField === "enTitle"} className="absolute left-2 top-2 p-1.5 bg-white dark:bg-gray-700 text-amber-500 hover:bg-amber-400 hover:text-gray-950 disabled:opacity-50 rounded-lg transition-colors">
                            {translatingField ? <Loader2 size={16} className="animate-spin"/> : <Wand2 size={16}/>}
                          </button>
                        </div>
                      </div>
                    </div>

                    {modalType === "stat" && (
                      <div className="flex flex-col gap-2">
                        <label className="text-xs font-bold text-gray-500">مقدار عددی آمار (مثلاً 50)</label>
                        <input type="text" dir="ltr" value={tempFormData.value || ""} onChange={e => setTempFormData({...tempFormData, value: e.target.value})} className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-sm focus:border-amber-400 outline-none w-1/2 font-mono" />
                      </div>
                    )}

                    {modalType === "branch" && (
                      <>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="flex flex-col gap-2"><label className="text-xs font-bold text-gray-600 dark:text-gray-400">تلفن شعبه</label><input type="text" dir="ltr" value={tempFormData.phone || ""} onChange={e => setTempFormData({...tempFormData, phone: e.target.value})} className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-sm focus:border-amber-400 outline-none font-mono" /></div>
                          <div className="flex flex-col gap-2"><label className="text-xs font-bold text-gray-600 dark:text-gray-400">ایمیل شعبه</label><input type="email" dir="ltr" value={tempFormData.email || ""} onChange={e => setTempFormData({...tempFormData, email: e.target.value})} className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-sm focus:border-amber-400 outline-none font-mono" /></div>
                          <div className="flex flex-col gap-2"><label className="text-xs font-bold text-gray-600 dark:text-gray-400">واتس‌اپ شعبه</label><input type="text" dir="ltr" value={tempFormData.wa || ""} onChange={e => setTempFormData({...tempFormData, wa: e.target.value})} className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-sm focus:border-amber-400 outline-none font-mono" /></div>
                          <div className="flex flex-col gap-2"><label className="text-xs font-bold text-gray-600 dark:text-gray-400">آیدی تلگرام شعبه</label><input type="text" dir="ltr" value={tempFormData.tg || ""} onChange={e => setTempFormData({...tempFormData, tg: e.target.value})} className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-sm focus:border-amber-400 outline-none font-mono" /></div>
                          <div className="flex flex-col gap-2 col-span-full"><label className="text-xs font-bold text-gray-600 dark:text-gray-400">لینک گوگل مپ</label><input type="url" dir="ltr" value={tempFormData.mapUrl || ""} onChange={e => setTempFormData({...tempFormData, mapUrl: e.target.value})} className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-sm focus:border-amber-400 outline-none font-mono" /></div>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="flex flex-col gap-2">
                            <label className="text-xs font-bold text-gray-600 dark:text-gray-400">آدرس شعبه (فارسی)</label>
                            <textarea rows={2} value={tempFormData.faAddress || ""} onChange={e => setTempFormData({...tempFormData, faAddress: e.target.value})} className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-sm focus:border-amber-400 outline-none resize-none"></textarea>
                          </div>
                          <div className="flex flex-col gap-2">
                            <label className="text-xs font-bold text-gray-600 dark:text-gray-400">Branch Address (English)</label>
                            <div className="relative h-full">
                              <textarea rows={2} dir="ltr" value={tempFormData.enAddress || ""} onChange={e => setTempFormData({...tempFormData, enAddress: e.target.value})} className="w-full h-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl py-3 pr-4 pl-12 text-sm focus:border-amber-400 outline-none resize-none font-mono"></textarea>
                              <button type="button" onClick={() => handleTranslate(tempFormData.faAddress, "enAddress", setTempFormData)} disabled={translatingField === "enAddress"} className="absolute left-2 top-2 p-1.5 bg-white dark:bg-gray-700 text-amber-500 hover:bg-amber-400 hover:text-gray-950 disabled:opacity-50 rounded-lg transition-colors">
                                {translatingField === "enAddress" ? <Loader2 size={16} className="animate-spin"/> : <Wand2 size={16}/>}
                              </button>
                            </div>
                          </div>
                        </div>
                      </>
                    )}

                    {modalType === "partner" && (
                      <div className="flex flex-col gap-2">
                        <label className="text-xs font-bold text-gray-600 dark:text-gray-400">لینک وب‌سایت شریک تجاری</label>
                        <input type="url" dir="ltr" value={tempFormData.url || ""} onChange={e => setTempFormData({...tempFormData, url: e.target.value})} className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-sm focus:border-amber-400 outline-none font-mono" placeholder="https://..." />
                      </div>
                    )}

                    {(modalType === "partner" || modalType === "cert") && (
                      <div className="flex flex-col gap-2">
                        <label className="text-xs font-bold text-gray-600 dark:text-gray-400">آپلود تصویر (Logo / Certificate)</label>
                        <label className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-2xl h-32 flex flex-col items-center justify-center gap-3 bg-gray-50 hover:bg-gray-100 dark:bg-gray-800/50 cursor-pointer transition-colors group">
                          <input type="file" accept="image/png, image/jpeg" className="hidden" onChange={(e) => { if(e.target.files && e.target.files[0]) alert(`تصویر ${e.target.files[0].name} آماده آپلود است.`); }} />
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
                    <CheckCircle2 size={18}/> ثبت نهایی
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