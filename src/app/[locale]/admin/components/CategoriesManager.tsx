"use client";

import React, { useState, useEffect } from "react";
import { 
  Trash2, Tag, Layers, Package, FlaskConical, Scale, 
  Edit3, GripVertical, Droplets, Sparkles, CheckCircle2, 
  X, Wand2, Loader2, AlertCircle, ArrowLeft, Film
} from "lucide-react";
import { useAdminShortcuts } from "../hooks/useAdminShortcuts";
import { getCategories, createCategory, updateCategory, deleteCategory } from "@/actions/category";
import { getBrands } from "@/actions/brand";

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
  const [editItemSlug, setEditItemSlug] = useState<string | null>(null);
  
  const [newItemFaName, setNewItemFaName] = useState("");
  const [newItemEnName, setNewItemEnName] = useState("");
  const [selectedMain, setSelectedMain] = useState("all");
  const [selectedSub, setSelectedSub] = useState("all");
  const [draggedItemIndex, setDraggedItemIndex] = useState<number | null>(null);
  const [isTranslating, setIsTranslating] = useState(false);
  
  const currentGroupData = groupMetadata.find(g => g.id === activeCategoryId);
  const isBrandsCategory = activeCategoryId === "brands";
  
  const isMainGroup = ["main", "media", "status"].includes(activeCategoryId);
  const isSpecGroup = ["packaging", "flavor", "weight"].includes(activeCategoryId);

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

  useEffect(() => {
    if (!isBrandsCategory) {
      const filtered = categories
        .filter(c => c.iconName === activeCategoryId)
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
    
    // ساخت اسلاگ تمیز بر اساس نام انگلیسی
    const baseSlug = newItemEnName.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-');

    let finalParent = "all";
    if (!isMainGroup) {
       if (isSpecGroup) {
          finalParent = selectedSub !== "all" ? selectedSub : selectedMain;
       } else {
          finalParent = selectedMain;
       }
    }

    if (editModeId) {
      const currentItem = categories.find(c => c._id === editModeId);
      
      // منطق هوشمند برای جلوگیری از تداخل اسلاگ‌های هم‌نام در حالت ویرایش
      let finalSlug = baseSlug;
      if (currentItem && newItemEnName.trim() === currentItem.enName.trim()) {
        // اگر اسم انگلیسی تغییری نکرده، همون اسلاگ قبلی که تو دیتابیس یونیک هست رو نگه می‌داریم
        finalSlug = currentItem.slug;
      } else {
        // اگر اسم انگلیسی تغییر کرده، برای جلوگیری از تداخل با بقیه یه عدد رندوم می‌دیم
        finalSlug = baseSlug + '-' + Math.floor(Math.random() * 10000);
      }
      
      const payload = {
        faName: newItemFaName,
        enName: newItemEnName,
        slug: finalSlug, 
        parent: finalParent,
        iconName: activeCategoryId,
        order: currentItem ? currentItem.order : localItems.length // حفظ ترتیب قبلی آیتم
      };

      const res = await updateCategory(editModeId, payload);
      if (res.success) {
        // --- آپدیت آبشاری هوشمند ---
        if (editItemSlug && editItemSlug !== finalSlug) {
          // اگر اسلاگ قبلی ثبت شده باشد، تمام زیردسته‌ها را پیدا کن (بدون حساسیت به حروف بزرگ و کوچک)
          const childrenToUpdate = categories.filter(c => 
            c.parent === editItemSlug || 
            (c.parent && editItemSlug && c.parent.toLowerCase() === editItemSlug.toLowerCase())
          );
          if (childrenToUpdate.length > 0) {
            await Promise.all(
              childrenToUpdate.map(child => updateCategory(child._id, { parent: finalSlug }))
            );
          }
        }
        resetForm();
        fetchData();
      } else alert(res.error);
      
    } else {
      // برای آیتم‌های جدید یک عدد تصادفی اضافه می‌کنیم تا در صورت تکراری بودن نام، خطا ندهد
      const finalSlug = baseSlug + '-' + Math.floor(Math.random() * 10000);
      
      const payload = {
        faName: newItemFaName,
        enName: newItemEnName,
        slug: finalSlug,
        parent: finalParent,
        iconName: activeCategoryId,
        order: localItems.length
      };

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
    setEditItemSlug(item.slug); // ذخیره اسلاگ فعلی
    setNewItemFaName(item.faName);
    setNewItemEnName(item.enName);

    if (!item.parent || item.parent === 'all') {
        setSelectedMain('all');
        setSelectedSub('all');
    } else {
        // جستجوی والد با انعطاف‌پذیری کامل (حروف بزرگ/کوچک یا آیدی)
        const parentCat = categories.find(c => 
            c.slug === item.parent || 
            (c.slug && item.parent && c.slug.toLowerCase() === item.parent.toLowerCase()) || 
            c._id === item.parent
        );
        
        if (parentCat) {
            if (parentCat.iconName === 'main') {
                setSelectedMain(parentCat.slug);
                setSelectedSub('all');
            } else {
                // اگر والد خودش زیردسته است، پدربزرگ را پیدا کن
                const grandParentCat = categories.find(c => 
                    c.slug === parentCat.parent || 
                    (c.slug && parentCat.parent && c.slug.toLowerCase() === parentCat.parent.toLowerCase()) || 
                    c._id === parentCat.parent
                );
                setSelectedMain(grandParentCat ? grandParentCat.slug : parentCat.parent);
                setSelectedSub(parentCat.slug);
            }
        } else {
            // والد پیدا نشد (ارتباط قطع شده قدیمی)، سلکت‌ها ریست می‌شوند تا دوباره انتخاب کنید
            setSelectedMain('all');
            setSelectedSub('all');
        }
    }
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
    setEditItemSlug(null);
    setNewItemFaName("");
    setNewItemEnName("");
    setSelectedMain("all");
    setSelectedSub("all");
  };

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
    
    setLocalItems(items);
    setDraggedItemIndex(index);
  };

  const handleDragEnd = () => {
    setDraggedItemIndex(null);
    localItems.forEach((item, idx) => {
      updateCategory(item._id, { order: idx });
    });
  };

  const getParentPathLabel = (parentId: string) => {
      if (!parentId || parentId === "all") return "عمومی برای همه";
      
      // جستجوی والد با خطاپوشی کامل
      const p = categories.find(c => 
          c.slug === parentId || 
          (c.slug && parentId && c.slug.toLowerCase() === parentId.toLowerCase()) || 
          c._id === parentId
      );
      
      if (!p) return "نامشخص (نیاز به ویرایش)";
      
      if (p.iconName === "main") return `گروه: ${p.faName}`;
      
      // جستجوی پدربزرگ
      const grandParent = categories.find(c => 
          c.slug === p.parent || 
          (c.slug && p.parent && c.slug.toLowerCase() === p.parent.toLowerCase()) || 
          c._id === p.parent
      );
      
      return `${grandParent ? grandParent.faName : ''} > ${p.faName}`;
  };

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
                برندها دارای صفحات فرانت‌اند اختصاصی هستند.
                ویرایش آن‌ها از این بخش امکان‌پذیر نیست.
              </p>
            </div>
            <a href="?section=brands_sec" className="shrink-0 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 transition-colors text-xs">
              مدیریت برندها <ArrowLeft size={16} />
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
              
              {isMainGroup ? (
                 <div className="grow text-xs text-gray-500 font-bold px-2 py-3">این یک دسته‌بندی سطح بالا است و نیازی به انتخاب والد ندارد.</div>
              ) : (
                <>
                  <select 
                    value={selectedMain} 
                    onChange={(e) => { setSelectedMain(e.target.value); setSelectedSub("all"); }} 
                    className="grow bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-amber-400 font-bold text-amber-600"
                  >
                    <option value="all">دسته‌بندی عمومی (مشترک)</option>
                    {categories.filter(c => c.iconName === 'main').map(c => <option key={c.slug} value={c.slug}>{c.faName}</option>)}
                  </select>
                  
                  {isSpecGroup && (
                    <select 
                      value={selectedSub} 
                      onChange={(e) => setSelectedSub(e.target.value)} 
                      disabled={selectedMain === "all"}
                      className="grow bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-800/50 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-400 font-bold text-blue-700 dark:text-blue-400 disabled:opacity-50"
                    >
                      <option value="all">{selectedMain === "all" ? "ابتدا گروه اصلی را انتخاب کنید" : "همه زیردسته‌ها"}</option>
                      {categories.filter(c => 
                        (c.parent === selectedMain || (c.parent && selectedMain && c.parent.toLowerCase() === selectedMain.toLowerCase())) 
                        && c.iconName !== 'main'
                      ).map(c => <option key={c.slug} value={c.slug}>{c.faName}</option>)}
                    </select>
                  )}
                </>
              )}
              
              <button 
                type="submit" 
                disabled={!newItemFaName.trim() || !newItemEnName.trim()} 
                className="shrink-0 bg-amber-400 hover:bg-amber-500 disabled:bg-amber-400/50 text-gray-950 px-8 py-3 rounded-xl font-bold transition-colors shadow-lg shadow-amber-400/20 flex items-center justify-center gap-2"
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
                  
                  <div className="hidden md:flex flex-col items-center w-56 justify-center">
                    <span className={`text-[10px] px-3 py-1 rounded-lg font-bold ${
                      getParentPathLabel(item.parent).includes('نیاز به ویرایش') 
                      ? 'bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400 border border-red-200 dark:border-red-800' 
                      : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300'
                    }`}>
                      {getParentPathLabel(item.parent)}
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