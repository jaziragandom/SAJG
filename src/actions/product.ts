"use server";

import dbConnect from "@/lib/mongodb";
import Product from "@/models/Product";
import { revalidatePath } from "next/cache";

export async function getProducts(filter: any = {}) {
  try {
    await dbConnect();
    let dbFilter: any = {};
    
    // حذف فیلتر اجباری published چون وضعیت‌ها کاملاً داینامیک شده‌اند
    if (filter.status && filter.status !== 'all') {
        dbFilter.status = filter.status;
    }

    // منطق فیلتر محصولات ویژه (Featured) برای سکشن محصولات صفحه اصلی
    if (filter.isFeatured !== undefined) {
        dbFilter.isFeatured = filter.isFeatured;
    }

    // هوشمندسازی دریافت فیلترها از ناوبار
    if (filter.brand) {
        dbFilter.brandId = filter.brand;
    }
    
    // اگر کاربر از ناوبار دسته‌بندی را انتخاب کرد
    if (filter.category) {
        // چون ناوبار ممکن است یک گروه اصلی (mainCat) یا زیردسته (category) بفرستد
        // ما هر دو فیلد را جستجو می‌کنیم تا کاربر دقیقاً به خواسته خود برسد
        dbFilter.$or = [
            { mainCat: filter.category },
            { category: filter.category }
        ];
    }

    // جستجوی متنی هوشمند (برای زمانی که کاربر مستقیماً متنی را تایپ می‌کند)
    if (filter.search) {
        dbFilter.$or = [
            ...(dbFilter.$or || []),
            { faTitle: { $regex: filter.search, $options: 'i' } },
            { enTitle: { $regex: filter.search, $options: 'i' } }
        ];
    }

    console.log("🔍 [BACKEND] کوئری پردازش شده برای دیتابیس:", JSON.stringify(dbFilter));

    const products = await Product.find(dbFilter)
      .populate('brandId', 'faName enName slug logo')
      .sort({ createdAt: -1 })
      .lean();
      
    console.log(`✅ [BACKEND] تعداد محصولات یافت شده: ${products.length}`);

    return { success: true, data: JSON.parse(JSON.stringify(products)) };
  } catch (error: any) {
    console.error("❌ [BACKEND] خطا در دریافت محصولات:", error.message || error);
    return { success: false, error: "خطا در دریافت محصولات", details: error.message };
  }
}

export async function createProduct(data: any) {
  try {
    await dbConnect();
    const newProduct = await Product.create(data);
    revalidatePath("/", "layout");
    return { success: true, data: JSON.parse(JSON.stringify(newProduct)) };
  } catch (error: any) {
    // بهبود لاگ خطا برای پیدا کردن راحت‌تر مشکلاتی مثل خالی بودن برند یا فیلدهای اجباری
    console.error("❌ [BACKEND] خطا در ثبت محصول:", error.message || error);
    return { success: false, error: error.message || "خطا در ثبت محصول" };
  }
}

export async function updateProduct(id: string, data: any) {
  try {
    await dbConnect();
    const updatedProduct = await Product.findByIdAndUpdate(id, data, { new: true, runValidators: true }).lean();
    revalidatePath("/", "layout");
    return { success: true, data: JSON.parse(JSON.stringify(updatedProduct)) };
  } catch (error: any) {
    console.error("❌ [BACKEND] خطا در ویرایش محصول:", error.message || error);
    return { success: false, error: "خطا در ویرایش محصول" };
  }
}

export async function deleteProduct(id: string) {
  try {
    await dbConnect();
    await Product.findByIdAndDelete(id);
    revalidatePath("/", "layout");
    return { success: true };
  } catch (error: any) {
    console.error("❌ [BACKEND] خطا در حذف محصول:", error.message || error);
    return { success: false, error: "خطا در حذف محصول" };
  }
}

export async function getProductById(id: string) {
  try {
    await dbConnect();
    const product = await Product.findById(id)
      .populate('brandId', 'faName enName slug logo')
      .lean();
    
    if (!product) {
      return { success: false, error: "محصول یافت نشد" };
    }
    
    return { success: true, data: JSON.parse(JSON.stringify(product)) };
  } catch (error: any) {
    console.error("❌ [BACKEND] خطا در دریافت تک محصول:", error.message || error);
    return { success: false, error: "خطا در دریافت اطلاعات محصول" };
  }
}