import React from 'react';
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
      {/* 
        توجه: ناوبار و فوتر از اینجا حذف شدند تا مشکل دو بار چاپ شدن حل شود.
        این دو کامپوننت در فایل RootLayout به صورت سراسری مدیریت می‌شوند.
      */}
      
      {/* فاصله دادن از بالا تا محتوا زیر ناوبار نرود */}
      <main className="grow w-full relative pt-20">
        {children}
      </main>
      
    </div>
  );
}