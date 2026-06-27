"use client";

import React, { useState, useEffect } from "react";
import { Plus, Search, Edit3, Trash2, Image as ImageIcon, GripVertical, X, Upload, CheckCircle2, Wand2, Loader2, Star } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAdminShortcuts } from "../hooks/useAdminShortcuts";
import { getProducts, createProduct, updateProduct, deleteProduct } from "@/actions/product";
import { getBrands } from "@/actions/brand";
import { getCategories } from "@/actions/category";

export default function ProductsManager() {
  const [products, setProducts] = useState<any[]>([]);
  const [brandsList, setBrandsList] = useState<any[]>([]);
  const [categoriesList, setCategoriesList] = useState<any[]>([]); 
  
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("basic");
  const [editMode, setEditMode] = useState(false);
  const [draggedItemIndex, setDraggedItemIndex] = useState<number | null>(null);
  const [translatingField, setTranslatingField] = useState<string | null>(null);

  const [formData, setFormData] = useState({ 
    _id: "", brandId: "", slug: "", faTitle: "", enTitle: "", 
    mainCat: "", category: "", 
    faDesc: "", enDesc: "", 
    flavor: "", weight: "", packaging: "", 
    faShelfLife: "", enShelfLife: "", faIngredients: "", enIngredients: "",
    visibilityStatus: "published", isFeatured: false, mainImage: ""
  });

  const tabList = ["basic", "specs", "media"];

  const fetchData = async () => {
    setIsLoading(true);
    const [productsRes, brandsRes, catsRes] = await Promise.all([getProducts(), getBrands(), getCategories()]);
    if (productsRes.success) setProducts(productsRes.data);
    if (brandsRes.success) setBrandsList(brandsRes.data);
    if (catsRes?.success) setCategoriesList(catsRes.data);
    setIsLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  useAdminShortcuts({
    activeTab: activeTab,
    setActiveTab: setActiveTab,
    tabsList: isModalOpen ? tabList : [], 
    closeModal: () => setIsModalOpen(false),
    onAddNew: () => { if (!isModalOpen) handleAddNew(); }
  });

  const mainCategories = categoriesList.filter(c => c.iconName === 'main');
  const subCategories = categoriesList.filter(c => c.parent === formData.mainCat && c.iconName !== 'main');
  
  // فیلتر هوشمند مشخصات تخصصی بر اساس وابستگی سلسله مراتبی
  const filterSpecs = (iconName: string) => {
    return categoriesList.filter(c => 
      c.iconName === iconName && 
      ['all', formData.mainCat, formData.category].includes(c.parent)
    );
  };

  const packagingOptions = filterSpecs('packaging');
  const flavorOptions = filterSpecs('flavor');
  const weightOptions = filterSpecs('weight');
  const statusOptions = categoriesList.filter(c => c.iconName === 'status'); // دریافت داینامیک لیبل‌های وضعیت

  const findCatSlug = (faNameOrSlug: string) => {
    if (!faNameOrSlug) return "";
    const c = categoriesList.find(x => x.faName === faNameOrSlug || x.slug === faNameOrSlug || x.enName === faNameOrSlug);
    return c ? c.slug : faNameOrSlug;
  };

  const handleEdit = (product: any) => {
    setEditMode(true);
    setFormData({ 
      _id: product._id, 
      brandId: product.brandId?._id || product.brandId || "",
      slug: product.slug || "",
      faTitle: product.faTitle || "", 
      enTitle: product.enTitle || "", 
      mainCat: product.mainCat || "", 
      category: product.category || "", 
      visibilityStatus: product.status || "published", 
      isFeatured: product.isFeatured || false,
      faDesc: product.faDesc || "", 
      enDesc: product.enDesc || "", 
      flavor: findCatSlug(product.specs?.flavorFa || ""),
      weight: findCatSlug(product.specs?.weight || ""),
      packaging: findCatSlug(product.specs?.packagingFa || ""),
      faShelfLife: product.specs?.shelfLifeFa || "", 
      enShelfLife: product.specs?.shelfLifeEn || "", 
      faIngredients: product.specs?.ingredientsFa || "", 
      enIngredients: product.specs?.ingredientsEn || "",
      mainImage: product.images?.main || ""
    });
    setActiveTab("basic");
    setIsModalOpen(true);
  };

  const handleAddNew = () => {
    setEditMode(false);
    const firstMainCat = mainCategories.length > 0 ? mainCategories[0].slug : "";
    setFormData({ 
      _id: "", brandId: brandsList.length > 0 ? brandsList[0]._id : "", slug: "", faTitle: "", enTitle: "", 
      mainCat: firstMainCat, category: "",
      faDesc: "", enDesc: "", flavor: "", weight: "", packaging: "",
      faShelfLife: "", enShelfLife: "", faIngredients: "", enIngredients: "",
      visibilityStatus: "published", isFeatured: false, mainImage: ""
    });
    setActiveTab("basic");
    setIsModalOpen(true);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.faTitle.trim() || !formData.enTitle.trim() || !formData.slug.trim() || !formData.brandId || !formData.mainCat || !formData.category) {
      alert("پر کردن نام‌ها، اسلاگ، انتخاب برند، گروه اصلی و زیردسته الزامی است.");
      return;
    }

    const selFlavor = categoriesList.find(c => c.slug === formData.flavor);
    const selPack = categoriesList.find(c => c.slug === formData.packaging);
    const selWeight = categoriesList.find(c => c.slug === formData.weight);

    const payload = {
      brandId: formData.brandId,
      faTitle: formData.faTitle,
      enTitle: formData.enTitle,
      slug: formData.slug.toLowerCase().replace(/\s+/g, '-'),
      mainCat: formData.mainCat,
      category: formData.category,
      status: formData.visibilityStatus,
      isFeatured: formData.isFeatured,
      faDesc: formData.faDesc,
      enDesc: formData.enDesc,
      specs: {
        flavorFa: selFlavor ? selFlavor.faName : formData.flavor,
        flavorEn: selFlavor ? selFlavor.enName : formData.flavor,
        weight: selWeight ? selWeight.faName : formData.weight,
        packagingFa: selPack ? selPack.faName : formData.packaging,
        packagingEn: selPack ? selPack.enName : formData.packaging,
        shelfLifeFa: formData.faShelfLife,
        shelfLifeEn: formData.enShelfLife,
        ingredientsFa: formData.faIngredients,
        ingredientsEn: formData.enIngredients,
      },
      images: { main: formData.mainImage || "https://placehold.co/400x400/png", gallery: [] }
    };

    if (editMode && formData._id) {
      const res = await updateProduct(formData._id, payload);
      if (res.success) {
        setIsModalOpen(false);
        fetchData();
      } else alert(res.error);
    } else {
      const res = await createProduct(payload);
      if (res.success) {
        setIsModalOpen(false);
        fetchData();
      } else alert(res.error);
    }
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
      alert("خطا در سیستم ترجمه.");
    } finally {
      setTranslatingField(null);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("آیا از حذف این محصول اطمینان دارید؟")) {
      const res = await deleteProduct(id);
      if (res.success) {
        fetchData();
      } else {
        alert(res.error || "خطا در حذف محصول");
      }
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

  const filteredProducts = products.filter(p => 
    (p.faTitle && p.faTitle.includes(searchQuery)) || 
    (p.enTitle && p.enTitle.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const getCatName = (slug: string) => {
    const cat = categoriesList.find(c => c.slug === slug);
    return cat ? cat.faName : "نامشخص";
  };

  return (
    <div className="flex flex-col gap-6">
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900 dark:text-white flex items-center gap-3">
            لیست محصولات
          </h1>
          <p className="text-xs text-gray-500 mt-2 font-medium flex items-center gap-2">
            داده‌ها و وابستگی‌های سلسله‌مراتبی کاملاً به Category Manager متصل است.
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
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
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
                <th className="px-6 py-4">دسته‌بندی‌ها</th>
                <th className="px-6 py-4">وضعیت</th>
                <th className="px-6 py-4">عملیات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800 relative">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="text-center py-12">
                    <Loader2 className="animate-spin text-amber-500 mx-auto" size={30} />
                  </td>
                </tr>
              ) : filteredProducts.map((product, index) => (
                <tr 
                  key={product._id} 
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
                    <div className="w-12 h-12 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center text-gray-400 overflow-hidden">
                      {product.images?.main ? (
                         <img src={product.images.main} alt="Product" className="w-full h-full object-cover" />
                      ) : (
                         <ImageIcon size={20} />
                      )}
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
                  <td className="px-6 py-4 text-gray-600 dark:text-gray-300 font-medium">{product.brandId?.faName || "نامشخص"}</td>
                  
                  <td className="px-6 py-4">
                    <div className="flex flex-col gap-1">
                      <span className="bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400 px-2 py-0.5 rounded text-[10px] w-fit">
                        گروه: {getCatName(product.mainCat)}
                      </span>
                      <span className="bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300 px-2 py-0.5 rounded text-[10px] w-fit">
                        دسته: {getCatName(product.category)}
                      </span>
                    </div>
                  </td>
                  
                  <td className="px-6 py-4">
                    <span className="px-3 py-1 text-xs font-bold rounded-md bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/50 whitespace-nowrap">
                      {getCatName(product.status)}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <button onClick={() => handleEdit(product)} className="text-gray-400 hover:text-amber-500 transition-colors" title="ویرایش">
                        <Edit3 size={18} />
                      </button>
                      <button onClick={() => handleDelete(String(product._id))} className="text-gray-400 hover:text-red-500 transition-colors" title="حذف">
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {!isLoading && filteredProducts.length === 0 && (
                <tr>
                  <td colSpan={7} className="text-center py-8 text-gray-400 font-bold">هیچ محصولی یافت نشد.</td>
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
                    {tab === "basic" ? "اطلاعات پایه" : tab === "specs" ? "مشخصات تخصصی" : "رسانه و عکس"}
                  </button>
                ))}
              </div>

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

                      <div className="flex flex-col gap-2 md:col-span-2">
                        <label className="text-xs font-bold text-gray-600 dark:text-gray-400">اسلاگ URL (شناسه لینک)</label>
                        <input 
                          type="text" 
                          dir="ltr" 
                          value={formData.slug}
                          onChange={(e) => setFormData({...formData, slug: e.target.value})}
                          placeholder="max-energy-250" 
                          className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl py-3 px-4 text-sm font-mono focus:outline-none focus:border-amber-400" 
                        />
                      </div>
                 
                      <div className="flex flex-col gap-2">
                        <label className="text-xs font-bold text-gray-600 dark:text-gray-400">گروه اصلی محصول</label>
                        <select 
                          value={formData.mainCat}
                          // وقتی گروه اصلی عوض شد، زیردسته‌ها و مشخصات قبلی را ریست می‌کنیم تا باگ نخوریم
                          onChange={(e) => setFormData({...formData, mainCat: e.target.value, category: "", packaging: "", flavor: "", weight: ""})}
                          className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-amber-400 font-bold text-amber-600"
                        >
                          <option value="">انتخاب گروه اصلی...</option>
                          {mainCategories.map(cat => (
                            <option key={cat.slug} value={cat.slug}>{cat.faName}</option>
                          ))}
                        </select>
                      </div>

                      <div className="flex flex-col gap-2">
                        <label className="text-xs font-bold text-blue-600 dark:text-blue-400">زیردسته محصول (نوع)</label>
                        <select 
                          value={formData.category}
                          // وقتی زیردسته عوض شد، مشخصات مرتبط را هم ریست می‌کنیم
                          onChange={(e) => setFormData({...formData, category: e.target.value, packaging: "", flavor: "", weight: ""})}
                          disabled={!formData.mainCat}
                          className="bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-800/50 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-400 font-bold text-blue-700 dark:text-blue-400 disabled:opacity-50"
                        >
                          <option value="">{formData.mainCat ? "انتخاب زیردسته..." : "ابتدا گروه اصلی را انتخاب کنید"}</option>
                          {subCategories.map(cat => (
                            <option key={cat.slug} value={cat.slug}>{cat.faName}</option>
                          ))}
                        </select>
                      </div>

                      <div className="flex flex-col gap-2">
                        <label className="text-xs font-bold text-gray-600 dark:text-gray-400">انتخاب برند</label>
                        <select 
                           value={formData.brandId}
                           onChange={(e) => setFormData({...formData, brandId: e.target.value})}
                           className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-amber-400"
                        >
                          <option value="">انتخاب برند...</option>
                          {brandsList.map(b => (
                            <option key={b._id} value={b._id}>{b.faName}</option>
                          ))}
                        </select>
                      </div>

                      <div className="flex flex-col gap-2">
                        <label className="text-xs font-bold text-gray-600 dark:text-gray-400">وضعیت نمایش در سایت</label>
                        <select 
                          value={formData.visibilityStatus}
                          onChange={(e) => setFormData({...formData, visibilityStatus: e.target.value})}
                          className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-amber-400 font-medium"
                        >
                          <option value="">انتخاب وضعیت...</option>
                          {statusOptions.map(cat => (
                            <option key={cat.slug} value={cat.slug}>{cat.faName}</option>
                          ))}
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

                      <div className="flex flex-col gap-2 md:col-span-2">
                        <label className="text-xs font-bold text-gray-600 dark:text-gray-400">توضیحات کوتاه (فارسی)</label>
                        <textarea rows={2} value={formData.faDesc} onChange={e => setFormData({...formData, faDesc: e.target.value})} placeholder="توضیح مختصر محصول..." className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-amber-400 resize-none"></textarea>
                      </div>
                      <div className="flex flex-col gap-2 md:col-span-2">
                        <label className="text-xs font-bold text-gray-600 dark:text-gray-400">توضیحات کوتاه (انگلیسی)</label>
                        <div className="relative">
                          <textarea rows={2} dir="ltr" value={formData.enDesc} onChange={e => setFormData({...formData, enDesc: e.target.value})} placeholder="Short description..." className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl py-3 pr-4 pl-12 text-sm font-mono focus:outline-none focus:border-amber-400 resize-none"></textarea>
                          <button type="button" onClick={() => handleAutoTranslate(formData.faDesc, 'enDesc')} disabled={translatingField === 'enDesc' || !formData.faDesc} className="absolute left-2 top-3 p-2 bg-amber-400/10 text-amber-600 hover:bg-amber-400 hover:text-gray-950 disabled:opacity-50 rounded-lg transition-colors">
                            {translatingField === 'enDesc' ? <Loader2 size={16} className="animate-spin" /> : <Wand2 size={16} />}
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {activeTab === "specs" && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in duration-300">
                      
                      {/* دراپ‌داون‌های هوشمند که فقط گزینه‌های مرتبط با زیردسته یا گروه اصلی را نشان می‌دهند */}
                      <div className="flex flex-col gap-2">
                        <label className="text-xs font-bold text-gray-600 dark:text-gray-400">نوع بسته‌بندی</label>
                        <select value={formData.packaging} onChange={(e) => setFormData({...formData, packaging: e.target.value})} className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-amber-400">
                          <option value="">{formData.category ? "انتخاب بسته‌بندی..." : "ابتدا زیردسته را انتخاب کنید"}</option>
                          {packagingOptions.map(cat => <option key={cat.slug} value={cat.slug}>{cat.faName}</option>)}
                        </select>
                      </div>

                      <div className="flex flex-col gap-2">
                        <label className="text-xs font-bold text-gray-600 dark:text-gray-400">طعم و عصاره</label>
                        <select value={formData.flavor} onChange={(e) => setFormData({...formData, flavor: e.target.value})} className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-amber-400">
                          <option value="">بدون طعم / انتخاب کنید...</option>
                          {flavorOptions.map(cat => <option key={cat.slug} value={cat.slug}>{cat.faName}</option>)}
                        </select>
                      </div>

                      <div className="flex flex-col gap-2">
                        <label className="text-xs font-bold text-gray-600 dark:text-gray-400">حجم / وزن</label>
                        <select value={formData.weight} onChange={(e) => setFormData({...formData, weight: e.target.value})} className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-amber-400">
                          <option value="">انتخاب کنید...</option>
                          {weightOptions.map(cat => <option key={cat.slug} value={cat.slug}>{cat.faName}</option>)}
                        </select>
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
                        <label className="text-sm font-bold text-gray-900 dark:text-white">تصویر اصلی محصول</label>
                        {formData.mainImage && <img src={formData.mainImage} className="h-32 object-contain mx-auto" alt="Product" />}
                        <label className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-2xl h-48 flex flex-col items-center justify-center gap-3 bg-gray-50 hover:bg-gray-100 dark:bg-gray-800/50 dark:hover:bg-gray-800 transition-colors cursor-pointer group">
                          <input type="file" accept="image/png, image/jpeg" className="hidden" onChange={async(e) => { 
                            const f = e.target.files?.[0];
                            if(!f) return; 
                            const fd = new FormData(); 
                            fd.append('file', f); 
                            const r = await fetch('/api/upload', {method:'POST',body:fd});
                            const d = await r.json(); 
                            if(d.success) setFormData({...formData, mainImage: d.url});
                          }} />
                           <div className="w-12 h-12 bg-white dark:bg-gray-900 rounded-full flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                            <Upload size={20} className="text-amber-500" />
                          </div>
                          <span className="text-xs font-bold text-gray-500">کلیک برای آپلود عکس محصول</span>
                        </label>
                      </div>

                      <div className="flex flex-col gap-3">
                        <label className="text-sm font-bold text-gray-900 dark:text-white">جدول ارزش غذایی</label>
                        <div className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-2xl h-48 flex flex-col items-center justify-center gap-3 bg-gray-50 hover:bg-gray-100 dark:bg-gray-800/50 dark:hover:bg-gray-800 transition-colors cursor-pointer group">
                           <div className="w-12 h-12 bg-white dark:bg-gray-900 rounded-full flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                            <Upload size={20} className="text-gray-400" />
                          </div>
                          <span className="text-xs font-bold text-gray-500">آپلود لیبل استاندارد غذایی (بزودی)</span>
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