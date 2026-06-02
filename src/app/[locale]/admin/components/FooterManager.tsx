"use client";

import React, { useState, useEffect } from "react";
import { CheckCircle2, Wand2, Loader2, PanelBottom, Share2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { getSiteContent, saveSiteContent } from "@/actions/siteContent";

export default function FooterManager() {
  const [formData, setFormData] = useState({
    faAbout: "", 
    enAbout: "",
    faCopyright: "", 
    enCopyright: "",
    instagram: "",
    whatsapp: "",
    linkedin: "",
    facebook: ""
  });

  const [activeTab, setActiveTab] = useState("texts");
  const [translatingField, setTranslatingField] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // کلید اختصاصی این بخش در دیتابیس
  const SECTION_KEY = "footer_settings";

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      const res = await getSiteContent(SECTION_KEY);
      if (res.success && res.data) {
        setFormData(res.data);
      }
      setIsLoading(false);
    };
    fetchData();
  }, []);

  const handleAutoTranslate = async (sourceText: string, targetKey: string) => {
    if (!sourceText.trim()) return;
    setTranslatingField(targetKey);
    try {
      const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=fa&tl=en&dt=t&q=${encodeURIComponent(sourceText)}`;
      const res = await fetch(url);
      const data = await res.json();
      const translatedText = data[0].map((item: any) => item[0]).join('');
      setFormData(prev => ({ ...prev, [targetKey]: translatedText }));
    } catch (error) {
      alert("خطا در سیستم ترجمه خودکار.");
    } finally {
      setTranslatingField(null);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    const res = await saveSiteContent(SECTION_KEY, formData);
    setIsSaving(false);
    
    if (res.success) {
      alert("تنظیمات فوتر با موفقیت ذخیره شد.");
    } else {
      alert(res.error || "خطا در ذخیره اطلاعات");
    }
  };

  if (isLoading) {
    return <div className="flex justify-center py-20"><Loader2 className="animate-spin text-amber-500" size={40} /></div>;
  }

  return (
    <div className="flex flex-col gap-6 max-w-5xl mx-auto w-full">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white dark:bg-gray-900 p-6 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm">
        <div>
          <h2 className="text-xl font-black text-gray-900 dark:text-white flex items-center gap-3">
            <PanelBottom className="text-amber-500" />
            تنظیمات فوتر (پانویس سایت)
          </h2>
          <p className="text-sm text-gray-500 mt-2 font-medium">مدیریت متن درباره ما در فوتر، کپی‌رایت و لینک شبکه‌های اجتماعی</p>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-3xl overflow-hidden shadow-sm flex flex-col">
        <div className="flex border-b border-gray-100 dark:border-gray-800 px-6 pt-4 gap-6 bg-gray-50/50 dark:bg-gray-900/50">
          <button 
            onClick={() => setActiveTab("texts")} 
            className={`pb-3 text-sm font-bold border-b-2 transition-colors flex items-center gap-2 ${activeTab === "texts" ? "border-amber-400 text-amber-500" : "border-transparent text-gray-500 hover:text-gray-900 dark:hover:text-gray-300"}`}
          >
            <PanelBottom size={16} /> متون و کپی‌رایت
          </button>
          <button 
            onClick={() => setActiveTab("social")} 
            className={`pb-3 text-sm font-bold border-b-2 transition-colors flex items-center gap-2 ${activeTab === "social" ? "border-amber-400 text-amber-500" : "border-transparent text-gray-500 hover:text-gray-900 dark:hover:text-gray-300"}`}
          >
            <Share2 size={16} /> شبکه‌های اجتماعی
          </button>
        </div>

        <form onSubmit={handleSave} className="p-6 md:p-8 flex flex-col gap-8">
          <AnimatePresence mode="wait">
            {activeTab === "texts" && (
              <motion.div key="texts" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="flex flex-col gap-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-bold text-gray-600 dark:text-gray-400">درباره ما (خلاصه در فوتر - فارسی)</label>
                    <textarea 
                      rows={4} 
                      value={formData.faAbout} 
                      onChange={e => setFormData({...formData, faAbout: e.target.value})} 
                      className="bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl p-4 text-sm font-bold focus:outline-none focus:border-amber-400 resize-none leading-relaxed" 
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-bold text-gray-600 dark:text-gray-400">About Us (Footer Summary - English)</label>
                    <div className="relative h-full">
                      <textarea 
                        rows={4} 
                        dir="ltr" 
                        value={formData.enAbout} 
                        onChange={e => setFormData({...formData, enAbout: e.target.value})} 
                        className="w-full h-full bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl py-4 pr-4 pl-12 text-sm font-mono focus:outline-none focus:border-amber-400 resize-none leading-relaxed" 
                      />
                      <button 
                        type="button" 
                        onClick={() => handleAutoTranslate(formData.faAbout, 'enAbout')} 
                        disabled={translatingField === 'enAbout' || !formData.faAbout} 
                        className="absolute left-2 top-3 p-2 bg-amber-400/10 text-amber-600 hover:bg-amber-400 hover:text-gray-950 disabled:opacity-50 rounded-lg transition-colors"
                      >
                        {translatingField === 'enAbout' ? <Loader2 size={16} className="animate-spin" /> : <Wand2 size={16} />}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-6 border-t border-gray-100 dark:border-gray-800">
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-bold text-gray-600 dark:text-gray-400">متن کپی‌رایت (فارسی)</label>
                    <input 
                      type="text" 
                      value={formData.faCopyright} 
                      onChange={e => setFormData({...formData, faCopyright: e.target.value})} 
                      className="bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-sm font-bold focus:outline-none focus:border-amber-400" 
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-bold text-gray-600 dark:text-gray-400">Copyright Text (English)</label>
                    <div className="relative">
                      <input 
                        type="text" 
                        dir="ltr" 
                        value={formData.enCopyright} 
                        onChange={e => setFormData({...formData, enCopyright: e.target.value})} 
                        className="w-full bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl py-3 pr-4 pl-12 text-sm font-mono focus:outline-none focus:border-amber-400" 
                      />
                      <button 
                        type="button" 
                        onClick={() => handleAutoTranslate(formData.faCopyright, 'enCopyright')} 
                        disabled={translatingField === 'enCopyright' || !formData.faCopyright} 
                        className="absolute left-2 top-1/2 -translate-y-1/2 p-1.5 bg-amber-400/10 text-amber-600 hover:bg-amber-400 hover:text-gray-950 disabled:opacity-50 rounded-lg transition-colors"
                      >
                        {translatingField === 'enCopyright' ? <Loader2 size={14} className="animate-spin" /> : <Wand2 size={14} />}
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === "social" && (
              <motion.div key="social" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-bold text-gray-600 dark:text-gray-400">لینک اینستاگرام (Instagram)</label>
                  <input type="url" dir="ltr" value={formData.instagram} onChange={e => setFormData({...formData, instagram: e.target.value})} placeholder="https://instagram.com/..." className="bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-sm font-mono focus:outline-none focus:border-amber-400" />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-bold text-gray-600 dark:text-gray-400">لینک واتساپ (WhatsApp)</label>
                  <input type="url" dir="ltr" value={formData.whatsapp} onChange={e => setFormData({...formData, whatsapp: e.target.value})} placeholder="https://wa.me/..." className="bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-sm font-mono focus:outline-none focus:border-amber-400" />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-bold text-gray-600 dark:text-gray-400">لینک لینکدین (LinkedIn)</label>
                  <input type="url" dir="ltr" value={formData.linkedin} onChange={e => setFormData({...formData, linkedin: e.target.value})} placeholder="https://linkedin.com/in/..." className="bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-sm font-mono focus:outline-none focus:border-amber-400" />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-bold text-gray-600 dark:text-gray-400">لینک فیسبوک (Facebook)</label>
                  <input type="url" dir="ltr" value={formData.facebook} onChange={e => setFormData({...formData, facebook: e.target.value})} placeholder="https://facebook.com/..." className="bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-sm font-mono focus:outline-none focus:border-amber-400" />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="flex justify-end border-t border-gray-100 dark:border-gray-800 pt-6 mt-2">
            <button type="submit" disabled={isSaving} className="bg-amber-400 hover:bg-amber-500 text-gray-950 px-8 py-3 rounded-xl font-bold flex items-center gap-2 shadow-lg transition-transform hover:scale-105 active:scale-95 disabled:opacity-50">
              {isSaving ? <Loader2 size={20} className="animate-spin" /> : <CheckCircle2 size={20} />}
              <span>{isSaving ? "در حال ذخیره..." : "ذخیره تنظیمات فوتر"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}