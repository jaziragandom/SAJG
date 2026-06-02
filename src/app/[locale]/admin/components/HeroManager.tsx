"use client";

import React, { useState, useEffect } from "react";
import { 
  Plus, Edit3, Trash2, GripVertical, X, Upload, 
  CheckCircle2, Wand2, Loader2, Image as ImageIcon, 
  Sparkles, RefreshCcw 
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { getHeroSlides, saveHeroSlides } from "@/actions/hero";

export default function HeroManager() {
  const [slides, setSlides] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("texts");
  const [editMode, setEditMode] = useState(false);
  
  const [formData, setFormData] = useState({ 
    id: 0, 
    faTitle: "", enTitle: "", 
    faSubtitle: "", enSubtitle: "", 
    faDesc: "", enDesc: "",
    color: "from-amber-400 to-orange-600",
    mainImage: "", leftImage: "", rightImage: ""
  });

  // استیت‌های مربوط به آپلود هوشمند قطعات معلق (Floaters)
  const [uploadedFloaters, setUploadedFloaters] = useState<any[]>([]);
  const [isProcessingFloaters, setIsProcessingFloaters] = useState(false);
  const [draggedItemIndex, setDraggedItemIndex] = useState<number | null>(null);
  const [translatingField, setTranslatingField] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState<{ [key: string]: boolean }>({});

  const fetchData = async () => {
    setIsLoading(true);
    const res = await getHeroSlides();
    if (res.success) setSlides(res.data);
    setIsLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  // توابع آپلود واقعی تصاویر روی سرور
  const handleFileUpload = async (file: File) => {
    const data = new FormData();
    data.append("file", file);
    try {
      const res = await fetch("/api/upload", { method: "POST", body: data });
      const result = await res.json();
      return result.success ? result.url : null;
    } catch (err) {
      return null;
    }
  };

  const handleSingleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, field: string) => {
    if (!e.target.files?.[0]) return;
    setIsUploading({ ...isUploading, [field]: true });
    const url = await handleFileUpload(e.target.files[0]);
    if (url) setFormData(prev => ({ ...prev, [field]: url }));
    setIsUploading({ ...isUploading, [field]: false });
  };

  const handleDelete = async (id: number) => {
    if(confirm("آیا از حذف این اسلاید اطمینان دارید؟")) {
      const newSlides = slides.filter(s => s.id !== id);
      setSlides(newSlides);
      await saveHeroSlides(newSlides);
    }
  };

  const handleEdit = (slide: any) => {
    setEditMode(true);
    setFormData({ 
      ...formData, 
      id: slide.id, 
      faTitle: slide.faTitle || "", 
      enTitle: slide.enTitle || "", 
      faSubtitle: slide.faSubtitle || "", 
      enSubtitle: slide.enSubtitle || "", 
      faDesc: slide.faDesc || "", 
      enDesc: slide.enDesc || "", 
      color: slide.color || "from-amber-400 to-orange-600",
      mainImage: slide.mainImage || "", 
      leftImage: slide.leftImage || "", 
      rightImage: slide.rightImage || ""
    });
    setUploadedFloaters(slide.floaters || []);
    setActiveTab("texts");
    setIsModalOpen(true);
  };

  const handleAddNew = () => {
    setEditMode(false);
    setFormData({ 
      id: 0, 
      faTitle: "", enTitle: "", 
      faSubtitle: "", enSubtitle: "", 
      faDesc: "", enDesc: "", 
      color: "from-amber-400 to-orange-600",
      mainImage: "", leftImage: "", rightImage: ""
    });
    setUploadedFloaters([]);
    setActiveTab("texts");
    setIsModalOpen(true);
  };

  const handleSaveSlide = async () => {
    if (!formData.faTitle || !formData.enTitle) {
      alert("پر کردن عنوان فارسی و انگلیسی الزامی است.");
      return;
    }

    const slideData = { ...formData, floaters: uploadedFloaters };
    let newSlides;
    
    if (editMode) {
      newSlides = slides.map(s => s.id === slideData.id ? slideData : s);
    } else {
      newSlides = [...slides, { ...slideData, id: Date.now() }];
    }

    setSlides(newSlides);
    await saveHeroSlides(newSlides);
    setIsModalOpen(false);
  };

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

  const handleDragStart = (index: number) => setDraggedItemIndex(index);

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedItemIndex === null || draggedItemIndex === index) return;
    const newSlides = [...slides];
    const draggedItem = newSlides[draggedItemIndex];
    newSlides.splice(draggedItemIndex, 1);
    newSlides.splice(index, 0, draggedItem);
    setDraggedItemIndex(index);
    setSlides(newSlides);
  };

  const handleDragEnd = async () => {
    setDraggedItemIndex(null);
    await saveHeroSlides(slides);
  };

  // --- الگوریتم هوشمند تکثیر و آپلود واقعی قطعات معلق ---
  const handleActualFloaterUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    setIsProcessingFloaters(true);
    const uploadedUrls: string[] = [];
    
    for (let i = 0; i < files.length; i++) {
      const url = await handleFileUpload(files[i]);
      if (url) uploadedUrls.push(url);
    }

    if (uploadedUrls.length > 0) {
      const blurs = ["blur-none", "blur-[2px]", "blur-[4px]", "blur-[6px]"];
      const opacities = ["opacity-100", "opacity-80", "opacity-60", "opacity-40"];
      const scales = ["scale-75", "scale-90", "scale-100", "scale-110", "scale-125"];

      const finalFloaters = [];
      for (let i = 0; i < 8; i++) {
        const baseUrl = uploadedUrls[i % uploadedUrls.length]; 
        finalFloaters.push({
          url: baseUrl,
          uniqueId: Date.now() + i,
          blur: blurs[Math.floor(Math.random() * blurs.length)],
          opacity: opacities[Math.floor(Math.random() * opacities.length)],
          scale: scales[Math.floor(Math.random() * scales.length)],
        });
      }
      setUploadedFloaters(finalFloaters);
    }
    setIsProcessingFloaters(false);
  };

  return (
    <div className="flex flex-col gap-6">
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900 dark:text-white">اسلایدر صفحه اصلی (Hero)</h1>
          <p className="text-xs text-gray-500 mt-1 font-medium">مدیریت لایه‌های متنی، تم‌های رنگی و تصاویرِ معلقِ اسلایدر</p>
        </div>
        
        <button 
          onClick={handleAddNew}
          className="bg-amber-400 hover:bg-amber-500 text-gray-950 px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 transition-colors shadow-lg shadow-amber-400/20"
        >
          <Plus size={18} />
          <span>افزودن اسلاید جدید</span>
        </button>
      </div>

      <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-6 shadow-sm min-h-100 flex flex-col">
        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="animate-spin text-amber-500" size={32} />
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {slides.map((slide, index) => (
              <div
                key={slide.id}
                draggable
                onDragStart={() => handleDragStart(index)}
                onDragOver={(e) => handleDragOver(e, index)}
                onDragEnd={handleDragEnd}
                className={`bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-2xl p-4 flex items-center gap-4 group shadow-sm transition-colors ${
                  draggedItemIndex === index ? 'opacity-50' : 'hover:border-amber-400'
                }`}
              >
                <div className="cursor-grab active:cursor-grabbing text-gray-300 hover:text-amber-500 transition-colors pl-2 border-l border-gray-200 dark:border-gray-700">
                  <GripVertical size={20} />
                </div>
                
                <div className={`w-14 h-14 rounded-xl bg-linear-to-br ${slide.color} shadow-inner flex items-center justify-center overflow-hidden relative`}>
                  {slide.mainImage ? (
                    <img src={slide.mainImage} className="w-full h-full object-cover opacity-80" alt="" />
                  ) : (
                    <ImageIcon size={20} className="text-white/80" />
                  )}
                </div>
                
                <div className="flex flex-col grow leading-tight pr-2">
                  <span className="text-sm font-bold text-gray-900 dark:text-gray-100">{slide.faTitle}</span>
                  <span className="text-xs font-mono text-gray-400 mt-0.5">{slide.enTitle}</span>
                </div>
                
                <div className="hidden md:flex flex-col text-left leading-tight px-4 border-r border-gray-200 dark:border-gray-700">
                  <span className="text-[11px] font-bold text-gray-500">{slide.faSubtitle}</span>
                </div>

                <div className="flex items-center gap-2 pl-2">
                  <button 
                    onClick={() => handleEdit(slide)} 
                    className="p-2 bg-white dark:bg-gray-900 text-gray-400 hover:text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-500/10 rounded-xl transition-colors" 
                    title="ویرایش"
                  >
                    <Edit3 size={18} />
                  </button>
                  <button 
                    onClick={() => handleDelete(slide.id)} 
                    className="p-2 bg-white dark:bg-gray-900 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-xl transition-colors" 
                    title="حذف"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            ))}
            
            {slides.length === 0 && (
              <div className="py-12 flex flex-col items-center justify-center border-2 border-dashed border-gray-200 dark:border-gray-800 rounded-2xl">
                <span className="text-sm text-gray-400 font-bold">هیچ اسلایدی یافت نشد!</span>
              </div>
            )}
          </div>
        )}
      </div>

      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-100 flex items-center justify-center p-4 sm:p-6">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} 
              className="absolute inset-0 bg-gray-950/60 backdrop-blur-sm"
              onClick={() => setIsModalOpen(false)}
            />
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-4xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-3xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden"
            >
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900">
                <h2 className="text-lg font-black text-gray-900 dark:text-white">
                  {editMode ? `ویرایش اسلاید` : "ساخت اسلاید جدید"}
                </h2>
                <button 
                  onClick={() => setIsModalOpen(false)} 
                  className="p-2 text-gray-400 hover:text-red-500 bg-gray-100 dark:bg-gray-800 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-full transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="flex border-b border-gray-100 dark:border-gray-800 px-6 pt-4 gap-6 bg-gray-50/50 dark:bg-gray-900 overflow-x-auto">
                {["texts", "images"].map((tab) => (
                  <button 
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`pb-3 text-sm font-bold border-b-2 transition-colors whitespace-nowrap ${
                      activeTab === tab 
                        ? "border-amber-400 text-amber-500" 
                        : "border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                    }`}
                  >
                    {tab === "texts" ? "محتوای متنی و رنگ" : "تصاویر و لایه‌های معلق"}
                  </button>
                ))}
              </div>

              <div className="p-6 overflow-y-auto grow custom-scrollbar">
                
                {activeTab === "texts" && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in duration-300">
                    
                    {/* فیلد زیرتیتر (Badge) */}
                    <div className="flex flex-col gap-2">
                      <label className="text-xs font-bold text-gray-600 dark:text-gray-400">زیرتیتر (بج بالای تیتر اصلی)</label>
                      <input 
                        type="text" 
                        value={formData.faSubtitle} 
                        onChange={e => setFormData({...formData, faSubtitle: e.target.value})} 
                        placeholder="مثال: جدیدترین محصول" 
                        className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-amber-400" 
                      />
                    </div>
    
                    <div className="flex flex-col gap-2">
                      <label className="text-xs font-bold text-gray-600 dark:text-gray-400">Subtitle (English)</label>
                      <div className="relative">
                        <input 
                          type="text" 
                          dir="ltr" 
                          value={formData.enSubtitle} 
                          onChange={e => setFormData({...formData, enSubtitle: e.target.value})} 
                          placeholder="New Arrival" 
                          className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl py-3 pr-4 pl-12 text-sm font-mono focus:outline-none focus:border-amber-400" 
                        />
                        <button 
                          type="button" 
                          onClick={() => handleAutoTranslate(formData.faSubtitle, 'enSubtitle')} 
                          disabled={translatingField === 'enSubtitle' || !formData.faSubtitle} 
                          className="absolute left-2 top-1/2 -translate-y-1/2 p-2 bg-amber-400/10 text-amber-600 hover:bg-amber-400 hover:text-gray-950 disabled:opacity-50 rounded-lg transition-colors"
                        >
                          {translatingField === 'enSubtitle' ? <Loader2 size={16} className="animate-spin" /> : <Wand2 size={16} />}
                        </button>
                      </div>
                    </div>

                    {/* فیلد تیتر اصلی */}
                    <div className="flex flex-col gap-2">
                      <label className="text-xs font-bold text-gray-600 dark:text-gray-400">تیتر اصلی و بزرگ</label>
                      <input 
                        type="text" 
                        value={formData.faTitle} 
                        onChange={e => setFormData({...formData, faTitle: e.target.value})} 
                        placeholder="مثال: انرژی بی‌نهایت" 
                        className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-amber-400" 
                      />
                    </div>
                    <div className="flex flex-col gap-2">
                      <label className="text-xs font-bold text-gray-600 dark:text-gray-400">Main Title (English)</label>
                      <div className="relative">
                        <input 
                          type="text" 
                          dir="ltr" 
                          value={formData.enTitle} 
                          onChange={e => setFormData({...formData, enTitle: e.target.value})} 
                          placeholder="Infinite Energy" 
                          className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl py-3 pr-4 pl-12 text-sm font-mono focus:outline-none focus:border-amber-400" 
                        />
                        <button 
                          type="button" 
                          onClick={() => handleAutoTranslate(formData.faTitle, 'enTitle')} 
                          disabled={translatingField === 'enTitle' || !formData.faTitle} 
                          className="absolute left-2 top-1/2 -translate-y-1/2 p-2 bg-amber-400/10 text-amber-600 hover:bg-amber-400 hover:text-gray-950 disabled:opacity-50 rounded-lg transition-colors"
                        >
                          {translatingField === 'enTitle' ? <Loader2 size={16} className="animate-spin" /> : <Wand2 size={16} />}
                        </button>
                      </div>
                    </div>

                    {/* فیلد توضیحات */}
                    <div className="flex flex-col gap-2">
                      <label className="text-xs font-bold text-gray-600 dark:text-gray-400">متن توضیحات (فارسی)</label>
                      <textarea 
                        rows={3} 
                        value={formData.faDesc} 
                        onChange={e => setFormData({...formData, faDesc: e.target.value})} 
                        placeholder="توضیحات زیر تیتر اصلی..." 
                        className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-amber-400 resize-none"
                      ></textarea>
                    </div>
                    <div className="flex flex-col gap-2">
                      <label className="text-xs font-bold text-gray-600 dark:text-gray-400">Description (English)</label>
                      <div className="relative">
                        <textarea 
                          rows={3} 
                          dir="ltr" 
                          value={formData.enDesc} 
                          onChange={e => setFormData({...formData, enDesc: e.target.value})} 
                          placeholder="Description text..." 
                          className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl py-3 pr-4 pl-12 text-sm font-mono focus:outline-none focus:border-amber-400 resize-none"
                        ></textarea>
                        <button 
                          type="button" 
                          onClick={() => handleAutoTranslate(formData.faDesc, 'enDesc')} 
                          disabled={translatingField === 'enDesc' || !formData.faDesc} 
                          className="absolute left-2 top-3 p-2 bg-amber-400/10 text-amber-600 hover:bg-amber-400 hover:text-gray-950 disabled:opacity-50 rounded-lg transition-colors"
                        >
                          {translatingField === 'enDesc' ? <Loader2 size={16} className="animate-spin" /> : <Wand2 size={16} />}
                        </button>
                      </div>
                    </div>

                    {/* انتخاب تم رنگی (تایلویند گرادیانت) */}
                    <div className="flex flex-col gap-2 md:col-span-2 mt-2">
                      <label className="text-xs font-bold text-gray-600 dark:text-gray-400 mb-2">تم رنگی اسلاید (پالت گرادیانت)</label>
                      <div className="flex gap-4">
                        {[
                          { val: "from-amber-400 to-orange-600", bg: "bg-linear-to-r from-amber-400 to-orange-600" },
                          { val: "from-red-500 to-rose-700", bg: "bg-linear-to-r from-red-500 to-rose-700" },
                          { val: "from-yellow-300 to-amber-500", bg: "bg-linear-to-r from-yellow-300 to-amber-500" },
                          { val: "from-blue-400 to-indigo-600", bg: "bg-linear-to-r from-blue-400 to-indigo-600" },
                          { val: "from-emerald-400 to-teal-600", bg: "bg-linear-to-r from-emerald-400 to-teal-600" }
                        ].map(c => (
                          <button 
                            key={c.val} 
                            type="button"
                            onClick={() => setFormData({...formData, color: c.val})}
                            className={`w-12 h-12 rounded-full ${c.bg} shadow-md transition-transform border-4 ${
                              formData.color === c.val ? 'border-gray-900 dark:border-white scale-110' : 'border-transparent hover:scale-105'
                            }`}
                          />
                        ))}
                      </div>
                    </div>

                  </div>
                )}

                {/* تب تصاویر با راهنمای ابعاد و سیستم هوشمند قطعات معلق */}
                {activeTab === "images" && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in duration-300">
                    
                    {/* محصول اصلی */}
                    <div className="flex flex-col gap-2">
                      <label className="text-sm font-bold text-gray-900 dark:text-white">تصویر محصول اصلی (Focus Point)</label>
                      <label className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-2xl h-44 flex flex-col items-center justify-center gap-2 bg-gray-50 hover:bg-gray-100 dark:bg-gray-800/50 dark:hover:bg-gray-800 transition-colors cursor-pointer group relative overflow-hidden">
                        <input 
                          type="file" 
                          className="hidden" 
                          onChange={(e) => handleSingleImageUpload(e, 'mainImage')} 
                        />
                        {isUploading.mainImage ? (
                          <Loader2 className="animate-spin text-amber-500" size={32} />
                        ) : formData.mainImage ? (
                          <img src={formData.mainImage} className="h-full object-contain p-2" alt="Main" />
                        ) : (
                          <>
                            <div className="w-12 h-12 bg-white dark:bg-gray-900 rounded-full flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                              <Upload size={20} className="text-amber-500" />
                            </div>
                            <div className="text-center px-4 mt-2">
                              <span className="text-xs font-black text-gray-600 block">PNG و بدون پس‌زمینه (Transparent)</span>
                              <span className="text-[10px] font-bold text-gray-400 font-mono mt-1 block">ابعاد ایده‌آل: 800x800 px | حجم: زیر 2MB</span>
                            </div>
                          </>
                        )}
                      </label>
                    </div>

                    {/* محصولات جانبی */}
                    <div className="flex flex-col gap-2">
                      <label className="text-sm font-bold text-gray-900 dark:text-white">تصاویر جانبی (محو شده در چپ و راست)</label>
                      <div className="flex gap-4 h-44">
                        <label className="flex-1 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-2xl flex flex-col items-center justify-center gap-2 bg-gray-50 hover:bg-gray-100 dark:bg-gray-800/50 dark:hover:bg-gray-800 transition-colors cursor-pointer group p-2 text-center relative overflow-hidden">
                          <input 
                            type="file" 
                            className="hidden" 
                            onChange={(e) => handleSingleImageUpload(e, 'rightImage')} 
                          />
                          {isUploading.rightImage ? (
                            <Loader2 className="animate-spin text-gray-400" />
                          ) : formData.rightImage ? (
                            <img src={formData.rightImage} className="h-full object-contain p-2" alt="Right" />
                          ) : (
                            <>
                              <Upload size={18} className="text-gray-400 group-hover:text-amber-500 transition-colors mb-1" />
                              <span className="text-xs font-bold text-gray-600">جانبی راست</span>
                              <span className="text-[9px] font-bold text-gray-400 font-mono">PNG - 500x500px</span>
                            </>
                          )}
                        </label>
                        <label className="flex-1 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-2xl flex flex-col items-center justify-center gap-2 bg-gray-50 hover:bg-gray-100 dark:bg-gray-800/50 dark:hover:bg-gray-800 transition-colors cursor-pointer group p-2 text-center relative overflow-hidden">
                          <input 
                            type="file" 
                            className="hidden" 
                            onChange={(e) => handleSingleImageUpload(e, 'leftImage')} 
                          />
                          {isUploading.leftImage ? (
                            <Loader2 className="animate-spin text-gray-400" />
                          ) : formData.leftImage ? (
                            <img src={formData.leftImage} className="h-full object-contain p-2" alt="Left" />
                          ) : (
                            <>
                              <Upload size={18} className="text-gray-400 group-hover:text-amber-500 transition-colors mb-1" />
                              <span className="text-xs font-bold text-gray-600">جانبی چپ</span>
                              <span className="text-[9px] font-bold text-gray-400 font-mono">PNG - 500x500px</span>
                            </>
                          )}
                        </label>
                      </div>
                    </div>

                    {/* بخش هوشمند قطعات معلق (Floaters) */}
                    <div className="flex flex-col gap-2 md:col-span-2 mt-4 pt-4 border-t border-gray-100 dark:border-gray-800">
                      <div className="flex items-center justify-between mb-2">
                        <label className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2">
                          <Sparkles size={16} className="text-amber-500" />
                          قطعات معلق و ذرات پراکنده (Floaters & Slices)
                        </label>
                        {uploadedFloaters.length > 0 && (
                          <span className="text-[10px] font-bold bg-green-100 text-green-700 px-2 py-1 rounded-md">
                            ۸ آیتم بهینه‌سازی شد
                          </span>
                        )}
                      </div>
                      
                      <p className="text-xs font-medium text-gray-500 leading-relaxed mb-3 pr-6 border-r-2 border-amber-400">
                        تصاویری مثل قاچ‌های میوه، برگ، قطرات آب یا اسنک‌های کوچک را آپلود کنید. <strong>(ابعاد پیشنهادی: ۱۵۰x۱۵۰ پیکسل - فرمت PNG)</strong><br/>
                        <span className="text-amber-600 font-bold">هوش مصنوعیِ رابط کاربری:</span> اگر کمتر از ۸ عکس آپلود کنید، سیستم برای جلوگیری از شلوغی و حفظ عمق میدان (Depth of Field)، تصاویر را به صورت خودکار تکثیر کرده و با سایزها، شفافیت و تارشدگی (Blur) متفاوت در بک‌گراند پخش می‌کند.
                      </p>

                      <div className="flex items-stretch gap-4">
                        {/* دکمه آپلود */}
                        <label className="w-40 border-2 border-dashed border-amber-300 dark:border-amber-700/50 rounded-2xl flex flex-col items-center justify-center gap-3 bg-amber-50/50 hover:bg-amber-50 dark:bg-amber-900/10 dark:hover:bg-amber-900/20 transition-colors group p-4 shrink-0 cursor-pointer">
                          <input 
                            type="file" 
                            multiple 
                            className="hidden" 
                            onChange={handleActualFloaterUpload} 
                            disabled={isProcessingFloaters} 
                          />
                          {isProcessingFloaters ? (
                            <Loader2 size={24} className="text-amber-500 animate-spin" />
                          ) : (
                            <Upload size={24} className="text-amber-500 group-hover:scale-110 transition-transform" />
                          )}
                          <span className="text-xs font-bold text-amber-700 dark:text-amber-500 text-center">
                            {isProcessingFloaters ? "در حال پردازش..." : "آپلود قطعات و تکثیر هوشمند"}
                          </span>
                        </label>

                        {/* پیش‌نمایش قطعات تکثیر شده */}
                        <div className="grow bg-gray-50 dark:bg-gray-800/30 rounded-2xl border border-gray-100 dark:border-gray-800 p-4 flex items-center justify-center overflow-hidden relative">
                          {uploadedFloaters.length === 0 ? (
                            <span className="text-xs font-bold text-gray-400">پیش‌نمایش افکت‌ها اینجا نمایش داده می‌شود</span>
                          ) : (
                            <div className="flex flex-wrap items-center justify-center gap-3 w-full">
                              <AnimatePresence>
                                {uploadedFloaters.map((floater, i) => (
                                  <motion.div 
                                    key={floater.uniqueId}
                                    initial={{ scale: 0, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    transition={{ delay: i * 0.1, type: "spring" }}
                                    className="relative group flex flex-col items-center gap-1"
                                    title={`افکت‌های اعمال شده:\n${floater.blur}\n${floater.opacity}\n${floater.scale}`}
                                  >
                                    <div className={`w-12 h-12 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700 flex items-center justify-center overflow-hidden`}>
                                      {floater.url ? (
                                        <img src={floater.url} className={`w-full h-full object-contain p-1 ${floater.blur} ${floater.opacity} ${floater.scale} transition-all duration-500 group-hover:blur-none group-hover:opacity-100 group-hover:scale-100`} alt="" />
                                      ) : (
                                        <ImageIcon size={16} className={`text-amber-500 ${floater.blur} ${floater.opacity} ${floater.scale} transition-all duration-500 group-hover:blur-none group-hover:opacity-100 group-hover:scale-100`} />
                                      )}
                                    </div>
                                    <span className="text-[8px] font-mono text-gray-400 bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded-sm">
                                      {floater.scale.replace('scale-','')} / {floater.blur.includes('none') ? '0' : floater.blur.replace('blur-[','').replace('px]','')}b
                                    </span>
                                  </motion.div>
                                ))}
                              </AnimatePresence>
                            </div>
                          )}
                        </div>
                      </div>

                    </div>

                  </div>
                )}

              </div>

              <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900">
                <button 
                  onClick={() => setIsModalOpen(false)} 
                  className="px-5 py-2.5 rounded-xl font-bold text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors text-sm"
                >
                  انصراف
                </button>
                <button 
                  onClick={handleSaveSlide}
                  className="bg-amber-400 hover:bg-amber-500 text-gray-950 px-6 py-2.5 rounded-xl font-bold flex items-center gap-2 transition-all shadow-lg shadow-amber-400/20 hover:scale-105 active:scale-95 text-sm"
                >
                  <CheckCircle2 size={18} />
                  <span>{editMode ? "بروزرسانی اسلاید" : "ذخیره اسلاید جدید"}</span>
                </button>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}