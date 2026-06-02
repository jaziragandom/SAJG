"use client";

import React, { useState, useEffect } from "react";
import { Plus, Search, Edit3, Trash2, Image as ImageIcon, GripVertical, X, Upload, CheckCircle2, Wand2, Loader2, Star, KeySquare } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAdminShortcuts } from "../hooks/useAdminShortcuts";

const initialProducts = [
  { id: 1, faTitle: "انرژی‌زا مکس ۲۵۰ میل", enTitle: "Max Energy 250ml", brand: "ام فور", category: "نوشیدنی انرژی‌زا", status: "published", isFeatured: true, mainCat: "beverage" },
  { id: 2, faTitle: "چیپس نمکی ترد", enTitle: "Crispy Chips", brand: "خندان", category: "اسنک و تنقلات", status: "published", isFeatured: false, mainCat: "snack" },
  { id: 3, faTitle: "آب انار گازدار", enTitle: "Carbonated Pomegranate", brand: "نیک", category: "نوشیدنی گازدار", status: "out_of_stock", isFeatured: false, mainCat: "beverage" },
];

export default function ProductsManager() {
  const [products, setProducts] = useState(initialProducts);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("basic");
  const [editMode, setEditMode] = useState(false);
  
  const [formData, setFormData] = useState({ 
    id: 0, faTitle: "", enTitle: "", mainCat: "beverage",
    faDesc: "", enDesc: "", faFlavor: "", enFlavor: "",
    faShelfLife: "", enShelfLife: "", faIngredients: "", enIngredients: "",
    visibilityStatus: "published", isFeatured: false 
  });
  
  const [draggedItemIndex, setDraggedItemIndex] = useState<number | null>(null);
  const [translatingField, setTranslatingField] = useState<string | null>(null);

  const tabList = ["basic", "specs", "media"];

  // اتصال فایل محصولات به سیستم شورت‌کات مرکزی
  useAdminShortcuts({
    activeTab: activeTab,
    setActiveTab: setActiveTab,
    tabsList: isModalOpen ? tabList : [], 
    closeModal: () => setIsModalOpen(false),
    onAddNew: () => { if (!isModalOpen) handleAddNew(); }
  });


  const handleDelete = (id: number) => {
    if(confirm("آیا از حذف این محصول اطمینان دارید؟")) {
      setProducts(products.filter(p => p.id !== id));
    }
  };

  const handleEdit = (product: any) => {
    setEditMode(true);
    setFormData({ 
      ...formData, 
      id: product.id, faTitle: product.faTitle, enTitle: product.enTitle, 
      mainCat: product.mainCat, visibilityStatus: product.status, isFeatured: product.isFeatured 
    });
    setActiveTab("basic");
    setIsModalOpen(true);
  };

  const handleAddNew = () => {
    setEditMode(false);
    setFormData({ 
      id: 0, faTitle: "", enTitle: "", mainCat: "beverage",
      faDesc: "", enDesc: "", faFlavor: "", enFlavor: "",
      faShelfLife: "", enShelfLife: "", faIngredients: "", enIngredients: "",
      visibilityStatus: "published", isFeatured: false
    });
    setActiveTab("basic");
    setIsModalOpen(true);
  };

  // تابع ذخیره فرم که با دکمه Enter روی کیبورد هم اجرا می‌شود
  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.faTitle.trim()) {
      alert("نام محصول الزامی است.");
      return;
    }
    // شبیه‌سازی ذخیره
    alert("محصول با موفقیت ذخیره شد!");
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
    const newProducts = [...products];
    const draggedItem = newProducts[draggedItemIndex];
    newProducts.splice(draggedItemIndex, 1);
    newProducts.splice(index, 0, draggedItem);
    setDraggedItemIndex(index);
    setProducts(newProducts);
  };

  const handleDragEnd = () => setDraggedItemIndex(null);

  return (
    <div className="flex flex-col gap-6">
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900 dark:text-white flex items-center gap-3">
            لیست محصولات
          </h1>
          <p className="text-xs text-gray-500 mt-2 font-medium flex items-center gap-2">
            راهنمای کیبورد: <kbd className="bg-gray-100 dark:bg-gray-800 px-1 rounded">Alt+N</kbd> محصول جدید
          </p>
        </div>
        
        <button 
          onClick={handleAddNew}
          className="bg-amber-400 hover:bg-amber-500 text-gray-950 px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 transition-colors shadow-lg shadow-amber-400/20"
        >
          <Plus size={18} />
          <span>افزودن محصول جدید</span>
        </button>
      </div>

      <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-4 flex flex-wrap items-center gap-4 shadow-sm">
        <div className="relative grow min-w-64">
          <Search size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" />
          <input 
            type="text" 
            placeholder="جستجو در نام محصولات..." 
            className="w-full bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl py-2.5 pr-12 pl-4 text-sm focus:outline-none focus:border-amber-400 transition-colors"
          />
        </div>
      </div>

      <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-right">
            <thead className="bg-gray-50 dark:bg-gray-800/50 text-gray-500 dark:text-gray-400 font-bold text-xs">
              <tr>
                <th className="px-4 py-4 w-10">ترتیب</th>
                <th className="px-6 py-4">تصویر</th>
                <th className="px-6 py-4">عنوان (فارسی / انگلیسی)</th>
                <th className="px-6 py-4">برند</th>
                <th className="px-6 py-4">دسته‌بندی</th>
                <th className="px-6 py-4">وضعیت</th>
                <th className="px-6 py-4">عملیات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800 relative">
              {products.map((product, index) => (
                <tr 
                  key={product.id} 
                  draggable
                  onDragStart={() => handleDragStart(index)}
                  onDragOver={(e) => handleDragOver(e, index)}
                  onDragEnd={handleDragEnd}
                  className={`hover:bg-gray-50 dark:hover:bg-gray-800/20 transition-colors group ${draggedItemIndex === index ? 'opacity-50 bg-gray-100 dark:bg-gray-800' : ''}`}
                >
                  <td className="px-4 py-4 cursor-grab active:cursor-grabbing text-gray-300 hover:text-amber-500 transition-colors">
                    <GripVertical size={18} />
                  </td>
                  <td className="px-6 py-4 relative">
                    <div className="w-12 h-12 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center text-gray-400">
                      <ImageIcon size={20} />
                    </div>
                    {product.isFeatured && (
                      <div className="absolute -top-1 -right-1 bg-amber-400 text-gray-900 p-1 rounded-full shadow-sm" title="محصول ویژه">
                        <Star size={10} className="fill-current" />
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-bold text-gray-900 dark:text-white">{product.faTitle}</div>
                    <div className="text-xs text-gray-500 font-mono mt-0.5">{product.enTitle}</div>
                  </td>
                  <td className="px-6 py-4 text-gray-600 dark:text-gray-300 font-medium">{product.brand}</td>
                  <td className="px-6 py-4 text-gray-600 dark:text-gray-300 font-medium">{product.category}</td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 text-xs font-bold rounded-md ${
                      product.status === "published" 
                        ? "bg-green-100 text-green-700 dark:bg-green-500/10 dark:text-green-400" 
                        : product.status === "draft"
                        ? "bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300"
                        : "bg-red-100 text-red-700 dark:bg-red-500/10 dark:text-red-400"
                    }`}>
                      {product.status === "published" ? "منتشر شده" : product.status === "draft" ? "پیش‌نویس" : "ناموجود"}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <button onClick={() => handleEdit(product)} className="text-gray-400 hover:text-amber-500 transition-colors" title="ویرایش">
                        <Edit3 size={18} />
                      </button>
                      <button onClick={() => handleDelete(product.id)} className="text-gray-400 hover:text-red-500 transition-colors" title="حذف">
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {products.length === 0 && (
                <tr>
                  <td colSpan={7} className="text-center py-8 text-gray-400">هیچ محصولی یافت نشد.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
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
                <div className="flex items-center gap-4">
                  <h2 className="text-lg font-black text-gray-900 dark:text-white">
                    {editMode ? `ویرایش: ${formData.faTitle}` : "ثبت محصول جدید"}
                  </h2>
                  <span className="hidden sm:flex text-[10px] text-gray-400 font-medium bg-gray-200 dark:bg-gray-800 px-2 py-1 rounded-md gap-2 items-center">
                    شورت‌کات‌ها: <kbd>Ctrl + ←/→</kbd> تغییر تب | <kbd>Enter</kbd> ذخیره | <kbd>Esc</kbd> خروج
                  </span>
                </div>
                <button type="button" onClick={() => setIsModalOpen(false)} className="p-2 text-gray-400 hover:text-red-500 bg-gray-100 dark:bg-gray-800 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-full transition-colors">
                  <X size={20} />
                </button>
              </div>

              <div className="flex border-b border-gray-100 dark:border-gray-800 px-6 pt-4 gap-6 bg-gray-50/50 dark:bg-gray-900 overflow-x-auto">
                {["basic", "specs", "media"].map((tab) => (
                  <button 
                    key={tab}
                    type="button"
                    onClick={() => setActiveTab(tab)}
                    className={`pb-3 text-sm font-bold border-b-2 transition-colors whitespace-nowrap ${
                      activeTab === tab 
                        ? "border-amber-400 text-amber-500" 
                        : "border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                    }`}
                  >
                    {tab === "basic" ? "اطلاعات پایه" : tab === "specs" ? "مشخصات تخصصی" : "رسانه و ارزش غذایی"}
                  </button>
                ))}
              </div>

              {/* کل فرم را داخل تگ form می‌گذاریم تا کلید اینتر در همه تب‌ها کار کند */}
              <form onSubmit={handleFormSubmit} className="flex flex-col grow overflow-hidden">
                <div className="p-6 overflow-y-auto grow custom-scrollbar">
                  
                  {activeTab === "basic" && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in duration-300">
                      <div className="flex flex-col gap-2">
                        <label className="text-xs font-bold text-gray-600 dark:text-gray-400">نام محصول (فارسی)</label>
                        <input 
                          autoFocus
                          type="text" 
                          value={formData.faTitle}
                          onChange={(e) => setFormData({...formData, faTitle: e.target.value})}
                          placeholder="مثال: انرژی‌زا مکس" 
                          className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-amber-400" 
                        />
                      </div>
                      <div className="flex flex-col gap-2">
                        <label className="text-xs font-bold text-gray-600 dark:text-gray-400">نام محصول (انگلیسی)</label>
                        <div className="relative">
                          <input 
                            type="text" 
                            dir="ltr" 
                            value={formData.enTitle}
                            onChange={(e) => setFormData({...formData, enTitle: e.target.value})}
                            placeholder="Example: Max Energy" 
                            className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl py-3 pr-4 pl-12 text-sm font-mono focus:outline-none focus:border-amber-400" 
                          />
                          <button type="button" onClick={() => handleAutoTranslate(formData.faTitle, 'enTitle')} disabled={translatingField === 'enTitle' || !formData.faTitle} className="absolute left-2 top-1/2 -translate-y-1/2 p-2 bg-amber-400/10 text-amber-600 hover:bg-amber-400 hover:text-gray-950 disabled:opacity-50 rounded-lg transition-colors">
                            {translatingField === 'enTitle' ? <Loader2 size={16} className="animate-spin" /> : <Wand2 size={16} />}
                          </button>
                        </div>
                      </div>
                      
                      <div className="flex flex-col gap-2">
                        <label className="text-xs font-bold text-gray-600 dark:text-gray-400">گروه اصلی محصول</label>
                        <select 
                          value={formData.mainCat}
                          onChange={(e) => setFormData({...formData, mainCat: e.target.value})}
                          className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-amber-400 font-bold text-amber-600"
                        >
                          <option value="beverage">نوشیدنی‌ها</option>
                          <option value="snack">اسنک و تنقلات</option>
                          <option value="bakery">کیک و بیسکویت</option>
                        </select>
                      </div>

                      <div className="flex flex-col gap-2">
                        <label className="text-xs font-bold text-gray-600 dark:text-gray-400">انتخاب برند</label>
                        <select className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-amber-400">
                          {formData.mainCat === "beverage" ? (
                            <><option>شیک</option><option>سون اسکای</option><option>نیک</option><option>ام فور</option></>
                          ) : formData.mainCat === "snack" ? (
                            <><option>خندان</option><option>صدف</option></>
                          ) : (<option>برندهای نان و کیک</option>)}
                        </select>
                      </div>

                      <div className="flex flex-col gap-2">
                        <label className="text-xs font-bold text-gray-600 dark:text-gray-400">وضعیت نمایش در سایت</label>
                        <select 
                          value={formData.visibilityStatus}
                          onChange={(e) => setFormData({...formData, visibilityStatus: e.target.value})}
                          className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-amber-400 font-medium"
                        >
                          <option value="published">منتشر شده (موجود)</option>
                          <option value="out_of_stock">ناموجود در انبار</option>
                          <option value="draft">پیش‌نویس (عدم نمایش)</option>
                        </select>
                      </div>

                      <div className="flex flex-col gap-2 justify-center">
                        <label className="text-xs font-bold text-gray-600 dark:text-gray-400 mb-1">محصول ویژه (نمایش در صفحه اصلی)</label>
                        <button 
                          type="button"
                          onClick={() => setFormData({...formData, isFeatured: !formData.isFeatured})}
                          className={`relative w-14 h-7 rounded-full transition-colors ${formData.isFeatured ? 'bg-amber-400' : 'bg-gray-300 dark:bg-gray-700'}`}
                        >
                          <motion.div 
                            className="w-5 h-5 bg-white rounded-full shadow-sm absolute top-1"
                            animate={{ left: formData.isFeatured ? '4px' : '32px' }}
                            transition={{ type: "spring", stiffness: 500, damping: 30 }}
                          />
                        </button>
                      </div>

                      <div className="flex flex-col gap-2">
                        <label className="text-xs font-bold text-gray-600 dark:text-gray-400">توضیحات کوتاه (فارسی)</label>
                        <textarea rows={3} value={formData.faDesc} onChange={e => setFormData({...formData, faDesc: e.target.value})} placeholder="توضیح مختصر محصول..." className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-amber-400 resize-none"></textarea>
                      </div>
                      <div className="flex flex-col gap-2">
                        <label className="text-xs font-bold text-gray-600 dark:text-gray-400">توضیحات کوتاه (انگلیسی)</label>
                        <div className="relative">
                          <textarea rows={3} dir="ltr" value={formData.enDesc} onChange={e => setFormData({...formData, enDesc: e.target.value})} placeholder="Short description..." className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl py-3 pr-4 pl-12 text-sm font-mono focus:outline-none focus:border-amber-400 resize-none"></textarea>
                          <button type="button" onClick={() => handleAutoTranslate(formData.faDesc, 'enDesc')} disabled={translatingField === 'enDesc' || !formData.faDesc} className="absolute left-2 top-3 p-2 bg-amber-400/10 text-amber-600 hover:bg-amber-400 hover:text-gray-950 disabled:opacity-50 rounded-lg transition-colors">
                            {translatingField === 'enDesc' ? <Loader2 size={16} className="animate-spin" /> : <Wand2 size={16} />}
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {activeTab === "specs" && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in duration-300">
                      
                      {formData.mainCat === "beverage" && (
                        <>
                          <div className="flex flex-col gap-2">
                            <label className="text-xs font-bold text-gray-600 dark:text-gray-400">نوع نوشیدنی</label>
                            <select className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-amber-400">
                              <option>گازدار</option><option>بدون گاز</option><option>پالپ‌دار</option><option>انرژی‌زا</option>
                            </select>
                          </div>
                          <div className="flex flex-col gap-2">
                            <label className="text-xs font-bold text-gray-600 dark:text-gray-400">نوع بسته‌بندی</label>
                            <select className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-amber-400">
                              <option>قوطی فلزی</option><option>بطری PET</option><option>تتراپک</option><option>شیشه</option>
                            </select>
                          </div>
                          <div className="flex flex-col gap-2">
                            <label className="text-xs font-bold text-gray-600 dark:text-gray-400">حجم (مقدار مشترک)</label>
                            <input type="text" placeholder="مثال: 250ml" className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-amber-400" />
                          </div>
                        </>
                      )}

                      {formData.mainCat === "snack" && (
                        <>
                          <div className="flex flex-col gap-2">
                            <label className="text-xs font-bold text-gray-600 dark:text-gray-400">نوع تنقلات</label>
                            <select className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-amber-400">
                              <option>پفک</option><option>پاپ‌کورن</option><option>چیپس</option>
                            </select>
                          </div>
                          <div className="flex flex-col gap-2">
                            <label className="text-xs font-bold text-gray-600 dark:text-gray-400">نوع بسته‌بندی</label>
                            <select className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-amber-400">
                              <option>پاکت سلفونی</option><option>بسته‌بندی خانواده</option>
                            </select>
                          </div>
                          <div className="flex flex-col gap-2">
                            <label className="text-xs font-bold text-gray-600 dark:text-gray-400">وزن خالص (مشترک)</label>
                            <input type="text" placeholder="مثال: 60g" className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-amber-400" />
                          </div>
                        </>
                      )}

                      <div className="flex flex-col gap-2">
                        <label className="text-xs font-bold text-gray-600 dark:text-gray-400">طعم (فارسی)</label>
                        <input autoFocus type="text" value={formData.faFlavor} onChange={e => setFormData({...formData, faFlavor: e.target.value})} placeholder="پرتقال..." className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-amber-400" />
                      </div>
                      <div className="flex flex-col gap-2">
                        <label className="text-xs font-bold text-gray-600 dark:text-gray-400">Flavor (انگلیسی)</label>
                        <div className="relative">
                          <input type="text" dir="ltr" value={formData.enFlavor} onChange={e => setFormData({...formData, enFlavor: e.target.value})} placeholder="Orange..." className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl py-3 pr-4 pl-12 text-sm font-mono focus:outline-none focus:border-amber-400" />
                          <button type="button" onClick={() => handleAutoTranslate(formData.faFlavor, 'enFlavor')} disabled={translatingField === 'enFlavor' || !formData.faFlavor} className="absolute left-2 top-1/2 -translate-y-1/2 p-1.5 bg-amber-400/10 text-amber-600 hover:bg-amber-400 hover:text-gray-950 disabled:opacity-50 rounded-lg transition-colors">
                            {translatingField === 'enFlavor' ? <Loader2 size={14} className="animate-spin" /> : <Wand2 size={14} />}
                          </button>
                        </div>
                      </div>
                      <div className="flex flex-col gap-2">
                        <label className="text-xs font-bold text-gray-600 dark:text-gray-400">تعداد در بسته (مشترک)</label>
                        <input type="number" placeholder="مثال: 24" className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-amber-400" />
                      </div>
                    
                      <div className="flex flex-col gap-2">
                        <label className="text-xs font-bold text-gray-600 dark:text-gray-400">مدت انقضا (فارسی)</label>
                        <input type="text" value={formData.faShelfLife} onChange={e => setFormData({...formData, faShelfLife: e.target.value})} placeholder="مثال: ۶ ماه" className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-amber-400" />
                      </div>
                      <div className="flex flex-col gap-2">
                        <label className="text-xs font-bold text-gray-600 dark:text-gray-400">Shelf Life (انگلیسی)</label>
                        <div className="relative">
                          <input type="text" dir="ltr" value={formData.enShelfLife} onChange={e => setFormData({...formData, enShelfLife: e.target.value})} placeholder="Example: 6 Months" className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl py-3 pr-4 pl-12 text-sm font-mono focus:outline-none focus:border-amber-400" />
                          <button type="button" onClick={() => handleAutoTranslate(formData.faShelfLife, 'enShelfLife')} disabled={translatingField === 'enShelfLife' || !formData.faShelfLife} className="absolute left-2 top-1/2 -translate-y-1/2 p-1.5 bg-amber-400/10 text-amber-600 hover:bg-amber-400 hover:text-gray-950 disabled:opacity-50 rounded-lg transition-colors">
                            {translatingField === 'enShelfLife' ? <Loader2 size={14} className="animate-spin" /> : <Wand2 size={14} />}
                          </button>
                        </div>
                      </div>

                      <div className="flex flex-col gap-2 md:col-span-2 lg:col-span-3">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-2">
                          <div className="flex flex-col gap-2">
                            <label className="text-xs font-bold text-gray-600 dark:text-gray-400">ترکیبات اصلی (فارسی)</label>
                            <textarea rows={2} value={formData.faIngredients} onChange={e => setFormData({...formData, faIngredients: e.target.value})} placeholder="آب، شکر..." className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-amber-400 resize-none"></textarea>
                          </div>
                          <div className="flex flex-col gap-2">
                            <label className="text-xs font-bold text-gray-600 dark:text-gray-400">Ingredients (انگلیسی)</label>
                            <div className="relative">
                              <textarea rows={2} dir="ltr" value={formData.enIngredients} onChange={e => setFormData({...formData, enIngredients: e.target.value})} placeholder="Water, Sugar..." className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl py-3 pr-4 pl-12 text-sm font-mono focus:outline-none focus:border-amber-400 resize-none"></textarea>
                              <button type="button" onClick={() => handleAutoTranslate(formData.faIngredients, 'enIngredients')} disabled={translatingField === 'enIngredients' || !formData.faIngredients} className="absolute left-2 top-3 p-2 bg-amber-400/10 text-amber-600 hover:bg-amber-400 hover:text-gray-950 disabled:opacity-50 rounded-lg transition-colors">
                                {translatingField === 'enIngredients' ? <Loader2 size={16} className="animate-spin" /> : <Wand2 size={16} />}
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {activeTab === "media" && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in duration-300">
                      <div className="flex flex-col gap-3">
                        <label className="text-sm font-bold text-gray-900 dark:text-white">تصویر اصلی محصول (مشترک)</label>
                        <div className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-2xl h-48 flex flex-col items-center justify-center gap-3 bg-gray-50 hover:bg-gray-100 dark:bg-gray-800/50 dark:hover:bg-gray-800 transition-colors cursor-pointer group">
                          <div className="w-12 h-12 bg-white dark:bg-gray-900 rounded-full flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                            <Upload size={20} className="text-amber-500" />
                          </div>
                          <span className="text-xs font-bold text-gray-500">آپلود عکس بدون پس‌زمینه (PNG)</span>
                        </div>
                      </div>

                      <div className="flex flex-col gap-3">
                        <label className="text-sm font-bold text-gray-900 dark:text-white">جدول ارزش غذایی (مشترک)</label>
                        <div className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-2xl h-48 flex flex-col items-center justify-center gap-3 bg-gray-50 hover:bg-gray-100 dark:bg-gray-800/50 dark:hover:bg-gray-800 transition-colors cursor-pointer group">
                          <div className="w-12 h-12 bg-white dark:bg-gray-900 rounded-full flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                            <Upload size={20} className="text-gray-400" />
                          </div>
                          <span className="text-xs font-bold text-gray-500">آپلود لیبل استاندارد غذایی (JPG/PNG)</span>
                        </div>
                      </div>
                    </div>
                  )}

                </div>

                <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900">
                  <button type="button" onClick={() => setIsModalOpen(false)} className="px-5 py-2.5 rounded-xl font-bold text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors text-sm">
                    انصراف
                  </button>
                  <button 
                    type="submit"
                    className="bg-amber-400 hover:bg-amber-500 text-gray-950 px-6 py-2.5 rounded-xl font-bold flex items-center gap-2 transition-all shadow-lg shadow-amber-400/20 hover:scale-105 active:scale-95 text-sm"
                  >
                    <CheckCircle2 size={18} />
                    <span>{editMode ? "بروزرسانی اطلاعات" : "ذخیره محصول جدید (Enter)"}</span>
                  </button>
                </div>
              </form>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}