import React from 'react';
import NavbarWrapper from "@/components/shared/NavbarWrapper";
import Footer from "@/components/shared/Footer";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative flex flex-col min-h-screen w-full">
      
      <div className="fixed top-0 left-0 w-full z-100 border-b border-white/5 backdrop-blur-md bg-white/5 dark:bg-black/10">
        {/* استفاده از واسط سروری به جای ناوبار مستقیم */}
        <NavbarWrapper />
      </div>
      
      <main className="grow w-full relative">
        {children}
      </main>
      
    
      
    </div>
  );
}