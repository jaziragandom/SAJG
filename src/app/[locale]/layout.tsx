import React from 'react';
import "@/styles/globals.css";
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { ThemeProvider } from '@/components/shared/ThemeProvider';
import { Vazirmatn } from 'next/font/google';
import { getSettings } from "@/actions/settings";
import { Metadata } from "next";

// اضافه شدن ناوبار و فوتر به صورت سراسری
import Navbar from "@/components/shared/Navbar";
import FooterWrapper from "@/components/shared/FooterWrapper";

// TODO: شما باید اکشن‌های مربوط به دریافت دسته‌بندی و برند را در اینجا ایمپورت کنید
// import { getCategories } from "@/actions/categories";
// import { getBrands } from "@/actions/brands";

const vazirmatn = Vazirmatn({ 
  subsets: ['arabic', 'latin'],
  display: 'swap',
});

export async function generateMetadata(): Promise<Metadata> {
  // خواندن عنوان، توضیحات و فاوآیکون از دیتابیس [cite: 138]
  const response = await getSettings(["site_title", "site_description", "site_favicon"]);
  const settings = response.success ? response.data : {};

  return {
    title: settings.site_title || "جزیره گندم | Jazirah Gandum",
    description: settings.site_description || "پلتفرم رسمی جزیره گندم",
    icons: {
      icon: settings.site_favicon || "/favicon.ico", // اگر فاوآیکون آپلود شده بود آن را بگذار، در غیر این صورت آیکون پیش‌فرض [cite: 142]
    },
  };
}

export default async function RootLayout({
  children,
  params
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const messages = await getMessages();
  
  // تعریف متغیر isRtl بر اساس زبان (locale) [cite: 144]
  const isRtl = locale === 'fa' || locale === 'ar' || locale === 'ps';

  // دریافت لوگو برای ناوبار
  const settingsResponse = await getSettings(["site_logo"]);
  const siteLogo = settingsResponse.success ? settingsResponse.data.site_logo : null;

  // فراخوانی برندها و دسته‌بندی‌ها از دیتابیس
  // اگر هنوز اکشن‌های آن را نساخته‌اید، مقادیر پیش‌فرض (آرایه خالی) قرار داده شده تا سایت کرش نکند
  // const categories = await getCategories();
  // const brands = await getBrands();
  const categories: any[] = []; 
  const brands: any[] = [];

  return (
    <html lang={locale} dir={isRtl ? "rtl" : "ltr"} suppressHydrationWarning>
      <body 
        className={`${vazirmatn.className} antialiased overflow-x-hidden`} 
        suppressHydrationWarning
      >
        <NextIntlClientProvider messages={messages}>
          <ThemeProvider 
            attribute="class" 
            defaultTheme="dark" 
            enableSystem={false}
          >
            <Navbar />

            {/* محتوای اصلی سایت */}
            {children}

            {/* فوتر در پایین‌ترین لایه ریشه قرار گرفت */}
            <FooterWrapper />
          </ThemeProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}