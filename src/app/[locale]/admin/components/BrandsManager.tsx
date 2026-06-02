"use client";

import React, { useState, useEffect } from "react";
import { Plus, Search, Edit3, Trash2, GripVertical, X, CheckCircle2, Wand2, Loader2, Layers } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { getBrands, createBrand, updateBrand, deleteBrand } from "@/actions/brand";

export default function BrandsManager() {
  const [brands, setBrands] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("basic");
  const [editMode, setEditMode] = useState(false);
  const [translatingField, setTranslatingField] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  
  const [formData, setFormData] = useState({ 
    _id: "", slug: "", faName: "", enName: "", faDesc: "", enDesc: "", logo: "", heroImage: "", color: "from-gray-400 to-gray-600"
  });

  const fetchBrandsData = async () => {
    setIsLoading(true);
    const res = await getBrands();
    if (res.success) setBrands(res.data);
    setIsLoading(false);
  };

  useEffect(() => {
    fetchBrandsData();
  }, []);

  const handleSave = async () => {
    if (!formData.faName || !formData.enName || !formData.slug) {
      alert("پر کردن نام فارسی، انگلیسی و اسلاگ (Slug) الزامی است.");
      return;
    }

    if (editMode && formData._id) {
      const res = await updateBrand(formData._id, formData);
      if (res.success) {
        setIsModalOpen(false);
        fetchBrandsData();
      } else alert(res.error);
    } else {
      // هنگام ساخت برند جدید، آیدی باید خالی باشد تا مونگودی‌بی خودش آیدی بسازد
      const { _id, ...newBrandData } = formData;
      const res = await createBrand(newBrandData);
      if (res.success) {
        setIsModalOpen(false);
        fetchBrandsData();
      } else alert(res.error);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("آیا از حذف این برند مطمئن هستید؟ تمام محصولات متصل به این برند نیز ممکن است دچار مشکل شوند.")) {
      const res = await deleteBrand(id);
      if (res.success) fetchBrandsData();
    }
  };

  const handleEdit = (brand: any) => {
    setFormData(brand);
    setEditMode(true);
    setActiveTab("basic");
    setIsModalOpen(true);
  };

  const handleAddNew = () => {
    setFormData({ _id: "", slug: "", faName: "", enName: "", faDesc: "", enDesc: "", logo: "", heroImage: "", color: "from-gray-400 to-gray-600" });
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
      console.error("Translation Error:", error);
      alert("خطا در سیستم ترجمه.");
    } finally {
      setTranslatingField(null);
    }
  };

  const filteredBrands = brands.filter(b => 
    (b.faName && b.faName.includes(searchQuery)) || 
    (b.enName && b.enName.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="flex flex-col gap-6">
      
      {/* هدر بخش مدیریت */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-gray-900 p-6 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm">
        <div>
          <h2 className="text-xl font-black text-gray-900 dark:text-white mb-1">مدیریت برندها</h2>
          <p className="text-sm font-medium text-gray-500">لیست برندهای مجموعه و اطلاعات پایه‌ای آن‌ها</p>
        </div>
        <button onClick={handleAddNew} className="bg-amber-400 hover:bg-amber-500 text-gray-950 px-6 py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-amber-400/20 hover:scale-105 active:scale-95">
          <Plus size={20} />
          <span>افزودن برند جدید</span>
        </button>
      </div>

      {/* جستجو */}
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

      {/* لیست برندها */}
      {isLoading ? (
        <div className="flex justify-center items-center py-20">
          <Loader2 className="animate-spin text-amber-500" size={40} />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredBrands.map((brand) => (
            <div key={brand._id} className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 p-6 flex flex-col gap-6 shadow-sm hover:shadow-xl hover:shadow-amber-400/5 transition-all group">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gray-50 dark:bg-gray-800 rounded-xl flex items-center justify-center cursor-move text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
                    <GripVertical size={20} />
                  </div>
                  <div>
                    <h3 className="font-black text-gray-900 dark:text-white">{brand.faName}</h3>
                    <p className="text-xs font-bold text-gray-500">{brand.enName}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                  <button onClick={() => handleEdit(brand)} className="p-2 bg-gray-50 dark:bg-gray-800 text-gray-400 hover:text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-500/10 rounded-xl transition-colors">
                    <Edit3 size={16} />
                  </button>
                  <button onClick={() => handleDelete(brand._id)} className="p-2 bg-gray-50 dark:bg-gray-800 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-xl transition-colors">
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400 line-clamp-2 leading-relaxed">
                {brand.faDesc || "توضیحاتی ثبت نشده است."}
              </p>
              <div className="mt-auto pt-4 border-t border-gray-50 dark:border-gray-800 flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-bold text-gray-500">
                  <Layers size={14} />
                  <span>اسلاگ: {brand.slug || "-"}</span>
                </div>
              </div>
            </div>
          ))}
          {filteredBrands.length === 0 && (
            <div className="col-span-full py-12 text-center text-gray-500 font-bold">
              هیچ برندی یافت نشد.
            </div>
          )}
        </div>
      )}

      {/* مدال افزودن/ویرایش */}
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

                    <div className="flex flex-col gap-2">
                      <label className="text-xs font-bold text-gray-600 dark:text-gray-400">شناسه URL (Slug) <span className="text-red-500">*</span></label>
                      <input type="text" value={formData.slug} onChange={e => setFormData({...formData, slug: e.target.value})} dir="ltr" placeholder="m4-energy" className="bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-sm font-mono focus:outline-none focus:border-amber-400 transition-colors" />
                      <p className="text-[10px] text-gray-400">این شناسه در آدرس مرورگر نمایش داده می‌شود و باید به انگلیسی و بدون فاصله باشد.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="flex flex-col gap-2 relative">
                        <label className="text-xs font-bold text-gray-600 dark:text-gray-400">توضیحات کوتاه (فارسی)</label>
                        <textarea value={formData.faDesc} onChange={e => setFormData({...formData, faDesc: e.target.value})} className="bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl p-4 text-sm font-bold focus:outline-none focus:border-amber-400 h-32 resize-none transition-colors" />
                      </div>
                      <div className="flex flex-col gap-2 relative">
                        <label className="text-xs font-bold text-gray-600 dark:text-gray-400">توضیحات کوتاه (انگلیسی)</label>
                        <textarea dir="ltr" value={formData.enDesc} onChange={e => setFormData({...formData, enDesc: e.target.value})} className="bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl p-4 text-sm font-bold focus:outline-none focus:border-amber-400 h-32 resize-none transition-colors pl-12" />
                        <button type="button" onClick={() => handleAutoTranslate(formData.faDesc, 'enDesc')} disabled={translatingField === 'enDesc' || !formData.faDesc} className="absolute left-3 top-8 p-2 bg-amber-400/10 text-amber-600 hover:bg-amber-400 hover:text-gray-950 disabled:opacity-50 rounded-lg transition-colors">
                          {translatingField === 'enDesc' ? <Loader2 size={16} className="animate-spin" /> : <Wand2 size={16} />}
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === "media" && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="flex flex-col gap-3">
                      <label className="text-xs font-bold text-gray-600 dark:text-gray-400">لینک لوگوی برند</label>
                      <input type="text" value={formData.logo} onChange={e => setFormData({...formData, logo: e.target.value})} dir="ltr" className="bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-sm font-mono focus:outline-none focus:border-amber-400 transition-colors" placeholder="https://..." />
                    </div>
                    <div className="flex flex-col gap-3">
                      <label className="text-xs font-bold text-gray-600 dark:text-gray-400">لینک تصویر کاور (Hero)</label>
                      <input type="text" value={formData.heroImage} onChange={e => setFormData({...formData, heroImage: e.target.value})} dir="ltr" className="bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-sm font-mono focus:outline-none focus:border-amber-400 transition-colors" placeholder="https://..." />
                    </div>
                    <div className="flex flex-col gap-3">
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