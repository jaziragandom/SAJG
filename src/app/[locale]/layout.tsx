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

// ایمپورت کامپوننتی که در مرحله قبل ساختیم
import ConditionalDisplay from "@/components/shared/ConditionalDisplay";

const vazirmatn = Vazirmatn({ 
  subsets: ['arabic', 'latin'],
  display: 'swap',
});

export async function generateMetadata(): Promise<Metadata> {
  const response = await getSettings(["site_title", "site_description", "site_favicon"]);
  const settings = response.success ? response.data : {};

  return {
    title: settings.site_title || "جزیره گندم | Jazirah Gandum",
    description: settings.site_description || "پلتفرم رسمی جزیره گندم",
    icons: {
      icon: settings.site_favicon || "/favicon.ico", 
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
  
  const isRtl = locale === 'fa' || locale === 'ar' || locale === 'ps';

  const settingsResponse = await getSettings(["site_logo"]);
  const siteLogo = settingsResponse.success ? settingsResponse.data.site_logo : null;

  const categories: any[] = []; 
  const brands: any[] = [];

  return (
    <html lang={locale} dir={isRtl ? 'rtl' : 'ltr'} suppressHydrationWarning>
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
            {/* ناوبار سر جایش ماند. (اگر می‌خواهید ناوبار هم در ادمین حذف شود، این را هم داخل ConditionalDisplay بگذارید) */}
            <Navbar />

            {/* محتوای اصلی سایت */}
            {children}

            {/* فوتر استثنائاً در مسیر ادمین مخفی می‌شود */}
            <ConditionalDisplay>
              <FooterWrapper />
            </ConditionalDisplay>
            
          </ThemeProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}