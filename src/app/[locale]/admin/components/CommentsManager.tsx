"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageSquare, Trash2, CheckCircle2, XCircle, Clock, Inbox, CheckSquare, Square, RotateCcw, Reply, ShieldCheck, Send, Loader2 } from "lucide-react";
import { fetchAllComments, updateCommentStatus, bulkUpdateComments, adminReplyToComment } from "@/actions/communications";

export default function CommentsManager() {
  const [comments, setComments] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'unread' | 'approved' | 'replied' | 'rejected'>('unread');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // استیت‌های مربوط به پاسخ‌دهی ادمین
  const [replyingToId, setReplyingToId] = useState<string | null>(null);
  const [adminReplyText, setAdminReplyText] = useState("");
  const [isSubmittingReply, setIsSubmittingReply] = useState(false);

  const loadData = async () => {
    setIsLoading(true);
    const res = await fetchAllComments();
    if (res.success && res.data) {
      const normalizedData = res.data.map((c: any) => {
        let st = c.status;
        if (!['unread', 'approved', 'replied', 'rejected'].includes(st)) st = 'unread';

        const cleanName = c.name || c.fullName || c.author || c.username || "کاربر مهمان";
        let cleanText = c.text || c.message || c.content || c.body || c.comment || "";
        
        if (!cleanText && typeof c === 'object') {
          for (const key of Object.keys(c)) {
            if (!['_id', 'createdAt', 'updatedAt', 'status', '__v', 'parentId', 'articleId', 'isAdminReply'].includes(key)) {
              if (typeof c[key] === 'string' && c[key].length > 2) {
                cleanText = c[key];
                break;
              }
            }
          }
        }

        return {
          ...c,
          cleanStatus: st,
          cleanName: cleanName,
          cleanText: cleanText || "بدون متن (رکورد خالی قدیمی)"
        };
      });
      setComments(normalizedData);
    }
    setIsLoading(false);
  };

  useEffect(() => { loadData(); }, []);

  const handleStatusChange = async (id: string, status: 'unread' | 'approved' | 'replied' | 'rejected') => {
    await updateCommentStatus(id, status);
    loadData();
  };

  const handleBulkAction = async (action: 'unread' | 'approved' | 'replied' | 'rejected' | 'delete') => {
    if (selectedIds.length === 0) return;
    if (action === 'delete' && !confirm("آیا از حذف موارد انتخاب شده مطمئن هستید؟")) return;
    await bulkUpdateComments(selectedIds, action);
    setSelectedIds([]);
    loadData();
  };

  // ارسال پاسخ ادمین
  const handleAdminReplySubmit = async (commentId: string) => {
    if (!adminReplyText.trim()) return;
    setIsSubmittingReply(true);
    const res = await adminReplyToComment(commentId, adminReplyText);
    setIsSubmittingReply(false);
    if (res.success) {
      setReplyingToId(null);
      setAdminReplyText("");
      loadData();
    } else {
      alert(res.error || "خطایی رخ داد.");
    }
  };

  const filteredComments = comments.filter(c => c.cleanStatus === activeTab);
  const totalPages = Math.ceil(filteredComments.length / itemsPerPage);
  const paginatedComments = filteredComments.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const toggleSelect = (id: string) => setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  const toggleSelectAll = () => selectedIds.length === paginatedComments.length && paginatedComments.length > 0 ? setSelectedIds([]) : setSelectedIds(paginatedComments.map(c => c._id));

  return (
    <div className="flex flex-col gap-6">
      <div className="bg-white dark:bg-gray-900 p-6 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm flex flex-col md:flex-row justify-between items-center gap-4">
        <div>
          <h2 className="text-xl font-black text-gray-900 dark:text-white">مدیریت کامنت‌ها و پرسش و پاسخ</h2>
          <p className="text-sm text-gray-500">بررسی، پاسخ‌دهی ادمین و انتشار نظرات کاربران</p>
        </div>
        
        <div className="flex items-center gap-3">
          <select value={itemsPerPage} onChange={(e) => { setItemsPerPage(Number(e.target.value)); setCurrentPage(1); }} className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-xs font-bold rounded-xl px-3 py-2 outline-none cursor-pointer">
            <option value={10}>۱۰ مورد در صفحه</option>
            <option value={20}>۲۰ مورد در صفحه</option>
            <option value={50}>۵۰ مورد در صفحه</option>
          </select>
          {selectedIds.length > 0 && (
            <div className="flex flex-wrap items-center gap-1.5 bg-amber-50 dark:bg-amber-900/20 p-1 rounded-xl border border-amber-200 dark:border-amber-800">
              <button onClick={() => handleBulkAction('approved')} className="px-2.5 py-1.5 bg-emerald-500 text-white rounded-lg text-xs font-bold hover:bg-emerald-600 transition-colors">تایید ({selectedIds.length})</button>
              <button onClick={() => handleBulkAction('replied')} className="px-2.5 py-1.5 bg-indigo-500 text-white rounded-lg text-xs font-bold hover:bg-indigo-600 transition-colors">پاسخ داده شد</button>
              <button onClick={() => handleBulkAction('rejected')} className="px-2.5 py-1.5 bg-gray-500 text-white rounded-lg text-xs font-bold hover:bg-gray-600 transition-colors">رد</button>
              <button onClick={() => handleBulkAction('unread')} className="px-2.5 py-1.5 bg-blue-500 text-white rounded-lg text-xs font-bold hover:bg-blue-600 transition-colors">بازگشت به جدید</button>
              <button onClick={() => handleBulkAction('delete')} className="px-2.5 py-1.5 bg-red-500 text-white rounded-lg text-xs font-bold hover:bg-red-600 transition-colors">حذف</button>
            </div>
          )}
        </div>
      </div>

      {/* ۴ تب وضعیت */}
      <div className="flex flex-wrap gap-2 bg-gray-100 dark:bg-gray-800/50 p-1.5 rounded-2xl w-max">
        <button onClick={() => { setActiveTab('unread'); setCurrentPage(1); setSelectedIds([]); }} className={`px-4 py-2 rounded-xl text-xs font-black transition-all ${activeTab === 'unread' ? 'bg-white dark:bg-gray-900 text-amber-500 shadow-sm' : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'}`}>
          کامنت‌های جدید ({comments.filter(c => c.cleanStatus === 'unread').length})
        </button>
        <button onClick={() => { setActiveTab('approved'); setCurrentPage(1); setSelectedIds([]); }} className={`px-4 py-2 rounded-xl text-xs font-black transition-all ${activeTab === 'approved' ? 'bg-white dark:bg-gray-900 text-emerald-500 shadow-sm' : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'}`}>
          تایید شده ({comments.filter(c => c.cleanStatus === 'approved').length})
        </button>
        <button onClick={() => { setActiveTab('replied'); setCurrentPage(1); setSelectedIds([]); }} className={`px-4 py-2 rounded-xl text-xs font-black transition-all ${activeTab === 'replied' ? 'bg-white dark:bg-gray-900 text-indigo-500 shadow-sm' : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'}`}>
          پاسخ داده شده ({comments.filter(c => c.cleanStatus === 'replied').length})
        </button>
        <button onClick={() => { setActiveTab('rejected'); setCurrentPage(1); setSelectedIds([]); }} className={`px-4 py-2 rounded-xl text-xs font-black transition-all ${activeTab === 'rejected' ? 'bg-white dark:bg-gray-900 text-red-500 shadow-sm' : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'}`}>
          رد شده ({comments.filter(c => c.cleanStatus === 'rejected').length})
        </button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20"><div className="w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div></div>
      ) : paginatedComments.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-gray-400 gap-3 border-2 border-dashed border-gray-100 dark:border-gray-800 rounded-3xl">
          <Inbox size={48} className="opacity-50" />
          <p className="font-bold">هیچ کامنتی در این تب وجود ندارد.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-2 px-4">
            <button onClick={toggleSelectAll} className="text-gray-500 hover:text-amber-500 transition-colors">
              {selectedIds.length === paginatedComments.length && paginatedComments.length > 0 ? <CheckSquare size={20} className="text-amber-500" /> : <Square size={20} />}
            </button>
            <span className="text-xs font-bold text-gray-500">انتخاب همه در این صفحه</span>
          </div>

          {paginatedComments.map((cmt, i) => (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} key={cmt._id} className={`p-6 rounded-2xl border transition-all flex gap-4 shadow-xs ${cmt.isAdminReply ? 'bg-amber-400/5 border-amber-400/30' : 'bg-white dark:bg-gray-900 border-gray-100 dark:border-gray-800'}`}>
              <button onClick={() => toggleSelect(cmt._id)} className={`mt-2 ${selectedIds.includes(cmt._id) ? 'text-amber-500' : 'text-gray-300 dark:text-gray-700'}`}>
                {selectedIds.includes(cmt._id) ? <CheckSquare size={20} /> : <Square size={20} />}
              </button>
              
              <div className="grow flex flex-col">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`p-3 rounded-xl ${cmt.isAdminReply ? 'bg-amber-400 text-gray-950' : 'bg-amber-50 dark:bg-amber-500/10 text-amber-500'}`}>
                      {cmt.isAdminReply ? <ShieldCheck size={20} /> : <MessageSquare size={20} />}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-gray-900 dark:text-white text-base">{cmt.cleanName}</h3>
                        {cmt.isAdminReply && <span className="bg-amber-400/20 text-amber-600 dark:text-amber-400 text-[10px] font-black px-2 py-0.5 rounded-md">پاسخ رسمی ادمین</span>}
                        {cmt.parentId && <span className="bg-gray-100 dark:bg-gray-800 text-gray-500 text-[10px] font-bold px-2 py-0.5 rounded-md">در پاسخ به کاربر دیگر</span>}
                      </div>
                      <p className="text-xs font-mono text-gray-500">{cmt.email || "-"}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-xs font-bold text-gray-400 bg-gray-50 dark:bg-gray-800 px-3 py-1.5 rounded-lg">
                    <Clock size={14} />
                    {cmt.createdAt ? new Date(cmt.createdAt).toLocaleString('fa-IR') : 'نامشخص'}
                  </div>
                </div>
                
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-800/50 p-4 rounded-xl leading-relaxed whitespace-pre-wrap">
                  {cmt.cleanText}
                </p>

                {/* فرم پاسخ مستقیم ادمین */}
                <AnimatePresence>
                  {replyingToId === cmt._id && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="mt-4 p-4 bg-amber-400/10 rounded-2xl border border-amber-400/30 flex flex-col gap-3">
                      <span className="text-xs font-bold text-amber-700 dark:text-amber-400 flex items-center gap-1.5">
                        <Reply size={14} /> نوشتن پاسخ ادمین برای {cmt.cleanName}:
                      </span>
                      <textarea rows={3} value={adminReplyText} onChange={e => setAdminReplyText(e.target.value)} placeholder="متن پاسخ رسمی ادمین را اینجا بنویسید..." className="w-full bg-white dark:bg-gray-900 border border-amber-400/40 rounded-xl p-3 text-sm font-bold outline-none focus:border-amber-500 resize-none"></textarea>
                      <div className="flex justify-end gap-2">
                        <button onClick={() => { setReplyingToId(null); setAdminReplyText(""); }} className="px-4 py-2 bg-gray-200 dark:bg-gray-800 text-gray-600 dark:text-gray-300 rounded-xl text-xs font-bold hover:bg-gray-300 transition-colors">انصراف</button>
                        <button disabled={isSubmittingReply} onClick={() => handleAdminReplySubmit(cmt._id)} className="px-5 py-2 bg-amber-400 hover:bg-amber-500 text-gray-950 rounded-xl text-xs font-black flex items-center gap-1.5 transition-colors disabled:opacity-50">
                          {isSubmittingReply ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />} ثبت پاسخ و انتشار
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="flex flex-wrap items-center justify-end gap-2 mt-4 pt-4 border-t border-gray-100 dark:border-gray-800">
                  <button onClick={() => { setReplyingToId(replyingToId === cmt._id ? null : cmt._id); setAdminReplyText(""); }} className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-400/10 text-amber-600 dark:text-amber-400 rounded-xl text-xs font-bold hover:bg-amber-400/20 transition-colors mr-auto">
                    <Reply size={14} /> پاسخ به این نظر
                  </button>
                  {activeTab !== 'approved' && (
                    <button onClick={() => handleStatusChange(cmt._id, 'approved')} className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 rounded-xl text-xs font-bold hover:bg-emerald-100 transition-colors">
                      <CheckCircle2 size={14} /> انتقال به تایید شده
                    </button>
                  )}
                  {activeTab !== 'replied' && (
                    <button onClick={() => handleStatusChange(cmt._id, 'replied')} className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 rounded-xl text-xs font-bold hover:bg-indigo-100 transition-colors">
                      <CheckCircle2 size={14} /> انتقال به پاسخ داده شده
                    </button>
                  )}
                  {activeTab !== 'rejected' && (
                    <button onClick={() => handleStatusChange(cmt._id, 'rejected')} className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 dark:bg-gray-800 text-gray-600 rounded-xl text-xs font-bold hover:bg-gray-200 transition-colors">
                      <XCircle size={14} /> انتقال به رد شده
                    </button>
                  )}
                  {activeTab !== 'unread' && (
                    <button onClick={() => handleStatusChange(cmt._id, 'unread')} className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 dark:bg-blue-500/10 text-blue-600 rounded-xl text-xs font-bold hover:bg-blue-100 transition-colors">
                      <RotateCcw size={14} /> بازگشت به جدید
                    </button>
                  )}
                  <button onClick={() => { setSelectedIds([cmt._id]); handleBulkAction('delete'); }} className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 dark:bg-red-500/10 text-red-600 rounded-xl text-xs font-bold hover:bg-red-100 transition-colors">
                    <Trash2 size={14} /> حذف
                  </button>
                </div>
              </div>
            </motion.div>
          ))}

          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-6">
              {Array.from({ length: totalPages }).map((_, idx) => (
                <button key={idx} onClick={() => setCurrentPage(idx + 1)} className={`w-8 h-8 rounded-xl font-bold text-sm flex items-center justify-center transition-colors ${currentPage === idx + 1 ? 'bg-amber-400 text-gray-950' : 'bg-white dark:bg-gray-800 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700'}`}>
                  {idx + 1}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}