"use server";

import dbConnect from "@/lib/mongodb";
import SiteContent from "@/models/SiteContent";
import { revalidatePath } from "next/cache";

// دریافت اسلایدهای هیرو
export async function getHeroSlides() {
  try {
    await dbConnect();
    const heroData = await SiteContent.findOne({ sectionKey: 'hero_slides' }).lean();
    return { success: true, data: heroData ? JSON.parse(JSON.stringify(heroData.data)) : [] };
  } catch (error) {
    return { success: false, error: "خطا در دریافت اسلایدها" };
  }
}

// ذخیره یکپارچه تمام اسلایدها (آپدیت کامل آرایه)
export async function saveHeroSlides(slides: any[]) {
  try {
    await dbConnect();
    await SiteContent.findOneAndUpdate(
      { sectionKey: 'hero_slides' },
      { data: slides },
      { new: true, upsert: true }
    );
    revalidatePath("/");
    return { success: true };
  } catch (error) {
    return { success: false, error: "خطا در ذخیره اسلایدها" };
  }
}