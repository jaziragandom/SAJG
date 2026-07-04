import React from "react";
import { cookies } from "next/headers";
import MainDashboard from "./components/MainDashboard";
import ProductsManager from "./components/ProductsManager";
import CategoriesManager from "./components/CategoriesManager";
import HeroManager from "./components/HeroManager";
import HomeProductsManager from "./components/HomeProductsManager";
import FooterManager from "./components/FooterManager";
import BrandsManager from "./components/BrandsManager";
import CorporateManager from "./components/CorporateManager";
import GalleryManager from "./components/GalleryManager";
import BlogManager from "./components/BlogManager";
import UsersManager from "./components/UsersManager";
import GeneralSettings from "./components/GeneralSettings";
import MessagesManager from "./components/MessagesManager";
import CommentsManager from "./components/CommentsManager";
import AgencyFormsManager from "./components/AgencyFormsManager";
import NewsletterManager from "./components/NewsletterManager";
import { ShieldAlert } from "lucide-react";

export default async function AdminDashboard({ searchParams }: { searchParams: Promise<{ section?: string }> }) {
  
  const resolvedParams = await searchParams;
  const section = resolvedParams.section || "overview";

  // استخراج نقش کاربر از کوکی برای قفل کردن کامپوننت‌ها
  const cookieStore = await cookies();
  const token = cookieStore.get("admin_token")?.value;
  let userRole = "editor";
  
  if (token) {
    try {
      const payload = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
      userRole = payload.role;
    } catch (e) {}
  }

  // جلوگیری قاطع از رندر شدن بخش کاربران برای افراد غیر مجاز
  if (section === "users" && userRole !== "super_admin") {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] gap-4 animate-in fade-in zoom-in duration-500">
        <div className="w-24 h-24 bg-red-500/10 rounded-full flex items-center justify-center">
          <ShieldAlert size={48} className="text-red-500" />
        </div>
        <h2 className="text-2xl font-black text-gray-900 dark:text-white">دسترسی مسدود شد!</h2>
        <p className="text-gray-500 font-bold">شما سطح دسترسی لازم برای مشاهده این بخش را ندارید.</p>
      </div>
    );
  }

  const isCorporateSection = [
    "history", "vision", "stats", "partners", "branches", "corporate_sec", "about_sec"
  ].includes(section);

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      {section === "overview" ? <MainDashboard />
      : section === "hero" ? <HeroManager />
      : ["gallery_all", "gallery_images", "gallery_videos"].includes(section) ? <GalleryManager currentSection={section} />
      : ["blog_all", "blog_published", "blog_draft"].includes(section) ? <BlogManager currentSection={section} />
      : section === "brands_sec" ? <BrandsManager />
      : section === "products_sec" ? <HomeProductsManager />
      : section === "footer_sec" ? <FooterManager />
      : ["messages_sec", "dash_messages_sec", "about_messages_sec"].includes(section) ? <MessagesManager />
      : ["comments_sec", "dash_comments_sec", "blog_comments_sec"].includes(section) ? <CommentsManager />
      : section === "agency_forms" ? <AgencyFormsManager />
      : section === "newsletter_sec" ? <NewsletterManager />
      : isCorporateSection ? <CorporateManager currentSection={section} />
      : section === "prod_list" ? <ProductsManager />
      : section.startsWith("cat_") ? <CategoriesManager activeCategoryId={section.replace("cat_", "")} />
      : section === "users" ? <UsersManager />
      : section === "general" ? <GeneralSettings />
      : (
        <div className="flex flex-col gap-6">
          <div className="bg-amber-400/10 border border-amber-400/20 text-amber-700 dark:text-amber-400 p-6 rounded-2xl font-bold flex items-center justify-between">
            <span>مدیریت بخش: {section}</span>
            <span className="text-xs font-mono bg-amber-400/20 px-2 py-1 rounded-md">v1.6</span>
          </div>
          <div className="border-2 border-dashed border-gray-200 dark:border-gray-800 rounded-3xl h-96 flex flex-col items-center justify-center text-gray-400">
            <p>این بخش در حال توسعه است...</p>
          </div>
        </div>
      )}
    </div>
  );
}