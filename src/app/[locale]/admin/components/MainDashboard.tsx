"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  Users, ShoppingBag, Eye, MessageSquare, Plus, Edit3, 
  Activity, Server, ShieldCheck, CheckCircle2,
  Clock, MailOpen, FileText, Sliders, LayoutDashboard, Database
} from "lucide-react";
import { 
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, Area, AreaChart 
} from "recharts";
import { getDashboardStats } from "@/actions/dashboard";
import Link from "next/link";
import { useLocale } from "next-intl";

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 100 } }
};

export default function MainDashboard() {
  const locale = useLocale();
  const [mounted, setMounted] = useState(false);
  const [stats, setStats] = useState({ products: 0, brands: 0, admins: 0, views: 0, messages: 0, agencies: 0, comments: 0 });
  const [activities, setActivities] = useState<any[]>([]);
  const [trafficData, setTrafficData] = useState<any[]>([]);
  const [productDistribution, setProductDistribution] = useState<any[]>([]);

  useEffect(() => {
    setMounted(true);
    getDashboardStats().then(res => {
      if (res.success && res.data) {
        setStats(prev => ({ ...prev, ...res.data.stats }));
        setActivities(res.data.recentActivities || []);
        setTrafficData(res.data.trafficData || []);
        
        setProductDistribution(res.data.categoryDistribution?.length > 0 
          ? res.data.categoryDistribution 
          : [{ name: 'بدون محصول', value: 1, color: '#e5e7eb' }]
        );
      }
    });
  }, []);

  if (!mounted) return null;

  const quickActions = [
    { label: "افزودن محصول جدید", icon: Plus, link: `/${locale}/admin?section=prod_list`, color: "text-emerald-500", hover: "hover:bg-emerald-50 border-emerald-200" },
    { label: "مدیریت پیام‌ها", icon: MailOpen, link: `/${locale}/admin?section=general`, color: "text-rose-500", hover: "hover:bg-rose-50 border-rose-200" },
    { label: "مدیریت مجله و مقالات", icon: FileText, link: `/${locale}/admin?section=blog_all`, color: "text-blue-500", hover: "hover:bg-blue-50 border-blue-200" },
    { label: "ویرایش اسلایدر هیرو", icon: Sliders, link: `/${locale}/admin?section=hero`, color: "text-amber-500", hover: "hover:bg-amber-50 border-amber-200" },
  ];

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="show" className="flex flex-col gap-6 w-full pb-10">
      
      {/* سربرگ داشبورد */}
      <motion.div variants={itemVariants} className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-gray-900 p-6 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-amber-400/5 rounded-full blur-3xl -z-10" />
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-amber-400 text-gray-950 rounded-2xl flex items-center justify-center shadow-lg shadow-amber-400/20">
            <LayoutDashboard size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-black text-gray-900 dark:text-white mb-1">پیشخوان مدیریت</h1>
            <p className="text-sm font-medium text-gray-500">گزارش‌گیری زنده و واقعی از وضعیت دیتابیس</p>
          </div>
        </div>
        <div className="flex items-center gap-3 bg-green-50 dark:bg-green-500/10 text-green-600 dark:text-green-400 px-4 py-2 rounded-xl text-sm font-bold border border-green-200 dark:border-green-900/30">
          <Activity size={18} className="animate-pulse" />
          <span>ارتباط با پایگاه داده برقرار است</span>
        </div>
      </motion.div>

      {/* ۱. کارت‌های آماری کلیدی */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { title: "مجموع محصولات ثبتی", value: stats.products, icon: ShoppingBag, color: "text-amber-500", bg: "bg-amber-50 dark:bg-amber-500/10", tag: "محصول" },
          { title: "ادمین‌های سیستم", value: stats.admins, icon: Users, color: "text-indigo-500", bg: "bg-indigo-50 dark:bg-indigo-500/10", tag: "مدیر" },
          { title: "پیام‌های فرم تماس", value: stats.messages, icon: MessageSquare, color: "text-rose-500", bg: "bg-rose-50 dark:bg-rose-500/10", tag: "پشتیبانی" },
          { title: "کامنت‌های ناخوانده", value: stats.comments, icon: MessageSquare, color: "text-blue-500", bg: "bg-blue-50 dark:bg-blue-500/10", tag: "نظرات مقالات" },
        ].map((kpi, i) => (
          <motion.div key={i} whileHover={{ y: -5, transition: { duration: 0.2 } }} className="bg-white dark:bg-gray-900 p-6 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm flex flex-col gap-4 group">
            <div className="flex justify-between items-start">
              <div className={`p-3 rounded-2xl ${kpi.bg} ${kpi.color}`}>
                <kpi.icon size={24} />
              </div>
              <span className="text-[10px] font-bold text-gray-500 bg-gray-50 dark:bg-gray-800 px-2 py-1 rounded-md">
                {kpi.tag}
              </span>
            </div>
            <div>
              <h3 className="text-3xl font-black text-gray-900 dark:text-white mb-1">{kpi.value}</h3>
              <p className="text-xs font-bold text-gray-500">{kpi.title}</p>
            </div>
          </motion.div>
        ))}
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* ۲. نمودار خطی ترافیک */}
        <motion.div variants={itemVariants} className="lg:col-span-2 bg-white dark:bg-gray-900 p-6 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-black text-gray-900 dark:text-white">آمار بازدید سایت (۳۰ روز اخیر)</h3>
          </div>
          <div className="grow w-full min-h-75" dir="ltr">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trafficData} margin={{ top: 10, right: 0, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.1} vertical={false} />
                <XAxis dataKey="day" stroke="#9ca3af" fontSize={10} tickLine={false} axisLine={false} />
                <YAxis stroke="#9ca3af" fontSize={10} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ backgroundColor: '#111827', borderColor: '#374151', borderRadius: '12px', color: '#fff', fontSize: '12px' }} itemStyle={{ color: '#60a5fa', fontWeight: 'bold' }} />
                <Area type="monotone" dataKey="views" name="تعداد بازدید" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorViews)" activeDot={{ r: 6, fill: '#3b82f6' }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* نمودار دایره‌ای */}
        <motion.div variants={itemVariants} className="bg-white dark:bg-gray-900 p-6 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm flex flex-col">
          <h3 className="font-black text-gray-900 dark:text-white mb-2">موجودی دسته‌بندی‌ها</h3>
          <div className="grow flex items-center justify-center min-h-55">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={productDistribution} cx="50%" cy="50%" innerRadius={65} outerRadius={85} paddingAngle={5} dataKey="value" animationDuration={1500}>
                  {productDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', fontSize: '12px', fontWeight: 'bold' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex flex-wrap justify-center gap-4 mt-4">
            {productDistribution.map((item, i) => (
              <div key={i} className="flex items-center gap-2 text-xs font-bold text-gray-600 dark:text-gray-300">
                <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                <span>{item.name} ({item.value})</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* ۳. اقدامات سریع */}
        <motion.div variants={itemVariants} className="flex flex-col gap-6">
          <div className="bg-white dark:bg-gray-900 p-6 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm">
            <h3 className="font-black text-gray-900 dark:text-white mb-4">اقدامات سریع</h3>
            <div className="grid grid-cols-2 gap-3">
              {quickActions.map((action, idx) => (
                <Link key={idx} href={action.link} className={`bg-gray-50 dark:bg-gray-800/50 border p-4 rounded-2xl flex flex-col items-center justify-center gap-3 transition-all duration-300 group border-transparent ${action.hover}`}>
                  <div className={`p-3 rounded-xl bg-white dark:bg-gray-800 shadow-sm ${action.color} group-hover:scale-110 transition-transform`}>
                    <action.icon size={20} />
                  </div>
                  <span className="text-[10px] font-bold text-gray-600 dark:text-gray-300 text-center">{action.label}</span>
                </Link>
              ))}
            </div>
          </div>

          <div className="bg-linear-to-br from-gray-900 to-gray-800 p-6 rounded-3xl border border-gray-700 shadow-xl relative overflow-hidden text-white">
            <div className="absolute -left-6 -bottom-6 text-white/5 rotate-12">
              <Database size={120} />
            </div>
            <h3 className="font-black mb-5 relative z-10 flex items-center gap-2">
              <ShieldCheck size={20} className="text-emerald-400" /> وضعیت سیستم
            </h3>
            <div className="flex flex-col gap-4 relative z-10">
              <div className="flex justify-between items-center text-sm border-b border-white/10 pb-3">
                <span className="text-gray-400 font-medium">پایگاه داده (DB)</span>
                <span className="font-bold text-emerald-400 flex items-center gap-1"><CheckCircle2 size={14} /> آنلاین</span>
              </div>
              <div className="flex justify-between items-center text-sm border-b border-white/10 pb-3">
                <span className="text-gray-400 font-medium">سرویس آمارگیر</span>
                <span className="font-bold text-blue-400">فعال (Local)</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* ۴. آخرین فعالیت‌ها */}
        <motion.div variants={itemVariants} className="lg:col-span-2 bg-white dark:bg-gray-900 p-6 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-black text-gray-900 dark:text-white">آخرین رویدادهای سیستم</h3>
          </div>
          
          <div className="flex flex-col gap-3">
            {activities.length > 0 ? (
              activities.map((activity, i) => (
                <div key={i} className="flex items-center gap-4 p-4 border border-gray-100 dark:border-gray-800 rounded-2xl">
                   <div className="p-3 rounded-xl shrink-0 bg-amber-50 dark:bg-amber-900/20 text-amber-500">
                     <Clock size={20} />
                   </div>
                   <div className="flex flex-col gap-1">
                     <span className="text-sm font-bold text-gray-800 dark:text-gray-200">{activity.description}</span>
                     <span className="text-[10px] text-gray-400">{new Date(activity.createdAt).toLocaleString('fa-IR')}</span>
                   </div>
                </div>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center py-12 border-2 border-dashed border-gray-200 dark:border-gray-800 rounded-2xl text-gray-400 gap-3">
                <Activity size={32} className="opacity-50" />
                <span className="text-sm font-bold">برای تست، یک برند یا محصول اضافه کنید تا لاگ آن اینجا ثبت شود.</span>
              </div>
            )}
          </div>
        </motion.div>

      </div>
    </motion.div>
  );
}