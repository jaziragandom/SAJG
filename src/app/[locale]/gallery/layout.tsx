import React from "react";
import Navbar from "@/components/shared/Navbar";
import Footer from "@/components/shared/Footer";

export const metadata = {
  title: "مرکز رسانه و گالری - جزیره گندم",
  description: "آرشیو ویدیوهای صنعتی، موشن گرافیک، تیزرهای رسمی و پوسترهای چاپی جزیره گندم",
};

export default function GalleryLayout({
  children,
}: {
  children: React.ReactNode;
}) {

  return (
  <div className="flex flex-col w-full min-h-screen bg-transparent relative overflow-x-hidden">      {/* ناوبار اصلی در بالاترین لایه وب‌سایت */}
      <Navbar />
      
      {/* فضای تزریق افکت‌های سراسری ترانزیشن و محتوای داینامیک گالری */}
      <div className="grow w-full relative">
        {children}
      </div>
      
      {/* فوتر اصلی در پایین‌ترین لایه وب‌سایت */}
      <Footer />
    </div>
  );
}