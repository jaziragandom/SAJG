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
  ChevronDown, ChevronLeft, MessageSquare,
  Factory, Target, BarChart, Award, MapPin, ClipboardList, Film, LayoutGrid, ListVideo, LayoutTemplate,
  LogOut, Globe, Send 
} from "lucide-react";
import { getAdminSession } from "@/actions/user";
import { getNotificationCounts } from "@/actions/notifications";
import { ToastProvider } from "./components/ToastProvider";

type SubItemType = {
  id: string;
  label: string;
  icon: ElementType;
};

type SidebarItemType = {
  id: string;
  label: string;
  icon: ElementType;
  subItems?: SubItemType[]; 
};

type TabMenuType = {
  label: string;
  icon: ElementType;
  sidebar: SidebarItemType[];
};

const menuStructure: Record<string, TabMenuType> = {
  dashboard: {
    label: "پیشخوان",
    icon: LayoutDashboard,
    sidebar: [
      { id: "overview", label: "نمای کلی سایت", icon: BarChart },
      { id: "dash_messages_sec", label: "مدیریت پیام‌ها", icon: Mail },
      { id: "dash_comments_sec", label: "مدیریت کامنت‌ها", icon: MessageSquare },
      { id: "newsletter_sec", label: "باشگاه مشتریان و خبرنامه", icon: Send } 
    ]
  },
  home: {
    label: "صفحه‌ اصلی",
    icon: LayoutTemplate,
    sidebar: [
      { id: "hero", label: "سکشن هیرو", icon: Sliders },
      { id: "products_sec", label: "سکشن محصولات", icon: ShoppingBag },
      { id: "brands_sec", label: "سکشن برندها", icon: Layers },
      { id: "footer_sec", label: "سکشن فوتر", icon: FileText },
    ]
  },
  products: {
    label: "محصولات",
    icon: ShoppingBag,
    sidebar: [
      { id: "prod_list", label: "لیست محصولات", icon: ShoppingBag },
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
      { id: "blog_comments_sec", label: "مدیریت کامنت‌ها", icon: MessageSquare },
    ]
  },
  about: {
    label: "درباره شرکت",
    icon: Info,
    sidebar: [
      { id: "history", label: "تاریخچه و ویدیو", icon: Factory },
      { id: "vision", label: "چشم‌انداز و ماموریت", icon: Target },
      { id: "stats", label: "آمار و چرا جزیره گندم", icon: BarChart },
      { id: "partners", label: "شرکا و گواهینامه‌ها", icon: Award },
      { id: "branches", label: "مدیریت تماس و شعب", icon: MapPin },
      { id: "about_messages_sec", label: "مدیریت پیام‌ها", icon: Mail },
      { id: "agency_forms", label: "مدیریت فرمهای نمایندگی", icon: ClipboardList },
      { id: "newsletter_sec", label: "باشگاه مشتریان و خبرنامه", icon: Send } 
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
  const currentSection = searchParams.get("section") || "overview";
  
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [activeTab, setActiveTab] = useState<TabKey>("dashboard");
  const [expandedGroups, setExpandedGroups] = useState<string[]>(["categories_group"]);

  const [userRole, setUserRole] = useState<string>("editor");
  const [filteredMenu, setFilteredMenu] = useState<Record<string, TabMenuType>>({});
  const [isMenuLoaded, setIsMenuLoaded] = useState(false);

  const [notifs, setNotifs] = useState({
    unreadMsgs: 0,
    totalMsgs: 0,
    unreadCmts: 0,
    totalCmts: 0,
    unreadAgencies: 0,
    totalAgencies: 0
  });

  useEffect(() => {
    if (!isLoginPage) {
      getNotificationCounts().then(res => {
        if (res.success && res.data) {
          setNotifs(res.data);
        }
      });

      const interval = setInterval(() => {
        getNotificationCounts().then(res => {
          if (res.success && res.data) {
            setNotifs(res.data);
          }
        });
      }, 30000);

      return () => clearInterval(interval);
    }
  }, [isLoginPage]);

  useEffect(() => {
    if (isLoginPage) {
      setIsAuthorized(true);
      return;
    }

    getAdminSession().then((payload) => {
      if (!payload) {
        router.push(`/${locale}/admin/login`);
        return;
      }

      setIsAuthorized(true);
      const role = String(payload.role || "editor");
      setUserRole(role);

      const allowed: Record<string, TabMenuType> = {};
      
      Object.keys(menuStructure).forEach(key => {
        const tab = menuStructure[key];
        let hasTabAccess = false;

        if (role === "super_admin") {
          hasTabAccess = true;
        } else if (role === "editor") {
          if (key === "blog") hasTabAccess = true;
        } else if (role === "admin") {
          if (["dashboard", "home", "products", "gallery", "about", "settings"].includes(key)) {
            hasTabAccess = true;
          }
        }

        if (hasTabAccess) {
          const filteredSidebar = tab.sidebar.filter(item => {
            if (item.id === "users" && role !== "super_admin") return false;
            return true;
          });

          if (filteredSidebar.length > 0) {
            allowed[key] = { ...tab, sidebar: filteredSidebar };
          }
        }
      });

      setFilteredMenu(allowed);
      setIsMenuLoaded(true);

      if (Object.keys(allowed).length > 0 && !allowed[activeTab]) {
        const firstAllowedTab = Object.keys(allowed)[0] as TabKey;
        setActiveTab(firstAllowedTab);
      }
    });
  }, [router, isLoginPage, pathname, locale, activeTab]);

  useEffect(() => {
    if (!isMenuLoaded || Object.keys(filteredMenu).length === 0) return;
    
    for (const [key, tab] of Object.entries(filteredMenu)) {
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
  }, [currentSection, filteredMenu, isMenuLoaded]);

  if (!isAuthorized || (!isMenuLoaded && !isLoginPage)) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (isLoginPage) return <>{children}</>;

  const handleTabChange = (tab: TabKey) => {
    const firstItem = filteredMenu[tab].sidebar[0];
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

  const handleLogout = async () => {
    document.cookie = "admin_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    router.push(`/${locale}/admin/login`);
  };

  return (
    <ToastProvider>
      <div className="min-h-screen bg-transparent flex flex-col text-gray-900 dark:text-gray-100" dir="rtl">
        <header className="h-16 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-6 flex items-center justify-between sticky top-0 z-50 shadow-xs">
          <div className="flex items-center gap-2 font-black text-lg tracking-tight">
            <span className="text-red-600">پنل</span>
            <span>مدیریت</span>
          </div>

          <nav className="flex items-center gap-1 bg-gray-100 dark:bg-gray-800 p-1 rounded-xl">
            {(Object.keys(filteredMenu) as TabKey[]).map((tabKey) => {
              const tab = filteredMenu[tabKey];
              const TabIcon = tab.icon;
              const isActive = activeTab === tabKey;

              let tabBadge = null;
              if (tabKey === 'dashboard') {
                const totalUnread = notifs.unreadMsgs + notifs.unreadCmts + notifs.unreadAgencies;
                if (totalUnread > 0) {
                  tabBadge = (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center animate-pulse shadow-sm shadow-red-500/50">
                      {totalUnread}
                    </span>
                  );
                }
              } else if (tabKey === 'about') {
                const aboutUnread = notifs.unreadMsgs + notifs.unreadAgencies;
                if (aboutUnread > 0) {
                  tabBadge = (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center animate-pulse shadow-sm shadow-red-500/50">
                      {aboutUnread}
                    </span>
                  );
                }
              } else if (tabKey === 'blog') {
                if (notifs.unreadCmts > 0) {
                  tabBadge = (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center animate-pulse shadow-sm shadow-red-500/50">
                      {notifs.unreadCmts}
                    </span>
                  );
                }
              }
              
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
                  <div className="relative">
                    <TabIcon size={16} />
                    {tabBadge}
                  </div>
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>

          <div className="flex items-center gap-3">
            <span className="text-xs font-bold text-gray-400">
              {userRole === "super_admin" ? "سوپر ادمین" : userRole === "admin" ? "مدیر ارشد" : "ویرایشگر"}
            </span>
            <div className="w-8 h-8 rounded-full bg-amber-400 flex items-center justify-center text-gray-900 font-black text-xs">
              {userRole === "super_admin" ? "S" : userRole === "admin" ? "A" : "E"}
            </div>
          </div>
        </header>

        <div className="flex grow h-[calc(100vh-64px)] overflow-hidden">
          <aside className="w-64 bg-white dark:bg-gray-900 border-l border-gray-200 dark:border-gray-800 p-4 flex flex-col justify-between overflow-y-auto custom-scrollbar">
            <div className="flex flex-col gap-1">
              <span className="text-[10px] font-black text-gray-400 dark:text-gray-500 block mb-3 px-3 uppercase tracking-wider">
                مدیریت بخش {filteredMenu[activeTab]?.label}
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
                  {filteredMenu[activeTab]?.sidebar.map((item) => {
                    if (item.subItems) {
                      const isExpanded = expandedGroups.includes(item.id);
                      const isChildActive = item.subItems.some(sub => sub.id === currentSection);
                      
                      return (
                        <div key={item.id} className="flex flex-col gap-1 w-full">
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
                          
                          <AnimatePresence>
                            {isExpanded && (
                              <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: "auto", opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                className="overflow-hidden flex flex-col gap-1 pr-4"
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
                    } else {
                      const ItemIcon = item.icon;
                      const isItemActive = currentSection === item.id;

                      let sidebarBadge = null;
                      if (item.id === 'messages_sec' || item.id === 'dash_messages_sec' || item.id === 'about_messages_sec') {
                        if (notifs.unreadMsgs > 0) {
                          sidebarBadge = (
                            <span className="bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full shadow-sm shadow-red-500/30">
                              {notifs.unreadMsgs}
                            </span>
                          );
                        } else if (notifs.totalMsgs > 0) {
                          sidebarBadge = (
                            <span className="bg-gray-100 dark:bg-gray-800 text-gray-500 text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                              {notifs.totalMsgs}
                            </span>
                          );
                        }
                      } else if (item.id === 'comments_sec' || item.id === 'dash_comments_sec' || item.id === 'blog_comments_sec') {
                        if (notifs.unreadCmts > 0) {
                          sidebarBadge = (
                            <span className="bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full shadow-sm shadow-red-500/30">
                              {notifs.unreadCmts}
                            </span>
                          );
                        } else if (notifs.totalCmts > 0) {
                          sidebarBadge = (
                            <span className="bg-gray-100 dark:bg-gray-800 text-gray-500 text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                              {notifs.totalCmts}
                            </span>
                          );
                        }
                      } else if (item.id === 'agency_forms') {
                        if (notifs.unreadAgencies > 0) {
                          sidebarBadge = (
                            <span className="bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full shadow-sm shadow-red-500/30">
                              {notifs.unreadAgencies}
                            </span>
                          );
                        } else if (notifs.totalAgencies > 0) {
                          sidebarBadge = (
                            <span className="bg-gray-100 dark:bg-gray-800 text-gray-500 text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                              {notifs.totalAgencies}
                            </span>
                          );
                        }
                      }

                      return (
                        <button
                          key={item.id}
                          onClick={() => handleSidebarClick(item.id)}
                          className={`flex items-center justify-between px-4 py-3 text-xs font-bold rounded-xl w-full text-right transition-all ${
                            isItemActive 
                              ? "bg-amber-400 text-gray-950 shadow-lg shadow-amber-400/10" 
                              : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800/50 hover:text-gray-900 dark:hover:text-white"
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <ItemIcon size={16} />
                            <span>{item.label}</span>
                          </div>
                          {sidebarBadge}
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
                onClick={handleLogout} 
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
    </ToastProvider>
  );
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-950"></div>}>
      <AdminLayoutContent>{children}</AdminLayoutContent>
    </Suspense>
  );
}