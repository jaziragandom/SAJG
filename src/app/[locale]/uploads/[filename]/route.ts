import { NextRequest, NextResponse } from "next/server";
import { readFile } from "fs/promises";
import path from "path";

// تغییر مهم: اضافه شدن locale و تعریف params به صورت Promise
export async function GET(
    request: NextRequest,
    context: { params: Promise<{ locale: string; filename: string }> }
) {
    try {
        // باز کردن Promise پارامترها (الزام نسخه‌های جدید Next.js)
        const { filename } = await context.params;

        // پیدا کردن مسیر فیزیکی عکس روی هارد سرور
        const filePath = path.join(process.cwd(), "public", "uploads", filename);

        // خواندن زنده فایل از روی هارد (بدون دخالت کش استاتیک Next.js)
        const fileBuffer = await readFile(filePath);

        // تشخیص فرمت فایل برای ارسال هدر صحیح به مرورگر
        const ext = path.extname(filename).toLowerCase();
        let mimeType = "image/jpeg";
        if (ext === ".png") mimeType = "image/png";
        else if (ext === ".webp") mimeType = "image/webp";
        else if (ext === ".gif") mimeType = "image/gif";
        else if (ext === ".svg") mimeType = "image/svg+xml";

        return new NextResponse(fileBuffer, {
            status: 200,
            headers: {
                "Content-Type": mimeType,
                "Cache-Control": "public, max-age=86400, must-revalidate",
            },
        });
    } catch (error) {
        // اگر فایل واقعاً در هارد هم نبود
        return new NextResponse("File Not Found", { status: 404 });
    }
}