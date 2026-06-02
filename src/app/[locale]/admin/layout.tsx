"use client";

import React, { useState, useEffect, Suspense, ElementType } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useLocale } from "next-intl";
import Link from "next/link";
import { 
  LayoutDashboard, Layers, FileText, FolderKey, 
  Sliders, ShoppingBag, Info, ShieldCheck, 
  Settings, Users, Mail, Compass, Tag, Droplets, 
  Sparkles, Package, FlaskConical, Scale, CheckCircle2,
  ChevronDown, ChevronLeft,
  Factory, Target, BarChart, Award, MapPin, ClipboardList, Film, LayoutGrid, ListVideo, LayoutTemplate
} from "lucide-react";
import { LogOut, Globe } from "lucide-react";
import { useAdminShortcuts } from "./hooks/useAdminShortcuts";

// 1. تعریف تایپ‌های دقیق برای رفع ارورهای TypeScript
type SubItemType = {
  id: string;
  label: string;
  icon: ElementType;
};

type SidebarItemType = {
  id: string;
  label: string;
  icon: ElementType;
  subItems?: SubItemType[]; // علامت سوال یعنی این ویژگی اختیاری است
};

type TabMenuType = {
  label: string;
  icon: ElementType;
  sidebar: SidebarItemType[];
};

// 2. اعمال تایپ Record به ساختار منو
const menuStructure: Record<string, TabMenuType> = {
  home: {
    label: "صفحه اصلی",
    icon: LayoutDashboard,
    sidebar: [
      { id: "hero", label: "سکشن هیرو", icon: Sliders },
      { id: "products_sec", label: "سکشن محصولات", icon: ShoppingBag },
      { id: "brands_sec", label: "سکشن برندها", icon: Layers },
      { id: "footer_sec", label: "سکشن فوتر", icon: FileText },
    ]
  },
  
  about: {
    label: "درباره شرکت",
    icon: Info,
    sidebar: [
      // گزینه‌های سایدبار دقیقاً مطابق با تب‌های پنل تنظیم شدند
      { id: "history", label: "تاریخچه و ویدیو", icon: Factory },
      { id: "vision", label: "چشم‌انداز و ماموریت", icon: Target },
      { id: "stats", label: "آمار و چرا جزیره گندم", icon: BarChart },
      { id: "partners", label: "شرکا و گواهینامه‌ها", icon: Award },
      { id: "branches", label: "مدیریت تماس و شعب", icon: MapPin },
      { id: "agency_forms", label: "مدیریت فرمهای نمایندگی", icon: ClipboardList },
    ]
  },
  products: {
    label: "محصولات",
    icon: ShoppingBag,
    sidebar: [
      { id: "prod_list", label: "لیست محصولات", icon: ShoppingBag },
      // منوی کشویی مدیریت دسته‌بندی‌ها
      { 
        id: "categories_group", 
        label: "مدیریت دسته‌بندی‌ها", 
        icon: Layers, 
        subItems: [
          { id: "cat_main", label: "گروه‌های اصلی", icon: Layers },
          { id: "cat_brands", label: "برندهای زیرمجموعه", icon: Tag },
          { id: "cat_beverage_type", label: "انواع نوشیدنی", icon: Droplets },
          { id: "cat_snack_type", label: "انواع تنقلات", icon: Sparkles },
          { id: "cat_packaging", label: "انواع بسته‌بندی", icon: Package },
          { id: "cat_flavor", label: "طعم و عصاره", icon: FlaskConical },
          { id: "cat_weight", label: "احجام و اوزان", icon: Scale },
          { id: "cat_status", label: "لیبل‌های وضعیت", icon: CheckCircle2 },
        ]
      },
      { id: "catalog", label: "کاتالوگ‌ساز پویا", icon: FileText },
    ]
  },
  gallery: {
    label: "مدیریت گالری",
    icon: Film,
    sidebar: [
      { id: "gallery_all", label: "نمایش همه رسانه‌ها", icon: LayoutGrid },
      { id: "gallery_images", label: "مدیریت تصویر و آلبوم", icon: Layers },
      { id: "gallery_videos", label: "مدیریت ویدیوها", icon: ListVideo },
      { id: "cat_media", label: "دسته‌بندی گالری و رسانه", icon: Film },
    ]
  },
  
  blog: {
    label: "مجله و اخبار",
    icon: FileText,
    sidebar: [
      { id: "blog_all", label: "همه مقالات", icon: LayoutTemplate },
      { id: "blog_published", label: "منتشر شده‌ها", icon: CheckCircle2 },
      { id: "blog_draft", label: "پیش‌نویس‌ها", icon: FileText },
    ]
  },

  settings: {
    label: "تنظیمات عمومی",
    icon: Settings,
    sidebar: [
      { id: "users", label: "مدیریت کاربران", icon: Users },
      { id: "general", label: "تنظیمات سایت", icon: Settings },
    ]
  }
};

