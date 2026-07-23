"use client";

import React, { forwardRef } from "react";
import QRCode from "react-qr-code";

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

    const title = isRtl
      ? product.faTitle
      : product.enTitle || product.faTitle;

    const description = isRtl
      ? product.faDesc
      : product.enDesc || product.faDesc;

    const productImage =
      product.images?.main ||
      "https://placehold.co/600x600/png";

    const brandName = brand
      ? isRtl
        ? brand.faName || brand.enName
        : brand.enName || brand.faName
      : "-";

    const brandLogo = brand
      ? isRtl
        ? brand.logoFa || brand.logo || brand.logoEn
        : brand.logoEn || brand.logo || brand.logoFa
      : "";

    const weight =
      isRtl
        ? product.specs?.weightFa ||
          product.specs?.weight ||
          "-"
        : product.specs?.weightEn ||
          product.specs?.weight ||
          "-";

    const packaging =
      isRtl
        ? product.specs?.packagingFa ||
          product.specs?.packaging ||
          "-"
        : product.specs?.packagingEn ||
          product.specs?.packaging ||
          "-";

    const flavor =
      isRtl
        ? product.specs?.flavorFa ||
          product.specs?.flavor ||
          "-"
        : product.specs?.flavorEn ||
          product.specs?.flavor ||
          "-";

    const ingredients = isRtl
      ? product.specs?.ingredientsFa
      : product.specs?.ingredientsEn;

    const shelfLife = isRtl
      ? product.specs?.shelfLifeFa
      : product.specs?.shelfLifeEn;

    const packCount =
      product.specs?.itemsPerPackage || "-";

    const issueDate = new Date().toLocaleDateString(
      isRtl ? "fa-IR" : "en-US"
    );

    const documentNo = `TDS-${String(
      product._id || product.id
    ).slice(-8)}`;

    const pageUrl =
      typeof window !== "undefined"
        ? window.location.href
        : "";

    return (
      <div
        ref={ref}
        id="datasheet-print"
        dir={isRtl ? "rtl" : "ltr"}
        className="bg-white text-black w-[210mm] min-h-[297mm] mx-auto p-10"
      >
        <div className="relative">

          <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-5">
            <span className="text-8xl font-black rotate-[-30deg]">
              Jazirah Gandum
            </span>
          </div>

          <header className="flex justify-between items-start border-b-4 border-amber-500 pb-6">

            <div>

              <h1 className="text-3xl font-black">

                {isRtl
                  ? "شرکت صنعتی جزیره گندم"
                  : "Jazirah Gandum Co."}

              </h1>

              <p className="mt-2 text-gray-500 text-sm">

                PRODUCT TECHNICAL DATASHEET (TDS)

              </p>

            </div>

            <div className="text-sm text-right">

              <div>

                {isRtl
                  ? "شماره سند"
                  : "Document No"}

              </div>

              <div className="font-black">

                {documentNo}

              </div>

              <div className="mt-3">

                {isRtl
                  ? "تاریخ صدور"
                  : "Issue Date"}

              </div>

              <div className="font-black">

                {issueDate}

              </div>

            </div>

          </header>

          <section className="grid grid-cols-12 gap-8 mt-10">

            <div className="col-span-3 flex items-center justify-center border rounded-2xl p-4 bg-gray-50">

              <img
                src={productImage}
                alt={title}
                className="max-h-56 object-contain"
              />

            </div>

            <div className="col-span-6">

              <div className="text-xs uppercase tracking-widest text-amber-600 font-bold">

                {isRtl
                  ? "شناسنامه محصول"
                  : "Product Identification"}

              </div>

              <h2 className="text-4xl font-black mt-3">

                {title}

              </h2>

              <p className="mt-5 text-sm leading-7 whitespace-pre-wrap text-gray-700">

                {description}

              </p>

              <div className="flex items-center gap-4 mt-8">

                {brandLogo && (
                  <img
                    src={brandLogo}
                    className="h-12 object-contain"
                    alt=""
                  />
                )}

                <div>

                  <div className="text-xs text-gray-500">

                    {isRtl ? "برند" : "Brand"}

                  </div>

                  <div className="text-xl font-black">

                    {brandName}

                  </div>

                </div>

              </div>

            </div>

            <div className="col-span-3 flex flex-col items-center justify-center border rounded-2xl">

              <QRCode
                value={pageUrl}
                size={130}
              />

              <div className="mt-3 text-center text-[11px] text-gray-500 px-4">

                {isRtl
                  ? "اسکن جهت مشاهده نسخه آنلاین"
                  : "Scan to view online version"}

              </div>

            </div>

          </section>
                    <section className="mt-10">

            <h3 className="text-xl font-black border-r-4 border-amber-500 pr-3 mb-5">

              {isRtl
                ? "مشخصات فنی"
                : "Technical Specifications"}

            </h3>

            <table className="w-full border-collapse text-sm">

              <thead>

                <tr className="bg-gray-100">

                  <th className="border p-3 w-1/3">

                    {isRtl
                      ? "پارامتر"
                      : "Parameter"}

                  </th>

                  <th className="border p-3">

                    {isRtl
                      ? "مقدار"
                      : "Value"}

                  </th>

                </tr>

              </thead>

              <tbody>

                <tr>

                  <td className="border p-3 font-bold">

                    {isRtl ? "برند" : "Brand"}

                  </td>

                  <td className="border p-3">

                    {brandName}

                  </td>

                </tr>

                <tr>

                  <td className="border p-3 font-bold">

                    {isRtl
                      ? "وزن / حجم"
                      : "Weight / Volume"}

                  </td>

                  <td className="border p-3">

                    {weight}

                  </td>

                </tr>

                <tr>

                  <td className="border p-3 font-bold">

                    {isRtl
                      ? "نوع بسته بندی"
                      : "Packaging"}

                  </td>

                  <td className="border p-3">

                    {packaging}

                  </td>

                </tr>

                <tr>

                  <td className="border p-3 font-bold">

                    {isRtl
                      ? "تعداد در کارتن"
                      : "Items Per Carton"}

                  </td>

                  <td className="border p-3">

                    {packCount}

                  </td>

                </tr>

                <tr>

                  <td className="border p-3 font-bold">

                    {isRtl
                      ? "طعم"
                      : "Flavor"}

                  </td>

                  <td className="border p-3">

                    {flavor}

                  </td>

                </tr>

                <tr>

                  <td className="border p-3 font-bold">

                    {isRtl
                      ? "ماندگاری"
                      : "Shelf Life"}

                  </td>

                  <td className="border p-3">

                    {shelfLife}

                  </td>

                </tr>

              </tbody>

            </table>

          </section>

          <section className="grid grid-cols-2 gap-8 mt-10">

            <div className="border rounded-2xl p-6">

              <h3 className="text-lg font-black border-b pb-3">

                {isRtl
                  ? "ترکیبات محصول"
                  : "Ingredients"}

              </h3>

              <p className="mt-4 leading-7 text-sm whitespace-pre-wrap text-gray-700">

                {ingredients ||
                  (isRtl
                    ? "اطلاعاتی ثبت نشده است."
                    : "No information available.")}

              </p>

            </div>

            <div className="border rounded-2xl p-6">

              <h3 className="text-lg font-black border-b pb-3">

                {isRtl
                  ? "شرح محصول"
                  : "Product Description"}

              </h3>

              <p className="mt-4 leading-7 text-sm whitespace-pre-wrap text-gray-700">

                {description}

              </p>

            </div>

          </section>
                    {(product.hasWarning ||
            product.warningMessageFa ||
            product.warningMessageEn) && (

            <section className="mt-10 border-2 border-red-400 bg-red-50 rounded-2xl p-6">

              <h3 className="text-xl font-black text-red-600">

                ⚠ {isRtl
                  ? "هشدار مصرف"
                  : "Warnings"}

              </h3>

              <p className="mt-4 leading-8 text-sm whitespace-pre-wrap">

                {isRtl
                  ? product.warningMessageFa
                  : product.warningMessageEn}

              </p>

            </section>

          )}

          <section className="mt-10">

            <h3 className="text-xl font-black mb-5">

              {isRtl
                ? "استانداردهای اخذ شده"
                : "Quality Standards"}

            </h3>

            <div className="grid grid-cols-3 gap-5">

              <div className="border rounded-2xl p-6 text-center">

                <div className="text-2xl font-black">

                  ISO 22000

                </div>

                <div className="text-xs text-gray-500 mt-2">

                  Food Safety Management

                </div>

              </div>

              <div className="border rounded-2xl p-6 text-center">

                <div className="text-2xl font-black">

                  HACCP

                </div>

                <div className="text-xs text-gray-500 mt-2">

                  Hazard Analysis

                </div>

              </div>

              <div className="border rounded-2xl p-6 text-center">

                <div className="text-2xl font-black">

                  GMP

                </div>

                <div className="text-xs text-gray-500 mt-2">

                  Good Manufacturing Practice

                </div>

              </div>

            </div>

          </section>

          {product.images?.nutrition && (

            <section className="mt-10">

              <h3 className="text-xl font-black mb-5">

                {isRtl
                  ? "جدول ارزش غذایی"
                  : "Nutrition Facts"}

              </h3>

              <div className="border rounded-2xl p-6 flex justify-center">

                <img
                  src={product.images.nutrition}
                  alt="Nutrition Facts"
                  className="max-h-105 object-contain"
                />

              </div>

            </section>

          )}
                    <section className="mt-10 border rounded-2xl bg-green-50 p-6">

            <h3 className="text-xl font-black text-green-700">

              {isRtl
                ? "تضمین کیفیت"
                : "Quality Assurance"}

            </h3>

            <p className="mt-4 text-sm leading-8 text-gray-700">

              {isRtl
                ? "این محصول تحت نظارت کامل واحد کنترل کیفیت شرکت تولید شده و مطابق استانداردهای بین‌المللی صنایع غذایی آزمایش و تأیید شده است."
                : "This product has been manufactured under strict laboratory quality control and complies with international food safety standards."}

            </p>

          </section>

          <footer className="mt-14 border-t pt-6">

            <div className="flex justify-between items-center">

              <div>

                <div className="font-black text-lg">

                  Jazirah Gandum Co.

                </div>

                <div className="text-xs text-gray-500 mt-1">

                  www.jazirahgandumco.com

                </div>

                <div className="text-xs text-gray-500">

                  +93 790 710 015

                </div>

              </div>

              <div className="text-right text-[11px] text-gray-500 leading-6">

                <div>

                  {isRtl
                    ? "این سند توسط سیستم مدیریت محصولات شرکت تولید شده است."
                    : "This document has been generated automatically by the company's Product Management System."}

                </div>

                <div>

                  © Jazirah Gandum Co.

                </div>

              </div>

            </div>

          </footer>

        </div>

      </div>

    );

  }

);

DatasheetPrint.displayName = "DatasheetPrint";

export default DatasheetPrint;