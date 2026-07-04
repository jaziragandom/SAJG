"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Mail, Trash2, CheckCircle2, XCircle, Clock, Inbox, CheckSquare, Square, RotateCcw } from "lucide-react";
import { fetchAllMessages, updateMessageStatus, bulkUpdateMessages } from "@/actions/communications";
import { useToast } from "../components/ToastProvider";

export default function MessagesManager() {
  const { showToast } = useToast();

  const [messages, setMessages] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'unread' | 'replied' | 'ignored'>('unread');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const loadData = async () => {
    setIsLoading(true);
    const res = await fetchAllMessages();
    if (res.success && res.data) {
      const normalizedData = res.data.map((m: any) => {
        let st = m.status;
        if (st === 'read') st = 'replied';
        if (!['unread', 'replied', 'ignored'].includes(st)) st = 'unread';

        const cleanName = m.name || m.fullName || m.username || "کاربر مهمان";
        let cleanText = m.text || m.message || m.content || m.body || m.description || "";
        
        if (!cleanText && typeof m === 'object') {
          for (const key of Object.keys(m)) {
            if (!['_id', 'createdAt', 'updatedAt', 'status', '__v', 'email'].includes(key)) {
              if (typeof m[key] === 'string' && m[key].length > 2) {
                cleanText = m[key];
                break;
              }
            }
          }
        }

        return {
          ...m,
          cleanStatus: st,
          cleanName: cleanName,
          cleanText: cleanText || "بدون متن (رکورد خالی قدیمی)"
        };
      });
      setMessages(normalizedData);
    }
    setIsLoading(false);
  };

  useEffect(() => { loadData(); }, []);

  const handleStatusChange = async (id: string, status: 'unread' | 'replied' | 'ignored') => {
    await updateMessageStatus(id, status);
    showToast("وضعیت پیام با موفقیت تغییر کرد.", "success");
    loadData();
  };

  const handleBulkAction = async (action: 'unread' | 'replied' | 'ignored' | 'delete') => {
    if (selectedIds.length === 0) return;
    if (action === 'delete' && !confirm("آیا از حذف موارد انتخاب شده مطمئن هستید؟")) return;
    await bulkUpdateMessages(selectedIds, action);
    showToast("عملیات گروهی با موفقیت روی پیام‌های انتخاب‌شده انجام شد.", "success");
    setSelectedIds([]);
    loadData();
  };

  const filteredMessages = messages.filter(m => m.cleanStatus === activeTab);
  const totalPages = Math.ceil(filteredMessages.length / itemsPerPage);
  const paginatedMessages = filteredMessages.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const toggleSelect = (id: string) => setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  const toggleSelectAll = () => selectedIds.length === paginatedMessages.length && paginatedMessages.length > 0 ? setSelectedIds([]) : setSelectedIds(paginatedMessages.map(m => m._id));

  return (
    <div className="flex flex-col gap-6">
      <div className="bg-white dark:bg-gray-900 p-6 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm flex flex-col md:flex-row justify-between items-center gap-4">
        <div>
          <h2 className="text-xl font-black text-gray-900 dark:text-white">مدیریت پیام‌های دریافتی</h2>
          <p className="text-sm text-gray-500">مشاهده و دسته‌بندی پیام‌های فرم تماس با ما</p>
        </div>
        
        <div className="flex items-center gap-3">
          <select value={itemsPerPage} onChange={(e) => { setItemsPerPage(Number(e.target.value)); setCurrentPage(1); }} className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-xs font-bold rounded-xl px-3 py-2 outline-none cursor-pointer">
            <option value={10}>۱۰ مورد در صفحه</option>
            <option value={20}>۲۰ مورد در صفحه</option>
            <option value={50}>۵۰ مورد در صفحه</option>
          </select>
          {selectedIds.length > 0 && (
            <div className="flex items-center gap-1.5 bg-amber-50 dark:bg-amber-900/20 p-1 rounded-xl border border-amber-200 dark:border-amber-800">
              <button onClick={() => handleBulkAction('replied')} className="px-2.5 py-1.5 bg-emerald-500 text-white rounded-lg text-xs font-bold hover:bg-emerald-600 transition-colors">پاسخ داده شد ({selectedIds.length})</button>
              <button onClick={() => handleBulkAction('ignored')} className="px-2.5 py-1.5 bg-gray-500 text-white rounded-lg text-xs font-bold hover:bg-gray-600 transition-colors">نادیده گرفتن</button>
              <button onClick={() => handleBulkAction('unread')} className="px-2.5 py-1.5 bg-blue-500 text-white rounded-lg text-xs font-bold hover:bg-blue-600 transition-colors">بازگشت به جدید</button>
              <button onClick={() => handleBulkAction('delete')} className="px-2.5 py-1.5 bg-red-500 text-white rounded-lg text-xs font-bold hover:bg-red-600 transition-colors">حذف</button>
            </div>
          )}
        </div>
      </div>

      <div className="flex gap-2 bg-gray-100 dark:bg-gray-800/50 p-1.5 rounded-2xl w-max">
        <button onClick={() => { setActiveTab('unread'); setCurrentPage(1); setSelectedIds([]); }} className={`px-5 py-2 rounded-xl text-xs font-black transition-all ${activeTab === 'unread' ? 'bg-white dark:bg-gray-900 text-amber-500 shadow-sm' : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'}`}>
          پیام‌های جدید ({messages.filter(m => m.cleanStatus === 'unread').length})
        </button>
        <button onClick={() => { setActiveTab('replied'); setCurrentPage(1); setSelectedIds([]); }} className={`px-5 py-2 rounded-xl text-xs font-black transition-all ${activeTab === 'replied' ? 'bg-white dark:bg-gray-900 text-emerald-500 shadow-sm' : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'}`}>
          پاسخ داده شده ({messages.filter(m => m.cleanStatus === 'replied').length})
        </button>
        <button onClick={() => { setActiveTab('ignored'); setCurrentPage(1); setSelectedIds([]); }} className={`px-5 py-2 rounded-xl text-xs font-black transition-all ${activeTab === 'ignored' ? 'bg-white dark:bg-gray-900 text-red-500 shadow-sm' : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'}`}>
          نادیده گرفته شده ({messages.filter(m => m.cleanStatus === 'ignored').length})
        </button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20"><div className="w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div></div>
      ) : paginatedMessages.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-gray-400 gap-3 border-2 border-dashed border-gray-100 dark:border-gray-800 rounded-3xl">
          <Inbox size={48} className="opacity-50" />
          <p className="font-bold">هیچ پیامی در این تب وجود ندارد.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-2 px-4">
            <button onClick={toggleSelectAll} className="text-gray-500 hover:text-amber-500 transition-colors">
              {selectedIds.length === paginatedMessages.length && paginatedMessages.length > 0 ? <CheckSquare size={20} className="text-amber-500" /> : <Square size={20} />}
            </button>
            <span className="text-xs font-bold text-gray-500">انتخاب همه در این صفحه</span>
          </div>

          {paginatedMessages.map((msg, i) => (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} key={msg._id} className="p-6 rounded-2xl border bg-white dark:bg-gray-900 border-gray-100 dark:border-gray-800 flex gap-4 shadow-xs">
              <button onClick={() => toggleSelect(msg._id)} className={`mt-2 ${selectedIds.includes(msg._id) ? 'text-amber-500' : 'text-gray-300 dark:text-gray-700'}`}>
                {selectedIds.includes(msg._id) ? <CheckSquare size={20} /> : <Square size={20} />}
              </button>
              
              <div className="grow flex flex-col">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-500/10 text-amber-500"><Mail size={20} /></div>
                    <div>
                      <h3 className="font-bold text-gray-900 dark:text-white text-base">{msg.cleanName}</h3>
                      <p className="text-xs font-mono text-gray-500">{msg.email || "-"}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-xs font-bold text-gray-400 bg-gray-50 dark:bg-gray-800 px-3 py-1.5 rounded-lg">
                    <Clock size={14} />
                    {msg.createdAt ? new Date(msg.createdAt).toLocaleString('fa-IR') : 'نامشخص'}
                  </div>
                </div>
                
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-800/50 p-4 rounded-xl leading-relaxed whitespace-pre-wrap">
                  {msg.cleanText}
                </p>

                <div className="flex flex-wrap items-center justify-end gap-2 mt-4 pt-4 border-t border-gray-100 dark:border-gray-800">
                  {activeTab !== 'replied' && (
                    <button onClick={() => handleStatusChange(msg._id, 'replied')} className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 rounded-xl text-xs font-bold hover:bg-emerald-100 transition-colors">
                      <CheckCircle2 size={14} /> انتقال به پاسخ داده شده
                    </button>
                  )}
                  {activeTab !== 'ignored' && (
                    <button onClick={() => handleStatusChange(msg._id, 'ignored')} className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 dark:bg-gray-800 text-gray-600 rounded-xl text-xs font-bold hover:bg-gray-200 transition-colors">
                      <XCircle size={14} /> انتقال به نادیده گرفته شده
                    </button>
                  )}
                  {activeTab !== 'unread' && (
                    <button onClick={() => handleStatusChange(msg._id, 'unread')} className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 dark:bg-blue-500/10 text-blue-600 rounded-xl text-xs font-bold hover:bg-blue-100 transition-colors">
                      <RotateCcw size={14} /> بازگشت به جدید
                    </button>
                  )}
                  <button onClick={() => { setSelectedIds([msg._id]); handleBulkAction('delete'); }} className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 dark:bg-red-500/10 text-red-600 rounded-xl text-xs font-bold hover:bg-red-100 transition-colors">
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