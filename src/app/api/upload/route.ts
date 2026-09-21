import { NextRequest, NextResponse } from "next/server";
import { writeFile, unlink, chmod, mkdir } from "fs/promises";
import path from "path";
import fs from "fs";

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
    const filename = `img-${uniqueSuffix}${ext}`;

    const uploadDir = path.join(process.cwd(), "public", "uploads");
    if (!fs.existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true });
    }

    const filePath = path.join(uploadDir, filename);
    await writeFile(filePath, buffer);

    // بلاک ایمن: اعمال پرمیشن در لینوکس و نادیده گرفتن خطا در ویندوز
    try {
      await chmod(filePath, 0o644);
    } catch (chmodError) {
      console.log("مجوز chmod در این سیستم‌عامل نیاز نیست یا پشتیبانی نمی‌شود.");
    }

    return NextResponse.json({ success: true, url: `/api/uploads/${filename}` });

  } catch (error: any) {
    return NextResponse.json({ success: false, error: "خطای سرور: " + error.message }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { fileUrl } = await request.json();
    if (!fileUrl) return NextResponse.json({ success: false, error: "آدرس فایل ارسال نشده است." }, { status: 400 });

    const filename = fileUrl.split('/').pop();
    if (!filename) return NextResponse.json({ success: false, error: "فرمت آدرس نامعتبر است." }, { status: 400 });

    const filePath = path.join(process.cwd(), "public", "uploads", filename);

    if (fs.existsSync(filePath)) {
      await unlink(filePath);
      return NextResponse.json({ success: true, message: "فایل پاک شد." });
    } else {
      return NextResponse.json({ success: false, error: "فایل پیدا نشد." }, { status: 404 });
    }
  } catch (error: any) {
    return NextResponse.json({ success: false, error: "خطا در حذف فایل." }, { status: 500 });
  }
}