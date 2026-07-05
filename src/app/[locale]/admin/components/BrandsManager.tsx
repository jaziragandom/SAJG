"use client";

import React, { useState, useEffect } from "react";
import { Plus, Search, Edit3, Trash2, GripVertical, X, CheckCircle2, Wand2, Loader2, Layers, Image as ImageIcon } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { getBrands, createBrand, updateBrand, deleteBrand } from "@/actions/brand";
import { useToast } from "../components/ToastProvider";

export default function BrandsManager() {
  const { showToast } = useToast();
  const [brands, setBrands] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("basic");
  const [editMode, setEditMode] = useState(false);
  const [translatingField, setTranslatingField] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [draggedItemIndex, setDraggedItemIndex] = useState<number | null>(null);
  
  const [formData, setFormData] = useState({ 
    _id: "", slug: "", faName: "", enName: "", faSlogan: "", enSlogan: "", logoFa: "", logoEn: "", logo: "", heroImage: "", color: "from-gray-400 to-gray-600", order: 0
  });

  const fetchBrandsData = async () => {
    setIsLoading(true);
    const res = await getBrands();
    if (res.success) {
      const sorted = (res.data || []).sort((a: any, b: any) => (a.order || 0) - (b.order || 0));
      setBrands(sorted);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchBrandsData();
  }, []);

  const handleSave = async () => {
    if (!formData.faName || !formData.enName || !formData.slug) {
      showToast("پر کردن نام فارسی، انگلیسی و اسلاگ (Slug) الزامی است.", "warning");
      return;
    }

    const payload = { ...formData, slug: formData.slug.toLowerCase().trim() };

    if (editMode && payload._id) {
      const res = await updateBrand(payload._id, payload);
      if (res.success) {
        showToast("برند با موفقیت ویرایش شد.", "success");
        setIsModalOpen(false);
        fetchBrandsData();
      } else showToast(res.error || "خطا در ویرایش برند", "error");
    } else {
      const { _id, ...newBrandData } = payload;
      newBrandData.order = brands.length;
      const res = await createBrand(newBrandData);
      if (res.success) {
        showToast("برند جدید با موفقیت ثبت شد.", "success");
        setIsModalOpen(false);
        fetchBrandsData();
      } else showToast(res.error || "خطا در ثبت برند", "error");
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("آیا از حذف این برند مطمئن هستید؟ تمام محصولات متصل به این برند نیز ممکن است دچار مشکل شوند.")) {
      const res = await deleteBrand(id);
      if (res.success) {
        showToast("برند با موفقیت حذف شد.", "success");
        fetchBrandsData();
      } else {
        showToast("خطا در حذف برند", "error");
      }
    }
  };

  const handleEdit = (brand: any) => {
    setFormData({
      ...brand,
      faSlogan: brand.faSlogan || "",
      enSlogan: brand.enSlogan || "",
      logoFa: brand.logoFa || brand.logo || "",
      logoEn: brand.logoEn || brand.logo || "",
      logo: brand.logo || "",
      order: brand.order || 0
    });
    setEditMode(true);
    setActiveTab("basic");
    setIsModalOpen(true);
  };

  const handleAddNew = () => {
    setFormData({ _id: "", slug: "", faName: "", enName: "", faSlogan: "", enSlogan: "", logoFa: "", logoEn: "", logo: "", heroImage: "", color: "from-gray-400 to-gray-600", order: brands.length });
    setEditMode(false);
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
      showToast("خطا در سیستم ترجمه.", "error");
    } finally {
      setTranslatingField(null);
    }
  };

  const handleDragStart = (index: number) => {
    if (searchQuery.trim() === "") {
      setDraggedItemIndex(index);
    }
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (searchQuery.trim() !== "" || draggedItemIndex === null || draggedItemIndex === index) return;
    const items = [...brands];
    const draggedItem = items[draggedItemIndex];
    items.splice(draggedItemIndex, 1);
    items.splice(index, 0, draggedItem);
    setDraggedItemIndex(index);
    setBrands(items);
  };

  const handleDragEnd = async () => {
    setDraggedItemIndex(null);
    if (searchQuery.trim() !== "") return;
    const updated = brands.map((b, idx) => ({ ...b, order: idx }));
    setBrands(updated);
    await Promise.all(updated.map(b => updateBrand(b._id, { order: b.order })));
    showToast("ترتیب نمایش برندها در سایت بروزرسانی شد.", "info");
  };

  const filteredBrands = brands.filter(b => 
    (b.faName && b.faName.includes(searchQuery)) || 
    (b.enName && b.enName.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="flex flex-col gap-6">
      
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-gray-900 p-6 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm">
        <div>
          <h2 className="text-xl font-black text-gray-900 dark:text-white mb-1">مدیریت برندها</h2>
          <p className="text-sm font-medium text-gray-500">قابلیت درگ اند دراپ فعال است؛ ترتیب چیدمان در ناوبار و سایت منعکس می‌شود.</p>
        </div>
        <button onClick={handleAddNew} className="bg-amber-400 hover:bg-amber-500 text-gray-950 px-6 py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-amber-400/20 hover:scale-105 active:scale-95">
          <Plus size={20} />
          <span>افزودن برند جدید</span>
        </button>
      </div>

      <div className="relative">
        <Search size={20} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" />
        <input 
          type="text" 
          placeholder="جستجو در بین برندها..." 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl pr-12 pl-4 py-4 text-sm font-bold focus:outline-none focus:border-amber-400 transition-colors shadow-sm"
        />
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center py-20">
          <Loader2 className="animate-spin text-amber-500" size={40} />
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {filteredBrands.map((brand, index) => {
            const logoToDisplay = brand.logoFa || brand.logoEn || brand.logo;
            return (
              <div 
                key={brand._id}
                draggable={searchQuery.trim() === ""}
                onDragStart={() => handleDragStart(index)}
                onDragOver={(e) => handleDragOver(e, index)}
                onDragEnd={handleDragEnd}
                className={`bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-4 flex items-center justify-between gap-4 shadow-sm hover:border-amber-400 transition-colors ${
                  draggedItemIndex === index ? 'opacity-50 bg-gray-50 dark:bg-gray-800' : ''
                }`}
              >
                <div className="flex items-center gap-4 grow min-w-0">
                  <div className={`cursor-grab active:cursor-grabbing text-gray-300 hover:text-amber-500 transition-colors ${searchQuery.trim() !== "" ? 'opacity-30 cursor-not-allowed' : ''}`}>
                    <GripVertical size={20} />
                  </div>
                  
                  <div className="w-12 h-12 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700 flex items-center justify-center shrink-0 p-1.5 overflow-hidden">
                    {logoToDisplay ? (
                      <img src={logoToDisplay} alt={brand.faName} className="w-full h-full object-contain" />
                    ) : (
                      <ImageIcon size={20} className="text-gray-400" />
                    )}
                  </div>

                  <div className="flex flex-col min-w-0">
                    <span className="text-sm font-black text-gray-900 dark:text-white truncate">{brand.faName}</span>
                    <span className="text-xs font-mono text-gray-400 truncate">{brand.enName}</span>
                  </div>
                </div>

                <div className="hidden md:flex items-center gap-2 px-4 border-r border-gray-100 dark:border-gray-800 shrink-0">
                  <Layers size={14} className="text-gray-400" />
                  <span className="text-xs font-mono font-bold text-gray-500">{brand.slug}</span>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button onClick={() => handleEdit(brand)} className="p-2 bg-gray-50 dark:bg-gray-800 text-gray-400 hover:text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-500/10 rounded-xl transition-colors">
                    <Edit3 size={16} />
                  </button>
                  <button onClick={() => handleDelete(brand._id)} className="p-2 bg-gray-50 dark:bg-gray-800 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-xl transition-colors">
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            );
          })}
          {filteredBrands.length === 0 && (
            <div className="py-12 text-center text-gray-500 font-bold border-2 border-dashed border-gray-200 dark:border-gray-800 rounded-2xl">
              هیچ برندی یافت نشد.
            </div>
          )}
        </div>
      )}

      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 flex items-center justify-center p-4 z-50">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsModalOpen(false)} className="absolute inset-0 bg-gray-950/80 backdrop-blur-sm cursor-pointer" />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="relative z-10 w-full max-w-4xl bg-white dark:bg-gray-950 rounded-[2rem] shadow-2xl overflow-hidden border border-gray-100 dark:border-gray-800 flex flex-col max-h-[90vh]">
              
              <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/50">
                <div>
                  <h3 className="text-xl font-black text-gray-900 dark:text-white mb-1">{editMode ? "ویرایش برند" : "افزودن برند جدید"}</h3>
                  <p className="text-xs font-medium text-gray-500">مشخصات برند را در فرم زیر وارد کنید.</p>
                </div>
                <button onClick={() => setIsModalOpen(false)} className="w-10 h-10 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full flex items-center justify-center text-gray-500 hover:text-red-500 hover:border-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors">
                  <X size={20} />
                </button>
              </div>

              <div className="flex gap-2 p-6 pb-0 overflow-x-auto custom-scrollbar">
                <button onClick={() => setActiveTab("basic")} className={`px-6 py-3 rounded-t-2xl font-bold text-sm transition-colors whitespace-nowrap ${activeTab === "basic" ? "bg-amber-400 text-gray-950" : "bg-gray-100 dark:bg-gray-900 text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-800"}`}>اطلاعات پایه</button>
                <button onClick={() => setActiveTab("media")} className={`px-6 py-3 rounded-t-2xl font-bold text-sm transition-colors whitespace-nowrap ${activeTab === "media" ? "bg-amber-400 text-gray-950" : "bg-gray-100 dark:bg-gray-900 text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-800"}`}>مدیا و تصاویر</button>
              </div>

              <div className="p-6 overflow-y-auto custom-scrollbar bg-white dark:bg-gray-950">
                
                {activeTab === "basic" && (
                  <div className="flex flex-col gap-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="flex flex-col gap-2">
                        <label className="text-xs font-bold text-gray-600 dark:text-gray-400">نام فارسی برند <span className="text-red-500">*</span></label>
                        <input type="text" value={formData.faName} onChange={e => setFormData({...formData, faName: e.target.value})} className="bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-sm font-bold focus:outline-none focus:border-amber-400 transition-colors" />
                      </div>
                      <div className="flex flex-col gap-2">
                        <label className="text-xs font-bold text-gray-600 dark:text-gray-400">نام انگلیسی (English) <span className="text-red-500">*</span></label>
                        <input type="text" value={formData.enName} onChange={e => setFormData({...formData, enName: e.target.value})} dir="ltr" className="bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-sm font-bold focus:outline-none focus:border-amber-400 transition-colors" />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="flex flex-col gap-2">
                        <label className="text-xs font-bold text-gray-600 dark:text-gray-400">شعار برند (فارسی)</label>
                        <input type="text" placeholder="مثال: طعمی نو برای زندگی بهتر" value={formData.faSlogan} onChange={e => setFormData({...formData, faSlogan: e.target.value})} className="bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-sm font-bold focus:outline-none focus:border-amber-400 transition-colors" />
                      </div>
                      <div className="flex flex-col gap-2 relative">
                        <label className="text-xs font-bold text-gray-600 dark:text-gray-400">شعار برند (انگلیسی)</label>
                        <input type="text" placeholder="Example: A New Taste for Better Life" value={formData.enSlogan} onChange={e => setFormData({...formData, enSlogan: e.target.value})} dir="ltr" className="w-full bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl py-3 pr-4 pl-12 text-sm font-bold focus:outline-none focus:border-amber-400 transition-colors" />
                        <button type="button" onClick={() => handleAutoTranslate(formData.faSlogan, 'enSlogan')} disabled={translatingField === 'enSlogan' || !formData.faSlogan} className="absolute left-2 top-7 p-2 bg-amber-400/10 text-amber-600 hover:bg-amber-400 hover:text-gray-950 disabled:opacity-50 rounded-lg transition-colors">
                          {translatingField === 'enSlogan' ? <Loader2 size={16} className="animate-spin" /> : <Wand2 size={16} />}
                        </button>
                      </div>
                    </div>

                    <div className="flex flex-col gap-2">
                      <label className="text-xs font-bold text-gray-600 dark:text-gray-400">شناسه URL (Slug) <span className="text-red-500">*</span></label>
                      <input type="text" value={formData.slug} onChange={e => setFormData({...formData, slug: e.target.value})} dir="ltr" placeholder="m4-energy" className="bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-sm font-mono focus:outline-none focus:border-amber-400 transition-colors" />
                      <p className="text-[10px] text-gray-400">این شناسه در آدرس مرورگر نمایش داده می‌شود و باید به انگلیسی و بدون فاصله باشد.</p>
                    </div>
                  </div>
                )}

                {activeTab === "media" && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="flex flex-col gap-3">
                      <label className="text-xs font-bold text-gray-600 dark:text-gray-400">لوگوی برند (نسخه فارسی)</label>
                      {formData.logoFa && <img src={formData.logoFa} alt="Logo Fa" className="h-20 object-contain mx-auto mb-2" />}
                      <label className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-xl h-32 flex flex-col items-center justify-center gap-2 cursor-pointer hover:border-amber-400">
                        <input type="file" accept="image/*" className="hidden" onChange={async(e) => { 
                          const f = e.target.files?.[0]; 
                          if(!f) return; 
                          if(formData.logoFa) { 
                            await fetch('/api/upload', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ fileUrl: formData.logoFa }) }).catch(e => console.error(e)); 
                          } 
                          const fd = new FormData(); 
                          fd.append('file', f); 
                          const r = await fetch('/api/upload', {method:'POST',body:fd}); 
                          const d = await r.json(); 
                          if(d.success) setFormData({...formData, logoFa: d.url}); 
                        }} />
                        <ImageIcon size={24} className="text-gray-400" />
                        <span className="text-xs font-bold text-gray-500">برای آپلود کلیک کنید</span>
                      </label>
                    </div>

                    <div className="flex flex-col gap-3">
                      <label className="text-xs font-bold text-gray-600 dark:text-gray-400">لوگوی برند (نسخه انگلیسی)</label>
                      {formData.logoEn && <img src={formData.logoEn} alt="Logo En" className="h-20 object-contain mx-auto mb-2" />}
                      <label className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-xl h-32 flex flex-col items-center justify-center gap-2 cursor-pointer hover:border-amber-400">
                        <input type="file" accept="image/*" className="hidden" onChange={async(e) => { 
                          const f = e.target.files?.[0]; 
                          if(!f) return; 
                          if(formData.logoEn) { 
                            await fetch('/api/upload', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ fileUrl: formData.logoEn }) }).catch(e => console.error(e)); 
                          } 
                          const fd = new FormData(); 
                          fd.append('file', f); 
                          const r = await fetch('/api/upload', {method:'POST',body:fd}); 
                          const d = await r.json(); 
                          if(d.success) setFormData({...formData, logoEn: d.url}); 
                        }} />
                        <ImageIcon size={24} className="text-gray-400" />
                        <span className="text-xs font-bold text-gray-500">برای آپلود کلیک کنید</span>
                      </label>
                    </div>

                    <div className="flex flex-col gap-3">
                      <label className="text-xs font-bold text-gray-600 dark:text-gray-400">تصویر کاور (Hero)</label>
                      {formData.heroImage && <img src={formData.heroImage} alt="Hero" className="h-20 object-cover rounded-xl mx-auto mb-2 w-full" />}
                      <label className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-xl h-32 flex flex-col items-center justify-center gap-2 cursor-pointer hover:border-amber-400">
                        <input type="file" accept="image/*" className="hidden" onChange={async(e) => { 
                          const f = e.target.files?.[0]; 
                          if(!f) return; 
                          if(formData.heroImage) { 
                            await fetch('/api/upload', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ fileUrl: formData.heroImage }) }).catch(e => console.error(e)); 
                          } 
                          const fd = new FormData(); 
                          fd.append('file', f); 
                          const r = await fetch('/api/upload', {method:'POST',body:fd}); 
                          const d = await r.json(); 
                          if(d.success) setFormData({...formData, heroImage: d.url}); 
                        }} />
                        <ImageIcon size={24} className="text-gray-400" />
                        <span className="text-xs font-bold text-gray-500">برای آپلود کلیک کنید</span>
                      </label>
                    </div>

                    <div className="flex flex-col gap-3 col-span-1 md:col-span-3">
                      <label className="text-xs font-bold text-gray-600 dark:text-gray-400">تم رنگی (کلاس Tailwind)</label>
                      <input type="text" value={formData.color} onChange={e => setFormData({...formData, color: e.target.value})} dir="ltr" className="bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-sm font-mono focus:outline-none focus:border-amber-400 transition-colors" placeholder="from-amber-400 to-orange-600" />
                    </div>
                  </div>
                )}

              </div>

              <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900">
                <button onClick={() => setIsModalOpen(false)} className="px-5 py-2.5 rounded-xl font-bold text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors text-sm">
                  انصراف
                </button>
                <button onClick={handleSave} className="bg-amber-400 hover:bg-amber-500 text-gray-950 px-6 py-2.5 rounded-xl font-bold flex items-center gap-2 transition-all shadow-lg shadow-amber-400/20 hover:scale-105 active:scale-95 text-sm">
                  <CheckCircle2 size={18} />
                  <span>{editMode ? "بروزرسانی برند" : "ذخیره برند جدید"}</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}