"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Save, Settings, Image as ImageIcon, Search, Loader2, UploadCloud, CheckCircle2 } from "lucide-react";
import { getSettings, saveSettings } from "@/actions/settings";

export default function GeneralSettings() {
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  const [isUploadingLogo, setIsUploadingLogo] = useState(false);
  const [isUploadingFavicon, setIsUploadingFavicon] = useState(false);

  const [formData, setFormData] = useState({
    site_title: "",
    site_description: "",
    site_logo: "",
    site_favicon: ""
  });

  const logoInputRef = useRef<HTMLInputElement>(null);
  const faviconInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    async function loadSettings() {
      const response = await getSettings(["site_title", "site_description", "site_logo", "site_favicon"]);
      if (response.success && response.data) {
        setFormData(prev => ({ ...prev, ...response.data }));
      }
      setIsLoading(false);
    }
    loadSettings();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, field: 'site_logo' | 'site_favicon') => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (field === 'site_logo') setIsUploadingLogo(true);
    else setIsUploadingFavicon(true);

    // حذف فیزیکی عکس قبلی از هاست در صورت وجود
    if (formData[field]) {
      await fetch('/api/upload', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fileUrl: formData[field] })
      }).catch(err => console.error(err));
    }

    const uploadData = new FormData();
    uploadData.append('file', file);

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: uploadData
      });
      
      const data = await res.json();

      if (data.success) {
        setFormData(prev => ({ ...prev, [field]: data.url }));
        setMessage({ type: "success", text: "عکس با موفقیت آپلود شد. برای ثبت نهایی روی ذخیره کلیک کنید." });
      } else {
        setMessage({ type: "error", text: data.error || "خطا در آپلود عکس." });
      }
    } catch (err) {
      setMessage({ type: "error", text: "خطا در ارتباط با سرور آپلود." });
    } finally {
      if (field === 'site_logo') setIsUploadingLogo(false);
      else setIsUploadingFavicon(false);
      
      setTimeout(() => setMessage({ type: "", text: "" }), 4000);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setMessage({ type: "", text: "" });

    const response = await saveSettings(formData);
    
    if (response.success) {
      setMessage({ type: "success", text: "تنظیمات با موفقیت در دیتابیس ذخیره شد!" });
    } else {
      setMessage({ type: "error", text: "خطا در ذخیره اطلاعات." });
    }
    setIsSaving(false);
    
    setTimeout(() => setMessage({ type: "", text: "" }), 4000);
  };

  if (isLoading) return <div className="flex justify-center items-center h-64"><Loader2 className="animate-spin text-amber-500" size={32} /></div>;

  return (
    <div className="w-full">
      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* کارت تنظیمات سئو */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 shadow-sm">
          <h2 className="flex items-center gap-2 text-lg font-bold text-zinc-800 dark:text-zinc-200 mb-6 border-b border-zinc-100 dark:border-zinc-800 pb-4">
            <Search className="text-amber-500" size={20} /> اطلاعات پایه و سئو
          </h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-zinc-700 dark:text-zinc-300 mb-2">نام سایت (Title)</label>
              <input 
                type="text" name="site_title" value={formData.site_title} onChange={handleChange}
                placeholder="مثال: جزیره گندم | Jazirah Gandum"
                className="w-full px-4 py-3 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl focus:ring-2 focus:ring-amber-500 outline-none transition-all text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-zinc-700 dark:text-zinc-300 mb-2">توضیحات سایت (Meta Description)</label>
              <textarea 
                name="site_description" value={formData.site_description} onChange={handleChange} rows={3}
                placeholder="این متن در نتایج جستجوی گوگل زیر نام سایت نمایش داده می‌شود..."
                className="w-full px-4 py-3 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl focus:ring-2 focus:ring-amber-500 outline-none transition-all text-sm resize-none custom-scrollbar"
              />
            </div>
          </div>
        </motion.div>

        {/* کارت تنظیمات هویت بصری */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 shadow-sm">
          <h2 className="flex items-center gap-2 text-lg font-bold text-zinc-800 dark:text-zinc-200 mb-6 border-b border-zinc-100 dark:border-zinc-800 pb-4">
            <ImageIcon className="text-amber-500" size={20} /> مدیریت لوگو و آیکون
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* آپلودر لوگو */}
            <div className="bg-zinc-50 dark:bg-zinc-950/50 p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 border-dashed text-center">
              <label className="block text-sm font-bold text-zinc-700 dark:text-zinc-300 mb-4">لوگوی اصلی سایت</label>
              
              {formData.site_logo ? (
                <div className="relative group mx-auto w-32 h-32 bg-white dark:bg-zinc-900 rounded-2xl p-4 shadow-sm border border-zinc-200 dark:border-zinc-800 flex items-center justify-center mb-4 overflow-hidden">
                  <img src={formData.site_logo} alt="Site Logo" className="max-w-full max-h-full object-contain" />
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <button type="button" onClick={() => logoInputRef.current?.click()} className="text-white text-xs font-bold px-3 py-1.5 bg-zinc-800 rounded-lg">تغییر لوگو</button>
                  </div>
                </div>
              ) : (
                <div 
                  onClick={() => logoInputRef.current?.click()} 
                  className="mx-auto w-32 h-32 bg-white dark:bg-zinc-900 rounded-2xl flex flex-col items-center justify-center border border-zinc-200 dark:border-zinc-800 mb-4 cursor-pointer hover:border-amber-500 transition-colors"
                >
                  <UploadCloud className="text-zinc-400 mb-2" size={32} />
                  <span className="text-xs text-zinc-500 font-bold">انتخاب تصویر</span>
                </div>
              )}
              
              <input 
                type="file" ref={logoInputRef} className="hidden" accept="image/*"
                onChange={(e) => handleFileUpload(e, 'site_logo')}
              />
              
              <button 
                type="button" onClick={() => logoInputRef.current?.click()} disabled={isUploadingLogo}
                className="inline-flex items-center justify-center gap-2 w-full py-2.5 bg-zinc-200 dark:bg-zinc-800 hover:bg-zinc-300 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 rounded-xl text-sm font-bold transition-colors disabled:opacity-50"
              >
                {isUploadingLogo ? <Loader2 className="animate-spin" size={16} /> : <UploadCloud size={16} />}
                {isUploadingLogo ? "در حال آپلود..." : "آپلود لوگوی جدید"}
              </button>
            </div>

            {/* آپلودر فاوآیکون */}
            <div className="bg-zinc-50 dark:bg-zinc-950/50 p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 border-dashed text-center">
              <label className="block text-sm font-bold text-zinc-700 dark:text-zinc-300 mb-4">آیکون مرورگر (Favicon)</label>
              
              {formData.site_favicon ? (
                <div className="relative group mx-auto w-20 h-20 bg-white dark:bg-zinc-900 rounded-2xl p-3 shadow-sm border border-zinc-200 dark:border-zinc-800 flex items-center justify-center mb-4 overflow-hidden">
                  <img src={formData.site_favicon} alt="Favicon" className="max-w-full max-h-full object-contain" />
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <button type="button" onClick={() => faviconInputRef.current?.click()} className="text-white text-[10px] font-bold px-2 py-1 bg-zinc-800 rounded-md">تغییر</button>
                  </div>
                </div>
              ) : (
                <div 
                  onClick={() => faviconInputRef.current?.click()} 
                  className="mx-auto w-20 h-20 bg-white dark:bg-zinc-900 rounded-2xl flex flex-col items-center justify-center border border-zinc-200 dark:border-zinc-800 mb-4 cursor-pointer hover:border-amber-500 transition-colors"
                >
                  <ImageIcon className="text-zinc-400" size={24} />
                </div>
              )}
              
              <input 
                type="file" ref={faviconInputRef} className="hidden" accept=".ico,.png,.jpg,.jpeg"
                onChange={(e) => handleFileUpload(e, 'site_favicon')}
              />
              
              <button 
                type="button" onClick={() => faviconInputRef.current?.click()} disabled={isUploadingFavicon}
                className="inline-flex items-center justify-center gap-2 w-full py-2.5 bg-zinc-200 dark:bg-zinc-800 hover:bg-zinc-300 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 rounded-xl text-sm font-bold transition-colors disabled:opacity-50"
              >
                {isUploadingFavicon ? <Loader2 className="animate-spin" size={16} /> : <UploadCloud size={16} />}
                {isUploadingFavicon ? "در حال آپلود..." : "آپلود فاوآیکون جدید"}
              </button>
              <p className="mt-3 text-[10px] text-zinc-500 dark:text-zinc-400">پیشنهاد می‌شود یک تصویر مربعی کوچک (مثلاً 64x64) آپلود کنید.</p>
            </div>
          </div>
        </motion.div>

        {/* دکمه ذخیره و پیام وضعیت */}
        <div className="flex flex-col-reverse sm:flex-row items-center justify-between gap-4 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-4 rounded-2xl">
          <div className="text-sm font-bold flex-1 text-center sm:text-right">
            {message.type === "success" && <span className="flex items-center justify-center sm:justify-start gap-1 text-green-600 dark:text-green-400"><CheckCircle2 size={16} /> {message.text}</span>}
            {message.type === "error" && <span className="text-red-600 dark:text-red-400">{message.text}</span>}
          </div>
          <button 
            type="submit" disabled={isSaving}
            className="flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-400 text-zinc-900 px-8 py-3 w-full sm:w-auto rounded-xl font-bold transition-all disabled:opacity-50"
          >
            {isSaving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
            {isSaving ? "در حال ذخیره..." : "ذخیره تنظیمات در دیتابیس"}
          </button>
        </div>

      </form>
    </div>
  );
}