import React from 'react';
import Navbar from "@/components/shared/Navbar";
import Footer from "@/components/shared/Footer";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative flex flex-col min-h-screen w-full">
      
      {/* اصلاح ارور: تغییر z-[100] به z-100 */}
      <div className="fixed top-0 left-0 w-full z-100 border-b border-white/5 backdrop-blur-md bg-white/5 dark:bg-black/10">
        <Navbar />
      </div>
      
      {/* اصلاح ارور: تغییر flex-grow به grow */}
      <main className="grow w-full relative">
        {children}
      </main>
      
      <Footer />
      
    </div>
  );
}