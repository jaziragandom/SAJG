import React from "react";
import Navbar from "@/components/shared/Navbar";
import Footer from "@/components/shared/Footer";

export const metadata = {
  title: "مجله گندم - اخبار و مقالات",
  description: "داستان‌ها، اخبار و مقالات تخصصی از دنیای نوشیدنی‌ها و سبک زندگی سالم در مجله اختصاصی جزیره گندم.",
};

export default function BlogLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col w-full min-h-screen bg-transparent relative overflow-x-hidden">
      {/* ناوبار اصلی در بالاترین لایه */}
      <Navbar />
      
      {/* فضای محتوای مقالات وبلاگ */}
      <div className="grow w-full relative">
        {children}
      </div>
      
      {/* فوتر اصلی در پایین‌ترین لایه */}
      <Footer />
    </div>
  );
}