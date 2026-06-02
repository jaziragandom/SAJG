"use client";

import React, { useState, useEffect } from "react";
import { Plus, Search, Edit3, Trash2, X, CheckCircle2, Upload, FileText, Settings, Image as ImageIcon, LayoutTemplate, Eye, Bold, Italic, Link as LinkIcon, List, AlignLeft } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { MOCK_BLOG_POSTS } from "@/lib/mockData";

export default function BlogManager({ currentSection }: { currentSection: string }) {
  const [posts, setPosts] = useState<any[]>(MOCK_BLOG_POSTS);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  
  // خواندن وضعیت فعال مستقیماً از سایدبار اصلی سایت
  const activeFilter = currentSection === "blog_published" ? "published" : currentSection === "blog_draft" ? "draft" : "all";
  
  const [modalTab, setModalTab] = useState<"content" | "media" | "seo">("content");
  const [editItem, setEditItem] = useState<any>(null);
  
  const [formData, setFormData] = useState({
    faTitle: "", enTitle: "", slug: "", category: "health",
    excerpt: "", content: "", readTime: "۵ دقیقه", author: "تحریریه جزیره گندم",
    status: "published", coverImage: "", thumbnailImage: "",
    seoTitle: "", seoDesc: "", seoKeywords: ""
  });

  const customEase: [number, number, number, number] = [0.22, 1, 0.36, 1];

  const filteredPosts = posts.filter(p => {
    const matchesSearch = p.faTitle.includes(searchQuery) || p.enTitle.toLowerCase().includes(searchQuery.toLowerCase());
    if (activeFilter === "published") return matchesSearch && p.status === "published";
    if (activeFilter === "draft") return matchesSearch && p.status === "draft";
    return matchesSearch;
  });

  // --- سیستم کلیدهای میانبر (Shortcuts) ---
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isModalOpen) return;

      // فشردن دکمه Escape برای خروج از فرم
      if (e.key === "Escape") {
        e.preventDefault();
        setIsModalOpen(false);
      }
      
      // فشردن کلیدهای ترکیبی Ctrl + Enter برای ذخیره سریع مقاله
      if (e.ctrlKey && e.key === "Enter") {
        e.preventDefault();
        handleSave();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isModalOpen, formData, editItem]);

  const handleDelete = (id: number) => {
    setPosts(prev => prev.filter(p => p.id !== id));
  };

  const handleEditOpen = (item: any) => {
    setEditItem(item);
    setFormData({
      faTitle: item.faTitle, enTitle: item.enTitle, slug: item.slug, category: item.category,
      excerpt: item.excerpt, content: item.content, readTime: item.readTime, author: item.author,
      status: item.status, coverImage: item.coverImage, thumbnailImage: item.thumbnailImage,
      seoTitle: item.seo?.title || "", seoDesc: item.seo?.description || "", seoKeywords: item.seo?.keywords || ""
    });
    setModalTab("content");
    setIsModalOpen(true);
  };

  const handleAddOpen = () => {
    setEditItem(null);
    setFormData({
      faTitle: "", enTitle: "", slug: "", category: "health",
      excerpt: "", content: "", readTime: "۵ دقیقه", author: "تحریریه جزیره گندم",
      status: "published", coverImage: "", thumbnailImage: "",
      seoTitle: "", seoDesc: "", seoKeywords: ""
    });
    setModalTab("content");
    setIsModalOpen(true);
  };

  const handleSave = () => {
    const newPostData = {
      faTitle: formData.faTitle, enTitle: formData.enTitle, slug: formData.slug,
      category: formData.category, excerpt: formData.excerpt, content: formData.content,
      readTime: formData.readTime, author: formData.author, status: formData.status,
      coverImage: formData.coverImage || "https://placehold.co/1200x600/1e293b/ffffff?text=Cover",
      thumbnailImage: formData.thumbnailImage || "https://placehold.co/600x600/1e293b/ffffff?text=Thumb",
      seo: { title: formData.seoTitle, description: formData.seoDesc, keywords: formData.seoKeywords }
    };

    if (editItem) {
      setPosts(prev => prev.map(p => p.id === editItem.id ? { ...p, ...newPostData } : p));
    } else {
      const newPost = { id: Date.now(), date: new Date().toISOString().split('T')[0], ...newPostData };
      setPosts(prev => [newPost as any, ...prev]);
    }
    setIsModalOpen(false);
  };

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto flex flex-col gap-8" dir="rtl">
      
      {/* ❌ سایدبار داخلی کاملاً حذف شد تا فضا بازتر شود */}
      
      <div className="grow flex flex-col">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <div>
            <h1 className="text-2xl font-black text-gray-900 dark:text-white">
              {activeFilter === "published" ? "مقالات منتشر شده" : activeFilter === "draft" ? "پیش‌نویس‌ها" : "مدیریت کل تحریریه"}
            </h1>
            <p className="text-sm text-gray-500 mt-0.5">نوشتن مقاله جدید، مدیریت سئو و انتشار اخبار</p>
          </div>
          <button onClick={handleAddOpen} className="w-full sm:w-auto bg-amber-400 hover:bg-amber-500 text-gray-950 px-5 py-2.5 rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg transition-transform hover:scale-103" title="میانبر: باز کردن فرم">
            <Plus size={18} /> نگارش مقاله جدید
          </button>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-200/60 dark:border-gray-800/60 p-4 mb-6 flex items-center gap-3 shadow-xs shrink-0">
          <Search className="text-gray-400 ml-1" size={18} />
          <input type="text" placeholder="جستجو در عنوان مقالات..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="bg-transparent border-none outline-none text-sm font-bold w-full text-gray-900 dark:text-white placeholder:text-gray-400"/>
        </div>

        <div className="flex flex-col gap-4">
          <AnimatePresence mode="popLayout">
            {filteredPosts.map(post => (
              <motion.div key={post.id} layout initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }} transition={{ duration: 0.4, ease: customEase }} className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center gap-4 hover:border-amber-400 transition-colors shadow-sm">
                <div className="w-full sm:w-32 h-20 rounded-xl overflow-hidden shrink-0 bg-gray-100">
                  <img src={post.thumbnailImage} alt={post.faTitle} className="w-full h-full object-cover" />
                </div>
                <div className="grow flex flex-col gap-1 min-w-0 w-full">
                  <h3 className="font-black text-gray-900 dark:text-white truncate">{post.faTitle}</h3>
                  <div className="flex items-center gap-3 text-[11px] font-bold text-gray-500 mt-1">
                    <span className={post.status === 'published' ? 'text-emerald-500' : 'text-amber-500'}>{post.status === 'published' ? '● منتشر شده' : '● پیش‌نویس'}</span>
                    <span>|</span><span>{post.date}</span><span>|</span><span>{post.category}</span>
                  </div>
                </div>
                <div className="flex gap-2 w-full sm:w-auto mt-4 sm:mt-0 justify-end shrink-0">
                  <button onClick={() => handleEditOpen(post)} className="p-2.5 bg-gray-50 dark:bg-gray-800 text-gray-400 hover:text-amber-500 hover:bg-amber-400/10 rounded-xl transition-colors"><Edit3 size={16} /></button>
                  <button onClick={() => handleDelete(post.id)} className="p-2.5 bg-gray-50 dark:bg-gray-800 text-gray-400 hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-colors"><Trash2 size={16} /></button>
                </div>
              </motion.div>
            ))}
            {filteredPosts.length === 0 && (
              <div className="py-12 text-center text-gray-400 text-sm font-bold border-2 border-dashed border-gray-200 dark:border-gray-800 rounded-3xl">مقاله‌ای در این بخش یافت نشد.</div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsModalOpen(false)} className="absolute inset-0 bg-gray-950/80 backdrop-blur-md" />
            <motion.div initial={{ opacity: 0, scale: 0.98, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.98, y: 20 }} transition={{ duration: 0.5, ease: customEase }} className="relative bg-white dark:bg-gray-950 w-full max-w-5xl rounded-[2rem] shadow-2xl flex flex-col h-[90vh] md:h-[85vh] overflow-hidden border border-gray-200 dark:border-gray-800 z-10">
              
              <div className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/50 shrink-0">
                <div className="flex gap-2 overflow-x-auto custom-scrollbar pr-2">
                  <button onClick={() => setModalTab("content")} className={`px-4 py-2 rounded-lg text-xs font-black transition-colors flex items-center gap-2 ${modalTab === "content" ? "bg-amber-400 text-gray-950" : "text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800"}`}><FileText size={16}/> محتوای مقاله</button>
                  <button onClick={() => setModalTab("media")} className={`px-4 py-2 rounded-lg text-xs font-black transition-colors flex items-center gap-2 ${modalTab === "media" ? "bg-amber-400 text-gray-950" : "text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800"}`}><ImageIcon size={16}/> تصاویر کاور</button>
                  <button onClick={() => setModalTab("seo")} className={`px-4 py-2 rounded-lg text-xs font-black transition-colors flex items-center gap-2 ${modalTab === "seo" ? "bg-amber-400 text-gray-950" : "text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800"}`}><Settings size={16}/> سئو و تنظیمات</button>
                </div>
                <div className="flex items-center gap-2">
                   <span className="hidden md:inline-block text-[10px] text-gray-400 font-bold bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded-md">Ctrl + Enter برای ذخیره</span>
                   <button onClick={() => setIsModalOpen(false)} className="p-2 bg-gray-100 dark:bg-gray-800 rounded-full hover:text-red-500 transition-colors shrink-0" title="بستن (Esc)"><X size={18}/></button>
                </div>
              </div>
              
              <div className="grow overflow-y-auto p-6 custom-scrollbar bg-white dark:bg-gray-950">
                {modalTab === "content" && (
                  <div className="flex flex-col gap-6">
                    <input autoFocus type="text" value={formData.faTitle} onChange={e => setFormData({...formData, faTitle: e.target.value})} className="w-full text-2xl md:text-4xl font-black text-gray-900 dark:text-white bg-transparent border-none outline-none placeholder:text-gray-300 dark:placeholder:text-gray-800" placeholder="عنوان مقاله را اینجا بنویسید..."/>
                    <input type="text" value={formData.excerpt} onChange={e => setFormData({...formData, excerpt: e.target.value})} className="w-full text-sm font-bold text-gray-500 bg-transparent border-none outline-none placeholder:text-gray-300 dark:placeholder:text-gray-700" placeholder="چکیده کوتاه مقاله (۱۵۰ کاراکتر)..."/>
                    
                    <div className="border border-gray-200 dark:border-gray-800 rounded-2xl overflow-hidden flex flex-col mt-4">
                      <div className="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 p-2 flex items-center gap-1 flex-wrap">
                        <button className="p-2 text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-800 rounded"><Bold size={16}/></button>
                        <button className="p-2 text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-800 rounded"><Italic size={16}/></button>
                        <div className="w-px h-6 bg-gray-300 dark:bg-gray-700 mx-1"></div>
                        <button className="p-2 text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-800 rounded"><LinkIcon size={16}/></button>
                        <button className="p-2 text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-800 rounded"><List size={16}/></button>
                        <button className="p-2 text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-800 rounded"><AlignLeft size={16}/></button>
                      </div>
                      <textarea value={formData.content} onChange={e => setFormData({...formData, content: e.target.value})} className="w-full h-96 p-4 bg-transparent resize-none outline-none text-gray-800 dark:text-gray-200 leading-relaxed font-medium" placeholder="متن اصلی مقاله را شروع کنید..."></textarea>
                    </div>
                  </div>
                )}

                {modalTab === "media" && (
                  <div className="flex flex-col gap-8">
                    <div className="flex flex-col gap-2">
                      <label className="text-sm font-black text-gray-900 dark:text-white">تصویر کاور هدر (ابعاد ۱۶:۹)</label>
                      <div className="border-2 border-dashed border-gray-200 dark:border-gray-800 rounded-2xl h-64 flex flex-col items-center justify-center gap-3 hover:border-amber-400 transition-colors cursor-pointer bg-gray-50 dark:bg-gray-900/50">
                        <Upload size={40} className="text-gray-400" />
                        <span className="text-sm font-bold text-gray-500">آپلود عکس کاور افقی</span>
                      </div>
                    </div>
                    <div className="flex flex-col gap-2">
                      <label className="text-sm font-black text-gray-900 dark:text-white">تصویر بندانگشتی (Thumbnail)</label>
                      <div className="border-2 border-dashed border-gray-200 dark:border-gray-800 rounded-2xl h-48 w-48 flex flex-col items-center justify-center gap-3 hover:border-amber-400 transition-colors cursor-pointer bg-gray-50 dark:bg-gray-900/50">
                        <Upload size={32} className="text-gray-400" />
                        <span className="text-xs font-bold text-gray-500">آپلود عکس مربعی</span>
                      </div>
                    </div>
                  </div>
                )}

                {modalTab === "seo" && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="flex flex-col gap-2"><label className="text-xs font-black text-gray-400">نامک (URL Slug)</label><input type="text" value={formData.slug} onChange={e => setFormData({...formData, slug: e.target.value})} className="border border-gray-200 dark:border-gray-800 rounded-xl p-3 bg-transparent text-sm font-bold outline-none focus:border-amber-400 text-left" dir="ltr" placeholder="how-to-use-energy-drinks"/></div>
                    <div className="flex flex-col gap-2"><label className="text-xs font-black text-gray-400">دسته‌بندی محتوا</label><select value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} className="border border-gray-200 dark:border-gray-800 rounded-xl p-3 bg-white dark:bg-gray-900 text-sm font-bold outline-none focus:border-amber-400"><option value="health">سبک زندگی و سلامت</option><option value="news">اخبار جزیره گندم</option><option value="products">معرفی محصولات</option></select></div>
                    <div className="flex flex-col gap-2"><label className="text-xs font-black text-gray-400">نام نویسنده</label><input type="text" value={formData.author} onChange={e => setFormData({...formData, author: e.target.value})} className="border border-gray-200 dark:border-gray-800 rounded-xl p-3 bg-transparent text-sm font-bold outline-none focus:border-amber-400" /></div>
                    <div className="flex flex-col gap-2"><label className="text-xs font-black text-gray-400">وضعیت انتشار</label><select value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})} className="border border-gray-200 dark:border-gray-800 rounded-xl p-3 bg-white dark:bg-gray-900 text-sm font-bold outline-none focus:border-amber-400"><option value="published">منتشر و عمومی شود</option><option value="draft">ذخیره به عنوان پیش‌نویس</option></select></div>
                    
                    <div className="col-span-1 md:col-span-2 border-t border-gray-100 dark:border-gray-800 pt-6 mt-2 flex flex-col gap-6">
                      <h4 className="font-black text-gray-900 dark:text-white flex items-center gap-2"><Search size={18} className="text-amber-500"/> تنظیمات سئو (موتورهای جستجو)</h4>
                      <div className="flex flex-col gap-2"><label className="text-xs font-black text-gray-400">تایتل سئو (SEO Title)</label><input type="text" value={formData.seoTitle} onChange={e => setFormData({...formData, seoTitle: e.target.value})} className="border border-gray-200 dark:border-gray-800 rounded-xl p-3 bg-transparent text-sm font-bold outline-none focus:border-amber-400" /></div>
                      <div className="flex flex-col gap-2"><label className="text-xs font-black text-gray-400">توضیحات متا (Meta Description)</label><textarea value={formData.seoDesc} onChange={e => setFormData({...formData, seoDesc: e.target.value})} className="border border-gray-200 dark:border-gray-800 rounded-xl p-3 bg-transparent text-sm font-bold outline-none focus:border-amber-400 h-24 resize-none"></textarea></div>
                      <div className="flex flex-col gap-2"><label className="text-xs font-black text-gray-400">کلمات کلیدی (با کاما جدا کنید)</label><input type="text" value={formData.seoKeywords} onChange={e => setFormData({...formData, seoKeywords: e.target.value})} className="border border-gray-200 dark:border-gray-800 rounded-xl p-3 bg-transparent text-sm font-bold outline-none focus:border-amber-400" /></div>
                    </div>
                  </div>
                )}
              </div>
              
              <div className="p-4 md:p-6 border-t border-gray-100 dark:border-gray-800 flex justify-between items-center bg-gray-50/50 dark:bg-gray-900/50 shrink-0">
                <button className="text-gray-500 hover:text-gray-900 dark:hover:text-white font-bold text-xs flex items-center gap-1.5 transition-colors"><Eye size={16}/> پیش‌نمایش زنده</button>
                <button onClick={handleSave} className="bg-amber-400 hover:bg-amber-500 text-gray-950 px-6 py-3 rounded-xl font-black text-xs flex items-center gap-2 shadow-md transition-all"><CheckCircle2 size={16}/> ذخیره مقاله (Ctrl+Enter)</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}