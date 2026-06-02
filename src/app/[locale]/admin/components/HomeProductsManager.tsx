"use client";

import React, { useState } from "react";
import { CheckCircle2, Wand2, Loader2, LayoutTemplate, Settings2 } from "lucide-react";
import { motion } from "framer-motion";

export default function HomeProductsManager() {
  const [formData, setFormData] = useState({
    faSubtitle: "محصولات ما", enSubtitle: "Our Products",
    faTitle: "محبوب‌ترین محصولات جزیره", enTitle: "Most Popular Island Products",
    displayType: "featured", // featured | latest | category
    maxItems: "8",
  });

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
    alert("تنظیمات سکشن محصولات صفحه اصلی ذخیره شد!");
  };

  return (
    <div className="flex flex-col gap-6">
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900 dark:text-white flex items-center gap-3">
            <LayoutTemplate className="text-amber-500" size={28} />
            سکشن محصولات صفحه اصلی
          </h1>
          <p className="text-xs text-gray-500 mt-1 font-medium">مدیریت تیترها و نحوه نمایش محصولات در صفحه اصلی سایت</p>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-3xl p-6 shadow-sm">
        <form onSubmit={handleSubmit} className="flex flex-col gap-8">
          
          {/* بخش متون */}
          <div className="flex flex-col gap-4">
            <h3 className="text-sm font-black text-gray-800 dark:text-gray-200 border-b border-gray-100 dark:border-gray-800 pb-2">۱. تیتر و متون سکشن</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-gray-600 dark:text-gray-400">زیرتیتر (فارسی)</label>
                <input type="text" value={formData.faSubtitle} onChange={e => setFormData({...formData, faSubtitle: e.target.value})} className="bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-amber-400" />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-gray-600 dark:text-gray-400">Subtitle (English)</label>
                <div className="relative">
                  <input type="text" dir="ltr" value={formData.enSubtitle} onChange={e => setFormData({...formData, enSubtitle: e.target.value})} className="w-full bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl py-3 pr-4 pl-12 text-sm font-mono focus:outline-none focus:border-amber-400" />
                  <button type="button" onClick={() => handleAutoTranslate(formData.faSubtitle, 'enSubtitle')} disabled={translatingField === 'enSubtitle'} className="absolute left-2 top-1/2 -translate-y-1/2 p-2 bg-amber-400/10 text-amber-600 hover:bg-amber-400 hover:text-gray-950 disabled:opacity-50 rounded-lg transition-colors">
                    {translatingField === 'enSubtitle' ? <Loader2 size={16} className="animate-spin" /> : <Wand2 size={16} />}
                  </button>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-gray-600 dark:text-gray-400">تیتر اصلی (فارسی)</label>
                <input type="text" value={formData.faTitle} onChange={e => setFormData({...formData, faTitle: e.target.value})} className="bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-amber-400" />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-gray-600 dark:text-gray-400">Main Title (English)</label>
                <div className="relative">
                  <input type="text" dir="ltr" value={formData.enTitle} onChange={e => setFormData({...formData, enTitle: e.target.value})} className="w-full bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl py-3 pr-4 pl-12 text-sm font-mono focus:outline-none focus:border-amber-400" />
                  <button type="button" onClick={() => handleAutoTranslate(formData.faTitle, 'enTitle')} disabled={translatingField === 'enTitle'} className="absolute left-2 top-1/2 -translate-y-1/2 p-2 bg-amber-400/10 text-amber-600 hover:bg-amber-400 hover:text-gray-950 disabled:opacity-50 rounded-lg transition-colors">
                    {translatingField === 'enTitle' ? <Loader2 size={16} className="animate-spin" /> : <Wand2 size={16} />}
                  </button>
                </div>
              </div>

            </div>
          </div>

          {/* بخش تنظیمات نمایش */}
          <div className="flex flex-col gap-4">
            <h3 className="text-sm font-black text-gray-800 dark:text-gray-200 border-b border-gray-100 dark:border-gray-800 pb-2 flex items-center gap-2">
              <Settings2 size={18} className="text-gray-400" /> ۲. تنظیمات نمایش
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-gray-600 dark:text-gray-400">چه محصولاتی در صفحه اصلی نمایش داده شود؟</label>
                <select value={formData.displayType} onChange={e => setFormData({...formData, displayType: e.target.value})} className="bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-amber-400 font-bold">
                  <option value="featured">فقط محصولات ویژه (تیک خورده در لیست)</option>
                  <option value="latest">جدیدترین محصولات اضافه شده</option>
                </select>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-gray-600 dark:text-gray-400">تعداد نمایش در سکشن</label>
                <select value={formData.maxItems} onChange={e => setFormData({...formData, maxItems: e.target.value})} className="bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-amber-400">
                  <option value="4">۴ محصول (یک ردیف)</option>
                  <option value="8">۸ محصول (دو ردیف)</option>
                  <option value="12">۱۲ محصول (سه ردیف)</option>
                </select>
              </div>

            </div>
          </div>

          <div className="flex justify-end border-t border-gray-100 dark:border-gray-800 pt-4 mt-2">
            <button type="submit" className="bg-amber-400 hover:bg-amber-500 text-gray-950 px-8 py-3 rounded-xl font-bold flex items-center gap-2 transition-all shadow-lg shadow-amber-400/20 hover:scale-105 active:scale-95 text-sm">
              <CheckCircle2 size={18} />
              <span>ذخیره تنظیمات صفحه اصلی</span>
            </button>
          </div>

        </form>
      </div>

    </div>
  );
}