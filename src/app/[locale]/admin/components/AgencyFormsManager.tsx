"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ClipboardList, Trash2, CheckCircle2, XCircle, Clock, Inbox, CheckSquare, Square, RotateCcw, MapPin, Phone } from "lucide-react";
import { fetchAllAgencyForms, updateAgencyFormStatus, bulkUpdateAgencyForms } from "@/actions/communications";

export default function AgencyFormsManager() {
  const [forms, setForms] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'unread' | 'reviewed' | 'rejected'>('unread');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const loadData = async () => {
    setIsLoading(true);
    const res = await fetchAllAgencyForms();
    if (res.success) setForms(res.data);
    setIsLoading(false);
  };

  useEffect(() => { loadData(); }, []);

  const handleStatusChange = async (id: string, status: 'unread' | 'reviewed' | 'rejected') => {
    await updateAgencyFormStatus(id, status);
    loadData();
  };

  const handleBulkAction = async (action: 'unread' | 'reviewed' | 'rejected' | 'delete') => {
    if (selectedIds.length === 0) return;
    if (action === 'delete' && !confirm("آیا از حذف موارد انتخاب شده مطمئن هستید؟")) return;
    await bulkUpdateAgencyForms(selectedIds, action);
    setSelectedIds([]);
    loadData();
  };

  const filteredForms = forms.filter(f => f.status === activeTab);
  const totalPages = Math.ceil(filteredForms.length / itemsPerPage);
  const paginatedForms = filteredForms.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const toggleSelect = (id: string) => setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  const toggleSelectAll = () => selectedIds.length === paginatedForms.length && paginatedForms.length > 0 ? setSelectedIds([]) : setSelectedIds(paginatedForms.map(f => f._id));

  return (
    <div className="flex flex-col gap-6">
      <div className="bg-white dark:bg-gray-900 p-6 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm flex flex-col md:flex-row justify-between items-center gap-4">
        <div>
          <h2 className="text-xl font-black text-gray-900 dark:text-white">درخواست‌های نمایندگی</h2>
          <p className="text-sm text-gray-500">بررسی و مدیریت فرم‌های اخذ نمایندگی جزیره گندم</p>
        </div>
        
        <div className="flex items-center gap-3">
          <select value={itemsPerPage} onChange={(e) => { setItemsPerPage(Number(e.target.value)); setCurrentPage(1); }} className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-xs font-bold rounded-xl px-3 py-2 outline-none cursor-pointer">
            <option value={10}>۱۰ مورد در صفحه</option>
            <option value={20}>۲۰ مورد در صفحه</option>
            <option value={50}>۵۰ مورد در صفحه</option>
          </select>
          {selectedIds.length > 0 && (
            <div className="flex items-center gap-1.5 bg-amber-50 dark:bg-amber-900/20 p-1 rounded-xl border border-amber-200 dark:border-amber-800">
              <button onClick={() => handleBulkAction('reviewed')} className="px-2.5 py-1.5 bg-emerald-500 text-white rounded-lg text-xs font-bold hover:bg-emerald-600 transition-colors">تایید ({selectedIds.length})</button>
              <button onClick={() => handleBulkAction('rejected')} className="px-2.5 py-1.5 bg-gray-500 text-white rounded-lg text-xs font-bold hover:bg-gray-600 transition-colors">رد</button>
              <button onClick={() => handleBulkAction('unread')} className="px-2.5 py-1.5 bg-blue-500 text-white rounded-lg text-xs font-bold hover:bg-blue-600 transition-colors">بازگشت به جدید</button>
              <button onClick={() => handleBulkAction('delete')} className="px-2.5 py-1.5 bg-red-500 text-white rounded-lg text-xs font-bold hover:bg-red-600 transition-colors">حذف</button>
            </div>
          )}
        </div>
      </div>

      <div className="flex gap-2 bg-gray-100 dark:bg-gray-800/50 p-1.5 rounded-2xl w-max">
        <button onClick={() => { setActiveTab('unread'); setCurrentPage(1); setSelectedIds([]); }} className={`px-5 py-2 rounded-xl text-xs font-black transition-all ${activeTab === 'unread' ? 'bg-white dark:bg-gray-900 text-amber-500 shadow-sm' : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'}`}>
          درخواست‌های جدید ({forms.filter(f => f.status === 'unread').length})
        </button>
        <button onClick={() => { setActiveTab('reviewed'); setCurrentPage(1); setSelectedIds([]); }} className={`px-5 py-2 rounded-xl text-xs font-black transition-all ${activeTab === 'reviewed' ? 'bg-white dark:bg-gray-900 text-emerald-500 shadow-sm' : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'}`}>
          تایید شده ({forms.filter(f => f.status === 'reviewed').length})
        </button>
        <button onClick={() => { setActiveTab('rejected'); setCurrentPage(1); setSelectedIds([]); }} className={`px-5 py-2 rounded-xl text-xs font-black transition-all ${activeTab === 'rejected' ? 'bg-white dark:bg-gray-900 text-red-500 shadow-sm' : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'}`}>
          رد شده ({forms.filter(f => f.status === 'rejected').length})
        </button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20"><div className="w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div></div>
      ) : paginatedForms.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-gray-400 gap-3 border-2 border-dashed border-gray-100 dark:border-gray-800 rounded-3xl">
          <Inbox size={48} className="opacity-50" />
          <p className="font-bold">هیچ درخواستی در این بخش وجود ندارد.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-2 px-4">
            <button onClick={toggleSelectAll} className="text-gray-500 hover:text-amber-500 transition-colors">
              {selectedIds.length === paginatedForms.length && paginatedForms.length > 0 ? <CheckSquare size={20} className="text-amber-500" /> : <Square size={20} />}
            </button>
            <span className="text-xs font-bold text-gray-500">انتخاب همه در این صفحه</span>
          </div>

          {paginatedForms.map((frm, i) => (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} key={frm._id} className="p-6 rounded-2xl border bg-white dark:bg-gray-900 border-gray-100 dark:border-gray-800 flex gap-4 shadow-xs">
              <button onClick={() => toggleSelect(frm._id)} className={`mt-2 ${selectedIds.includes(frm._id) ? 'text-amber-500' : 'text-gray-300 dark:text-gray-700'}`}>
                {selectedIds.includes(frm._id) ? <CheckSquare size={20} /> : <Square size={20} />}
              </button>
              
              <div className="grow flex flex-col">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-500/10 text-amber-500"><ClipboardList size={20} /></div>
                    <div>
                      <h3 className="font-bold text-gray-900 dark:text-white text-base">{frm.name || "نامشخص"}</h3>
                      <div className="flex items-center gap-4 mt-1 text-xs text-gray-500">
                        <span className="flex items-center gap-1 font-mono"><Phone size={12}/> {frm.phone || "-"}</span>
                        <span className="flex items-center gap-1"><MapPin size={12}/> {frm.city || "-"}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-xs font-bold text-gray-400 bg-gray-50 dark:bg-gray-800 px-3 py-1.5 rounded-lg">
                    <Clock size={14} />
                    {frm.createdAt ? new Date(frm.createdAt).toLocaleString('fa-IR') : 'نامشخص'}
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-2">
                  <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-xl text-sm">
                    <span className="font-bold text-gray-400 block mb-1 text-xs">توضیحات و امکانات:</span>
                    <span className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{frm.description || frm.text || frm.message || "بدون توضیحات"}</span>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-xl text-sm">
                    <span className="font-bold text-gray-400 block mb-1 text-xs">سابقه پخش و توزیع:</span>
                    <span className="text-gray-700 dark:text-gray-300 font-mono">{frm.experience ? `${frm.experience} سال` : "ذکر نشده"}</span>
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-end gap-2 mt-4 pt-4 border-t border-gray-100 dark:border-gray-800">
                  {activeTab !== 'reviewed' && (
                    <button onClick={() => handleStatusChange(frm._id, 'reviewed')} className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 rounded-xl text-xs font-bold hover:bg-emerald-100 transition-colors">
                      <CheckCircle2 size={14} /> انتقال به تایید شده
                    </button>
                  )}
                  {activeTab !== 'rejected' && (
                    <button onClick={() => handleStatusChange(frm._id, 'rejected')} className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 dark:bg-gray-800 text-gray-600 rounded-xl text-xs font-bold hover:bg-gray-200 transition-colors">
                      <XCircle size={14} /> انتقال به رد شده
                    </button>
                  )}
                  {activeTab !== 'unread' && (
                    <button onClick={() => handleStatusChange(frm._id, 'unread')} className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 dark:bg-blue-500/10 text-blue-600 rounded-xl text-xs font-bold hover:bg-blue-100 transition-colors">
                      <RotateCcw size={14} /> بازگشت به جدید
                    </button>
                  )}
                  <button onClick={() => { setSelectedIds([frm._id]); handleBulkAction('delete'); }} className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 dark:bg-red-500/10 text-red-600 rounded-xl text-xs font-bold hover:bg-red-100 transition-colors">
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