"use client";

import React, { useState } from "react";
import { Plus, Search, Edit3, Trash2, GripVertical, X, Upload, CheckCircle2, Wand2, Loader2, Layers, Image as ImageIcon } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const initialBrands = [
  { id: 1, faName: "ام فور", enName: "M4", faDesc: "برترین تولیدکننده نوشیدنی‌های انرژی‌زا با فرمولاسیون آلمان.", enDesc: "Top producer of energy drinks with German formulation.", productCount: 12 },
  { id: 2, faName: "خندان", enName: "Khandan", faDesc: "اسنک‌های خوشمزه و سالم برای تمام سنین.", enDesc: "Delicious and healthy snacks for all ages.", productCount: 8 },
  { id: 3, faName: "سون اسکای", enName: "Seven Sky", faDesc: "آبمیوه‌های طبیعی با طراوت بی‌نظیر.", enDesc: "Natural juices with unmatched freshness.", productCount: 5 },
];

export default function BrandsManager() {
  const [brands, setBrands] = useState(initialBrands);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("basic");
  const [editMode, setEditMode] = useState(false);
  
  const [formData, setFormData] = useState({ 
    id: 0, faName: "", enName: "", faDesc: "", enDesc: ""
  });

  const [draggedItemIndex, setDraggedItemIndex] = useState<number | null>(null);
  const [translatingField, setTranslatingField] = useState<string | null>(null);

  const handleDelete = (id: number) => {
    if(confirm("آیا از حذف این برند اطمینان دارید؟ تمام محصولات این برند بی‌نام خواهند شد!")) {
      setBrands(brands.filter(b => b.id !== id));
    }
  };

  const handleEdit = (brand: any) => {
    setEditMode(true);
    setFormData({ ...brand });
    setActiveTab("basic");
    setIsModalOpen(true);
  };

  const handleAddNew = () => {
    setEditMode(false);
    setFormData({ id: 0, faName: "", enName: "", faDesc: "", enDesc: "" });
    setActiveTab("basic");
    setIsModalOpen(true);
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
    const newBrands = [...brands];
    const draggedItem = newBrands[draggedItemIndex];
    newBrands.splice(draggedItemIndex, 1);
    newBrands.splice(index, 0, draggedItem);
    setDraggedItemIndex(index);
    setBrands(newBrands);
  };
  const handleDragEnd = () => setDraggedItemIndex(null);

  return (
    <div className="flex flex-col gap-6">
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900 dark:text-white flex items-center gap-3">
            <Layers className="text-amber-500" size={28} />
            مدیریت صفحات اختصاصی برندها
          </h1>
          <p className="text-xs text-gray-500 mt-1 font-medium">ساخت هیروی سینمایی، توضیحات و اتصال خودکار به سیستم دسته‌بندی‌ها</p>
        </div>
        <button onClick={handleAddNew} className="bg-amber-400 hover:bg-amber-500 text-gray-950 px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 transition-colors shadow-lg shadow-amber-400/20">
          <Plus size={18} /><span>افزودن برند جدید</span>
        </button>
      </div>

      <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-3xl overflow-hidden shadow-sm">
        <div className="p-4 border-b border-gray-100 dark:border-gray-800">
          <div className="relative grow max-w-md">
            <Search size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input type="text" placeholder="جستجو در برندها..." className="w-full bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl py-2.5 pr-12 pl-4 text-sm focus:outline-none focus:border-amber-400 transition-colors" />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-right">
            <thead className="bg-gray-50 dark:bg-gray-800/50 text-gray-500 dark:text-gray-400 font-bold text-xs">
              <tr>
                <th className="px-4 py-4 w-10">ترتیب</th>
                <th className="px-6 py-4">لوگو / کاور</th>
                <th className="px-6 py-4">نام برند (فا/انگ)</th>
                <th className="px-6 py-4">تعداد محصولات</th>
                <th className="px-6 py-4">عملیات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800 relative">
              {brands.map((brand, index) => (
                <tr key={brand.id} draggable onDragStart={() => handleDragStart(index)} onDragOver={(e) => handleDragOver(e, index)} onDragEnd={handleDragEnd} className={`hover:bg-gray-50 dark:hover:bg-gray-800/20 transition-colors group ${draggedItemIndex === index ? 'opacity-50 bg-gray-100 dark:bg-gray-800' : ''}`}>
                  <td className="px-4 py-4 cursor-grab active:cursor-grabbing text-gray-300 hover:text-amber-500 transition-colors"><GripVertical size={18} /></td>
                  <td className="px-6 py-4 flex gap-2 items-center">
                    <div className="w-10 h-10 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center text-gray-400" title="لوگو"><ImageIcon size={16} /></div>
                    <div className="w-16 h-10 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center text-gray-400" title="هیرو سینمایی"><ImageIcon size={16} /></div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-bold text-gray-900 dark:text-white">{brand.faName}</div>
                    <div className="text-[10px] text-gray-500 font-mono mt-0.5">{brand.enName}</div>
                  </td>
                  <td className="px-6 py-4 text-gray-600 dark:text-gray-300 font-medium">
                    <span className="bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-500 px-2 py-1 rounded-md text-xs">{brand.productCount} محصول</span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <button onClick={() => handleEdit(brand)} className="text-gray-400 hover:text-amber-500 transition-colors"><Edit3 size={18} /></button>
                      <button onClick={() => handleDelete(brand.id)} className="text-gray-400 hover:text-red-500 transition-colors"><Trash2 size={18} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-100 flex items-center justify-center p-4 sm:p-6">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-gray-950/60 backdrop-blur-sm" onClick={() => setIsModalOpen(false)} />
            
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="relative w-full max-w-4xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-3xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
              
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900">
                <h2 className="text-lg font-black text-gray-900 dark:text-white">
                  {editMode ? `ویرایش برند: ${formData.faName}` : "ساخت صفحه اختصاصی برند جدید"}
                </h2>
                <button onClick={() => setIsModalOpen(false)} className="p-2 text-gray-400 hover:text-red-500 bg-gray-100 dark:bg-gray-800 rounded-full transition-colors"><X size={20} /></button>
              </div>

              <div className="flex border-b border-gray-100 dark:border-gray-800 px-6 pt-4 gap-6 bg-gray-50/50 dark:bg-gray-900 overflow-x-auto">
                {["basic", "media", "desc"].map((tab) => (
                  <button key={tab} onClick={() => setActiveTab(tab)} className={`pb-3 text-sm font-bold border-b-2 transition-colors whitespace-nowrap ${activeTab === tab ? "border-amber-400 text-amber-500" : "border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"}`}>
                    {tab === "basic" ? "اطلاعات پایه" : tab === "media" ? "تصاویر و هیروی سینمایی" : "پاراگراف‌های معرفی"}
                  </button>
                ))}
              </div>

              <div className="p-6 overflow-y-auto grow custom-scrollbar">
                
                {activeTab === "basic" && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in duration-300">
                    <div className="flex flex-col gap-2">
                      <label className="text-xs font-bold text-gray-600 dark:text-gray-400">نام تجاری برند (فارسی)</label>
                      <input type="text" value={formData.faName} onChange={(e) => setFormData({...formData, faName: e.target.value})} placeholder="مثال: ام فور" className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-amber-400" />
                    </div>
                    <div className="flex flex-col gap-2">
                      <label className="text-xs font-bold text-gray-600 dark:text-gray-400">Brand Name (English)</label>
                      <div className="relative">
                        <input type="text" dir="ltr" value={formData.enName} onChange={(e) => setFormData({...formData, enName: e.target.value})} placeholder="Example: M4" className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl py-3 pr-4 pl-12 text-sm font-mono focus:outline-none focus:border-amber-400" />
                        <button type="button" onClick={() => handleAutoTranslate(formData.faName, 'enName')} disabled={translatingField === 'enName' || !formData.faName} className="absolute left-2 top-1/2 -translate-y-1/2 p-2 bg-amber-400/10 text-amber-600 hover:bg-amber-400 hover:text-gray-950 disabled:opacity-50 rounded-lg transition-colors">
                          {translatingField === 'enName' ? <Loader2 size={16} className="animate-spin" /> : <Wand2 size={16} />}
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === "media" && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in duration-300">
                    <div className="flex flex-col gap-3">
                      <label className="text-sm font-bold text-gray-900 dark:text-white">لوگوی برند (بدون پس‌زمینه)</label>
                      <div className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-2xl h-40 flex flex-col items-center justify-center gap-3 bg-gray-50 hover:bg-gray-100 dark:bg-gray-800/50 dark:hover:bg-gray-800 transition-colors cursor-pointer group">
                        <Upload size={20} className="text-amber-500 group-hover:scale-110 transition-transform" />
                        <span className="text-xs font-bold text-gray-500">آپلود فرمت PNG (حدود 400x400)</span>
                      </div>
                    </div>
                    <div className="flex flex-col gap-3">
                      <label className="text-sm font-bold text-gray-900 dark:text-white">تصویر ترکیبی هیروی سینمایی</label>
                      <div className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-2xl h-40 flex flex-col items-center justify-center gap-3 bg-gray-50 hover:bg-gray-100 dark:bg-gray-800/50 dark:hover:bg-gray-800 transition-colors cursor-pointer group">
                        <Upload size={20} className="text-gray-400 group-hover:text-amber-500 transition-colors" />
                        <span className="text-[10px] font-bold text-gray-500 text-center px-4">یک تصویر عریض شامل ترکیبی از محصولات این برند (ایده‌آل: 1920x800)</span>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === "desc" && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in duration-300">
                    <div className="flex flex-col gap-2">
                      <label className="text-xs font-bold text-gray-600 dark:text-gray-400">پاراگراف معرفی برند (فارسی)</label>
                      <textarea rows={8} value={formData.faDesc} onChange={(e) => setFormData({...formData, faDesc: e.target.value})} placeholder="توضیحات مفصل برای صفحه اختصاصی برند..." className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-amber-400 resize-none leading-relaxed"></textarea>
                    </div>
                    <div className="flex flex-col gap-2">
                      <label className="text-xs font-bold text-gray-600 dark:text-gray-400">Brand Description (English)</label>
                      <div className="relative h-full">
                        <textarea rows={8} dir="ltr" value={formData.enDesc} onChange={(e) => setFormData({...formData, enDesc: e.target.value})} placeholder="Detailed brand description..." className="w-full h-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl py-3 pr-4 pl-12 text-sm font-mono focus:outline-none focus:border-amber-400 resize-none leading-relaxed"></textarea>
                        <button type="button" onClick={() => handleAutoTranslate(formData.faDesc, 'enDesc')} disabled={translatingField === 'enDesc' || !formData.faDesc} className="absolute left-2 top-3 p-2 bg-amber-400/10 text-amber-600 hover:bg-amber-400 hover:text-gray-950 disabled:opacity-50 rounded-lg transition-colors">
                          {translatingField === 'enDesc' ? <Loader2 size={16} className="animate-spin" /> : <Wand2 size={16} />}
                        </button>
                      </div>
                    </div>
                  </div>
                )}

              </div>

              <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900">
                <button onClick={() => setIsModalOpen(false)} className="px-5 py-2.5 rounded-xl font-bold text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors text-sm">انصراف</button>
                <button onClick={() => setIsModalOpen(false)} className="bg-amber-400 hover:bg-amber-500 text-gray-950 px-6 py-2.5 rounded-xl font-bold flex items-center gap-2 transition-all shadow-lg shadow-amber-400/20 hover:scale-105 active:scale-95 text-sm">
                  <CheckCircle2 size={18} /><span>{editMode ? "بروزرسانی اطلاعات برند" : "ذخیره و ساخت صفحه برند"}</span>
                </button>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}