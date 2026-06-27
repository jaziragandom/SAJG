import { NextRequest, NextResponse } from "next/server";
import { writeFile, unlink } from "fs/promises";
import path from "path";
import fs from "fs";

// ==========================================
// ۱. سیستم آپلود فایل روی هاست (POST)
// ==========================================
export async function POST(request: NextRequest) {
  try {
    const data = await request.formData();
    const file: File | null = data.get("file") as unknown as File;

    if (!file) {
      return NextResponse.json({ success: false, error: "فایلی یافت نشد." }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.name); 
    const safeName = file.name.replace(ext, "").replace(/[^a-zA-Z0-9]/g, "-");
    const filename = `${safeName}-${uniqueSuffix}${ext}`;

    const uploadDir = path.join(process.cwd(), "public", "uploads");
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const filePath = path.join(uploadDir, filename);
    await writeFile(filePath, buffer);
    
    return NextResponse.json({ success: true, url: `/uploads/${filename}` });
    
  } catch (error: any) {
    console.error("Upload API Error:", error);
    return NextResponse.json({ success: false, error: "خطای سرور: " + error.message }, { status: 500 });
  }
}

// ==========================================
// ۲. سیستم حذف فیزیکی فایل از هاست (DELETE)
// ==========================================
export async function DELETE(request: NextRequest) {
  try {
    const { fileUrl } = await request.json();
    
    if (!fileUrl) {
      return NextResponse.json({ success: false, error: "آدرس فایل ارسال نشده است." }, { status: 400 });
    }

    // استخراج نام فایل از آدرس (مثلاً /uploads/image-123.jpg تبدیل می‌شود به image-123.jpg)
    const filename = fileUrl.split('/').pop();
    if (!filename) {
      return NextResponse.json({ success: false, error: "فرمت آدرس نامعتبر است." }, { status: 400 });
    }

    // پیدا کردن مسیر دقیق فایل در سرور
    const filePath = path.join(process.cwd(), "public", "uploads", filename);

    // بررسی وجود فایل و حذف آن
    if (fs.existsSync(filePath)) {
      await unlink(filePath);
      return NextResponse.json({ success: true, message: "فایل با موفقیت از هاست پاک شد." });
    } else {
      return NextResponse.json({ success: false, error: "فایل در سرور پیدا نشد." }, { status: 404 });
    }

  } catch (error: any) {
    console.error("Delete API Error:", error);
    return NextResponse.json({ success: false, error: "خطای سرور در حذف فایل." }, { status: 500 });
  }
}