type TabKey = keyof typeof menuStructure;

function AdminLayoutContent({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const locale = useLocale();
  
  const isLoginPage = pathname.includes('/login');
  const currentSection = searchParams.get("section") || "hero";

  const [isAuthorized, setIsAuthorized] = useState(false);
  const [activeTab, setActiveTab] = useState<TabKey>("home");

  // استیت برای کنترل باز و بسته بودن منوهای کشویی سایدبار
  const [expandedGroups, setExpandedGroups] = useState<string[]>(["categories_group"]);

  useEffect(() => {
    if (isLoginPage) {
      setIsAuthorized(true);
      return;
    }
    const checkAuth = sessionStorage.getItem("isJazirehAdmin");
    if (!checkAuth) {
      router.push(`/${locale}/admin/login`);
    } else {
      setIsAuthorized(true);
    }
  }, [router, isLoginPage, pathname, locale]);

  // تنظیم خودکار تبِ فعال بر اساس اینکه آیا سکشن داخل منوی اصلی است یا زیرمنو
  useEffect(() => {
    for (const [key, tab] of Object.entries(menuStructure)) {
      const hasActiveItem = tab.sidebar.some(item => {
        if (item.id === currentSection) return true;
        if (item.subItems && item.subItems.some(sub => sub.id === currentSection)) return true;
        return false;
      });
      if (hasActiveItem) {
        setActiveTab(key as TabKey);
        break;
      }
    }
  }, [currentSection]);

  if (!isAuthorized) return <div className="min-h-screen bg-gray-950"></div>;
  if (isLoginPage) return <>{children}</>;

  const handleTabChange = (tab: TabKey) => {
    setActiveTab(tab);
    // وقتی تب عوض می‌شود، به اولین آیتمِ آن تب (چه عادی چه زیرمنو) برو
    const firstItem = menuStructure[tab].sidebar[0];
    const targetId = firstItem.subItems ? firstItem.subItems[0].id : firstItem.id;
    router.push(`/${locale}/admin?section=${targetId}`);
  };

  const handleSidebarClick = (id: string) => {
    router.push(`/${locale}/admin?section=${id}`);
  };

  const toggleGroup = (id: string) => {
    setExpandedGroups(prev => 
      prev.includes(id) ? prev.filter(g => g !== id) : [...prev, id]
    );
  };

  return (
    <div className="min-h-screen bg-transparent flex flex-col text-gray-900 dark:text-gray-100" dir="rtl">
      
      <header className="h-16 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-6 flex items-center justify-between sticky top-0 z-50 shadow-xs">
        <div className="flex items-center gap-2 font-black text-lg tracking-tight">
          <span className="text-red-600">پنل</span>
          <span>مدیریت</span>
        </div>

        <nav className="flex items-center gap-1 bg-gray-100 dark:bg-gray-800 p-1 rounded-xl">
          {(Object.keys(menuStructure) as TabKey[]).map((tabKey) => {
            const tab = menuStructure[tabKey];
            const TabIcon = tab.icon;
            const isActive = activeTab === tabKey;
            
            return (
              <button
                key={tabKey}
                onClick={() => handleTabChange(tabKey)}
                className={`relative flex items-center gap-2 px-5 py-2 text-xs font-bold rounded-lg transition-colors z-10 ${
                  isActive ? "text-gray-900 dark:text-white" : "text-gray-500 hover:text-gray-900 dark:hover:text-white"
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="activeAdminTab"
                    className="absolute inset-0 bg-white dark:bg-gray-700 rounded-lg shadow-sm -z-10"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
                <TabIcon size={16} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="flex items-center gap-3">
          <span className="text-xs font-bold text-gray-400">خوش آمدید، مدیر</span>
          <div className="w-8 h-8 rounded-full bg-amber-400" />
        </div>
      </header>

      <div className="flex grow h-[calc(100vh-64px)] overflow-hidden">
        
        <aside className="w-64 bg-white dark:bg-gray-900 border-l border-gray-200 dark:border-gray-800 p-4 flex flex-col justify-between overflow-y-auto custom-scrollbar">
          <div className="flex flex-col gap-1">
            <span className="text-[10px] font-black text-gray-400 dark:text-gray-500 block mb-3 px-3 uppercase tracking-wider">
              مدیریت بخش {menuStructure[activeTab].label}
            </span>
            
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, x: 15 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -15 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
                className="flex flex-col gap-1 w-full"
              >
                {menuStructure[activeTab].sidebar.map((item) => {
                  
                  // اگر آیتم دارای زیرمجموعه (Accordion) بود
                  if (item.subItems) {
                    const isExpanded = expandedGroups.includes(item.id);
                    const isChildActive = item.subItems.some(sub => sub.id === currentSection);
                    
                    return (
                      <div key={item.id} className="flex flex-col gap-1 w-full">
                        {/* دکمه اصلی گروه (باز و بسته کننده) */}
                        <button
                          onClick={() => toggleGroup(item.id)}
                          className={`flex items-center justify-between px-4 py-3 text-xs font-bold rounded-xl w-full text-right transition-all ${
                            isChildActive && !isExpanded 
                              ? "bg-amber-400/10 text-amber-600 dark:text-amber-500" 
                              : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800/50 hover:text-gray-900 dark:hover:text-white"
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <item.icon size={16} />
                            <span>{item.label}</span>
                          </div>
                          {isExpanded ? <ChevronDown size={14} /> : <ChevronLeft size={14} />}
                        </button>
                        
                        {/* لیست زیرمجموعه‌ها با افکت انیمیشنی */}
                        <AnimatePresence>
                          {isExpanded && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: "auto", opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              className="overflow-hidden flex flex-col gap-1 pr-4" // تورفتگی برای زیرمجموعه‌ها
                            >
                              {item.subItems.map((sub) => {
                                const SubIcon = sub.icon;
                                const isSubActive = currentSection === sub.id;
                                return (
                                   <button
                                     key={sub.id}
                                     onClick={() => handleSidebarClick(sub.id)}
                                     className={`flex items-center gap-3 px-4 py-2.5 text-xs font-bold rounded-xl w-full text-right transition-all ${
                                       isSubActive 
                                         ? "bg-amber-400 text-gray-950 shadow-lg shadow-amber-400/10" 
                                         : "text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800/50 hover:text-gray-900 dark:hover:text-white"
                                     }`}
                                   >
                                     <SubIcon size={14} />
                                     <span>{sub.label}</span>
                                   </button>
                                );
                              })}
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                      
                    );
                  } 
                  
                  // اگر آیتم یک لینک معمولی بود (بدون زیرمجموعه)
                  else {
                    const ItemIcon = item.icon;
                    const isItemActive = currentSection === item.id;

                    return (
                      <button
                        key={item.id}
                        onClick={() => handleSidebarClick(item.id)}
                        className={`flex items-center gap-3 px-4 py-3 text-xs font-bold rounded-xl w-full text-right transition-all ${
                          isItemActive 
                            ? "bg-amber-400 text-gray-950 shadow-lg shadow-amber-400/10" 
                            : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800/50 hover:text-gray-900 dark:hover:text-white"
                        }`}
                      >
                        <ItemIcon size={16} />
                        <span>{item.label}</span>
                      </button>
                    );
                  }
                })}
              </motion.div>
            </AnimatePresence>
          </div>
        <div className="mt-auto p-4 border-t border-gray-100 dark:border-gray-800 flex flex-col gap-1.5 shrink-0">
            <Link 
              href={`/${locale}`}
              className="flex items-center gap-3 px-4 py-2.5 text-xs font-bold rounded-xl w-full text-right text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800/50 hover:text-gray-900 dark:hover:text-white transition-all"
            >
              <Globe size={16} />
              <span>مشاهده وب‌سایت</span>
            </Link>
            
            <button 
              onClick={() => router.push(`/${locale}/admin/login`)} // یا هر منطق خروجی که دارید
              className="flex items-center gap-3 px-4 py-2.5 text-xs font-bold rounded-xl w-full text-right text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10 transition-all"
            >
              <LogOut size={16} />
              <span>خروج از پنل</span>
            </button>
          </div>

        </aside>

        <main className="grow p-8 overflow-y-auto bg-transparent custom-scrollbar">
          <div className="max-w-6xl mx-auto">
            {children}
          </div>
        </main>

      </div>
    </div>
  );
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-950"></div>}>
      <AdminLayoutContent>{children}</AdminLayoutContent>
    </Suspense>
  );
}