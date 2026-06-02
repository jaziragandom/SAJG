import React from "react";
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

export default async function AdminDashboard({ searchParams }: { searchParams: Promise<{ section?: string }> }) {
  
  const resolvedParams = await searchParams;
  const section = resolvedParams.section || "hero";

  // بررسی مسیرهای مربوط به بخش درباره ما
  const isCorporateSection = [
    "history", 
    "vision", 
    "stats", 
    "partners", 
    "branches", 
    "agency_forms",
    "corporate_sec",
    "about_sec"
  ].includes(section);

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* روتینگ هوشمند داشبورد ادمین */}
      {section === "hero" ? (
        <HeroManager />
      ) : ["gallery_all", "gallery_images", "gallery_videos"].includes(section) ? (
        <GalleryManager currentSection={section} />
      ) : ["blog_all", "blog_published", "blog_draft"].includes(section) ? (
        <BlogManager currentSection={section} />
      ) : section === "brands_sec" ? (
        <BrandsManager />
      ) : section === "products_sec" ? (
        <HomeProductsManager />
      ) : section === "footer_sec" ? (
        <FooterManager />
      ) : isCorporateSection ? ( 
        <CorporateManager currentSection={section} />
      ) : section === "prod_list" ? (
        <ProductsManager />
      ) : section.startsWith("cat_") ? (
        <CategoriesManager activeCategoryId={section.replace("cat_", "")} />
      ) : section === "users" ? (
        <UsersManager />
      ) : (
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