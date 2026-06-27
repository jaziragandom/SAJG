import React from "react";

export default function BrandsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col min-h-screen bg-transparent">
      {/* محتوای صفحات لیست برندها و صفحات اختصاصی */}
      <div className="grow">
        {children}
      </div>
    </div>
  );
}