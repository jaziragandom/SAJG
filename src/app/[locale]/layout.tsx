import React from 'react';
import "@/styles/globals.css";
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { ThemeProvider } from '@/components/shared/ThemeProvider';
import { Vazirmatn } from 'next/font/google';

const vazirmatn = Vazirmatn({ 
  subsets: ['arabic', 'latin'],
  display: 'swap',
});

export default async function RootLayout({
  children,
  params
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const messages = await getMessages();
  
  // تعریف متغیر isRtl بر اساس زبان (locale)
  const isRtl = locale === 'fa' || locale === 'ar' || locale === 'ps';

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
            {/* محتوای اصلی سایت */}
            {children}
          </ThemeProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}