"use client";

import React, { useState, useEffect } from "react";
import { Plus, Search, Edit3, Trash2, X, CheckCircle2, ShieldAlert, Shield, ShieldHalf, User, KeyRound, Mail, ToggleLeft, ToggleRight, Check, Clock, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
// فرض بر این است که فایل اکشن شما با نام users.ts در پوشه actions قرار دارد
import { getUsers, createUser, updateUser, deleteUser } from "@/actions/user";

export default function UsersManager() {
  const [users, setUsers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  
  const [activeFilter, setActiveFilter] = useState<"all" | "super_admin" | "admin" | "editor">("all");
  
  const [editItem, setEditItem] = useState<any>(null);
  
  const [formData, setFormData] = useState({
    name: "", email: "", password: "", role: "editor", status: "active",
    permissions: [] as string[]
  });

  const availablePermissions = [
    { id: "products", label: "مدیریت محصولات و برندها" },
    { id: "gallery", label: "گالری و رسانه" },
    { id: "blog", label: "تحریریه و مجله گندم" },
    { id: "settings", label: "تنظیمات عمومی سایت" }
  ];

  const customEase: [number, number, number, number] = [0.22, 1, 0.36, 1];

  const fetchUsersData = async () => {
    setIsLoading(true);
    const res = await getUsers();
    if (res.success) setUsers(res.data);
    setIsLoading(false);
  };

  useEffect(() => {
    fetchUsersData();
  }, []);

  const filteredUsers = users.filter(u => {
    const matchesSearch = (u.name && u.name.includes(searchQuery)) || (u.email && u.email.toLowerCase().includes(searchQuery.toLowerCase()));
    if (activeFilter !== "all") return matchesSearch && u.role === activeFilter;
    return matchesSearch;
  });

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isModalOpen) return;
      if (e.key === "Escape") setIsModalOpen(false);
      if (e.ctrlKey && e.key === "Enter") handleSave();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isModalOpen, formData, editItem]);

  const handleTogglePermission = (permId: string) => {
    setFormData(prev => ({
      ...prev,
      permissions: prev.permissions.includes(permId) 
        ? prev.permissions.filter(p => p !== permId)
        : [...prev.permissions, permId]
    }));
  };

  const handleEditOpen = (item: any) => {
    setEditItem(item);
    setFormData({
      name: item.name || "", 
      email: item.email || "", 
      password: "", // رمز عبور برای امنیت همیشه خالی نمایش داده می‌شود
      role: item.role || "editor", 
      status: item.status || "active", 
      permissions: item.permissions?.includes("all") ? availablePermissions.map(p=>p.id) : (item.permissions || [])
    });
    setIsModalOpen(true);
  };

  const handleAddOpen = () => {
    setEditItem(null);
    setFormData({
      name: "", email: "", password: "", role: "editor", status: "active", permissions: ["blog"]
    });
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    if (!formData.name || !formData.email) {
      alert("وارد کردن نام و ایمیل الزامی است.");
      return;
    }

    const isSuperAdmin = formData.role === "super_admin";
    const finalPermissions = isSuperAdmin ? ["all"] : formData.permissions;

    const payload = {
      name: formData.name, 
      email: formData.email.toLowerCase(), 
      password: formData.password, // در سمت سرور هش خواهد شد
      role: formData.role, 
      status: formData.status, 
      permissions: finalPermissions,
      avatar: editItem?.avatar || `https://placehold.co/150x150/1e293b/ffffff?text=${formData.name.charAt(0)}`
    };

    if (editItem && editItem._id) {
      const res = await updateUser(editItem._id, payload);
      if (res.success) {
        setIsModalOpen(false);
        fetchUsersData();
      } else alert(res.error);
    } else {
      if (!formData.password) {
        alert("برای ایجاد کاربر جدید، تعیین رمز عبور الزامی است.");
        return;
      }
      const res = await createUser(payload);
      if (res.success) {
        setIsModalOpen(false);
        fetchUsersData();
      } else alert(res.error);
    }
  };

  const handleDelete = async (id: string, role: string) => {
    if (role === "super_admin") {
      alert("سوپر ادمین اصلی قابل حذف نیست!");
      return;
    }
    if (confirm("آیا از حذف این کاربر اطمینان دارید؟")) {
      const res = await deleteUser(id);
      if (res.success) fetchUsersData();
      else alert(res.error || "خطا در حذف کاربر");
    }
  };

  const RoleBadge = ({ role }: { role: string }) => {
    if (role === "super_admin") return <span className="flex items-center gap-1.5 text-xs font-black bg-red-100 text-red-600 dark:bg-red-500/10 dark:text-red-400 px-3 py-1.5 rounded-md"><ShieldAlert size={14}/> سوپر ادمین</span>;
    if (role === "admin") return <span className="flex items-center gap-1.5 text-xs font-black bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400 px-3 py-1.5 rounded-md"><Shield size={14}/> مدیر ارشد</span>;
    return <span className="flex items-center gap-1.5 text-xs font-black bg-blue-100 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400 px-3 py-1.5 rounded-md"><ShieldHalf size={14}/> نویسنده/ویرایشگر</span>;
  };

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto flex flex-col gap-8" dir="rtl">
      
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900 dark:text-white">مدیریت کاربران و دسترسی‌ها</h1>
          <p className="text-sm text-gray-500 mt-0.5">افزودن مدیر جدید، تعیین سطوح دسترسی و وضعیت اکانت‌ها</p>
        </div>
        <button onClick={handleAddOpen} className="w-full sm:w-auto bg-amber-400 hover:bg-amber-500 text-gray-950 px-5 py-2.5 rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg transition-transform hover:scale-105">
          <Plus size={18} /> افزودن کاربر جدید
        </button>
      </div>

      {/* فیلترها و سرچ */}
      <div className="flex flex-col md:flex-row gap-4 bg-white dark:bg-gray-900 rounded-3xl border border-gray-200/60 dark:border-gray-800/60 p-2 shadow-sm shrink-0">
        <div className="flex items-center gap-2 overflow-x-auto custom-scrollbar p-2">
          {[
            { id: "all", label: "همه کاربران" },
            { id: "super_admin", label: "سوپر ادمین‌ها" },
            { id: "admin", label: "مدیران ارشد" },
            { id: "editor", label: "ویرایشگرها" }
          ].map(f => (
            <button key={f.id} onClick={() => setActiveFilter(f.id as any)} className={`px-4 py-2 rounded-xl text-xs font-black transition-all whitespace-nowrap ${activeFilter === f.id ? "bg-gray-900 dark:bg-white text-white dark:text-gray-900 shadow-md" : "text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800"}`}>
              {f.label}
            </button>
          ))}
        </div>
        <div className="grow flex items-center gap-3 bg-gray-50 dark:bg-gray-800/50 rounded-2xl px-4 py-2 border border-gray-100 dark:border-gray-800/80">
          <Search className="text-gray-400 ml-1" size={18} />
          <input type="text" placeholder="جستجو بر اساس نام یا ایمیل..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="bg-transparent border-none outline-none text-sm font-bold w-full text-gray-900 dark:text-white placeholder:text-gray-400"/>
        </div>
      </div>

      {/* لیست کاربران */}
      {isLoading ? (
        <div className="flex justify-center py-20"><Loader2 className="animate-spin text-amber-500" size={40} /></div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence mode="popLayout">
            {filteredUsers.map(user => (
              <motion.div key={user._id} layout initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} transition={{ duration: 0.4, ease: customEase }} className={`bg-white dark:bg-gray-900 border ${user.status === 'active' ? 'border-gray-200 dark:border-gray-800' : 'border-red-200 dark:border-red-900/50 opacity-75'} rounded-[2rem] p-6 flex flex-col gap-5 shadow-sm hover:shadow-xl transition-all`}>
                
                <div className="flex justify-between items-start">
                  <div className="flex gap-4 items-center">
                    <img src={user.avatar || `https://placehold.co/150x150/1e293b/ffffff?text=${user.name?.charAt(0) || 'U'}`} alt={user.name} className="w-14 h-14 rounded-2xl object-cover shadow-inner" />
                    <div className="flex flex-col gap-1">
                      <h3 className="font-black text-gray-900 dark:text-white text-lg">{user.name}</h3>
                      <RoleBadge role={user.role} />
                    </div>
                  </div>
                  {user.status === 'active' ? <ToggleRight className="text-emerald-500" size={24}/> : <ToggleLeft className="text-red-400" size={24}/>}
                </div>

                <div className="flex flex-col gap-3 bg-gray-50 dark:bg-gray-800/40 p-4 rounded-2xl">
                  <span className="flex items-center gap-2 text-xs font-bold text-gray-600 dark:text-gray-400"><Mail size={14} className="text-gray-400"/> {user.email}</span>
                  <span className="flex items-center gap-2 text-xs font-bold text-gray-600 dark:text-gray-400" dir="ltr"><Clock size={14} className="text-gray-400"/> {user.lastLogin ? new Date(user.lastLogin).toLocaleDateString('fa-IR') : "---"} :Login</span>
                </div>

                <div className="mt-auto pt-2 flex gap-2 justify-end">
                  <button onClick={() => handleEditOpen(user)} className="p-3 bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:text-amber-500 hover:bg-amber-400/10 rounded-xl transition-colors font-bold text-xs flex items-center gap-2 grow justify-center"><Edit3 size={16} /> ویرایش دسترسی</button>
                  <button onClick={() => handleDelete(user._id, user.role)} className="p-3 bg-gray-50 dark:bg-gray-800 text-gray-400 hover:text-white hover:bg-red-500 rounded-xl transition-colors"><Trash2 size={16} /></button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          {filteredUsers.length === 0 && (
            <div className="col-span-full py-12 text-center text-gray-400 font-bold">مدیری با این مشخصات یافت نشد.</div>
          )}
        </div>
      )}

      {/* مدال افزودن/ویرایش کاربر */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsModalOpen(false)} className="absolute inset-0 bg-gray-950/80 backdrop-blur-md" />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} transition={{ duration: 0.5, ease: customEase }} className="relative bg-white dark:bg-gray-950 w-full max-w-3xl rounded-[2.5rem] shadow-2xl flex flex-col overflow-hidden border border-gray-200 dark:border-gray-800 z-10 max-h-[90vh]">
              
              <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/50">
                <h3 className="font-black text-xl text-gray-900 dark:text-white flex items-center gap-2">
                  <User className="text-amber-500"/> {editItem ? "ویرایش کاربر سیستم" : "ثبت مدیر جدید"}
                </h3>
                <button onClick={() => setIsModalOpen(false)} className="p-2 bg-gray-100 dark:bg-gray-800 rounded-full hover:text-red-500 transition-colors"><X size={18}/></button>
              </div>
              
              <div className="grow overflow-y-auto p-6 md:p-8 custom-scrollbar">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                  <div className="flex flex-col gap-2"><label className="text-xs font-black text-gray-400">نام کامل</label><input type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="border border-gray-200 dark:border-gray-800 rounded-xl p-3 bg-transparent text-sm font-bold outline-none focus:border-amber-400" /></div>
                  <div className="flex flex-col gap-2"><label className="text-xs font-black text-gray-400">آدرس ایمیل (نام کاربری)</label><input type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="border border-gray-200 dark:border-gray-800 rounded-xl p-3 bg-transparent text-sm font-bold outline-none focus:border-amber-400 text-left" dir="ltr" /></div>
                  <div className="flex flex-col gap-2"><label className="text-xs font-black text-gray-400">{editItem ? "تغییر رمز عبور (خالی بگذارید تا تغییر نکند)" : "رمز عبور اولیه"}</label><input type="password" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} className="border border-gray-200 dark:border-gray-800 rounded-xl p-3 bg-transparent text-sm font-bold outline-none focus:border-amber-400" /></div>
                  <div className="flex flex-col gap-2"><label className="text-xs font-black text-gray-400">وضعیت اکانت</label><select value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})} className="border border-gray-200 dark:border-gray-800 rounded-xl p-3 bg-white dark:bg-gray-900 text-sm font-bold outline-none focus:border-amber-400"><option value="active">فعال (اجازه ورود)</option><option value="inactive">غیرفعال (مسدود)</option></select></div>
                </div>

                <div className="border-t border-gray-200 dark:border-gray-800 pt-8">
                  <h4 className="font-black text-gray-900 dark:text-white mb-6 flex items-center gap-2"><ShieldAlert size={18} className="text-amber-500"/> تعیین سطح دسترسی (نقش)</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                    {[
                      { id: "super_admin", label: "سوپر ادمین", desc: "دسترسی کامل به سیستم و کاربران" },
                      { id: "admin", label: "مدیر ارشد", desc: "دسترسی به بخش‌های تعیین شده" },
                      { id: "editor", label: "نویسنده", desc: "فقط دسترسی به مدیریت مقالات" }
                    ].map(r => (
                      <div key={r.id} onClick={() => setFormData({...formData, role: r.id})} className={`p-4 rounded-2xl border-2 cursor-pointer transition-all ${formData.role === r.id ? "border-amber-400 bg-amber-50 dark:bg-amber-500/10" : "border-gray-100 dark:border-gray-800 hover:border-gray-300"}`}>
                        <div className="flex items-center justify-between mb-2">
                          <span className={`font-black text-sm ${formData.role === r.id ? "text-amber-600 dark:text-amber-400" : "text-gray-700 dark:text-gray-300"}`}>{r.label}</span>
                          {formData.role === r.id && <CheckCircle2 size={18} className="text-amber-500"/>}
                        </div>
                        <p className="text-[10px] font-bold text-gray-500">{r.desc}</p>
                      </div>
                    ))}
                  </div>

                  {/* چک‌باکس‌های دسترسی برای نقش‌های غیر از سوپر ادمین */}
                  <AnimatePresence>
                    {formData.role !== "super_admin" && (
                      <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                        <h4 className="font-black text-gray-900 dark:text-white mb-4 text-sm mt-4 border-t border-gray-200 dark:border-gray-800 pt-6">دسترسی‌های مجاز این مدیر:</h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {availablePermissions.map(perm => {
                            const isChecked = formData.permissions.includes(perm.id) || formData.permissions.includes("all");
                            return (
                              <label key={perm.id} className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${isChecked ? "bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/30" : "bg-gray-50 dark:bg-gray-800/50 border-transparent hover:bg-gray-100 dark:hover:bg-gray-800"}`}>
                                <div className={`w-5 h-5 rounded-md flex items-center justify-center border transition-colors ${isChecked ? "bg-emerald-500 border-emerald-500" : "bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-700"}`}>
                                  {isChecked && <Check size={14} className="text-white"/>}
                                </div>
                                <input type="checkbox" className="hidden" checked={isChecked} onChange={() => handleTogglePermission(perm.id)} />
                                <span className={`text-xs font-bold ${isChecked ? "text-emerald-700 dark:text-emerald-400" : "text-gray-600 dark:text-gray-400"}`}>{perm.label}</span>
                              </label>
                            );
                          })}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
              
              <div className="p-4 md:p-6 border-t border-gray-100 dark:border-gray-800 flex justify-end bg-gray-50/50 dark:bg-gray-900/50">
                <button onClick={handleSave} className="bg-amber-400 hover:bg-amber-500 text-gray-950 px-8 py-3 rounded-xl font-black text-sm flex items-center gap-2 shadow-md transition-all">
                  <CheckCircle2 size={18}/> ذخیره اطلاعات مدیر
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}