"use client";

import React, { useState } from "react";
import { CheckCircle2, Wand2, Loader2, PanelBottom, Share2 } from "lucide-react";
import { motion } from "framer-motion";

export default function FooterManager() {
  const [formData, setFormData] = useState({
    faAbout: "جزیره گندم، پیشرو در تولید و توزیع برترین نوشیدنی‌ها و تنقلات در سطح منطقه با کیفیت جهانی.", 
    enAbout: "Jazireh Gandom, a leader in producing and distributing the best beverages and snacks regionally with global quality.",
    faCopyright: "تمامی حقوق برای شرکت جزیره گندم محفوظ است.", 
    enCopyright: "All rights reserved by Jazireh Gandom Co.",
    instagram: "https://instagram.com/jazireh",
    whatsapp: "https://wa.me/989123456789",
    linkedin: "",
    facebook: ""
  });

  const [activeTab, setActiveTab] = useState("texts");
  const [translatingField, setTranslatingField] = useState<string | null>(null);

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
      console.error("Translation Error:", error);
      alert("خطا در سیستم ترجمه.");
    } finally {
      setTranslatingField(null);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert("تنظیمات فوتر با موفقیت ذخیره شد!");
  };

  return (
    <div className="flex flex-col gap-6">
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900 dark:text-white flex items-center gap-3">
            <PanelBottom className="text-amber-500" size={28} />
            تنظیمات فوتر (پاورقی سایت)
          </h1>
          <p className="text-xs text-gray-500 mt-1 font-medium">مدیریت متن درباره ما، کپی‌رایت و لینک‌های شبکه‌های اجتماعی پایین سایت</p>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-3xl overflow-hidden shadow-sm flex flex-col">
        
        <div className="flex border-b border-gray-100 dark:border-gray-800 px-6 pt-4 gap-6 bg-gray-50/50 dark:bg-gray-900 overflow-x-auto">
          <button onClick={() => setActiveTab("texts")} className={`pb-3 text-sm font-bold border-b-2 transition-colors whitespace-nowrap ${activeTab === "texts" ? "border-amber-400 text-amber-500" : "border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"}`}>
            متون و کپی‌رایت
          </button>
          <button onClick={() => setActiveTab("socials")} className={`pb-3 text-sm font-bold border-b-2 transition-colors whitespace-nowrap ${activeTab === "socials" ? "border-amber-400 text-amber-500" : "border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"}`}>
            شبکه‌های اجتماعی
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-8">
          
          {activeTab === "texts" && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col gap-6">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-bold text-gray-600 dark:text-gray-400">توضیح کوتاه درباره شرکت در فوتر (فارسی)</label>
                  <textarea rows={4} value={formData.faAbout} onChange={e => setFormData({...formData, faAbout: e.target.value})} className="bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-amber-400 resize-none"></textarea>
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-bold text-gray-600 dark:text-gray-400">Footer About Text (English)</label>
                  <div className="relative h-full">
                    <textarea rows={4} dir="ltr" value={formData.enAbout} onChange={e => setFormData({...formData, enAbout: e.target.value})} className="w-full h-full bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl py-3 pr-4 pl-12 text-sm font-mono focus:outline-none focus:border-amber-400 resize-none"></textarea>
                    <button type="button" onClick={() => handleAutoTranslate(formData.faAbout, 'enAbout')} disabled={translatingField === 'enAbout'} className="absolute left-2 top-3 p-2 bg-amber-400/10 text-amber-600 hover:bg-amber-400 hover:text-gray-950 disabled:opacity-50 rounded-lg transition-colors">
                      {translatingField === 'enAbout' ? <Loader2 size={16} className="animate-spin" /> : <Wand2 size={16} />}
                    </button>
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-xs font-bold text-gray-600 dark:text-gray-400">متن حق کپی‌رایت (فارسی)</label>
                  <input type="text" value={formData.faCopyright} onChange={e => setFormData({...formData, faCopyright: e.target.value})} className="bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-amber-400" />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-bold text-gray-600 dark:text-gray-400">Copyright Text (English)</label>
                  <div className="relative">
                    <input type="text" dir="ltr" value={formData.enCopyright} onChange={e => setFormData({...formData, enCopyright: e.target.value})} className="w-full bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl py-3 pr-4 pl-12 text-sm font-mono focus:outline-none focus:border-amber-400" />
                    <button type="button" onClick={() => handleAutoTranslate(formData.faCopyright, 'enCopyright')} disabled={translatingField === 'enCopyright'} className="absolute left-2 top-1/2 -translate-y-1/2 p-2 bg-amber-400/10 text-amber-600 hover:bg-amber-400 hover:text-gray-950 disabled:opacity-50 rounded-lg transition-colors">
                      {translatingField === 'enCopyright' ? <Loader2 size={16} className="animate-spin" /> : <Wand2 size={16} />}
                    </button>
                  </div>
                </div>
              </div>

            </motion.div>
          )}

          {activeTab === "socials" && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col gap-6">
              
              <div className="bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-800/50 rounded-xl p-4 flex items-center gap-3">
                <Share2 className="text-blue-500 shrink-0" size={20} />
                <p className="text-xs text-blue-700 dark:text-blue-400 font-bold leading-relaxed">
                  لینک شبکه‌های اجتماعی خود را وارد کنید. اگر فیلدی را خالی بگذارید، آیکون آن شبکه در فوتر سایت نمایش داده نخواهد شد.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-bold text-gray-600 dark:text-gray-400">لینک اینستاگرام (Instagram)</label>
                  <input type="url" dir="ltr" value={formData.instagram} onChange={e => setFormData({...formData, instagram: e.target.value})} placeholder="https://instagram.com/..." className="bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-sm font-mono focus:outline-none focus:border-amber-400" />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-bold text-gray-600 dark:text-gray-400">لینک واتس‌اپ (WhatsApp)</label>
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
              </div>

            </motion.div>
          )}

          <div className="flex justify-end border-t border-gray-100 dark:border-gray-800 pt-4 mt-2">
            <button type="submit" className="bg-amber-400 hover:bg-amber-500 text-gray-950 px-8 py-3 rounded-xl font-bold flex items-center gap-2 transition-all shadow-lg shadow-amber-400/20 hover:scale-105 active:scale-95 text-sm">
              <CheckCircle2 size={18} />
              <span>ذخیره تنظیمات فوتر</span>
            </button>
          </div>

        </form>
      </div>

    </div>
  );
}