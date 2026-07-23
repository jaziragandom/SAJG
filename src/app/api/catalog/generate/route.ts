import dbConnect from "@/lib/mongodb";
import Product from "@/models/Product";
import Category from "@/models/Category";
import Brand from "@/models/Brand"; 
import puppeteer from "puppeteer";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { lang, productIds, hqData } = await req.json();
    await dbConnect();

    const isRtl = lang === "fa";
    
    // واکشی کامل محصولات و دسته‌بندی‌ها
    const products = await Product.find({ _id: { $in: productIds } })
      .populate({ path: 'brandId', model: Brand, select: 'faName enName logo logoFa logoEn' })
      .lean();

    const categories = await Category.find({}).lean();
    
    const getCatName = (slug: string) => {
      const cat = categories.find((c: any) => c.slug === slug);
      if (!cat) return slug || "-";
      return isRtl ? cat.faName : (cat.enName || cat.faName);
    };

    // --- ساختاربندی HTML برای رندر PDF ---
    const htmlContent = `
    <!DOCTYPE html>
    <html lang="${lang}" dir="${isRtl ? 'rtl' : 'ltr'}">
    <head>
      <meta charset="UTF-8">
      <script src="https://cdn.tailwindcss.com"></script>
      <link href="https://fonts.googleapis.com/css2?family=Vazirmatn:wght@400;700;900&display=swap" rel="stylesheet">
      <style>
        body { 
          font-family: 'Vazirmatn', sans-serif; 
          margin: 0; 
          padding: 0; 
          background: #fff; 
          -webkit-print-color-adjust: exact; 
          print-color-adjust: exact; 
        }
        .page { 
          width: 210mm; 
          height: 297mm; 
          overflow: hidden; 
          position: relative; 
          page-break-after: always; 
          box-sizing: border-box; 
        }
        /* تنظیمات اسکرول و لینک‌های فهرست */
        a { text-decoration: none; color: inherit; }
      </style>
    </head>
    <body>

      <!-- 1. صفحه کاور اصلی -->
      <div class="page bg-amber-400 flex flex-col items-center justify-center p-12 text-center relative">
        <div class="absolute inset-0 bg-black opacity-5"></div>
        <div class="relative z-10 w-full h-full flex flex-col items-center justify-center border-8 border-gray-900 p-10 bg-amber-400/90 backdrop-blur-sm">
          <div class="w-24 h-24 bg-gray-900 rounded-2xl mb-8 flex items-center justify-center">
             <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#fbbf24" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 20a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V8l-7 5V8l-7 5V4a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z"/><path d="M17 18h1"/><path d="M12 18h1"/><path d="M7 18h1"/></svg>
          </div>
          
          <h1 class="text-6xl font-black text-gray-900 mb-6 tracking-tighter leading-tight">
            ${isRtl ? (hqData?.faName || "شرکت جزیره گندم") : (hqData?.enName || "Jazirah Gandum Co.")}
          </h1>
          <div class="w-32 h-2 bg-gray-900 mb-6"></div>
          <h2 class="text-3xl font-bold text-amber-900 uppercase tracking-widest mb-16">
            ${isRtl ? "کاتالوگ جامع و مشخصات فنی محصولات" : "Comprehensive Product Catalog & TDS"}
          </h2>
          
          <div class="mt-auto flex flex-col gap-4 text-gray-900 font-bold text-xl bg-amber-500/20 p-8 rounded-3xl border border-amber-500/30 w-full max-w-lg">
            <p dir="ltr" class="flex items-center justify-center gap-3">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
              ${hqData?.phone || "+93 790 710 015"}
            </p>
            <p class="flex items-center justify-center gap-3">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
              ${hqData?.email || "info@jazirahgandumco.com"}
            </p>
            <p class="text-sm mt-2 leading-relaxed border-t border-amber-500/30 pt-4 flex items-start justify-center gap-3">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="shrink-0 mt-0.5"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
              ${isRtl ? (hqData?.faAddress || "آدرس شرکت") : (hqData?.enAddress || "Company Address")}
            </p>
          </div>
        </div>
      </div>

      <!-- 2. صفحه فهرست محصولات (Index) -->
      <div class="page flex flex-col bg-gray-50 px-12 py-16">
        <div class="flex items-center gap-4 mb-10 border-b-4 border-amber-400 pb-4">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#fbbf24" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="8" x2="21" y1="6" y2="6"/><line x1="8" x2="21" y1="12" y2="12"/><line x1="8" x2="21" y1="18" y2="18"/><line x1="3" x2="3.01" y1="6" y2="6"/><line x1="3" x2="3.01" y1="12" y2="12"/><line x1="3" x2="3.01" y1="18" y2="18"/></svg>
          <h2 class="text-4xl font-black text-gray-900">${isRtl ? "فهرست محصولات" : "Table of Contents"}</h2>
        </div>
        
        <div class="flex flex-col gap-2">
          ${products.map((p: any, index: number) => {
            const title = isRtl ? p.faTitle : (p.enTitle || p.faTitle);
            const brandName = isRtl ? p.brandId?.faName : p.brandId?.enName;
            return `
            <a href="#prod-${p._id}" class="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-xl hover:bg-amber-50">
              <div class="flex items-center gap-4">
                <span class="text-gray-400 font-bold w-6 text-center">${index + 1}</span>
                <img src="${p.images?.main}" class="w-10 h-10 object-contain mix-blend-multiply" />
                <span class="font-black text-gray-900 text-lg">${title}</span>
              </div>
              <span class="bg-amber-100 text-amber-700 px-3 py-1 rounded-md text-xs font-bold">${brandName || "-"}</span>
            </a>
          `}).join('')}
        </div>
      </div>

      <!-- 3. صفحات محصولات (یک محصول در هر صفحه) -->
      ${products.map((p: any, index: number) => {
        const title = isRtl ? p.faTitle : (p.enTitle || p.faTitle);
        const desc = isRtl ? p.faDesc : (p.enDesc || p.faDesc);
        const brandName = isRtl ? p.brandId?.faName : p.brandId?.enName;
        const brandLogo = isRtl ? (p.brandId?.logoFa || p.brandId?.logo) : (p.brandId?.logoEn || p.brandId?.logo);
        
        const catName = getCatName(p.category);
        const mainCatName = getCatName(p.mainCat);
        
        const weight = isRtl ? (p.specs?.weightFa || getCatName(p.specs?.weight)) : (p.specs?.weightEn || getCatName(p.specs?.weight));
        const packaging = isRtl ? (p.specs?.packagingFa || getCatName(p.specs?.packaging)) : (p.specs?.packagingEn || getCatName(p.specs?.packaging));
        const flavor = isRtl ? (p.specs?.flavorFa || getCatName(p.specs?.flavor)) : (p.specs?.flavorEn || getCatName(p.specs?.flavor));
        const shelfLife = isRtl ? p.specs?.shelfLifeFa : p.specs?.shelfLifeEn;
        const ingredients = isRtl ? p.specs?.ingredientsFa : p.specs?.ingredientsEn;
        const itemsPerPack = p.specs?.itemsPerPackage || "-";
        
        const warningMsg = isRtl ? p.warningMessageFa : p.warningMessageEn;

        return `
        <!-- ID به صفحه اضافه شد تا لینک‌های فهرست کار کنند -->
        <div class="page flex flex-col bg-white" id="prod-${p._id}">
          
          <!-- هدر صفحه -->
          <div class="h-32 bg-gray-50 flex items-center justify-between px-12 border-b border-gray-200">
             <div class="flex flex-col">
                <div class="flex items-center gap-2 mb-1">
                  <span class="bg-amber-100 text-amber-700 px-3 py-1 rounded-md text-[10px] font-black uppercase tracking-wider">${brandName || "-"}</span>
                  <span class="text-gray-400 text-xs font-bold">${mainCatName} / ${catName}</span>
                </div>
                <h2 class="text-3xl font-black text-gray-900">${title}</h2>
             </div>
             ${brandLogo ? `<img src="${brandLogo}" class="h-14 object-contain" />` : ''}
          </div>

          <!-- بدنه اصلی -->
          <div class="flex-1 flex flex-col p-12 gap-8">
            
            <div class="flex h-[110mm] gap-8">
              <!-- تصویر محصول -->
              <div class="w-1/2 bg-white border border-gray-100 rounded-3xl flex items-center justify-center p-8 shadow-sm relative overflow-hidden">
                <div class="absolute inset-0 bg-linear-to-tr from-gray-50 to-white"></div>
                <img src="${p.images?.main}" class="relative z-10 max-w-full max-h-full object-contain drop-shadow-xl" />
                ${p.isFeatured ? `
                  <div class="absolute top-6 ${isRtl ? 'right-6' : 'left-6'} bg-amber-400 text-gray-900 text-xs font-black px-4 py-2 rounded-xl flex items-center gap-1 shadow-md z-20">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" stroke="none"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                    ${isRtl ? "محصول ویژه" : "Featured"}
                  </div>
                ` : ''}
              </div>

              <!-- توضیحات و هشدار -->
              <div class="w-1/2 flex flex-col gap-6">
                ${desc ? `
                  <div>
                    <h4 class="text-sm font-black text-gray-900 border-b-2 border-amber-400 pb-1 mb-3 inline-block">${isRtl ? 'معرفی محصول' : 'Description'}</h4>
                    <p class="text-sm text-gray-600 leading-loose text-justify">${desc}</p>
                  </div>
                ` : ''}

                ${p.hasWarning && warningMsg ? `
                  <div class="bg-red-50 border border-red-200 p-5 rounded-2xl mt-auto">
                    <div class="flex items-center gap-2 mb-2">
                       <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ef4444" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4"/><path d="M12 17h.01"/></svg>
                       <h4 class="font-black text-red-600 text-sm">${isRtl ? 'هشدار مصرف' : 'Warning'}</h4>
                    </div>
                    <p class="text-xs text-red-500 font-medium leading-relaxed text-justify">${warningMsg}</p>
                  </div>
                ` : ''}
                
                <div class="bg-emerald-50 border border-emerald-200 p-4 rounded-2xl ${!(p.hasWarning && warningMsg) ? 'mt-auto' : ''}">
                   <div class="flex items-center gap-2 mb-1">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="m9 12 2 2 4-4"/></svg>
                      <h4 class="font-black text-emerald-700 text-sm">${isRtl ? 'اصالت و کیفیت' : 'Authenticity Guarantee'}</h4>
                   </div>
                   <p class="text-[10px] text-emerald-600 font-medium leading-relaxed">${isRtl ? 'این محصول تحت استانداردهای کیفی جزیره گندم تولید شده است.' : 'Produced under Jazirah Gandum strict quality standards.'}</p>
                </div>
              </div>
            </div>

            <!-- جدول مشخصات فنی و ترکیبات -->
            <div class="flex gap-8">
              <div class="w-1/2">
                <div class="bg-gray-50 rounded-2xl border border-gray-200 overflow-hidden">
                  <div class="bg-gray-900 px-5 py-3 font-black text-white flex items-center gap-2">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" x2="8" y1="13" y2="13"/><line x1="16" x2="8" y1="17" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
                    ${isRtl ? 'پارامترهای فنی' : 'Technical Parameters'}
                  </div>
                  <div class="flex flex-col text-sm">
                    <div class="flex justify-between p-4 border-b border-gray-200"><span class="font-bold text-gray-500">${isRtl ? 'وزن / حجم ظرف' : 'Net Weight'}</span><span class="font-black text-gray-900" dir="ltr">${weight || "-"}</span></div>
                    <div class="flex justify-between p-4 border-b border-gray-200 bg-white"><span class="font-bold text-gray-500">${isRtl ? 'نوع بسته‌بندی' : 'Packaging'}</span><span class="font-black text-gray-900">${packaging || "-"}</span></div>
                    <div class="flex justify-between p-4 border-b border-gray-200"><span class="font-bold text-gray-500">${isRtl ? 'تعداد در کارتن/شیرینگ' : 'Items per Pack'}</span><span class="font-black text-gray-900">${itemsPerPack}</span></div>
                    <div class="flex justify-between p-4 border-b border-gray-200 bg-white"><span class="font-bold text-gray-500">${isRtl ? 'طعم و عصاره پایه' : 'Flavor'}</span><span class="font-black text-gray-900">${flavor || "-"}</span></div>
                    <div class="flex justify-between p-4"><span class="font-bold text-gray-500">${isRtl ? 'تاریخ انقضا' : 'Shelf Life'}</span><span class="font-black text-gray-900">${shelfLife || "-"}</span></div>
                  </div>
                </div>
              </div>

              <div class="w-1/2 flex flex-col">
                ${ingredients ? `
                  <div class="bg-gray-50 rounded-2xl border border-gray-200 overflow-hidden h-full">
                    <div class="bg-gray-200/50 px-5 py-3 font-black text-gray-900 flex items-center gap-2 border-b border-gray-200">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 11a5 5 0 1 0 6 0"/><path d="M12 2v9"/><path d="M12 15v7"/><path d="M6 21h12"/></svg>
                      ${isRtl ? 'ترکیبات اصلی' : 'Main Ingredients'}
                    </div>
                    <div class="p-5 text-sm text-gray-700 leading-loose text-justify font-medium">
                      ${ingredients}
                    </div>
                  </div>
                ` : ''}
              </div>
            </div>

          </div>

          <!-- فوتر صفحه -->
          <div class="h-16 bg-gray-900 mt-auto flex justify-between items-center px-12 text-xs font-bold text-gray-300">
            <span class="text-amber-400">${isRtl ? (hqData?.faName || "") : (hqData?.enName || "")}</span>
            <div class="flex items-center gap-4">
               <span>Page ${index + 1} of ${products.length}</span>
               <span class="opacity-30">|</span>
               <span dir="ltr">${hqData?.mapUrl ? new URL(hqData.mapUrl).hostname : "jazirahgandumco.com"}</span>
            </div>
          </div>
        </div>
        `;
      }).join('')}

    </body>
    </html>
    `;

    // پیکربندی و اجرای Puppeteer
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    const page = await browser.newPage();
    await page.setContent(htmlContent, { waitUntil: 'load' });
    
    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: { top: '0', right: '0', bottom: '0', left: '0' }
    });
    
    await browser.close();

    return new NextResponse(Buffer.from(pdfBuffer), {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="Jazirah-Gandum-Catalog-${Date.now()}.pdf"`
      }
    });

  } catch (error: any) {
    console.error("PDF Generation Error:", error);
    // ارسال پیام خطای دقیق به کلاینت برای دیباگ راحت‌تر
    return NextResponse.json({ success: false, error: error.message || "Failed to generate PDF" }, { status: 500 });
  }
}