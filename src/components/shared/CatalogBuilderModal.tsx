"use client";

import React, { useState, useEffect, useMemo } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useLocale } from "next-intl";
import {
  X, CheckSquare, Square, Download, Loader2, Layers,
  ChevronDown, ChevronUp, MapPin, Printer, Package, Info, ShieldCheck,
  AlertTriangle, GripVertical, Phone, Mail, Globe, Search, Award, CheckCircle
} from "lucide-react";
import { getProducts } from "@/actions/product";
import { getCategories } from "@/actions/category";
import { getSiteContent } from "@/actions/siteContent";
import { getNavbarData } from "@/actions/navbar";
import QRCode from "react-qr-code";

// ==========================================
// 1. کامپوننت رندر کننده محتوای کاتالوگ (A4 Pages)
// ==========================================
const CatalogContent = ({
  orderedProducts,
  hqData,
  lang,
  categories,
  siteLogo
}: {
  orderedProducts: any[],
  hqData: any,
  lang: 'fa' | 'en',
  categories: any[],
  siteLogo: string | null
}) => {
  const isRtl = lang === 'fa';

  const getCatName = (slug: string) => {
    const cat = categories.find((c: any) => c.slug === slug || c._id === slug);
    if (!cat) return slug || "-";
    return isRtl ? cat.faName : (cat.enName || cat.faName);
  };

  const resolveSpec = (specSlugOrVal: string, fallbackFa: string, fallbackEn: string) => {
    if (!specSlugOrVal) return "-";
    const cat = categories.find((c: any) => c.slug === specSlugOrVal || c._id === specSlugOrVal || c.faName === specSlugOrVal);
    if (cat) {
      return isRtl ? cat.faName : (cat.enName || cat.faName);
    }
    return isRtl ? (fallbackFa || specSlugOrVal) : (fallbackEn || specSlugOrVal);
  };

  const groupedProducts = useMemo(() => {
    const groups: Record<string, any[]> = {};
    const groupOrder: string[] = [];

    orderedProducts.forEach((product) => {
      const groupName = getCatName(product.mainCat);
      if (!groups[groupName]) {
        groups[groupName] = [];
        groupOrder.push(groupName);
      }
      groups[groupName].push(product);
    });

    return groupOrder.map(name => ({ groupName: name, prods: groups[name] }));
  }, [orderedProducts, categories, isRtl]);

  const tocPages = useMemo(() => {
    const flatList: any[] = [];
    groupedProducts.forEach(({ groupName, prods }) => {
      flatList.push({ type: 'header', content: groupName });
      prods.forEach((p: any) => flatList.push({ type: 'product', content: p }));
    });

    const pages = [];
    let currentPage: any[] = [];
    let currentHeight = 0;
    const CAPACITY = 18;

    flatList.forEach(item => {
      const weight = item.type === 'header' ? 2 : 1;
      if (currentHeight + weight > CAPACITY) {
        pages.push(currentPage);
        currentPage = [];
        currentHeight = 0;
      }
      currentPage.push(item);
      currentHeight += weight;
    });
    if (currentPage.length > 0) pages.push(currentPage);
    return pages;
  }, [groupedProducts]);

  let globalPageCounter = 1;

  const companyNameFa = hqData?.faName && hqData.faName !== 'کارخانه' ? hqData.faName : "جزیره گندم";
  const companyNameEn = hqData?.enName && hqData.enName !== 'Factory' ? hqData.enName : "Jazirah Gandum";

  return (
    <div className="w-[210mm] mx-auto bg-white text-gray-900 shadow-2xl origin-top" dir={isRtl ? 'rtl' : 'ltr'}>

      {/* ---------- PAGE 1: COVER ---------- */}
      <div className="print-page bg-white flex flex-col relative h-[297mm] overflow-hidden page-break border-0">

        <div className="absolute inset-0 z-0 pointer-events-none">
          <svg viewBox="0 0 100 141" preserveAspectRatio="none" className="w-full h-full">
            <defs>
              <linearGradient id="coverGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#fde047" />
                <stop offset="60%" stopColor="#f59e0b" />
                <stop offset="100%" stopColor="#b45309" />
              </linearGradient>
            </defs>
            <path d="M0,45 C35,65 65,15 100,45 L100,141 L0,141 Z" fill="url(#coverGrad)" />
          </svg>
        </div>

        <div className={`absolute top-12 ${isRtl ? 'left-12' : 'right-12'} z-10 flex flex-col items-center`}>
          {siteLogo ? (
            <img src={siteLogo} className="h-16 object-contain mb-2 drop-shadow-md" alt="Company Logo" />
          ) : (
            <Layers size={48} className="text-gray-900 mb-2" />
          )}
          <span className="text-sm font-black text-gray-900 tracking-widest uppercase">{isRtl ? companyNameFa : companyNameEn}</span>
        </div>

        <div className="flex-1 flex items-center justify-center z-10 pt-10">
          <div className="w-[90mm] h-[90mm] bg-gray-900 rounded-full flex flex-col items-center justify-center shadow-2xl p-10 relative border-4 border-white/10">
            <div className="absolute inset-2 border border-dashed border-gray-700 rounded-full pointer-events-none"></div>
            <h1 className="text-[2.75rem] font-black text-white mb-5 tracking-tighter leading-tight text-center relative z-10 drop-shadow-md">
              {isRtl ? companyNameFa : companyNameEn}
            </h1>
            <div className="w-16 h-1.5 bg-amber-400 mb-5 rounded-full relative z-10"></div>
            <h2 className="text-lg font-bold text-gray-300 uppercase tracking-widest text-center relative z-10">
              {isRtl ? "کاتالوگ جامع محصولات" : "PRODUCT CATALOG"}
            </h2>
          </div>
        </div>

        <div className="absolute bottom-16 left-0 right-0 z-10 px-16">
          <div className="grid grid-cols-2 gap-8 w-full max-w-[180mm] mx-auto text-white">

            <div className="flex flex-col gap-6 justify-center">
              <div className="flex items-center gap-4">
                <div className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center shrink-0">
                  <Mail size={14} className="text-white" />
                </div>
                <span className="text-[11px] font-bold mt-0.5 tracking-wide">
                  {hqData?.email || "info@jazirahgandumco.com"}
                </span>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center shrink-0 mt-0.5">
                  <MapPin size={14} className="text-white" />
                </div>
                <span className="text-[11px] font-bold leading-relaxed max-w-55 mt-0.5">
                  <bdi>{isRtl ? (hqData?.faAddress || "آدرس شرکت") : (hqData?.enAddress || "Company Address")}</bdi>
                </span>
              </div>
            </div>

            <div className="flex flex-col gap-6 justify-center">
              <div className="flex items-center gap-4">
                <div className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center shrink-0">
                  <Globe size={14} className="text-white" />
                </div>
                <span className="text-[11px] font-bold uppercase tracking-[0.15em] mt-0.5" dir="ltr">
                  WWW.JAZIRAHGANDUMCO.COM
                </span>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center shrink-0">
                  <Phone size={14} className="text-white" />
                </div>
                <span className="text-[12px] font-black mt-0.5 tracking-wide" dir="ltr">
                  <bdi>{hqData?.phone || "+93 790 710 015"}</bdi>
                </span>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* ---------- PAGES: TABLE OF CONTENTS ---------- */}
      {tocPages.map((pageItems, pageIdx) => {
        globalPageCounter++;
        return (
          <div key={`toc-${pageIdx}`} className="print-page flex flex-col bg-white h-[297mm] overflow-hidden page-break relative">
            <div className="h-6 w-full bg-amber-400 absolute top-0 left-0"></div>

            <div className="px-16 pt-20 pb-8 border-b-2 border-gray-100 shrink-0 flex justify-between items-end">
              <h2 className="text-5xl font-black text-gray-900 tracking-tight">
                {isRtl ? "فهرست محصولات" : "INDEX"}
              </h2>
            </div>

            <div className="flex-1 px-16 py-8 overflow-hidden flex flex-col justify-start gap-2">
              {pageItems.map((item, idx) => {
                if (item.type === 'header') {
                  return (
                    <h3 key={idx} className="text-lg font-black text-gray-900 bg-gray-100 px-4 py-2 rounded-xl mt-4 mb-2 w-max">
                      {item.content}
                    </h3>
                  );
                } else {
                  const p = item.content;
                  const title = isRtl ? p.faTitle : (p.enTitle || p.faTitle);
                  const pIndex = orderedProducts.findIndex(x => x._id === p._id) + 1;
                  const targetPageNum = 1 + tocPages.length + pIndex;
                  return (
                    <a href={`#prod-${p._id}`} key={idx} className="flex items-center justify-between w-full group py-2 hover:bg-amber-50 rounded-lg px-2">
                      <div className="flex items-center gap-4">
                        <span className="text-gray-400 font-bold w-6 text-center text-sm">{String(pIndex).padStart(2, '0')}</span>
                        <span className="font-bold text-gray-700 text-sm">{title}</span>
                      </div>
                      <span className="flex-1 border-b-2 border-dotted border-gray-200 mx-4 mb-2"></span>
                      <span className="font-black text-gray-900">{targetPageNum}</span>
                    </a>
                  );
                }
              })}
            </div>

            {/* TOC Footer */}
            <div className="h-16 bg-gray-900 mt-auto flex items-center px-10 text-xs font-bold text-gray-400 shrink-0">
              <div className="flex-1 flex items-center justify-start gap-2 text-amber-400">
                <span className="w-2 h-2 bg-amber-400 rounded-full"></span>
                {isRtl ? companyNameFa : companyNameEn}
              </div>
              <div className="flex-1 flex items-center justify-center">
                <span className="text-white bg-gray-800 px-3 py-1 rounded-full">Page {globalPageCounter}</span>
              </div>
              <div className="flex-1 flex items-center justify-end" dir="ltr">
                <span className="uppercase tracking-widest">
                  WWW.JAZIRAHGANDUMCO.COM
                </span>
              </div>
            </div>
          </div>
        );
      })}

      {/* ---------- PRODUCT PAGES (Datasheet Layout Match) ---------- */}
      {orderedProducts.map((p, index) => {
        globalPageCounter++;
        const title = isRtl ? p.faTitle : (p.enTitle || p.faTitle);
        const desc = isRtl ? p.faDesc : (p.enDesc || p.faDesc);

        const activeBrand = p.brandId;
        const brandName = activeBrand ? (isRtl ? (activeBrand.faName || activeBrand.enName) : (activeBrand.enName || activeBrand.faName)) : "-";
        const brandLogo = activeBrand ? (isRtl ? (activeBrand.logoFa || activeBrand.logo || activeBrand.logoEn) : (activeBrand.logoEn || activeBrand.logo || activeBrand.logoFa)) : "";

        const catObj = categories?.find((c: any) => c.slug === p.category || c._id === p.category);
        const catName = catObj ? (isRtl ? catObj.faName : catObj.enName) : (p.category || "-");

        const weight = resolveSpec(p.specs?.weight, p.specs?.weightFa, p.specs?.weightEn);
        const packagingRaw = resolveSpec(p.specs?.packaging, p.specs?.packagingFa, p.specs?.packagingEn);
        const flavor = resolveSpec(p.specs?.flavor, p.specs?.flavorFa, p.specs?.flavorEn);

        const shelfLife = isRtl ? p.specs?.shelfLifeFa : p.specs?.shelfLifeEn;
        const ingredients = isRtl ? p.specs?.ingredientsFa : p.specs?.ingredientsEn;
        const packCountRaw = p.specs?.itemsPerPackage || p.packCount || "-";

        // منطق نمایش پکیجینگ
        const packArr = [];
        if (packCountRaw && packCountRaw !== "-" && packCountRaw !== "نامشخص" && packCountRaw !== "N/A") packArr.push(packCountRaw);
        if (packagingRaw && packagingRaw !== "-" && packagingRaw !== "نامشخص" && packagingRaw !== "N/A") packArr.push(packagingRaw);
        const displayPackaging = packArr.length > 0 ? packArr.join(" - ") : "-";

        const warningMsg = isRtl ? p.warningMessageFa : p.warningMessageEn;
        const productImage = p.images?.main || "https://placehold.co/600x600/png";
        const pageUrl = typeof window !== "undefined" ? `${window.location.origin}/${lang}/products/${p.slug}` : "";

        return (
          <div key={p._id} id={`prod-${p._id}`} className="print-page flex flex-col bg-white h-[297mm] overflow-hidden page-break relative scroll-mt-0">
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.03] z-0 overflow-hidden">
              <span className="text-9xl font-black rotate-[-35deg] whitespace-nowrap">
                Jazirah Gandum
              </span>
            </div>

            <div className="relative z-10 flex-1 flex flex-col w-full px-12 pt-10 pb-6 gap-6">

              <div className="flex justify-between items-center border-b-2 border-gray-900 pb-3">
                <div className="flex flex-col gap-1">
                  <h3 className="text-xl font-black tracking-tight text-gray-950">
                    {isRtl ? companyNameFa : companyNameEn}
                  </h3>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                    Product Technical Datasheet (TDS)
                  </p>
                </div>
              </div>

              <div className="flex flex-col gap-4 w-full">
                <div className="flex flex-row items-stretch bg-gray-50 p-5 rounded-2xl border border-gray-100 gap-6">
                  <div className="flex flex-col gap-3 flex-[2] justify-center">
                    <div className="flex items-center gap-3 mb-1">
                      <span className="text-[10px] font-bold bg-white border border-gray-200 px-2 py-1 rounded text-gray-600 uppercase tracking-wide">
                        {brandName}
                      </span>
                      {/* حل مشکل عکس شکسته با onError */}
                      {brandLogo && (
                        <img
                          src={brandLogo}
                          onError={(e) => (e.currentTarget.style.display = 'none')}
                          className="h-6 object-contain"
                          alt="Brand Logo"
                        />
                      )}
                    </div>
                    <h4 className="text-2xl font-black text-gray-950">{title}</h4>
                    <p className="text-[11px] leading-relaxed text-gray-600 text-justify whitespace-pre-wrap">
                      {desc}
                    </p>
                  </div>
                  <div className="flex flex-[1] justify-center items-center h-auto min-h-[120px]">
                    <img src={productImage} alt={title} className="max-h-[160px] object-contain mix-blend-multiply" />
                  </div>
                </div>

                {(p.hasWarning || warningMsg) && (
                  <div className="border border-red-200 bg-red-50/70 rounded-2xl p-4 flex items-start gap-3 w-full">
                    <span className="text-red-500 text-lg mt-0.5 shrink-0">⚠</span>
                    <div>
                      <h3 className="text-xs font-black text-red-700 mb-1 text-start">
                        {isRtl ? "هشدار مصرف" : "Warnings"}
                      </h3>
                      <p className="text-[11px] font-medium text-red-900/80 leading-relaxed text-justify">
                        {warningMsg}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex flex-col gap-3 w-full flex-1">
                <h5 className={`text-xs font-black text-gray-900 ${isRtl ? 'border-r-4 pr-2' : 'border-l-4 pl-2'} border-amber-400`}>
                  {isRtl ? "جدول مشخصات و پارامترهای فنی" : "Technical Parameters"}
                </h5>

                <div className="grid grid-cols-3 gap-6 items-stretch h-full min-h-0">
                  <div className="col-span-2 border border-gray-200 rounded-xl overflow-hidden shadow-sm flex flex-col">
                    <table className={`w-full text-xs ${isRtl ? 'text-right' : 'text-left'} border-collapse h-full`}>
                      <thead>
                        <tr className="bg-gray-100 text-gray-600 font-bold border-b border-gray-200">
                          <th className="px-4 py-3 w-1/3 text-start">{isRtl ? "نام پارامتر" : "Parameter"}</th>
                          <th className="px-4 py-3 text-start">{isRtl ? "مقدار / مشخصه" : "Value / Specs"}</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200 font-medium text-gray-700 h-full">
                        <tr>
                          <td className="px-4 py-3 font-bold text-gray-900 text-start">{isRtl ? "برند / دسته‌بندی" : "Brand / Category"}</td>
                          <td className="px-4 py-3 text-start">{brandName} - {catName}</td>
                        </tr>
                        <tr className="bg-gray-50/50">
                          <td className="px-4 py-3 font-bold text-gray-900 text-start">{isRtl ? "وزن خالص / حجم ظرف" : "Net Weight / Volume"}</td>
                          <td className="px-4 py-3 text-start"><bdi>{weight}</bdi></td>
                        </tr>
                        <tr>
                          <td className="px-4 py-3 font-bold text-gray-900 text-start">{isRtl ? "بسته‌بندی / تعداد در کارتن" : "Packaging / Pack Count"}</td>
                          <td className="px-4 py-3 text-start"><bdi>{displayPackaging}</bdi></td>
                        </tr>
                        <tr className="bg-gray-50/50">
                          <td className="px-4 py-3 font-bold text-gray-900 text-start">{isRtl ? "طعم و عصاره پایه" : "Base Flavor"}</td>
                          <td className="px-4 py-3 text-start">{flavor}</td>
                        </tr>
                        <tr>
                          <td className="px-4 py-3 font-bold text-gray-900 text-start">{isRtl ? "ترکیبات اصلی" : "Main Ingredients"}</td>
                          <td className="px-4 py-3 leading-relaxed text-start">{ingredients || "-"}</td>
                        </tr>
                        <tr className="bg-gray-50/50">
                          <td className="px-4 py-3 font-bold text-gray-900 text-start align-top">{isRtl ? "تاریخ انقضا (ماندگاری)" : "Shelf Life"}</td>
                          <td className="px-4 py-3 text-start align-top">{shelfLife || "-"}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  <div className="col-span-1 flex flex-col gap-4 h-full">
                    <div className="border border-gray-200 rounded-xl p-3 flex flex-col items-center justify-center bg-white shadow-sm flex-1 min-h-[100px]">
                      <QRCode value={pageUrl} size={60} />
                      <div className="mt-2 text-center text-[9px] font-bold text-gray-500">
                        {isRtl ? "اسکن برای مشاهده آنلاین" : "Scan to view online"}
                      </div>
                    </div>

                    <div className="shrink-0 h-[44px] border border-gray-200 rounded-xl px-2.5 py-1.5 flex items-center bg-gray-50/50 shadow-sm gap-2.5">
                      <div className="w-7 h-7 bg-white border border-gray-100 rounded-lg flex items-center justify-center shrink-0 shadow-sm">
                        <Award size={14} className="text-blue-600" />
                      </div>
                      <div className="flex flex-col justify-center">
                        <div className="text-[10px] font-black text-gray-800 leading-tight">ISO 22000</div>
                        <div className="text-[6.5px] font-bold text-gray-500 mt-0.5 text-start leading-tight">
                          {isRtl ? "مدیریت ایمنی مواد غذایی" : "Food Safety Management"}
                        </div>
                      </div>
                    </div>

                    <div className="shrink-0 h-[44px] border border-gray-200 rounded-xl px-2.5 py-1.5 flex items-center bg-gray-50/50 shadow-sm gap-2.5">
                      <div className="w-7 h-7 bg-white border border-gray-100 rounded-lg flex items-center justify-center shrink-0 shadow-sm">
                        <ShieldCheck size={14} className="text-emerald-600" />
                      </div>
                      <div className="flex flex-col justify-center">
                        <div className="text-[10px] font-black text-gray-800 leading-tight">HACCP</div>
                        <div className="text-[6.5px] font-bold text-gray-500 mt-0.5 text-start leading-tight">
                          {isRtl ? "تحلیل خطر و کنترل بحرانی" : "Hazard Analysis"}
                        </div>
                      </div>
                    </div>

                    <div className="shrink-0 h-[44px] border border-gray-200 rounded-xl px-2.5 py-1.5 flex items-center bg-gray-50/50 shadow-sm gap-2.5">
                      <div className="w-7 h-7 bg-white border border-gray-100 rounded-lg flex items-center justify-center shrink-0 shadow-sm">
                        <CheckCircle size={14} className="text-amber-600" />
                      </div>
                      <div className="flex flex-col justify-center">
                        <div className="text-[10px] font-black text-gray-800 leading-tight">GMP</div>
                        <div className="text-[6.5px] font-bold text-gray-500 mt-0.5 text-start leading-tight">
                          {isRtl ? "شرایط خوب تولید" : "Good Manufacturing Practice"}
                        </div>
                      </div>
                    </div>

                  </div>
                </div>

                <div className="border border-emerald-200 bg-emerald-50/50 rounded-2xl p-3 text-center w-full mt-2 shrink-0">
                  <h3 className="text-[11px] font-black text-emerald-800 mb-1">
                    {isRtl ? "تضمین کیفیت" : "Quality Assurance"}
                  </h3>
                  <p className="text-[10px] font-medium text-emerald-900/80 leading-relaxed mx-auto text-justify sm:text-center">
                    {isRtl
                      ? "این محصول تحت نظارت کامل واحد کنترل کیفیت شرکت تولید شده و مطابق استانداردهای بین‌المللی صنایع غذایی آزمایش و تأیید شده است."
                      : "This product has been manufactured under strict laboratory quality control and complies with international food safety standards."}
                  </p>
                </div>
              </div>

            </div>

            <div className="h-14 bg-gray-900 mt-auto flex items-center px-10 text-[10px] font-bold text-gray-400 shrink-0">
              <div className="flex-1 flex items-center justify-start gap-2 text-amber-400">
                <span className="w-1.5 h-1.5 bg-amber-400 rounded-full"></span>
                {isRtl ? companyNameFa : companyNameEn}
              </div>
              <div className="flex-1 flex items-center justify-center">
                <span className="text-white bg-gray-800 px-3 py-1 rounded-lg">Page {globalPageCounter}</span>
              </div>
              <div className="flex-1 flex items-center justify-end" dir="ltr">
                <span className="uppercase tracking-widest">
                  WWW.JAZIRAHGANDUMCO.COM
                </span>
              </div>
            </div>

          </div>
        );
      })}
    </div>
  );
};

