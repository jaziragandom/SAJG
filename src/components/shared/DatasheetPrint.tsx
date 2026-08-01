"use client";

import React, { forwardRef } from "react";
import QRCode from "react-qr-code";
import { Award, ShieldCheck, CheckCircle } from "lucide-react"; // آیکن‌های گواهینامه‌ها اضافه شد

export interface DatasheetPrintProps {
  locale: string;
  product: any;
  categories: any[];
  brand: any;
}

const DatasheetPrint = forwardRef<HTMLDivElement, DatasheetPrintProps>(
  ({ locale, product, categories, brand }, ref) => {
    const isRtl = locale === "fa";

    if (!product) return null;

    const title = isRtl ? product.faTitle : product.enTitle || product.faTitle;
    const description = isRtl ? product.faDesc : product.enDesc || product.faDesc;
    const productImage = product.images?.main || "https://placehold.co/600x600/png";

    const brandName = brand
      ? isRtl ? brand.faName || brand.enName : brand.enName || brand.faName
      : "-";

    const catObj = categories?.find((c: any) => c.slug === product.category || c._id === product.category);
    const catName = catObj ? (isRtl ? catObj.faName : catObj.enName) : (product.category || "-");

    const resolveSpec = (val: any, faVal: any, enVal: any) => {
      if (!val) return "-";
      const cat = categories?.find((c: any) => c.slug === val || c._id === val || c.faName === val);
      if (cat) return isRtl ? cat.faName : (cat.enName || cat.faName);
      return isRtl ? (faVal || val) : (enVal || val);
    };

    const weight = resolveSpec(product.specs?.weight, product.specs?.weightFa, product.specs?.weightEn);
    const packagingRaw = resolveSpec(product.specs?.packaging, product.specs?.packagingFa, product.specs?.packagingEn);
    const flavor = resolveSpec(product.specs?.flavor, product.specs?.flavorFa, product.specs?.flavorEn);

    const ingredients = isRtl ? product.specs?.ingredientsFa : product.specs?.ingredientsEn;
    const shelfLife = isRtl ? product.specs?.shelfLifeFa : product.specs?.shelfLifeEn;
    const packCountRaw = product.specs?.itemsPerPackage || "-";

    // منطق اصلاح شده برای جلوگیری از نمایش خط تیره‌های اضافی و خام در بسته‌بندی
    const packArr = [];
    if (packCountRaw && packCountRaw !== "-" && packCountRaw !== "نامشخص" && packCountRaw !== "N/A") packArr.push(packCountRaw);
    if (packagingRaw && packagingRaw !== "-" && packagingRaw !== "نامشخص" && packagingRaw !== "N/A") packArr.push(packagingRaw);
    const displayPackaging = packArr.length > 0 ? packArr.join(" - ") : "-";

    const issueDate = new Date().toLocaleDateString(isRtl ? "fa-IR" : "en-US");
    const documentNo = `TDS-${String(product._id || product.id).slice(-8)}`;
    const pageUrl = typeof window !== "undefined" ? window.location.href : "";

    return (
      <div
        ref={ref}
        id="datasheet-print"
        dir={isRtl ? "rtl" : "ltr"}
        className="w-[210mm] min-h-[297mm] mx-auto p-8 md:p-12 bg-white text-gray-900 flex flex-col gap-8 print:p-8 print:m-0 print:shadow-none shadow-xl relative"
      >
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.03] z-0 overflow-hidden">
          <span className="text-9xl font-black rotate-[-35deg] whitespace-nowrap">
            Jazirah Gandum
          </span>
        </div>

        <div className="relative z-10 flex flex-col h-full w-full gap-8">

          <div className="flex justify-between items-center border-b-2 border-gray-900 pb-4">
            <div className="flex flex-col gap-1">
              <h3 className="text-xl font-black tracking-tight text-gray-950">
                {isRtl ? "شرکت صنعتی جزیره گندم" : "Jazirah Gandum Co."}
              </h3>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                Product Technical Datasheet (TDS)
              </p>
            </div>
            <div className="text-left" dir="ltr">
              <p className="text-[10px] font-bold text-gray-400 text-end">Doc No: {documentNo}</p>
              <p className="text-[10px] font-bold text-gray-400 mt-0.5 text-end">Issue Date: {issueDate}</p>
            </div>
          </div>

          <div className="flex flex-col gap-4 w-full">
            <div className="flex flex-row items-stretch bg-gray-50 p-6 rounded-2xl border border-gray-100 gap-6">
              <div className="flex flex-col gap-3 flex-[2] justify-center">
                <div>
                  <span className="text-[10px] font-bold text-amber-600 uppercase tracking-wide">
                    {isRtl ? "شناسنامه فنی محصول" : "Product ID"}
                  </span>
                  <h4 className="text-xl font-black text-gray-950 mt-1">{title}</h4>
                </div>
                <p className="text-[11px] leading-relaxed text-gray-600 text-justify whitespace-pre-wrap">
                  {description}
                </p>
              </div>
              <div className="flex flex-[1] justify-center items-center h-auto min-h-[120px]">
                <img src={productImage} alt={title} className="max-h-[160px] object-contain mix-blend-multiply" />
              </div>
            </div>

            {(product.hasWarning || product.warningMessageFa || product.warningMessageEn) && (
              <div className="border border-red-200 bg-red-50/70 rounded-2xl p-4 flex items-start gap-3 w-full">
                <span className="text-red-500 text-lg mt-0.5 shrink-0">⚠</span>
                <div>
                  <h3 className="text-xs font-black text-red-700 mb-1 text-start">
                    {isRtl ? "هشدار مصرف" : "Warnings"}
                  </h3>
                  <p className="text-[11px] font-medium text-red-900/80 leading-relaxed text-justify">
                    {isRtl ? product.warningMessageFa : product.warningMessageEn}
                  </p>
                </div>
              </div>
            )}
          </div>

          <div className="flex flex-col gap-3 w-full">
            <h5 className={`text-xs font-black text-gray-900 ${isRtl ? 'border-r-4 pr-2' : 'border-l-4 pl-2'} border-amber-400`}>
              {isRtl ? "جدول مشخصات و پارامترهای فنی" : "Technical Parameters"}
            </h5>

            <div className="grid grid-cols-3 gap-6 items-stretch h-full">
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
                      {/* جایگزینی با متغیر اصلاح‌شده */}
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

              <div className="col-span-1 flex flex-col gap-6 h-full">
                <div className="border border-gray-200 rounded-xl p-3 flex flex-col items-center justify-center bg-white shadow-sm flex-1 min-h-[110px]">
                  <QRCode value={pageUrl} size={65} />
                  <div className="mt-2 text-center text-[9px] font-bold text-gray-500">
                    {isRtl ? "اسکن برای مشاهده آنلاین" : "Scan to view online"}
                  </div>
                </div>

                {/* تغییر طراحی کارت‌های ایزو و گواهینامه به صورت دو‌بخشی (لوگو + متن) */}
                <div className="shrink-0 h-[48px] border border-gray-200 rounded-xl px-2.5 py-1.5 flex items-center bg-gray-50/50 shadow-sm gap-2.5">
                  <div className="w-8 h-8 bg-white border border-gray-100 rounded-lg flex items-center justify-center shrink-0 shadow-sm">
                    <Award size={16} className="text-blue-600" />
                  </div>
                  <div className="flex flex-col justify-center">
                    <div className="text-[11px] font-black text-gray-800 leading-tight">ISO 22000</div>
                    <div className="text-[7px] font-bold text-gray-500 mt-0.5 text-start leading-tight">
                      {isRtl ? "مدیریت ایمنی مواد غذایی" : "Food Safety Management"}
                    </div>
                  </div>
                </div>

                <div className="shrink-0 h-[48px] border border-gray-200 rounded-xl px-2.5 py-1.5 flex items-center bg-gray-50/50 shadow-sm gap-2.5">
                  <div className="w-8 h-8 bg-white border border-gray-100 rounded-lg flex items-center justify-center shrink-0 shadow-sm">
                    <ShieldCheck size={16} className="text-emerald-600" />
                  </div>
                  <div className="flex flex-col justify-center">
                    <div className="text-[11px] font-black text-gray-800 leading-tight">HACCP</div>
                    <div className="text-[7px] font-bold text-gray-500 mt-0.5 text-start leading-tight">
                      {isRtl ? "تحلیل خطر و کنترل بحرانی" : "Hazard Analysis"}
                    </div>
                  </div>
                </div>

                <div className="shrink-0 h-[48px] border border-gray-200 rounded-xl px-2.5 py-1.5 flex items-center bg-gray-50/50 shadow-sm gap-2.5">
                  <div className="w-8 h-8 bg-white border border-gray-100 rounded-lg flex items-center justify-center shrink-0 shadow-sm">
                    <CheckCircle size={16} className="text-amber-600" />
                  </div>
                  <div className="flex flex-col justify-center">
                    <div className="text-[11px] font-black text-gray-800 leading-tight">GMP</div>
                    <div className="text-[7px] font-bold text-gray-500 mt-0.5 text-start leading-tight">
                      {isRtl ? "شرایط خوب تولید" : "Good Manufacturing Practice"}
                    </div>
                  </div>
                </div>

              </div>
            </div>

            <div className="border border-emerald-200 bg-emerald-50/50 rounded-2xl p-4 text-center w-full mt-2">
              <h3 className="text-xs font-black text-emerald-800 mb-2">
                {isRtl ? "تضمین کیفیت" : "Quality Assurance"}
              </h3>
              <p className="text-[11px] font-medium text-emerald-900/80 leading-relaxed mx-auto text-justify sm:text-center">
                {isRtl
                  ? "این محصول تحت نظارت کامل واحد کنترل کیفیت شرکت تولید شده و مطابق استانداردهای بین‌المللی صنایع غذایی آزمایش و تأیید شده است."
                  : "This product has been manufactured under strict laboratory quality control and complies with international food safety standards."}
              </p>
            </div>
          </div>

          <div className="mt-auto pt-8 border-t border-dashed border-gray-300 flex justify-between items-center text-[10px] font-medium text-gray-400">
            <p className="text-start">
              {isRtl ? "تأیید شده توسط واحد کنترل کیفیت (QC) جزیره گندم" : "Approved by Jazirah Gandum Quality Control (QC)"}
            </p>
            <p className="text-end font-mono" dir="ltr">www.jazirahgandumco.com</p>
          </div>

        </div>
      </div>
    );
  }
);

DatasheetPrint.displayName = "DatasheetPrint";

export default DatasheetPrint;