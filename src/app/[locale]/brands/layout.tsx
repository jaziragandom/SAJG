import React from "react";
import Navbar from "@/components/shared/Navbar";
import Footer from "@/components/shared/Footer";

export default function BrandsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col min-h-screen bg-transparent">
      {/* ناوبار اصلی در بالاترین لایه */}
      <Navbar />
      
      {/* محتوای صفحات لیست برندها و صفحات اختصاصی */}
      <div className="grow">
        {children}
      </div>
      
      {/* فوتر اصلی در پایین‌ترین لایه */}
      <Footer />
    </div>
  );
}