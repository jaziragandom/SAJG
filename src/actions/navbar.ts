"use server";

import dbConnect from "@/lib/mongodb";
import Category from "@/models/Category";
import Brand from "@/models/Brand";
import Setting from "@/models/Setting"; // مدل درست خودتان جایگزین شد
import { unstable_noStore as noStore } from "next/cache";

export async function getNavbarData() {
  // این دستور معجزه می‌کند! به سیستم می‌گوید ناوبار را کش نکند تا تغییرات دیتابیس فوراً دیده شوند
  noStore(); 
  
  try {
    await dbConnect();

    // فیلتر status برداشته شد تا آیتم‌های قدیمی دیتابیس که استاتوس ندارند هم خوانده شوند
    const categories = await Category.find({})
      .sort({ order: 1 })
      .select('slug faName enName parent iconName')
      .lean();

    const brands = await Brand.find({ status: 'active' })
      .sort({ order: 1 })
      .select('slug faName enName logo logoFa logoEn')
      .lean();
      
    // خواندن لوگو دقیقاً از مدل خودتان انجام شد تا سیستم کرش نکند
    const siteLogoSetting = await Setting.findOne({ key: 'site_logo' }).lean();
    const siteLogo = siteLogoSetting ? siteLogoSetting.value : null;

    return {
      success: true,
      data: JSON.parse(JSON.stringify({ categories, brands, siteLogo }))
    };

  } catch (error) {
    console.error("Error fetching navbar data:", error);
    return { success: false, data: { categories: [], brands: [], siteLogo: null } };
  }
}