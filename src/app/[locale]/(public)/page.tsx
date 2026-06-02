import React from 'react';
import Hero from "@/components/home/Hero";
import Products from "@/components/home/Products";
import Brands from "@/components/home/Brands";
import AboutFactory from "@/components/home/AboutFactory";
import WhyUs from "@/components/home/WhyUs";
import Testimonials from "@/components/home/Testimonials";
import CTA from "@/components/home/CTA";

export default function HomePage() {
  return (
    // overflow-x-hidden برای جلوگیری از اسکرول افقیِ انیمیشن‌های هیرو اضافه شد
    <main className="flex min-h-screen flex-col overflow-x-hidden">
      
      {/* سکشن ۱: هیرو */}
      <Hero />
      
      {/* سکشن ۲: محصولات */}
      <Products />
      
      {/* سکشن ۳: برندهای ما */}
      <Brands />
      
      {/* سکشن ۴: درباره شرکت/کارخانه (کد اصلی خودتان) */}
      <AboutFactory />
      
      {/* سکشن ۵: چرا ما */}
      <WhyUs />
      
      {/* سکشن ۶: صدای مشتریان */}
      <Testimonials />
      
      {/* سکشن ۷: دعوت به اقدام / خبرنامه */}
      <CTA />
      
    </main>
  );
}