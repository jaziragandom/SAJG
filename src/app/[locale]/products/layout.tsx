import React from "react";

export default function ProductsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col min-h-screen bg-transparent">
      {/* محتوای صفحه لیست محصولات با z-index منطقی برای جلوگیری از تداخل با مگامنو */}
      <div className="grow w-full relative z-10 flex flex-col">
        {children}
      </div>
    </div>
  );
}