// ==========================================
// 2. کامپوننت اصلی و پاپ‌آپ تنظیمات (UI)
// ==========================================
interface CatalogBuilderModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CatalogBuilderModal({ isOpen, onClose }: CatalogBuilderModalProps) {
  const locale = useLocale();
  const isUiRtl = locale === 'fa';

  const [isMounted, setIsMounted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [hqData, setHqData] = useState<any>({});
  const [siteLogo, setSiteLogo] = useState<string | null>(null);

  const [selectedLang, setSelectedLang] = useState<"fa" | "en">(locale as "fa" | "en");

  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [expandedCats, setExpandedCats] = useState<string[]>([]);
  const [draggedItemIndex, setDraggedItemIndex] = useState<number | null>(null);

  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    setSelectedLang(locale as "fa" | "en");

    const fetchCatalogData = async () => {
      setIsLoading(true);
      const [prodRes, catRes, hqRes, navRes] = await Promise.all([
        getProducts({ status: 'all' }),
        getCategories(),
        getSiteContent('corporate_hq'),
        getNavbarData()
      ]);

      if (prodRes.success) {
        const activeProducts = prodRes.data.filter((p: any) => p.status !== 'draft');
        setProducts(activeProducts);
        setSelectedProducts(activeProducts.map((p: any) => p._id));
      }
      if (catRes.success) setCategories(catRes.data);
      if (hqRes?.data?.hqData) setHqData(hqRes.data.hqData);
      if (navRes?.data?.siteLogo) setSiteLogo(navRes.data.siteLogo);

      setIsLoading(false);
    };

    fetchCatalogData();
  }, [isOpen, locale]);

  const mainCategories = categories.filter(c => c.iconName === 'main');
  const getSubCats = (mainSlug: string) => categories.filter(c => c.parent === mainSlug);
  const getProductsForCat = (catSlug: string, isMain: boolean) =>
    products.filter(p => isMain ? p.mainCat === catSlug : p.category === catSlug).map(p => p._id);

  const toggleAllProducts = () => {
    if (selectedProducts.length === products.length) setSelectedProducts([]);
    else setSelectedProducts(products.map(p => p._id));
  };

  const toggleCategory = (catSlug: string, isMain: boolean) => {
    const prodIds = getProductsForCat(catSlug, isMain);
    const isAllSelected = prodIds.every(id => selectedProducts.includes(id));
    if (isAllSelected) {
      setSelectedProducts(prev => prev.filter(id => !prodIds.includes(id)));
    } else {
      setSelectedProducts(prev => {
        const newIds = prodIds.filter(id => !prev.includes(id));
        return [...prev, ...newIds];
      });
    }
  };

  const toggleSingleProduct = (productId: string) => {
    setSelectedProducts(prev => prev.includes(productId) ? prev.filter(id => id !== productId) : [...prev, productId]);
  };

  const toggleAccordion = (slug: string) => {
    setExpandedCats(prev => prev.includes(slug) ? prev.filter(s => s !== slug) : [...prev, slug]);
  };

  const handleDrop = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedItemIndex === null || draggedItemIndex === index) return;
    const newList = [...selectedProducts];
    const draggedItem = newList[draggedItemIndex];
    newList.splice(draggedItemIndex, 1);
    newList.splice(index, 0, draggedItem);
    setSelectedProducts(newList);
    setDraggedItemIndex(null);
  };

  const orderedProducts = selectedProducts.map(id => products.find(p => p._id === id)).filter(Boolean);

  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    return products.filter(p => {
      const tFa = p.faTitle || "";
      const tEn = p.enTitle || "";
      return tFa.toLowerCase().includes(searchQuery.toLowerCase()) || tEn.toLowerCase().includes(searchQuery.toLowerCase());
    });
  }, [searchQuery, products]);

  const printStyles = `
    .custom-scrollbar::-webkit-scrollbar { width: 6px; }
    .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
    .custom-scrollbar::-webkit-scrollbar-thumb { background: #d1d5db; border-radius: 10px; }

    @media print {
      @page { size: A4 portrait; margin: 0; }
      body > *:not(#print-portal) { display: none !important; }
      #print-portal { display: block !important; position: absolute; top: 0; left: 0; width: 100%; z-index: 999999; }
      html, body { height: auto !important; overflow: visible !important; background: white !important; }
      * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
      .page-break { page-break-after: always; break-inside: avoid; }
    }
  `;

  if (!isMounted) return null;

  return createPortal(
    <>
      <style>{printStyles}</style>

      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-[99999] overflow-y-auto" dir={isUiRtl ? "rtl" : "ltr"}>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onClose}
              className="fixed inset-0 bg-gray-950/60 backdrop-blur-md cursor-pointer"
            />

            <div className="min-h-screen flex items-start md:items-center justify-center p-4 sm:p-8 pointer-events-none relative z-10">
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="relative w-full max-w-[350mm] h-[90vh] bg-[#0f172a] rounded-3xl shadow-2xl flex flex-col lg:flex-row overflow-hidden border border-gray-800 my-8 lg:my-0 pointer-events-auto"
              >
                <button onClick={onClose} className="absolute top-4 left-4 rtl:left-4 rtl:right-auto ltr:right-4 ltr:left-auto w-10 h-10 bg-white/10 text-gray-300 hover:text-white hover:bg-red-500 rounded-full flex items-center justify-center z-50 transition-colors shadow-sm">
                  <X size={20} />
                </button>

                {/* --- پنل پیش‌نمایش --- */}
                <div className="w-full lg:w-[60%] h-[50vh] lg:h-full bg-gray-900 flex flex-col overflow-hidden relative border-b lg:border-b-0 lg:border-l rtl:lg:border-l-0 rtl:lg:border-r border-gray-800">
                  <div className="p-6 border-b border-gray-800 shrink-0 flex justify-between items-center bg-gray-950/50">
                    <h2 className="text-xl font-black text-white flex items-center gap-2">
                      <Layers className="text-amber-500" /> {isUiRtl ? "پیش‌نمایش زنده کاتالوگ" : "Live Catalog Preview"}
                    </h2>
                  </div>

                  <div className="flex-1 overflow-y-auto custom-scrollbar p-8 flex justify-center bg-gray-800/50 relative">
                    <div className="origin-top" style={{ transform: 'scale(0.45)', height: 'max-content' }}>
                      <CatalogContent
                        orderedProducts={orderedProducts}
                        hqData={hqData}
                        lang={selectedLang}
                        categories={categories}
                        siteLogo={siteLogo}
                      />
                    </div>
                  </div>
                </div>

                {/* --- پنل تنظیمات --- */}
                <div className="w-full lg:w-[40%] h-[50vh] lg:h-full bg-gray-950 flex flex-col relative z-10">
                  <div className="p-6 border-b border-gray-800 shrink-0">
                    <h2 className="text-2xl font-black text-white flex items-center gap-2 mb-2">
                      {isUiRtl ? "تنظیمات چاپ و خروجی" : "Print Settings"}
                    </h2>
                    <p className="text-xs text-gray-400">{isUiRtl ? "محصولات مورد نظر خود را انتخاب و مرتب کنید." : "Select and sort your products."}</p>
                  </div>

                  <div className="flex-1 overflow-y-auto custom-scrollbar p-6 flex flex-col gap-6">
                    <div className="flex flex-col gap-3">
                      <label className="text-xs font-bold text-gray-400 uppercase">{isUiRtl ? "زبان چاپ کاتالوگ" : "Print Language"}</label>
                      <div className="flex bg-gray-900 p-1.5 rounded-xl border border-gray-800">
                        <button onClick={() => setSelectedLang("fa")} className={`flex-1 py-2.5 rounded-lg text-sm font-bold transition-colors ${selectedLang === "fa" ? 'bg-amber-500 text-gray-900 shadow-sm' : 'text-gray-400 hover:text-white'}`}>فارسی</button>
                        <button onClick={() => setSelectedLang("en")} className={`flex-1 py-2.5 rounded-lg text-sm font-bold transition-colors ${selectedLang === "en" ? 'bg-amber-500 text-gray-900 shadow-sm' : 'text-gray-400 hover:text-white'}`}>English</button>
                      </div>
                    </div>

                    {isLoading ? (
                      <div className="flex justify-center py-10"><Loader2 className="animate-spin text-amber-500" size={32} /></div>
                    ) : (
                      <div className="flex flex-col gap-4">

                        <label className="text-xs font-bold text-gray-400 uppercase mt-2 flex items-center justify-between">
                          <span>{isUiRtl ? "انتخاب محصولات از دسته‌بندی‌ها" : "Add from Categories"}</span>
                        </label>

                        <div className="relative mb-2 z-20">
                          <div className="flex items-center bg-gray-900 border border-gray-800 rounded-xl px-3 py-2 transition-colors focus-within:border-amber-500">
                            <Search size={18} className="text-gray-500 shrink-0" />
                            <input
                              type="text"
                              value={searchQuery}
                              onChange={(e) => setSearchQuery(e.target.value)}
                              placeholder={isUiRtl ? "جستجوی سریع نام محصول..." : "Search products..."}
                              className="bg-transparent border-none outline-none text-sm text-white w-full px-3 placeholder-gray-600"
                            />
                            {searchQuery && (
                              <button onClick={() => setSearchQuery("")} className="text-gray-500 hover:text-white shrink-0">
                                <X size={16} />
                              </button>
                            )}
                          </div>

                          <AnimatePresence>
                            {searchQuery.trim() !== "" && (
                              <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="absolute top-full mt-2 left-0 right-0 bg-gray-800 border border-gray-700 rounded-xl max-h-60 overflow-y-auto custom-scrollbar p-2 shadow-2xl flex flex-col gap-1"
                              >
                                {searchResults.length > 0 ? searchResults.map(p => {
                                  const isSelected = selectedProducts.includes(p._id);
                                  return (
                                    <label key={p._id} className="flex items-center gap-3 p-2 hover:bg-gray-700 rounded-lg cursor-pointer transition-colors" onClick={(e) => { e.preventDefault(); toggleSingleProduct(p._id); }}>
                                      <img src={p.images?.main || "https://placehold.co/100"} className="w-8 h-8 object-contain bg-white rounded p-0.5" alt="img" />
                                      <span className="text-xs font-bold text-gray-200 line-clamp-1 flex-1">{isUiRtl ? p.faTitle : p.enTitle}</span>
                                      <div className="shrink-0">
                                        {isSelected ? <CheckSquare className="text-amber-500" size={18} /> : <Square className="text-gray-500" size={18} />}
                                      </div>
                                    </label>
                                  )
                                }) : (
                                  <div className="text-center text-gray-500 text-xs py-4">{isUiRtl ? "محصولی یافت نشد." : "No products found."}</div>
                                )}
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>

                        <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden mb-2">
                          <div className="flex items-center gap-3 p-4 cursor-pointer hover:bg-gray-800 transition-colors" onClick={toggleAllProducts}>
                            {selectedProducts.length > 0 && selectedProducts.length === products.length ? <CheckSquare className="text-amber-500" size={20} /> : <Square className="text-gray-600" size={20} />}
                            <span className="font-bold text-white">{isUiRtl ? "انتخاب کل محصولات" : "Select All Products"}</span>
                          </div>
                        </div>

                        <div className="flex flex-col gap-3 mb-6">
                          {mainCategories.map(mainCat => {
                            const mainProds = getProductsForCat(mainCat.slug, true);
                            if (mainProds.length === 0) return null;
                            const isMainAllSelected = mainProds.every(id => selectedProducts.includes(id));
                            const isMainPartiallySelected = !isMainAllSelected && mainProds.some(id => selectedProducts.includes(id));
                            const isMainExpanded = expandedCats.includes(mainCat.slug);

                            return (
                              <div key={mainCat.slug} className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
                                <div className="flex items-center justify-between p-4 bg-gray-800/50 border-b border-gray-800">
                                  <div className="flex items-center gap-3 cursor-pointer flex-1" onClick={() => toggleCategory(mainCat.slug, true)}>
                                    {isMainAllSelected ? <CheckSquare className="text-amber-500" size={18} /> : isMainPartiallySelected ? <CheckSquare className="text-amber-500/50" size={18} /> : <Square className="text-gray-600" size={18} />}
                                    <span className="font-bold text-white text-sm">{isUiRtl ? mainCat.faName : mainCat.enName}</span>
                                  </div>
                                  <button onClick={() => toggleAccordion(mainCat.slug)} className="p-1 text-gray-500 hover:text-amber-500 transition-colors">
                                    {isMainExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                                  </button>
                                </div>

                                <AnimatePresence>
                                  {isMainExpanded && (
                                    <motion.div initial={{ height: 0 }} animate={{ height: "auto" }} exit={{ height: 0 }} className="overflow-hidden">
                                      <div className="flex flex-col p-2 bg-gray-900">
                                        {getSubCats(mainCat.slug).map(subCat => {
                                          const subProds = getProductsForCat(subCat.slug, false);
                                          if (subProds.length === 0) return null;
                                          const isSubAllSelected = subProds.every(id => selectedProducts.includes(id));
                                          const isSubPartiallySelected = !isSubAllSelected && subProds.some(id => selectedProducts.includes(id));
                                          const isSubExpanded = expandedCats.includes(subCat.slug);

                                          return (
                                            <div key={subCat.slug} className="flex flex-col mb-1">
                                              <div className="flex items-center justify-between p-2 pl-4 rtl:pl-2 rtl:pr-4 hover:bg-gray-800 rounded-xl transition-colors">
                                                <div className="flex items-center gap-3 cursor-pointer flex-1" onClick={() => toggleCategory(subCat.slug, false)}>
                                                  {isSubAllSelected ? <CheckSquare className="text-blue-500" size={16} /> : isSubPartiallySelected ? <CheckSquare className="text-blue-500/50" size={16} /> : <Square className="text-gray-600" size={16} />}
                                                  <span className="text-xs font-bold text-gray-300">{isUiRtl ? subCat.faName : subCat.enName}</span>
                                                </div>
                                                <button onClick={() => toggleAccordion(subCat.slug)} className="p-1 text-gray-500 hover:text-blue-500 transition-colors">
                                                  {isSubExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                                                </button>
                                              </div>

                                              <AnimatePresence>
                                                {isSubExpanded && (
                                                  <motion.div initial={{ height: 0 }} animate={{ height: "auto" }} exit={{ height: 0 }} className="overflow-hidden">
                                                    <div className="flex flex-col pl-10 pr-2 rtl:pr-10 rtl:pl-2 border-l border-gray-800 rtl:border-l-0 rtl:border-r ml-5 rtl:ml-0 rtl:mr-5 py-1">
                                                      {products.filter(p => p.category === subCat.slug).map(product => (
                                                        <label key={product._id} className="flex items-center gap-3 p-2 hover:bg-gray-800 rounded-xl cursor-pointer transition-colors">
                                                          {selectedProducts.includes(product._id) ? <CheckSquare className="text-amber-500" size={14} /> : <Square className="text-gray-600" size={14} />}
                                                          <img src={product.images?.main || "https://placehold.co/100x100"} alt="product" className="w-6 h-6 object-contain bg-white rounded p-0.5" />
                                                          <span className="text-[11px] font-medium text-gray-400 line-clamp-1">{isUiRtl ? product.faTitle : product.enTitle}</span>
                                                        </label>
                                                      ))}
                                                    </div>
                                                  </motion.div>
                                                )}
                                              </AnimatePresence>
                                            </div>
                                          );
                                        })}
                                      </div>
                                    </motion.div>
                                  )}
                                </AnimatePresence>
                              </div>
                            );
                          })}
                        </div>

                        <div className="flex flex-col gap-3 mb-2 border border-gray-800 rounded-2xl p-4 bg-gray-900/50">
                          <label className="text-xs font-bold text-amber-500 uppercase flex items-center justify-between mb-2">
                            <span>{isUiRtl ? "مرتب‌سازی و مدیریت انتخاب‌ها" : "Sort & Manage Selection"}</span>
                            <span className="text-[10px] bg-amber-500/20 text-amber-400 px-2 py-1 rounded-md">{selectedProducts.length}</span>
                          </label>
                          <div className="flex flex-col gap-2 max-h-96 overflow-y-auto custom-scrollbar pr-2 rtl:pl-2 rtl:pr-0">
                            {orderedProducts.map((p, index) => (
                              <div
                                key={p._id}
                                draggable
                                onDragStart={() => setDraggedItemIndex(index)}
                                onDragOver={(e) => e.preventDefault()}
                                onDrop={(e) => handleDrop(e, index)}
                                className={`flex items-center justify-between bg-gray-800/80 border border-gray-700 p-2.5 rounded-xl cursor-grab active:cursor-grabbing transition-colors ${draggedItemIndex === index ? 'opacity-50 border-dashed border-amber-500' : 'hover:border-gray-500'}`}
                              >
                                <div className="flex items-center gap-3">
                                  <GripVertical size={16} className="text-gray-500 shrink-0" />
                                  <span className="text-xs font-bold text-gray-300 line-clamp-1">{index + 1}. {isUiRtl ? p.faTitle : p.enTitle}</span>
                                </div>
                                <button onClick={() => toggleSingleProduct(p._id)} className="text-gray-500 hover:text-red-500 transition-colors shrink-0">
                                  <X size={16} />
                                </button>
                              </div>
                            ))}
                            {orderedProducts.length === 0 && (
                              <div className="text-center text-gray-500 text-xs py-4">{isUiRtl ? "هیچ محصولی انتخاب نشده است." : "No products selected."}</div>
                            )}
                          </div>
                        </div>

                      </div>
                    )}
                  </div>

                  <div className="p-6 border-t border-gray-800 bg-gray-950 shrink-0">
                    <button
                      onClick={() => window.print()}
                      disabled={selectedProducts.length === 0}
                      className="w-full bg-amber-500 hover:bg-amber-400 text-gray-950 py-4 rounded-xl font-black flex items-center justify-center gap-2 transition-all shadow-lg shadow-amber-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Printer size={20} />
                      {isUiRtl ? "دانلود و چاپ کاتالوگ (PDF)" : "Download & Print Catalog"}
                    </button>
                  </div>
                </div>

              </motion.div>
            </div>
          </div>
        )}
      </AnimatePresence>

      {/* --- پورتال اصلی چاپ --- */}
      <div id="print-portal" className="hidden">
        <CatalogContent
          orderedProducts={orderedProducts}
          hqData={hqData}
          lang={selectedLang}
          categories={categories}
          siteLogo={siteLogo}
        />
      </div>
    </>,
    document.body
  );
}