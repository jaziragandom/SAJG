"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Mail, Send, Users, History, Trash2, CheckCircle2, 
  XCircle, Clock, Inbox, CheckSquare, Square, 
  Download, Filter, Loader2, Sparkles, AlertCircle 
} from "lucide-react";
import { 
  fetchAllSubscribers, 
  fetchCampaignHistory, 
  bulkUpdateSubscribers, 
  sendNewsletterBlast 
} from "@/actions/newsletter";
import { useToast } from "../components/ToastProvider";

export default function NewsletterManager() {
  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState<'compose' | 'subscribers' | 'history'>('compose');
  const [subscribers, setSubscribers] = useState<any[]>([]);
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // استیت‌های تب ارسال خبرنامه
  const [subject, setSubject] = useState("");
  const [htmlContent, setHtmlContent] = useState("");
  const [targetSegment, setTargetSegment] = useState("all");
  const [isSending, setIsSending] = useState(false);
  const [sendResult, setSendResult] = useState({ type: '', msg: '' });

  // استیت‌های مدیریت مشترکین
  const [segmentFilter, setSegmentFilter] = useState("all");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 15;

  const loadData = async () => {
    setIsLoading(true);
    const [subsRes, campRes] = await Promise.all([
      fetchAllSubscribers(),
      fetchCampaignHistory()
    ]);
    if (subsRes.success) setSubscribers(subsRes.data);
    if (campRes.success) setCampaigns(campRes.data);
    setIsLoading(false);
  };

  useEffect(() => { loadData(); }, []);

  // ارسال کمپین جدید
  const handleSendCampaign = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !htmlContent.trim()) {
      setSendResult({ type: 'error', msg: "عنوان و متن خبرنامه نمی‌تواند خالی باشد." });
      showToast("عنوان و متن خبرنامه نمی‌تواند خالی باشد.", "warning");
      return;
    }
    if (!confirm(`آیا از ارسال این ایمیل مطمئن هستید؟`)) return;

    setIsSending(true);
    setSendResult({ type: '', msg: '' });

    const res = await sendNewsletterBlast({ subject, htmlContent, targetSegment });
    setIsSending(false);

    if (res.success) {
      const successMessage = res.message || "ارسال انجام شد.";
      setSendResult({ type: 'success', msg: successMessage });
      showToast(successMessage, "success");
      setSubject("");
      setHtmlContent("");
      loadData();
    } else {
      const errorMessage = res.error || "خطایی رخ داد.";
      setSendResult({ type: 'error', msg: errorMessage });
      showToast(errorMessage, "error");
    }
  };

  // عملیات گروهی روی مشترکین
  const handleBulkAction = async (action: 'active' | 'unsubscribed' | 'delete') => {
    if (selectedIds.length === 0) return;
    if (action === 'delete' && !confirm("آیا از حذف این مشترکین مطمئن هستید؟")) return;
    await bulkUpdateSubscribers(selectedIds, action);
    showToast("عملیات گروهی با موفقیت روی مشترکین اعمال شد.", "success");
    setSelectedIds([]);
    loadData();
  };

  // دانلود فایل CSV مشترکین (خروجی اکسل)
  const exportToCSV = () => {
    const headers = ["Email,Name,Segment,Source,Status,JoinedDate\n"];
    const rows = subscribers.map(s => 
      `"${s.email}","${s.name}","${s.segment}","${s.source}","${s.status}","${new Date(s.createdAt).toLocaleDateString('fa-IR')}"`
    );
    const csvContent = "data:text/csv;charset=utf-8,\uFEFF" + headers.concat(rows).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `subscribers_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast("فایل اکسل مشترکین با موفقیت دانلود شد.", "success");
  };

  const filteredSubs = subscribers.filter(s => segmentFilter === "all" ? true : s.segment === segmentFilter);
  const totalPages = Math.ceil(filteredSubs.length / itemsPerPage);
  const paginatedSubs = filteredSubs.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const toggleSelect = (id: string) => setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  const toggleSelectAll = () => selectedIds.length === paginatedSubs.length && paginatedSubs.length > 0 ? setSelectedIds([]) : setSelectedIds(paginatedSubs.map(s => s._id));

  const segmentLabels: Record<string, string> = {
    all: "همه مشترکین",
    general: "عضویت عمومی سایت",
    blog_health: "علاقه‌مندان مقالات سلامت",
    blog_news: "علاقه‌مندان اخبار شرکت",
    agency: "نمایندگان و همکاران",
    vip: "مشتریان ویژه (VIP)"
  };

  return (
    <div className="flex flex-col gap-6" dir="rtl">
      {/* سربرگ و تب‌ها */}
      <div className="bg-white dark:bg-gray-900 p-6 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm flex flex-col md:flex-row justify-between items-center gap-4">
        <div>
          <h2 className="text-xl font-black text-gray-900 dark:text-white flex items-center gap-2">
            <Mail className="text-amber-500" size={24} />
            باشگاه مشتریان و ارسال خبرنامه
          </h2>
          <p className="text-sm text-gray-500 mt-1">مدیریت ایمیل‌های اعضا و ارسال اطلاعیه‌های رسمی شرکت</p>
        </div>

        <div className="flex gap-2 bg-gray-100 dark:bg-gray-800 p-1.5 rounded-2xl">
          <button 
            onClick={() => setActiveTab('compose')}
            className={`px-4 py-2 rounded-xl text-xs font-black flex items-center gap-2 transition-all ${activeTab === 'compose' ? 'bg-white dark:bg-gray-900 text-amber-500 shadow-sm' : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'}`}
          >
            <Send size={14} /> ارسال خبرنامه جدید
          </button>
          <button 
            onClick={() => setActiveTab('subscribers')}
            className={`px-4 py-2 rounded-xl text-xs font-black flex items-center gap-2 transition-all ${activeTab === 'subscribers' ? 'bg-white dark:bg-gray-900 text-amber-500 shadow-sm' : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'}`}
          >
            <Users size={14} /> اعضا ({subscribers.filter(s => s.status === 'active').length})
          </button>
          <button 
            onClick={() => setActiveTab('history')}
            className={`px-4 py-2 rounded-xl text-xs font-black flex items-center gap-2 transition-all ${activeTab === 'history' ? 'bg-white dark:bg-gray-900 text-amber-500 shadow-sm' : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'}`}
          >
            <History size={14} /> تاریخچه ارسالی‌ها ({campaigns.length})
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20"><div className="w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div></div>
      ) : (
        <>
          {/* تب ۱: ارسال خبرنامه جدید */}
          {activeTab === 'compose' && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-white dark:bg-gray-900 p-6 md:p-8 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm">
              <form onSubmit={handleSendCampaign} className="flex flex-col gap-6 max-w-4xl mx-auto">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex flex-col gap-2 grow">
                    <label className="text-xs font-bold text-gray-600 dark:text-gray-400">عنوان ایمیل (Subject) *</label>
                    <input 
                      type="text" 
                      value={subject} 
                      onChange={e => setSubject(e.target.value)} 
                      placeholder="مثال: معرفی محصولات جدید تنقلات جزیره گندم + تخفیف ویژه" 
                      className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-sm font-bold outline-none focus:border-amber-400" 
                      required 
                    />
                  </div>
                  <div className="flex flex-col gap-2 w-full md:w-64 shrink-0">
                    <label className="text-xs font-bold text-gray-600 dark:text-gray-400">گروه هدف (Segmentation) *</label>
                    <select 
                      value={targetSegment} 
                      onChange={e => setTargetSegment(e.target.value)}
                      className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-sm font-bold outline-none focus:border-amber-400 cursor-pointer"
                    >
                      <option value="all">ارسال به همه مشترکین فعال</option>
                      <option value="general">فقط اعضای عمومی سایت</option>
                      <option value="blog_health">علاقه‌مندان مقالات سلامت</option>
                      <option value="blog_news">علاقه‌مندان اخبار شرکت</option>
                      <option value="agency">نمایندگان و همکاران</option>
                    </select>
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-xs font-bold text-gray-600 dark:text-gray-400">متن پیام (پشتیبانی از تگ‌های HTML) *</label>
                  <textarea 
                    rows={8} 
                    value={htmlContent} 
                    onChange={e => setHtmlContent(e.target.value)} 
                    placeholder="متن ایمیل خود را بنویسید. می‌توانید از تگ‌های HTML مثل <p>, <b>, <a> نیز برای زیباسازی استفاده کنید..." 
                    className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4 text-sm font-medium outline-none focus:border-amber-400 resize-y"
                    required
                  ></textarea>
                </div>

                <AnimatePresence>
                  {sendResult.msg && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className={`p-4 rounded-2xl text-xs font-bold flex items-center gap-2 ${sendResult.type === 'success' ? 'bg-emerald-500/10 text-emerald-600' : 'bg-red-500/10 text-red-500'}`}>
                      {sendResult.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
                      {sendResult.msg}
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-gray-800">
                  <span className="text-xs text-gray-400">ایمیل‌ها به صورت خودکار با قالب گرافیکی و لوگوی شرکت ارسال می‌شوند.</span>
                  <button 
                    type="submit" 
                    disabled={isSending} 
                    className="bg-amber-400 hover:bg-amber-500 text-gray-950 font-black px-8 py-3.5 rounded-xl transition-all flex items-center gap-2 shadow-md disabled:opacity-50"
                  >
                    {isSending ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
                    {isSending ? "در حال ارسال ایمیل‌ها..." : "ارسال گروهی خبرنامه"}
                  </button>
                </div>
              </form>
            </motion.div>
          )}

          {/* تب ۲: لیست مشترکین و مدیریت دسته‌ها */}
          {activeTab === 'subscribers' && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col gap-6">
              <div className="bg-white dark:bg-gray-900 p-6 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm flex flex-col md:flex-row justify-between items-center gap-4">
                <div className="flex items-center gap-3">
                  <Filter size={18} className="text-amber-500" />
                  <span className="text-xs font-bold text-gray-500">فیلتر دسته‌بندی:</span>
                  <select 
                    value={segmentFilter} 
                    onChange={e => { setSegmentFilter(e.target.value); setCurrentPage(1); }}
                    className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-xs font-bold rounded-xl px-3 py-2 outline-none cursor-pointer"
                  >
                    <option value="all">همه دسته‌ها</option>
                    <option value="general">عمومی سایت</option>
                    <option value="blog_health">مقالات سلامت</option>
                    <option value="blog_news">اخبار شرکت</option>
                    <option value="agency">نمایندگان</option>
                  </select>
                </div>

                <div className="flex items-center gap-3">
                  <button onClick={exportToCSV} className="bg-gray-100 dark:bg-gray-800 hover:bg-amber-400 hover:text-gray-950 text-gray-600 dark:text-gray-300 px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors">
                    <Download size={14} /> دانلود اکسل (CSV)
                  </button>
                  {selectedIds.length > 0 && (
                    <div className="flex items-center gap-1.5 bg-amber-50 dark:bg-amber-900/20 p-1 rounded-xl border border-amber-200 dark:border-amber-800">
                      <button onClick={() => handleBulkAction('active')} className="px-2.5 py-1.5 bg-emerald-500 text-white rounded-lg text-xs font-bold">فعال‌سازی ({selectedIds.length})</button>
                      <button onClick={() => handleBulkAction('unsubscribed')} className="px-2.5 py-1.5 bg-gray-500 text-white rounded-lg text-xs font-bold">لغو عضویت</button>
                      <button onClick={() => handleBulkAction('delete')} className="px-2.5 py-1.5 bg-red-500 text-white rounded-lg text-xs font-bold">حذف</button>
                    </div>
                  )}
                </div>
              </div>

              {paginatedSubs.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 bg-white dark:bg-gray-900 rounded-3xl border border-dashed border-gray-200 dark:border-gray-800 text-gray-400 gap-3">
                  <Inbox size={48} className="opacity-50" />
                  <p className="font-bold">هیچ مشترکی در این دسته‌بندی یافت نشد.</p>
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  <div className="flex items-center gap-2 px-4">
                    <button onClick={toggleSelectAll} className="text-gray-500 hover:text-amber-500 transition-colors">
                      {selectedIds.length === paginatedSubs.length && paginatedSubs.length > 0 ? <CheckSquare size={20} className="text-amber-500" /> : <Square size={20} />}
                    </button>
                    <span className="text-xs font-bold text-gray-500">انتخاب همه در این صفحه</span>
                  </div>

                  {paginatedSubs.map(sub => (
                    <div key={sub._id} className="bg-white dark:bg-gray-900 p-5 rounded-2xl border border-gray-100 dark:border-gray-800 flex items-center justify-between gap-4 shadow-xs">
                      <div className="flex items-center gap-3">
                        <button onClick={() => toggleSelect(sub._id)} className={selectedIds.includes(sub._id) ? 'text-amber-500' : 'text-gray-300 dark:text-gray-700'}>
                          {selectedIds.includes(sub._id) ? <CheckSquare size={20} /> : <Square size={20} />}
                        </button>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-gray-900 dark:text-white text-sm">{sub.name}</span>
                            <span className="bg-gray-100 dark:bg-gray-800 text-gray-500 text-[10px] font-bold px-2 py-0.5 rounded-md">{segmentLabels[sub.segment] || sub.segment}</span>
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${sub.status === 'active' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'}`}>
                              {sub.status === 'active' ? 'فعال' : 'لغو عضویت'}
                            </span>
                          </div>
                          <span className="text-xs font-mono text-gray-500 block mt-1">{sub.email}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                        <span className="text-xs text-gray-400 hidden md:inline">منبع: {sub.source}</span>
                        <span className="text-xs font-bold text-gray-400">{new Date(sub.createdAt).toLocaleDateString('fa-IR')}</span>
                        <button onClick={() => { setSelectedIds([sub._id]); handleBulkAction('delete'); }} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-colors">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  ))}

                  {totalPages > 1 && (
                    <div className="flex items-center justify-center gap-2 mt-4">
                      {Array.from({ length: totalPages }).map((_, idx) => (
                        <button key={idx} onClick={() => setCurrentPage(idx + 1)} className={`w-8 h-8 rounded-xl font-bold text-sm flex items-center justify-center transition-colors ${currentPage === idx + 1 ? 'bg-amber-400 text-gray-950' : 'bg-white dark:bg-gray-800 text-gray-500'}`}>
                          {idx + 1}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          )}

          {/* تب ۳: تاریخچه ارسالی‌ها */}
          {activeTab === 'history' && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col gap-4">
              {campaigns.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 bg-white dark:bg-gray-900 rounded-3xl border border-dashed border-gray-200 dark:border-gray-800 text-gray-400 gap-3">
                  <Inbox size={48} className="opacity-50" />
                  <p className="font-bold">هنوز هیچ خبرنامه‌ای ارسال نشده است.</p>
                </div>
              ) : (
                campaigns.map(camp => (
                  <div key={camp._id} className="bg-white dark:bg-gray-900 p-6 rounded-2xl border border-gray-100 dark:border-gray-800 flex flex-col gap-3 shadow-xs">
                    <div className="flex justify-between items-center border-b border-gray-100 dark:border-gray-800 pb-3">
                      <h3 className="font-black text-gray-900 dark:text-white text-base">{camp.subject}</h3>
                      <span className="text-xs font-bold text-gray-400 flex items-center gap-1.5">
                        <Clock size={14} /> {new Date(camp.createdAt).toLocaleString('fa-IR')}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-4 text-xs font-bold text-gray-500">
                      <span className="bg-amber-50 dark:bg-amber-500/10 text-amber-600 px-3 py-1 rounded-lg">گروه هدف: {segmentLabels[camp.targetSegment] || camp.targetSegment}</span>
                      <span className="bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 px-3 py-1 rounded-lg">تعداد دریافت‌کنندگان: {camp.recipientsCount} نفر</span>
                    </div>
                  </div>
                ))
              )}
            </motion.div>
          )}
        </>
      )}
    </div>
  );
}