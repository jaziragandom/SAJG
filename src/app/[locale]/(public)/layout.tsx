import React from 'react';
import NavbarWrapper from "@/components/shared/NavbarWrapper";
import FooterWrapper from "@/components/shared/FooterWrapper";
import { logPageView } from "@/actions/dashboard"; // اکشن ثبت بازدید

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  
  // ثبت بازدید در سرور بدون معطل کردن لود صفحه
  logPageView().catch(() => {});

  return (
    <div className="relative flex flex-col min-h-screen w-full">
      <div className="fixed top-0 left-0 w-full z-100 border-b border-white/5 backdrop-blur-md bg-white/5 dark:bg-black/10">
        <NavbarWrapper />
      </div>
      
      {/* فاصله دادن از بالا تا محتوا زیر ناوبار نرود */}
      <main className="grow w-full relative pt-20">
        {children}
      </main>
      
      <FooterWrapper />
    </div>
  );
}