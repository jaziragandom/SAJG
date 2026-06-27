"use client";

import React, { useState, useEffect } from "react";
import { Plus, Search, Edit3, Trash2, X, CheckCircle2, Upload, FileText, Settings, Image as ImageIcon, LayoutTemplate, Eye, Bold, Italic, Link as LinkIcon, List, AlignLeft, Loader2, Wand2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { getBlogs, createBlog, updateBlog, deleteBlog } from "@/actions/blog";

export default function BlogManager({ currentSection }: { currentSection: string }) {
  const [blogs, setBlogs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [translatingField, setTranslatingField] = useState<string | null>(null);
  
  const activeFilter = currentSection === "blog_published" ? "published" : currentSection === "blog_draft" ? "draft" : "all";
  
  const [modalTab, setModalTab] = useState<"content" | "media" | "seo">("content");
  const [editMode, setEditMode] = useState(false);
  
  const [formData, setFormData] = useState({
    _id: "", faTitle: "", enTitle: "", slug: "", category: "health",
    excerpt: "", content: "", readTime: "۵ دقیقه", author: "تحریریه جزیره گندم",
    status: "published", coverImage: "", thumbnailImage: "",
    seoTitle: "", seoDesc: "", seoKeywords: ""
  });

  const fetchBlogsData = async () => {
    setIsLoading(true);
    const res = await getBlogs();
    if (res.success) setBlogs(res.data);
    setIsLoading(false);
  };

  useEffect(() => {
    fetchBlogsData();
  }, []);

  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!formData.faTitle.trim() || !formData.enTitle.trim() || !formData.slug.trim()) {
      alert("پر کردن عنوان (فارسی و انگلیسی) و اسلاگ الزامی است.");
      return;
    }

    const payload = {
      faTitle: formData.faTitle,
      enTitle: formData.enTitle,
      slug: formData.slug.toLowerCase().replace(/\s+/g, '-'),
      category: formData.category,
      excerpt: formData.excerpt,
      content: formData.content,
      readTime: formData.readTime,
      author: formData.author,
      status: formData.status,
      coverImage: formData.coverImage || "https://placehold.co/1200x600/png",
      thumbnailImage: formData.thumbnailImage || "https://placehold.co/600x600/png",
      seo: {
        title: formData.seoTitle,
        description: formData.seoDesc,
        keywords: formData.seoKeywords
      }
    };

    if (editMode && formData._id) {
      const res = await updateBlog(formData._id, payload);
      if (res.success) {
        setIsModalOpen(false);
        fetchBlogsData();
      } else alert(res.error);
    } else {
      const res = await createBlog(payload);
      if (res.success) {
        setIsModalOpen(false);
        fetchBlogsData();
      } else alert(res.error);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("آیا از حذف این مقاله اطمینان دارید؟")) {
      const res = await deleteBlog(id);
      if (res.success) fetchBlogsData();
    }
  };

  const handleEdit = (blog: any) => {
    setFormData({
      _id: blog._id,
      faTitle: blog.faTitle || "",
      enTitle: blog.enTitle || "",
      slug: blog.slug || "",
      category: blog.category || "health",
      excerpt: blog.excerpt || "",
      content: blog.content || "",
      readTime: blog.readTime || "۵ دقیقه",
      author: blog.author || "تحریریه جزیره گندم",
      status: blog.status || "draft",
      coverImage: blog.coverImage || "",
      thumbnailImage: blog.thumbnailImage || "",
      seoTitle: blog.seo?.title || "",
      seoDesc: blog.seo?.description || "",
      seoKeywords: blog.seo?.keywords || ""
    });
    setEditMode(true);
    setModalTab("content");
    setIsModalOpen(true);
  };

  const handleAddNew = () => {
    setFormData({
      _id: "", faTitle: "", enTitle: "", slug: "", category: "health",
      excerpt: "", content: "", readTime: "۵ دقیقه", author: "تحریریه جزیره گندم",
      status: "draft", coverImage: "", thumbnailImage: "",
      seoTitle: "", seoDesc: "", seoKeywords: ""
    });
    setEditMode(false);
    setModalTab("content");
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
      alert("خطا در سیستم ترجمه.");
    } finally {
      setTranslatingField(null);
    }
  };

  const filteredBlogs = blogs.filter(post => {
    const matchesSearch = post.faTitle?.includes(searchQuery) || post.enTitle?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = activeFilter === "all" ? true : post.status === activeFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white dark:bg-gray-900 p-6 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm">
        <div>
          <h2 className="text-xl font-black text-gray-900 dark:text-white flex items-center gap-3">
            <FileText className="text-amber-500" /> مدیریت مجله و مقالات
          </h2>
          <p className="text-sm text-gray-500 mt-2 font-medium">
            {activeFilter === "all" ? "تمام مقالات سایت" : activeFilter === "published" ? "مقالات منتشر شده و فعال" : "پیش‌نویس‌ها و مقالات در حال نگارش"}
          </p>
        </div>
        <button onClick={handleAddNew} className="bg-amber-400 hover:bg-amber-500 text-gray-950 px-6 py-3 rounded-xl font-bold flex items-center gap-2 transition-all shadow-lg hover:scale-105 active:scale-95">
          <Plus size={20} />
          <span>نگارش مقاله جدید</span>
        </button>
      </div>

      <div className="relative">
        <Search size={20} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" />
        <input 
          type="text" 
          placeholder="جستجو در عنوان مقالات..." 
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          className="w-full bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl py-4 pr-12 pl-4 text-sm focus:outline-none focus:border-amber-400 transition-colors shadow-sm"
        />
      </div>

      <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-3xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-right">
            <thead className="bg-gray-50/50 dark:bg-gray-800/50 text-gray-500 dark:text-gray-400 font-bold text-xs border-b border-gray-100 dark:border-gray-800">
              <tr>
                <th className="px-6 py-4">کاور</th>
                <th className="px-6 py-4 min-w-62.5">عنوان مقاله (فارسی / انگلیسی)</th>
                <th className="px-6 py-4">دسته‌بندی</th>
                <th className="px-6 py-4">وضعیت</th>
                <th className="px-6 py-4">تاریخ انتشار</th>
                <th className="px-6 py-4">عملیات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-gray-800/50">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="text-center py-12">
                    <Loader2 className="animate-spin text-amber-500 mx-auto" size={30} />
                  </td>
                </tr>
              ) : filteredBlogs.map((post) => (
                <tr key={post._id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/20 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="w-16 h-12 bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
                      {post.thumbnailImage ? <img src={post.thumbnailImage} alt="Cover" className="w-full h-full object-cover" /> : <ImageIcon size={20} className="m-auto mt-3 text-gray-400" />}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-bold text-gray-900 dark:text-white line-clamp-1">{post.faTitle}</div>
                    <div className="text-xs text-gray-500 font-mono mt-1 line-clamp-1">{post.enTitle}</div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 px-3 py-1 rounded-md text-xs font-bold">
                      {post.category === 'health' ? 'سلامت' : post.category === 'news' ? 'اخبار' : 'محصولات'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 text-xs font-bold rounded-md ${post.status === "published" ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`}>
                      {post.status === "published" ? "منتشر شده" : "پیش‌نویس"}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-500 font-medium text-xs">
                     {new Date(post.createdAt || Date.now()).toLocaleDateString('fa-IR')}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                      <button onClick={() => handleEdit(post)} className="p-2 bg-gray-50 dark:bg-gray-800 text-gray-400 hover:text-amber-500 hover:bg-amber-50 rounded-xl transition-colors"><Edit3 size={16} /></button>
                      <button onClick={() => handleDelete(post._id)} className="p-2 bg-gray-50 dark:bg-gray-800 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors"><Trash2 size={16} /></button>
                    </div>
                  </td>
                </tr>
              ))}
              {!isLoading && filteredBlogs.length === 0 && (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-gray-400 font-bold">هیچ مقاله‌ای در این بخش یافت نشد.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-gray-950/80 backdrop-blur-sm" onClick={() => setIsModalOpen(false)} />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="relative w-full max-w-5xl bg-white dark:bg-gray-950 border border-gray-100 dark:border-gray-800 rounded-[2rem] shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
              
              <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/50 shrink-0">
                <div>
                  <h3 className="text-lg font-black text-gray-900 dark:text-white">{editMode ? "ویرایش مقاله" : "نگارش مقاله جدید"}</h3>
                  <p className="text-xs text-gray-500 font-medium mt-1">تکمیل تمامی فیلدهای ستاره‌دار الزامی است.</p>
                </div>
                <button type="button" onClick={() => setIsModalOpen(false)} className="p-2 text-gray-400 hover:text-red-500 bg-white dark:bg-gray-800 hover:bg-red-50 rounded-full transition-colors border border-gray-200 dark:border-gray-700"><X size={20} /></button>
              </div>

              <div className="flex px-6 pt-4 gap-2 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/50 overflow-x-auto custom-scrollbar shrink-0">
                <button onClick={() => setModalTab("content")} className={`px-5 py-3 text-sm font-bold border-b-2 transition-colors whitespace-nowrap flex items-center gap-2 ${modalTab === "content" ? "border-amber-400 text-amber-500" : "border-transparent text-gray-500 hover:text-gray-900 dark:hover:text-gray-300"}`}><LayoutTemplate size={16}/> محتوای اصلی</button>
                <button onClick={() => setModalTab("media")} className={`px-5 py-3 text-sm font-bold border-b-2 transition-colors whitespace-nowrap flex items-center gap-2 ${modalTab === "media" ? "border-amber-400 text-amber-500" : "border-transparent text-gray-500 hover:text-gray-900 dark:hover:text-gray-300"}`}><ImageIcon size={16}/> رسانه و کاور</button>
                <button onClick={() => setModalTab("seo")} className={`px-5 py-3 text-sm font-bold border-b-2 transition-colors whitespace-nowrap flex items-center gap-2 ${modalTab === "seo" ? "border-amber-400 text-amber-500" : "border-transparent text-gray-500 hover:text-gray-900 dark:hover:text-gray-300"}`}><Settings size={16}/> سئو (SEO)</button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 custom-scrollbar bg-white dark:bg-gray-950">
                {modalTab === "content" && (
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 flex flex-col gap-6">
                      <div className="flex flex-col gap-2">
                        <label className="text-xs font-black text-gray-400">عنوان مقاله (فارسی) <span className="text-red-500">*</span></label>
                        <input type="text" value={formData.faTitle} onChange={e => setFormData({...formData, faTitle: e.target.value})} className="border border-gray-200 dark:border-gray-800 rounded-xl p-3 bg-transparent text-sm font-bold outline-none focus:border-amber-400" placeholder="مثال: فواید مصرف ویتامین C..." />
                      </div>
                      <div className="flex flex-col gap-2">
                        <label className="text-xs font-black text-gray-400">عنوان مقاله (انگلیسی) <span className="text-red-500">*</span></label>
                        <div className="relative">
                          <input type="text" dir="ltr" value={formData.enTitle} onChange={e => setFormData({...formData, enTitle: e.target.value})} className="w-full border border-gray-200 dark:border-gray-800 rounded-xl py-3 pl-12 pr-4 bg-transparent text-sm font-mono outline-none focus:border-amber-400" />
                          <button type="button" onClick={() => handleAutoTranslate(formData.faTitle, 'enTitle')} disabled={translatingField === 'enTitle' || !formData.faTitle} className="absolute left-2 top-1/2 -translate-y-1/2 p-2 bg-amber-400/10 text-amber-600 hover:bg-amber-400 hover:text-gray-950 disabled:opacity-50 rounded-lg transition-colors">
                            {translatingField === 'enTitle' ? <Loader2 size={16} className="animate-spin" /> : <Wand2 size={16} />}
                          </button>
                        </div>
                      </div>
                      <div className="flex flex-col gap-2">
                        <label className="text-xs font-black text-gray-400">اسلاگ URL (شناسه لینک) <span className="text-red-500">*</span></label>
                        <input type="text" dir="ltr" value={formData.slug} onChange={e => setFormData({...formData, slug: e.target.value})} className="border border-gray-200 dark:border-gray-800 rounded-xl p-3 bg-transparent text-sm font-mono outline-none focus:border-amber-400" placeholder="benefits-of-vitamin-c" />
                      </div>
                      <div className="flex flex-col gap-2">
                        <label className="text-xs font-black text-gray-400">خلاصه مقاله (نمایش در کارت‌ها)</label>
                        <textarea rows={2} value={formData.excerpt} onChange={e => setFormData({...formData, excerpt: e.target.value})} className="border border-gray-200 dark:border-gray-800 rounded-xl p-3 bg-transparent text-sm font-bold outline-none focus:border-amber-400 resize-none"></textarea>
                      </div>
                      <div className="flex flex-col gap-2">
                        <div className="flex items-center justify-between">
                          <label className="text-xs font-black text-gray-400">متن کامل مقاله (ویرایشگر)</label>
                          <div className="flex gap-1 bg-gray-50 dark:bg-gray-800 p-1 rounded-lg">
                            <button className="p-1.5 text-gray-500 hover:bg-white dark:hover:bg-gray-700 rounded-md shadow-sm"><Bold size={14}/></button>
                            <button className="p-1.5 text-gray-500 hover:bg-white dark:hover:bg-gray-700 rounded-md shadow-sm"><Italic size={14}/></button>
                            <button className="p-1.5 text-gray-500 hover:bg-white dark:hover:bg-gray-700 rounded-md shadow-sm"><LinkIcon size={14}/></button>
                            <button className="p-1.5 text-gray-500 hover:bg-white dark:hover:bg-gray-700 rounded-md shadow-sm"><List size={14}/></button>
                            <button className="p-1.5 text-gray-500 hover:bg-white dark:hover:bg-gray-700 rounded-md shadow-sm"><AlignLeft size={14}/></button>
                          </div>
                        </div>
                        <textarea rows={8} value={formData.content} onChange={e => setFormData({...formData, content: e.target.value})} className="border border-gray-200 dark:border-gray-800 rounded-xl p-4 bg-gray-50/30 dark:bg-gray-900/30 text-sm font-medium outline-none focus:border-amber-400 leading-relaxed"></textarea>
                      </div>
                    </div>
                    
                    <div className="flex flex-col gap-6 lg:border-r border-gray-100 dark:border-gray-800 lg:pr-8">
                      <div className="flex flex-col gap-2">
                        <label className="text-xs font-black text-gray-400">دسته‌بندی</label>
                        <select value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} className="border border-gray-200 dark:border-gray-800 rounded-xl p-3 bg-transparent text-sm font-bold outline-none focus:border-amber-400">
                          <option value="health">سبک زندگی و سلامت</option>
                          <option value="news">اخبار جزیره گندم</option>
                          <option value="products">معرفی محصولات</option>
                        </select>
                      </div>
                      <div className="flex flex-col gap-2">
                        <label className="text-xs font-black text-gray-400">نویسنده</label>
                        <input type="text" value={formData.author} onChange={e => setFormData({...formData, author: e.target.value})} className="border border-gray-200 dark:border-gray-800 rounded-xl p-3 bg-transparent text-sm font-bold outline-none focus:border-amber-400" />
                      </div>
                      <div className="flex flex-col gap-2">
                        <label className="text-xs font-black text-gray-400">زمان مطالعه</label>
                        <input type="text" value={formData.readTime} onChange={e => setFormData({...formData, readTime: e.target.value})} className="border border-gray-200 dark:border-gray-800 rounded-xl p-3 bg-transparent text-sm font-bold outline-none focus:border-amber-400" />
                      </div>
                      <div className="flex flex-col gap-2">
                        <label className="text-xs font-black text-gray-400">وضعیت انتشار</label>
                        <select value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})} className="border border-gray-200 dark:border-gray-800 rounded-xl p-3 bg-transparent text-sm font-bold outline-none focus:border-amber-400">
                          <option value="published">منتشر شده و قابل مشاهده</option>
                          <option value="draft">ذخیره به عنوان پیش‌نویس</option>
                        </select>
                      </div>
                    </div>
                  </div>
                )}

                {modalTab === "media" && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="flex flex-col gap-4">
                      <label className="text-sm font-black text-gray-900 dark:text-white">تصویر کاور (هدر مقاله)</label>
                      {formData.coverImage && <img src={formData.coverImage} className="w-full h-32 object-cover rounded-xl border border-gray-200 dark:border-gray-700" alt="Cover" />}
                      <div className="relative overflow-hidden border-2 border-dashed border-gray-200 dark:border-gray-800 rounded-2xl p-8 flex flex-col items-center justify-center gap-2 hover:border-amber-400 transition-colors bg-gray-50/50 dark:bg-gray-900/30">
                        <input type="file" accept="image/*" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" onChange={async(e) => { 
                          const f = e.target.files?.[0]; 
                          if(!f) return; 
                          if(formData.coverImage) await fetch('/api/upload', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ fileUrl: formData.coverImage }) }).catch(err => console.error(err));
                          const fd = new FormData(); fd.append('file', f); 
                          const r = await fetch('/api/upload', {method:'POST',body:fd}); const d = await r.json(); 
                          if(d.success) setFormData({...formData, coverImage: d.url}); 
                        }} />
                        <Upload size={24} className="text-gray-400" />
                        <span className="text-xs font-black text-gray-500">آپلود عکس کاور (1920x800)</span>
                      </div>
                    </div>

                    <div className="flex flex-col gap-4">
                      <label className="text-sm font-black text-gray-900 dark:text-white">تصویر بندانگشتی (مربع)</label>
                      {formData.thumbnailImage && <img src={formData.thumbnailImage} className="w-32 h-32 object-cover mx-auto rounded-xl border border-gray-200 dark:border-gray-700" alt="Thumbnail" />}
                      <div className="relative overflow-hidden border-2 border-dashed border-gray-200 dark:border-gray-800 rounded-2xl p-8 flex flex-col items-center justify-center gap-2 hover:border-amber-400 transition-colors bg-gray-50/50 dark:bg-gray-900/30">
                        <input type="file" accept="image/*" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" onChange={async(e) => { 
                          const f = e.target.files?.[0]; 
                          if(!f) return; 
                          if(formData.thumbnailImage) await fetch('/api/upload', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ fileUrl: formData.thumbnailImage }) }).catch(err => console.error(err));
                          const fd = new FormData(); fd.append('file', f); 
                          const r = await fetch('/api/upload', {method:'POST',body:fd}); const d = await r.json(); 
                          if(d.success) setFormData({...formData, thumbnailImage: d.url}); 
                        }} />
                        <Upload size={24} className="text-gray-400" />
                        <span className="text-xs font-black text-gray-500">آپلود عکس بندانگشتی</span>
                      </div>
                    </div>
                  </div>
                )}

                {modalTab === "seo" && (
                  <div className="max-w-2xl flex flex-col gap-8">
                    <div className="bg-blue-50/50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/50 rounded-2xl p-5">
                      <h4 className="text-sm font-black text-blue-800 dark:text-blue-400 mb-2">پیش‌نمایش در نتایج گوگل</h4>
                      <div className="bg-white dark:bg-gray-950 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800">
                        <div className="text-[11px] text-gray-500 mb-1 flex items-center gap-2">
                          <span className="w-5 h-5 rounded-full bg-gray-200 dark:bg-gray-800 flex items-center justify-center"><ImageIcon size={10}/></span>
                          <span>جزیره گندم | Gandom Island</span>
                        </div>
                        <div className="text-[15px] text-blue-600 dark:text-blue-400 font-medium hover:underline cursor-pointer truncate">
                          {formData.seoTitle || formData.faTitle || "عنوان مقاله در گوگل"}
                        </div>
                        <div className="text-xs text-gray-600 dark:text-gray-400 mt-1 line-clamp-2 leading-relaxed">
                          {formData.seoDesc || formData.excerpt || "توضیحات متای مقاله در این بخش نمایش داده می‌شود و کاربران با خواندن آن تصمیم می‌گیرند که روی لینک کلیک کنند یا خیر..."}
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col gap-5">
                      <div className="flex flex-col gap-2"><label className="text-xs font-black text-gray-400">عنوان متا (Meta Title)</label><input type="text" value={formData.seoTitle} onChange={e => setFormData({...formData, seoTitle: e.target.value})} className="border border-gray-200 dark:border-gray-800 rounded-xl p-3 bg-transparent text-sm font-bold outline-none focus:border-amber-400" /></div>
                      <div className="flex flex-col gap-2"><label className="text-xs font-black text-gray-400">توضیحات متا (Meta Description)</label><textarea value={formData.seoDesc} onChange={e => setFormData({...formData, seoDesc: e.target.value})} className="border border-gray-200 dark:border-gray-800 rounded-xl p-3 bg-transparent text-sm font-bold outline-none focus:border-amber-400 h-24 resize-none"></textarea></div>
                      <div className="flex flex-col gap-2"><label className="text-xs font-black text-gray-400">کلمات کلیدی (با کاما جدا کنید)</label><input type="text" value={formData.seoKeywords} onChange={e => setFormData({...formData, seoKeywords: e.target.value})} className="border border-gray-200 dark:border-gray-800 rounded-xl p-3 bg-transparent text-sm font-bold outline-none focus:border-amber-400" /></div>
                    </div>
                  </div>
                )}
              </div>
              
              <div className="p-4 md:p-6 border-t border-gray-100 dark:border-gray-800 flex justify-between items-center bg-gray-50/50 dark:bg-gray-900/50 shrink-0">
                <button type="button" className="text-gray-500 hover:text-gray-900 dark:hover:text-white font-bold text-xs flex items-center gap-1.5 transition-colors"><Eye size={16}/> پیش‌نمایش زنده</button>
                <button onClick={handleSave} className="bg-amber-400 hover:bg-amber-500 text-gray-950 px-8 py-3 rounded-xl font-black text-sm flex items-center gap-2 shadow-md transition-all">
                  <CheckCircle2 size={18}/> ذخیره مقاله (Enter)
                </button>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}