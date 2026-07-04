"use client";

import React, { useState, useEffect } from "react";
import { Plus, Search, Edit3, Trash2, Image as ImageIcon, Video, Layers, ListVideo, X, CheckCircle2, Upload, GripVertical, LayoutGrid, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { getGalleryItems, createGalleryItem, updateGalleryItem, deleteGalleryItem } from "@/actions/gallery";
import { useToast } from "../components/ToastProvider";

export default function GalleryManager({ currentSection }: { currentSection: string }) {
  const { showToast } = useToast();

  const [mediaList, setMediaList] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  
  // خواندن وضعیت فعال مستقیماً از سایدبار اصلی سایت
  const activeSubSection = currentSection === "gallery_images" ? "images" : currentSection === "gallery_videos" ? "videos" : "all";
  
  // استیت‌های مربوط به مدال مدیریت (ویرایش / افزودن)
  const [editItem, setEditItem] = useState<any>(null);
  const [formTitleFa, setFormTitleFa] = useState("");
  const [formTitleEn, setFormTitleEn] = useState("");
  const [formType, setFormType] = useState("image");
  const [formCategory, setFormCategory] = useState("teaser");
  const [formThumbnail, setFormThumbnail] = useState("");

  // استیت‌های سیستم آپلود پیشرفته (برای آلبوم و پلی‌لیست)
  const [formItems, setFormItems] = useState<any[]>([]);
  const [draggedItemId, setDraggedItemId] = useState<number | null>(null);

  // لیست دسته‌بندی‌های داینامیک رسانه
  const [mediaCategories] = useState([
    { id: "teaser", title: "تیزر تبلیغاتی" },
    { id: "graphic", title: "گرافیک و پوستر" },
    { id: "bts", title: "پشت صحنه خط تولید" }
  ]);

  // گراف سرعت اختصاصی پروژه (بدون فنر، ترمز بسیار نرم اپل)
  const customEase: [number, number, number, number] = [0.22, 1, 0.36, 1];

  const fetchData = async () => {
    setIsLoading(true);
    const res = await getGalleryItems();
    if (res.success) setMediaList(res.data);
    setIsLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  // --- سیستم مرکزی آپلود روی سرور فیزیکی ---
  const handleFileUpload = async (file: File) => {
    setIsUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    try {
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const data = await res.json();
      setIsUploading(false);
      if (data.success) return data.url;
      showToast(data.error || "خطا در آپلود فایل", "error");
      return null;
    } catch (err) {
      setIsUploading(false);
      showToast("خطای ارتباط با سرور آپلود.", "error");
      return null;
    }
  };

  // منطق فیلترینگ دو لایه هوشمند
  const filteredMedia = mediaList.filter(m => {
    const matchesSearch = (m.faTitle && m.faTitle.includes(searchQuery)) || (m.enTitle && m.enTitle.toLowerCase().includes(searchQuery.toLowerCase()));
    
    if (activeSubSection === "images") {
      return matchesSearch && (m.type === "image" || m.type === "album");
    }
    if (activeSubSection === "videos") {
      return matchesSearch && (m.type === "video" || m.type === "playlist");
    }
    return matchesSearch;
  });

  const handleDelete = async (id: string) => {
    if (confirm("آیا از حذف این رسانه مطمئن هستید؟")) {
      const res = await deleteGalleryItem(id);
      if (res.success) {
        showToast("رسانه با موفقیت حذف شد.", "success");
        fetchData();
      } else {
        showToast("خطا در حذف رسانه.", "error");
      }
    }
  };

  const handleEditOpen = (item: any) => {
    setEditItem(item);
    setFormTitleFa(item.faTitle || "");
    setFormTitleEn(item.enTitle || "");
    setFormType(item.type || "image");
    setFormCategory(item.category || "teaser");
    setFormThumbnail(item.thumbnail || "");

    let initialItems: any[] = [];
    if (item.type === 'album') {
      initialItems = item.items?.map((url: string, index: number) => ({
        id: Date.now() + index,
        url,
        title: "",
        isCover: item.thumbnail === url
      })) || [];
    } else if (item.type === 'playlist') {
      initialItems = item.items?.map((ep: any, index: number) => ({
        id: Date.now() + index,
        url: ep.url || "",
        title: ep.title,
        isCover: item.thumbnail === ep.thumbnail || false
      })) || [];
    }
    
    if (initialItems.length > 0 && !initialItems.some(i => i.isCover)) {
      initialItems[0].isCover = true;
    }
    setFormItems(initialItems);
    setIsModalOpen(true);
  };

  const handleAddOpen = () => {
    setEditItem(null);
    setFormTitleFa("");
    setFormTitleEn("");
    setFormThumbnail("");
    setFormType(activeSubSection === "videos" ? "video" : "image");
    setFormCategory(mediaCategories[0].id);
    setFormItems([]);
    setIsModalOpen(true);
  };

  const handleTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newType = e.target.value;
    setFormType(newType);
    if ((newType === 'album' || newType === 'playlist') && formItems.length === 0) {
      setFormItems([{
        id: Date.now(),
        url: ``,
        title: `آیتم اول`,
        isCover: true
      }]);
    }
  };

  // --- هندلرهای سیستم درگ اند دراپ بومی (Drag & Drop) ---
  const handleDragStart = (e: React.DragEvent, id: number) => setDraggedItemId(id);
  const handleDragOver = (e: React.DragEvent) => e.preventDefault(); 
  
  const handleDrop = (e: React.DragEvent, targetId: number) => {
    e.preventDefault();
    if (draggedItemId === null || draggedItemId === targetId) return;
    
    const draggedIndex = formItems.findIndex(i => i.id === draggedItemId);
    const targetIndex = formItems.findIndex(i => i.id === targetId);
    
    const newItems = [...formItems];
    const [draggedItem] = newItems.splice(draggedIndex, 1);
    newItems.splice(targetIndex, 0, draggedItem);
    setFormItems(newItems);
    setDraggedItemId(null);
  };

  const handleAddItem = () => {
    setFormItems([...formItems, {
      id: Date.now(),
      url: ``,
      title: `قسمت ${formItems.length + 1}`,
      isCover: formItems.length === 0
    }]);
  };

  const handleReplaceItem = async (id: number, e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.[0]) return;
    
    const currentItem = formItems.find(i => i.id === id);
    if (currentItem && currentItem.url && currentItem.url.startsWith('/uploads/')) {
      await fetch('/api/upload', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ fileUrl: currentItem.url }) }).catch(err => console.error(err));
    }

    const url = await handleFileUpload(e.target.files[0]);
    if (url) {
      setFormItems(formItems.map(item => item.id === id ? { ...item, url } : item));
      showToast("فایل با موفقیت بارگذاری شد.", "success");
    }
  };

  const handleSetCover = (id: number) => {
    setFormItems(formItems.map(item => ({ ...item, isCover: item.id === id })));
  };

  const handleSave = async () => {
    if (!formTitleFa || !formTitleEn) {
      showToast("وارد کردن عنوان فارسی و انگلیسی الزامی است.", "warning");
      return;
    }

    let finalThumbnail = formThumbnail;
    let finalItems: any[] = [];

    if (formType === 'album' || formType === 'playlist') {
       const coverItem = formItems.find(i => i.isCover) || formItems[0];
       if (coverItem && coverItem.url) finalThumbnail = coverItem.url;
       
       if (formType === 'album') {
          finalItems = formItems.filter(i => i.url).map(i => i.url);
       } else {
          finalItems = formItems.filter(i => i.url).map((i, idx) => ({
             ep: idx + 1,
             title: i.title || `قسمت ${idx + 1}`,
             url: i.url
          }));
       }
    }

    const payload = {
      type: formType,
      category: formCategory,
      faTitle: formTitleFa,
      enTitle: formTitleEn,
      thumbnail: finalThumbnail,
      url: finalThumbnail, // برای تصویر یا ویدیوی تکی
      items: finalItems.length > 0 ? finalItems : undefined,
      status: "published"
    };

    if (editItem && editItem._id) {
      const res = await updateGalleryItem(editItem._id, payload);
      if (res.success) {
        showToast("رسانه با موفقیت بروزرسانی شد.", "success");
        setIsModalOpen(false);
        fetchData();
      } else showToast(res.error || "خطا در بروزرسانی رسانه", "error");
    } else {
      const res = await createGalleryItem(payload);
      if (res.success) {
        showToast("رسانه جدید با موفقیت ایجاد شد.", "success");
        setIsModalOpen(false);
        fetchData();
      } else showToast(res.error || "خطا در ثبت رسانه", "error");
    }
  };

  const getIcon = (type: string) => {
    if (type === 'video') return <Video size={16} className="text-blue-500" />;
    if (type === 'playlist') return <ListVideo size={16} className="text-purple-500" />;
    if (type === 'album') return <Layers size={16} className="text-amber-500" />;
    return <ImageIcon size={16} className="text-emerald-500" />;
  };

  const getTypeLabel = (type: string) => {
    if (type === 'video') return "ویدیوی تکی";
    if (type === 'playlist') return "پلی‌لیست اپیزودیک";
    if (type === 'album') return "آلبوم تصاویر";
    return "تصویر تکی";
  };

  const getCategoryLabel = (catId: string) => {
    const found = mediaCategories.find(c => c.id === catId);
    return found ? found.title : catId;
  };

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto flex flex-col gap-8" dir="rtl">
      
      <div className="grow flex flex-col">
        
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <div>
            <h1 className="text-2xl font-black text-gray-900 dark:text-white">
              {activeSubSection === "all" ? "مدیریت کل رسانه‌ها" : activeSubSection === "images" ? "مدیریت تصاویر و آلبوم‌ها" : "مدیریت ویدیوهای تکی و اپیزودیک"}
            </h1>
            <p className="text-sm text-gray-500 mt-0.5">تنظیم چیدمان بنتو، ویرایش داده‌های متادیتا و حذف فایل‌ها</p>
          </div>
          <button onClick={handleAddOpen} className="w-full sm:w-auto bg-amber-400 hover:bg-amber-500 text-gray-950 px-5 py-2.5 rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg transition-transform hover:scale-105">
            <Plus size={18} /> افزودن رسانه جدید
          </button>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-200/60 dark:border-gray-800/60 p-4 mb-6 flex items-center gap-3 shadow-sm shrink-0">
          <Search className="text-gray-400 ml-1" size={18} />
          <input 
            type="text" 
            placeholder="جستجو در عناوین رسانه‌های این بخش..." 
            value={searchQuery} 
            onChange={e => setSearchQuery(e.target.value)}
            className="bg-transparent border-none outline-none text-sm font-bold w-full text-gray-900 dark:text-white placeholder:text-gray-400"
          />
        </div>

        {isLoading ? (
          <div className="flex justify-center py-20"><Loader2 className="animate-spin text-amber-500" size={40} /></div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            <AnimatePresence mode="popLayout">
              {filteredMedia.map(media => (
                <motion.div 
                  key={media._id} 
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.4, ease: customEase }}
                  className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-3xl overflow-hidden group hover:border-amber-400 transition-colors shadow-sm flex flex-col h-full relative"
                >
                  <div className="h-44 relative overflow-hidden bg-gray-100 dark:bg-gray-800 shrink-0">
                    {media.thumbnail ? (
                       <img src={media.thumbnail} alt={media.faTitle} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                    ) : (
                       <div className="w-full h-full flex items-center justify-center text-gray-400"><ImageIcon size={32}/></div>
                    )}
                    
                    <div className="absolute top-3 right-3 bg-white/95 dark:bg-gray-950/95 backdrop-blur-md px-3 py-1.5 rounded-xl flex items-center gap-1.5 shadow-sm z-20">
                      {getIcon(media.type)} 
                      <span className="text-[10px] font-black text-gray-700 dark:text-gray-300">{getTypeLabel(media.type)}</span>
                    </div>
                  </div>
                  
                  <div className="p-5 flex flex-col grow">
                    <h3 className="font-black text-gray-900 dark:text-white truncate mb-0.5">{media.faTitle}</h3>
                    <p className="text-[10px] font-mono text-gray-400 truncate mb-4">{media.enTitle}</p>
                    
                    <div className="mt-auto flex justify-between items-center pt-4 border-t border-gray-100 dark:border-gray-800">
                      <span className="text-[10px] font-black px-2.5 py-1 bg-gray-100 dark:bg-gray-800 rounded-md text-gray-500 uppercase">
                        {getCategoryLabel(media.category)}
                      </span>
                      <div className="flex gap-1.5">
                        <button onClick={() => handleEditOpen(media)} className="p-2 bg-gray-50 dark:bg-gray-800 text-gray-400 hover:text-amber-500 hover:bg-amber-400/10 rounded-xl transition-colors" title="ویرایش"><Edit3 size={15} /></button>
                        <button onClick={() => handleDelete(media._id)} className="p-2 bg-gray-50 dark:bg-gray-800 text-gray-400 hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-colors" title="حذف"><Trash2 size={15} /></button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
            {filteredMedia.length === 0 && (
              <div className="col-span-full py-12 text-center text-gray-400 font-bold">رسانه‌ای یافت نشد.</div>
            )}
          </div>
        )}
      </div>

      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsModalOpen(false)} className="absolute inset-0 bg-gray-950/60 backdrop-blur-sm" />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }} 
              animate={{ opacity: 1, scale: 1, y: 0 }} 
              exit={{ opacity: 0, scale: 0.95, y: 20 }} 
              transition={{ duration: 0.5, ease: customEase }} 
              className="relative bg-white dark:bg-gray-900 w-full max-w-3xl rounded-[2.5rem] shadow-2xl flex flex-col max-h-[90vh] overflow-hidden border border-gray-100 dark:border-gray-800 z-10"
            >
              <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center bg-gray-50/50 dark:bg-gray-900/50">
                <h2 className="text-base font-black text-gray-900 dark:text-white">
                  {editItem ? `ویرایش رسانه: ${editItem.faTitle}` : "افزودن رسانه جدید به پلتفرم"}
                </h2>
                <button onClick={() => setIsModalOpen(false)} className="p-2 bg-gray-100 dark:bg-gray-800 rounded-full hover:text-red-500 transition-colors"><X size={18}/></button>
              </div>
              
              <div className="p-6 overflow-y-auto flex flex-col gap-4 custom-scrollbar">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-black text-gray-400">عنوان فارسی</label>
                    <input 
                      type="text" 
                      value={formTitleFa}
                      onChange={e => setFormTitleFa(e.target.value)}
                      className="border border-gray-200 dark:border-gray-700 rounded-xl p-3 bg-transparent text-sm font-bold outline-none focus:border-amber-400 transition-colors text-gray-900 dark:text-white" 
                      placeholder="مثلا: تیزر معرفی کارخانه" 
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-black text-gray-400">عنوان انگلیسی</label>
                    <input 
                      type="text" 
                      value={formTitleEn}
                      onChange={e => setFormTitleEn(e.target.value)}
                      className="border border-gray-200 dark:border-gray-700 rounded-xl p-3 bg-transparent text-sm font-bold outline-none focus:border-amber-400 transition-colors text-gray-900 dark:text-white" 
                      placeholder="e.g. Factory Tour" 
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-black text-gray-400">نوع ساختار رسانه</label>
                    <select 
                      value={formType}
                      onChange={handleTypeChange}
                      className="border border-gray-200 dark:border-gray-700 rounded-xl p-3 bg-white dark:bg-gray-900 text-sm font-bold outline-none focus:border-amber-400 transition-colors text-gray-900 dark:text-white"
                    >
                      <option value="image">تصویر تکی</option>
                      <option value="album">آلبوم تصاویر چندگانه</option>
                      <option value="video">ویدیوی تکی</option>
                      <option value="playlist">پلی‌لیست اپیزودیک (چند قسمتی)</option>
                    </select>
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-black text-gray-400">دسته‌بندی ساختاری</label>
                    <select 
                      value={formCategory}
                      onChange={e => setFormCategory(e.target.value)}
                      className="border border-gray-200 dark:border-gray-700 rounded-xl p-3 bg-white dark:bg-gray-900 text-sm font-bold outline-none focus:border-amber-400 transition-colors text-gray-900 dark:text-white"
                    >
                      {mediaCategories.map(cat => (
                        <option key={cat.id} value={cat.id}>{cat.title}</option>
                      ))}
                    </select>
                  </div>
                </div>
                
                <div className="flex flex-col gap-2 mt-2">
                  <label className="text-xs font-black text-gray-400">نوع ابعاد چیدمان در ویترین بنتو سایت</label>
                  <div className="flex gap-4">
                    <label className="flex items-center gap-2 text-xs font-bold text-gray-600 dark:text-gray-300 cursor-pointer">
                      <input type="radio" name="bentoSize" defaultChecked /> سایز معمولی کادر (۱×۱)
                    </label>
                    <label className="flex items-center gap-2 text-xs font-bold text-gray-600 dark:text-gray-300 cursor-pointer">
                      <input type="radio" name="bentoSize" /> کادر بزرگ ویژه بنتو (۲×۲)
                    </label>
                  </div>
                </div>

                {/* --- سیستم آپلود پیشرفته (بسته به نوع رسانه) --- */}
                {formType === 'album' || formType === 'playlist' ? (
                  <div className="border border-gray-200 dark:border-gray-800 rounded-2xl p-4 bg-gray-50/50 dark:bg-gray-900/30 mt-4">
                     <div className="flex items-center justify-between mb-4">
                        <label className="text-sm font-black text-gray-900 dark:text-white">
                          {formType === 'album' ? 'آیتم‌های آلبوم تصاویر' : 'اپیزودهای پلی‌لیست ویدیویی'}
                        </label>
                        <button 
                          type="button" 
                          onClick={handleAddItem} 
                          className="bg-amber-400/20 text-amber-700 dark:text-amber-400 px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-amber-400 hover:text-gray-900 transition-colors flex items-center gap-1"
                        >
                          <Plus size={14}/> افزودن آیتم جدید
                        </button>
                     </div>
                     
                     <div className="flex flex-col gap-2">
                        {formItems.map((item, index) => (
                           <div 
                             key={item.id}
                             draggable
                             onDragStart={(e) => handleDragStart(e, item.id)}
                             onDragOver={handleDragOver}
                             onDrop={(e) => handleDrop(e, item.id)}
                             className="flex items-center gap-3 bg-white dark:bg-gray-900 p-3 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm transition-all"
                           >
                              <div className="cursor-grab active:cursor-grabbing text-gray-400 hover:text-amber-500 transition-colors p-1" title="برای جابجایی بکشید">
                                <GripVertical size={16}/>
                              </div>
                              <div className="w-16 h-12 rounded-lg overflow-hidden shrink-0 bg-gray-100 dark:bg-gray-800 relative">
                                 {item.url ? (
                                   <img src={item.url} className="w-full h-full object-cover" alt="item thumbnail"/>
                                 ) : (
                                   <div className="w-full h-full flex items-center justify-center"><ImageIcon size={14} className="text-gray-400" /></div>
                                 )}
                                 {item.isCover && <div className="absolute top-0 right-0 bg-amber-400 text-gray-950 text-[9px] font-black px-1.5 py-0.5 rounded-bl-lg shadow-sm">کاور</div>}
                              </div>
                              
                              <div className="flex flex-col grow gap-1 min-w-0">
                                 {formType === 'playlist' ? (
                                    <input 
                                      type="text" 
                                      value={item.title} 
                                      onChange={(e) => {
                                         setFormItems(formItems.map(i => i.id === item.id ? {...i, title: e.target.value} : i));
                                      }}
                                      className="bg-transparent border-b border-gray-200 dark:border-gray-700 text-xs font-bold text-gray-900 dark:text-white outline-none focus:border-amber-400 px-1 py-1 w-full transition-colors"
                                      placeholder="عنوان اپیزود را وارد کنید..."
                                    />
                                 ) : (
                                    <span className="text-xs font-bold text-gray-600 dark:text-gray-300">تصویر {index + 1}</span>
                                 )}
                              </div>

                              <div className="flex items-center gap-1.5 shrink-0">
                                 {!item.isCover && (
                                     <button type="button" onClick={() => handleSetCover(item.id)} className="p-1.5 text-gray-400 hover:text-amber-500 bg-gray-50 dark:bg-gray-800 rounded-lg transition-colors border border-transparent hover:border-amber-400/30 text-[10px] font-bold" title="انتخاب به عنوان کاور اصلی گالری">کاور</button>
                                 )}
                                 
                                 <div className="relative p-1.5 text-gray-400 hover:text-blue-500 bg-gray-50 dark:bg-gray-800 rounded-lg transition-colors border border-transparent hover:border-blue-500/30 overflow-hidden" title="آپلود فایل">
                                    <Upload size={14}/>
                                    <input type="file" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" onChange={(e) => handleReplaceItem(item.id, e)} />
                                 </div>

                                 <button type="button" onClick={() => setFormItems(formItems.filter(i => i.id !== item.id))} className="p-1.5 text-gray-400 hover:text-red-500 bg-gray-50 dark:bg-gray-800 rounded-lg transition-colors border border-transparent hover:border-red-500/30" title="حذف کامل این آیتم"><Trash2 size={14}/></button>
                              </div>
                           </div>
                        ))}
                        {formItems.length === 0 && (
                          <div className="text-center py-8 text-gray-400 text-xs font-bold border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-xl">
                            هیچ آیتمی در لیست وجود ندارد. برای شروع «افزودن آیتم جدید» را بزنید.
                          </div>
                        )}
                     </div>
                  </div>
                ) : (
                  <div className="relative overflow-hidden border-2 border-dashed border-gray-200 dark:border-gray-800 rounded-2xl p-8 flex flex-col items-center justify-center gap-2 mt-4 hover:border-amber-400 transition-colors bg-gray-50/50 dark:bg-gray-900/30">
                    <input type="file" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" onChange={async (e) => {
                       if (e.target.files?.[0]) {
                         if (formThumbnail && formThumbnail.startsWith('/uploads/')) {
                           await fetch('/api/upload', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ fileUrl: formThumbnail }) }).catch(err => console.error(err));
                         }
                         const url = await handleFileUpload(e.target.files[0]);
                         if (url) {
                           setFormThumbnail(url);
                           showToast("تصویر با موفقیت بارگذاری شد.", "success");
                         }
                       }
                    }} />
                    {isUploading ? (
                       <Loader2 size={32} className="animate-spin text-amber-500" />
                    ) : formThumbnail ? (
                       <img src={formThumbnail} alt="preview" className="h-20 object-contain rounded-lg" />
                    ) : (
                       <>
                         <Upload size={32} className="text-gray-400 group-hover:text-amber-500 transition-colors" />
                         <span className="text-xs font-black text-gray-600 dark:text-gray-300">بارگذاری فایل {formType === 'video' ? 'ویدیو و کاور' : 'تصویر'} اصلی (Thumbnail)</span>
                       </>
                    )}
                  </div>
                )}

              </div>
              
              <div className="p-6 border-t border-gray-100 dark:border-gray-800 flex justify-end bg-gray-50/50 dark:bg-gray-900/50">
                <button onClick={handleSave} disabled={isUploading} className="bg-amber-400 hover:bg-amber-500 text-gray-950 px-6 py-3 rounded-xl font-black text-xs flex items-center gap-2 shadow-md transition-all disabled:opacity-50">
                  <CheckCircle2 size={16}/> 
                  <span>{editItem ? "بروزرسانی تغییرات رسانه" : "ذخیره و انتشار نهایی رسانه"}</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}