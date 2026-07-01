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

  const contactInfo = {
    phone: hqData?.phone || "+93 790 71 00 15",
    email: hqData?.email || "info@jazirah-gandum.com",
    faAddress: hqData?.faAddress || "دفتر مرکزی، جزیره گندم",
    enAddress: hqData?.enAddress || "HQ Office, Jazirah Gandum",
    socials: hqData?.socials || []
  };

  const footerTexts = {
    aboutFa: footerData?.faAbout || "",
    aboutEn: footerData?.enAbout || "",
    copyrightFa: footerData?.faCopyright || "",
    copyrightEn: footerData?.enCopyright || "",
  };

  return <Footer siteLogo={siteLogo} contactInfo={contactInfo} footerTexts={footerTexts} />;
}