"use client";

import React, { useState, useEffect } from "react";
import { 
  Trash2, Tag, Layers, Package, FlaskConical, Scale, 
  Edit3, GripVertical, Droplets, Sparkles, CheckCircle2, 
  X, Wand2, Loader2, AlertCircle, ArrowLeft, Film
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

import { useAdminShortcuts } from "../hooks/useAdminShortcuts";
import { getCategories, createCategory, updateCategory, deleteCategory } from "@/actions/category";
import { getBrands } from "@/actions/brand";

const mainCats = [
  { id: "all", label: "عمومی (مشترک)", badge: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400" },
  { id: "beverage", label: "نوشیدنی‌ها", badge: "bg-blue-100 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400" },
  { id: "snack", label: "اسنک و تنقلات", badge: "bg-orange-100 text-orange-700 dark:bg-orange-500/10 dark:text-orange-400" },
  { id: "bakery", label: "کیک و بیسکویت", badge: "bg-pink-100 text-pink-700 dark:bg-pink-500/10 dark:text-pink-400" },
  { id: "media", label: "دسته‌بندی‌های رسانه و گالری", badge: "bg-purple-100 text-purple-700 dark:bg-purple-500/10 dark:text-purple-400" },
];

const groupMetadata = [
  { id: "main", title: "گروه‌های اصلی محصولات", icon: Layers },
  { id: "brands", title: "برندهای زیرمجموعه", icon: Tag },
  { id: "beverage_type", title: "انواع نوشیدنی", icon: Droplets },
  { id: "snack_type", title: "انواع تنقلات", icon: Sparkles },
  { id: "packaging", title: "انواع بسته‌بندی", icon: Package },
  { id: "flavor", title: "طعم و عصاره", icon: FlaskConical },
  { id: "weight", title: "احجام و اوزان", icon: Scale },
  { id: "status", title: "لیبل‌های وضعیت", icon: CheckCircle2 },
  { id: "media", title: "دسته‌بندی‌های رسانه و گالری", icon: Film }
];

export default function CategoriesManager({ activeCategoryId }: { activeCategoryId: string }) {
  const [categories, setCategories] = useState<any[]>([]);
  const [brands, setBrands] = useState<any[]>([]);
  const [localItems, setLocalItems] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [editModeId, setEditModeId] = useState<string | null>(null);
  const [newItemFaName, setNewItemFaName] = useState("");
  const [newItemEnName, setNewItemEnName] = useState("");
  const [newItemParent, setNewItemParent] = useState("all");

  const [draggedItemIndex, setDraggedItemIndex] = useState<number | null>(null);
  const [isTranslating, setIsTranslating] = useState(false);

  const currentGroupData = groupMetadata.find(g => g.id === activeCategoryId);
  const isBrandsCategory = activeCategoryId === "brands";

  const fetchData = async () => {
    setIsLoading(true);
    const [catRes, brandRes] = await Promise.all([getCategories(), getBrands()]);
    if (catRes.success) setCategories(catRes.data);
    if (brandRes.success) setBrands(brandRes.data);
    setIsLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  // فیلتر کردن آیتم‌های گروه فعلی و مرتب‌سازی بر اساس فیلد order
  useEffect(() => {
    if (!isBrandsCategory) {
      const filtered = categories
        .filter(c => c.iconName === activeCategoryId) // از iconName برای ذخیره گروه استفاده کردیم
        .sort((a, b) => (a.order || 0) - (b.order || 0));
      setLocalItems(filtered);
    }
  }, [categories, activeCategoryId, isBrandsCategory]);

  useAdminShortcuts({
    closeModal: () => { if (editModeId) resetForm(); },
    onAddNew: () => document.getElementById('cat-fa-input')?.focus()
  });

  if (!currentGroupData) {
    return (
      <div className="p-8 text-center text-gray-500 font-medium">
        لطفاً از منوی سمت راست یک دسته‌بندی را انتخاب کنید.
      </div>
    );
  }

  const autoTranslate = async () => {
    if (!newItemFaName.trim()) return;
    setIsTranslating(true);
    try {
      const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=fa&tl=en&dt=t&q=${encodeURIComponent(newItemFaName)}`;
      const res = await fetch(url);
      const data = await res.json();
      const translatedText = data[0].map((item: any) => item[0]).join('');
      setNewItemEnName(translatedText);
    } catch (error) {
      alert("خطا در ترجمه خودکار");
    } finally {
      setIsTranslating(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemFaName.trim() || !newItemEnName.trim() || isBrandsCategory) return;

    // ساخت اسلاگ یکتا به صورت خودکار از نام انگلیسی
    const slug = newItemEnName.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-') + '-' + Math.floor(Math.random() * 1000);

    const payload = {
      faName: newItemFaName,
      enName: newItemEnName,
      slug: slug,
      parent: newItemParent,
      iconName: activeCategoryId, // ترفند اتصال گروه به دیتابیس
      order: localItems.length
    };

    if (editModeId) {
      const res = await updateCategory(editModeId, payload);
      if (res.success) {
        resetForm();
        fetchData();
      } else alert(res.error);
    } else {
      const res = await createCategory(payload);
      if (res.success) {
        resetForm();
        fetchData();
      } else alert(res.error);
    }
    document.getElementById('cat-fa-input')?.focus();
  };

  const handleEdit = (item: any) => {
    if (isBrandsCategory) return;
    setEditModeId(item._id);
    setNewItemFaName(item.faName);
    setNewItemEnName(item.enName);
    setNewItemParent(item.parent);
    document.getElementById('cat-fa-input')?.focus();
  };

  const handleDelete = async (id: string) => {
    if (isBrandsCategory) return;
    if (confirm("آیا از حذف این آیتم اطمینان دارید؟")) {
      const res = await deleteCategory(id);
      if (res.success) fetchData();
    }
  };

  const resetForm = () => {
    setEditModeId(null);
    setNewItemFaName("");
    setNewItemEnName("");
    setNewItemParent("all");
  };

  // --- سیستم مرتب‌سازی Drag and Drop متصل به دیتابیس ---
  const handleDragStart = (index: number) => {
    if (!isBrandsCategory) setDraggedItemIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (isBrandsCategory || draggedItemIndex === null || draggedItemIndex === index) return;
    
    const items = [...localItems];
    const draggedItem = items[draggedItemIndex];
    items.splice(draggedItemIndex, 1);
    items.splice(index, 0, draggedItem);
    
    setLocalItems(items); // آپدیت فوری رابط کاربری
    setDraggedItemIndex(index);
  };

  const handleDragEnd = () => {
    setDraggedItemIndex(null);
    // آپدیت کردن فیلد order در دیتابیس در پس‌زمینه
    localItems.forEach((item, idx) => {
      updateCategory(item._id, { order: idx });
    });
  };

  const getParentInfo = (parentId: string) => mainCats.find(c => c.id === parentId) || mainCats[0];

  // تشخیص اینکه چه دیتایی باید در لیست رندر شود
  const displayItems = isBrandsCategory 
    ? brands.map(b => ({ _id: b._id, faName: b.faName, enName: b.enName, parent: "all" }))
    : localItems;

  return (
    <div className="flex flex-col gap-6">
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900 dark:text-white flex items-center gap-3">
            {React.createElement(currentGroupData.icon, { size: 24, className: "text-amber-500" })}
            مدیریت: {currentGroupData.title}
          </h1>
          <p className="text-xs text-gray-500 mt-2 font-medium flex items-center gap-2">
            {isBrandsCategory 
              ? "برندها از بخش اختصاصی خود فراخوانی می‌شوند." 
              : "راهنمای کیبورد: Alt+N (افزودن جدید) | Enter (ذخیره) | Esc (لغو ویرایش)"}
          </p>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-3xl p-6 shadow-sm min-h-100 flex flex-col">
        
        {isBrandsCategory ? (
          <div className="mb-8 bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-800/50 rounded-2xl p-5 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3 text-blue-700 dark:text-blue-400">
              <AlertCircle size={24} className="shrink-0" />
              <p className="text-sm font-bold leading-relaxed">
                برندها دارای صفحات فرانت‌اند اختصاصی (هیرو، متن و لیست محصول) هستند. امکان ویرایش آن‌ها از این بخش وجود ندارد.
              </p>
            </div>
            <a href="?section=brands_sec" className="shrink-0 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 transition-colors text-xs">
              رفتن به مدیریت برندها <ArrowLeft size={16} />
            </a>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-3 mb-8 bg-gray-50 dark:bg-gray-800/30 p-5 rounded-2xl border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-bold text-gray-700 dark:text-gray-300">
                {editModeId ? "ویرایش آیتم انتخاب شده" : "افزودن آیتم جدید"}
              </span>
              {editModeId && (
                <button type="button" onClick={resetForm} className="text-xs font-bold text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 px-3 py-1 rounded-lg transition-colors flex items-center gap-1">
                  <X size={14} /> لغو ویرایش (Esc)
                </button>
              )}
            </div>

            <div className="flex flex-col md:flex-row gap-4 w-full">
              <input 
                id="cat-fa-input"
                type="text" 
                value={newItemFaName} 
                onChange={(e) => setNewItemFaName(e.target.value)} 
                placeholder="عنوان فارسی..." 
                className="w-full md:w-1/2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-amber-400 transition-colors" 
              />
              <div className="relative w-full md:w-1/2">
                <input 
                  type="text" 
                  dir="ltr" 
                  value={newItemEnName} 
                  onChange={(e) => setNewItemEnName(e.target.value)} 
                  placeholder="English Title..." 
                  className="w-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl py-3 pr-4 pl-12 text-sm font-mono focus:outline-none focus:border-amber-400 transition-colors" 
                />
                <button 
                  type="button" 
                  onClick={autoTranslate} 
                  disabled={isTranslating || !newItemFaName.trim()} 
                  className="absolute left-2 top-1/2 -translate-y-1/2 p-2 bg-amber-400/10 text-amber-600 hover:bg-amber-400 hover:text-gray-950 disabled:opacity-50 rounded-lg transition-colors"
                >
                  {isTranslating ? <Loader2 size={16} className="animate-spin" /> : <Wand2 size={16} />}
                </button>
              </div>
            </div>
            
            <div className="flex flex-col md:flex-row gap-4 w-full mt-1">
              <select 
                value={newItemParent} 
                onChange={(e) => setNewItemParent(e.target.value)} 
                className="grow bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-amber-400 font-bold"
              >
                {mainCats.map(cat => <option key={cat.id} value={cat.id}>{cat.label}</option>)}
              </select>
              <button 
                type="submit" 
                disabled={!newItemFaName.trim() || !newItemEnName.trim()} 
                className="shrink-0 bg-amber-400 hover:bg-amber-500 disabled:bg-amber-400/50 text-gray-950 px-8 py-3 rounded-xl font-bold transition-colors shadow-lg shadow-amber-400/20 flex items-center gap-2"
              >
                {editModeId ? "ذخیره تغییرات" : "ثبت آیتم (Enter)"}
              </button>
            </div>
          </form>
        )}

        <div className="flex flex-col gap-2">
          {isLoading ? (
             <div className="py-12 flex justify-center"><Loader2 className="animate-spin text-amber-500" size={32} /></div>
          ) : (
            displayItems.map((item, index) => {
              const parentInfo = getParentInfo(item.parent);
              
              return (
                <div
                  key={item._id}
                  draggable={!isBrandsCategory}
                  onDragStart={() => handleDragStart(index)}
                  onDragOver={(e) => handleDragOver(e, index)}
                  onDragEnd={handleDragEnd}
                  className={`bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-3 flex items-center gap-4 group shadow-sm transition-colors ${draggedItemIndex === index ? 'opacity-50 bg-gray-50 dark:bg-gray-900' : 'hover:border-amber-400'} ${isBrandsCategory ? 'opacity-80 pointer-events-none' : ''}`}
                >
                  {!isBrandsCategory && (
                    <div className="cursor-grab active:cursor-grabbing text-gray-300 hover:text-amber-500 transition-colors">
                      <GripVertical size={20} />
                    </div>
                  )}
                  
                  <div className={`flex flex-col grow leading-tight pr-4 ${!isBrandsCategory ? 'border-r border-gray-100 dark:border-gray-700' : ''}`}>
                    <span className="text-sm font-bold text-gray-900 dark:text-gray-100">{item.faName}</span>
                    <span className="text-xs font-mono text-gray-400 mt-0.5">{item.enName}</span>
                  </div>
                  
                  <div className="hidden md:flex w-40 justify-center">
                    <span className={`text-[10px] px-3 py-1 rounded-lg font-bold ${parentInfo.badge}`}>
                      {parentInfo.label}
                    </span>
                  </div>

                  {!isBrandsCategory && (
                    <div className="flex items-center gap-2 pl-2">
                      <button onClick={() => handleEdit(item)} className="p-2 bg-gray-50 dark:bg-gray-900 text-gray-400 hover:text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-500/10 rounded-xl transition-colors">
                        <Edit3 size={16} />
                      </button>
                      <button onClick={() => handleDelete(item._id)} className="p-2 bg-gray-50 dark:bg-gray-900 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-xl transition-colors">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  )}
                </div>
              );
            })
          )}
          
          {!isLoading && displayItems.length === 0 && (
            <div className="py-12 flex flex-col items-center justify-center border-2 border-dashed border-gray-200 dark:border-gray-800 rounded-2xl">
              <span className="text-sm text-gray-400 font-bold">هیچ آیتمی یافت نشد!</span>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}