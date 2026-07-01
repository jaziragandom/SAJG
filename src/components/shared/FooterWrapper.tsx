import React from 'react';
import Footer from './Footer';
import { getSettings } from "@/actions/settings";
import { getSiteContent } from "@/actions/siteContent";

export default async function FooterWrapper() {
  // ۱. دریافت لوگو از تنظیمات عمومی
  const settingsResponse = await getSettings(["site_logo"]);
  const siteLogo = settingsResponse.success ? settingsResponse.data?.site_logo : null;

  // ۲. دریافت زنده اطلاعات دفتر مرکزی از دیتابیس (کلید: corporate_hq)
  const hqResponse = await getSiteContent("corporate_hq");
  const hqData = hqResponse.success ? hqResponse.data?.hqData : null;

  // ۳. دریافت متون خلاصه درباره ما و کپی‌رایت فوتر (کلید: footer_settings)
  const footerResponse = await getSiteContent("footer_settings");
  const footerData = footerResponse.success ? footerResponse.data : null;

  // استخراج مقادیر شبکه‌های اجتماعی از آرایه برای تطابق با Interface مورد انتظار در کامپوننت فوتر
  const socialsArray = Array.isArray(hqData?.socials) ? hqData.socials : [];
  
  const getSocialValue = (platform: string, legacyKey: string): string => {
    const found = socialsArray.find((s: { platform: string; value: string }) => s.platform === platform);
    return (found?.value || hqData?.[legacyKey] || "") as string;
  };

  const contactInfo = {
    phone: (hqData?.phone || "+93 790 71 00 15") as string,
    email: (hqData?.email || "info@jazirah-gandum.com") as string,
    faAddress: (hqData?.faAddress || "دفتر مرکزی، جزیره گندم") as string,
    enAddress: (hqData?.enAddress || "HQ Office, Jazirah Gandum") as string,
    // پاس دادن تک‌تک شبکه‌های اجتماعی مطابق با تایپ‌های Footer
    wa: getSocialValue('whatsapp', 'wa'),
    tg: getSocialValue('telegram', 'tg'),
    ig: getSocialValue('instagram', 'ig'),
    fb: getSocialValue('facebook', 'fb')
  };

  const footerTexts = {
    aboutFa: (footerData?.faAbout || "") as string,
    aboutEn: (footerData?.enAbout || "") as string,
    copyrightFa: (footerData?.faCopyright || "") as string,
    copyrightEn: (footerData?.enCopyright || "") as string,
  };

  return <Footer siteLogo={siteLogo} contactInfo={contactInfo} footerTexts={footerTexts} />;
}