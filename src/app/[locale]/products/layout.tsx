import React from "react";
import Navbar from "@/components/shared/Navbar";
import Footer from "@/components/shared/Footer";

export default function ProductsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col min-h-screen bg-transparent">
      {/* ناوبار اصلی در بالاترین لایه */}
      <Navbar />
      
      {/* محتوای صفحه لیست محصولات با z-index منطقی برای جلوگیری از تداخل با مگامنو */}
      <div className="grow w-full relative z-10 flex flex-col">
        {children}
      </div>
      
      {/* فوتر اصلی در پایین‌ترین لایه */}
      <Footer />
    </div>
  );
}