"use server";

import dbConnect from "@/lib/mongodb";
import SiteContent from "@/models/SiteContent";
import { revalidatePath } from "next/cache";

// دریافت اطلاعات یک بخش خاص (مثلاً 'footer_settings' یا 'home_products')
export async function getSiteContent(sectionKey: string) {
  try {
    await dbConnect();
    const content = await SiteContent.findOne({ sectionKey }).lean();
    return { success: true, data: content ? JSON.parse(JSON.stringify(content.data)) : null };
  } catch (error) {
    return { success: false, error: "خطا در دریافت اطلاعات" };
  }
}

// ذخیره یا بروزرسانی اطلاعات یک بخش
export async function saveSiteContent(sectionKey: string, data: any) {
  try {
    await dbConnect();
    // upsert: true یعنی اگر این بخش قبلاً در دیتابیس نبود، خودش آن را می‌سازد
    await SiteContent.findOneAndUpdate(
      { sectionKey },
      { data },
      { new: true, upsert: true } 
    );
    revalidatePath("/"); // رفرش کش برای اعمال فوری تغییرات در سایت
    return { success: true };
  } catch (error) {
    return { success: false, error: "خطا در ذخیره اطلاعات" };
  }
}