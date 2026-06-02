import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

export async function POST(request: NextRequest) {
  try {
    const data = await request.formData();
    const file: File | null = data.get("file") as unknown as File;

    if (!file) {
      return NextResponse.json({ success: false, error: "فایلی برای آپلود یافت نشد." }, { status: 400 });
    }

    // تبدیل فایل به بافر برای ذخیره در هارد سرور
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // ساخت یک نام یکتا برای فایل (برای جلوگیری از تداخل اسم‌های تکراری)
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    // استخراج فرمت فایل (مثلا .jpg یا .mp4)
    const ext = path.extname(file.name); 
    // حذف فاصله‌ها و کاراکترهای عجیب از اسم فایل
    const safeName = file.name.replace(ext, "").replace(/[^a-zA-Z0-9]/g, "-");
    const filename = `${safeName}-${uniqueSuffix}${ext}`;

    // تعیین مسیر دقیق ذخیره‌سازی در پوشه public/uploads
    const uploadDir = path.join(process.cwd(), "public", "uploads");
    
    // اطمینان از وجود پوشه (اگر نبود ساخته می‌شود)
    try {
      await mkdir(uploadDir, { recursive: true });
    } catch (err) {
      // پوشه از قبل وجود دارد
    }

    const filePath = path.join(uploadDir, filename);
    
    // ذخیره فیزیکی فایل روی هارد سرور
    await writeFile(filePath, buffer);

    // تولید لینکی که باید در دیتابیس (MongoDB) ذخیره شود
    const fileUrl = `/uploads/${filename}`;

    return NextResponse.json({ success: true, url: fileUrl });
  } catch (error) {
    console.error("Upload Error:", error);
    return NextResponse.json({ success: false, error: "خطای سرور در آپلود فایل." }, { status: 500 });
  }
}