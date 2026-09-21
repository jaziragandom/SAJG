import { NextRequest, NextResponse } from "next/server";
import { readFile } from "fs/promises";
import path from "path";

export async function GET(
    request: NextRequest,
    context: { params: Promise<{ filename: string }> }
) {
    try {
        const { filename } = await context.params;

        // پیدا کردن مسیر فیزیکی عکس روی هارد سرور
        const filePath = path.join(process.cwd(), "public", "uploads", filename);

        // خواندن زنده فایل از روی هارد
        const fileBuffer = await readFile(filePath);

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
        return new NextResponse("File Not Found", { status: 404 });
    }
}