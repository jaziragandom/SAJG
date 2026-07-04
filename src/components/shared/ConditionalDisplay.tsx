"use client";

import { usePathname } from 'next/navigation';
import React from 'react';

export default function ConditionalDisplay({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  
  // اگر آدرس صفحه شامل /admin بود، هیچی رندر نکن (فوتر مخفی می‌شود)
  if (pathname && pathname.includes('/admin')) {
    return null;
  }
  
  // در غیر این صورت (برای سایر صفحات سایت)، محتوا را نمایش بده
  return <>{children}</>;
}