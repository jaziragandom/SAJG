"use server";

import dbConnect from "@/lib/mongodb";
import Product from "@/models/Product";
import { revalidatePath } from "next/cache";

export async function getProducts(filter: any = {}) {
  try {
    await dbConnect();
    
    let dbFilter: any = {};
    
    // اگر از پنل ادمین status ارسال نشد، پیش‌فرض محصولات منتشر شده را می‌آوریم
    if (filter.status) {
        dbFilter.status = filter.status;
    } else {
        dbFilter.status = 'published';
    }

    // هوشمندسازی دریافت فیلترها از ناوبار
    if (filter.brand) dbFilter.brandId = filter.brand; // اگر شناسه برند یا اسلاگ پاس داده شد
    
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

    const products = await Product.find(dbFilter)
      .populate('brandId', 'faName enName slug logo')
      .sort({ createdAt: -1 })
      .lean();
      
    return { success: true, data: JSON.parse(JSON.stringify(products)) };
  } catch (error) {
    console.error("Error fetching products:", error);
    return { success: false, error: "خطا در دریافت محصولات" };
  }
}

export async function createProduct(data: any) {
  try {
    await dbConnect();
    const newProduct = await Product.create(data);
    revalidatePath("/");
    return { success: true, data: JSON.parse(JSON.stringify(newProduct)) };
  } catch (error) {
    return { success: false, error: "خطا در ثبت محصول" };
  }
}

export async function updateProduct(id: string, data: any) {
  try {
    await dbConnect();
    const updatedProduct = await Product.findByIdAndUpdate(id, data, { new: true }).lean();
    revalidatePath("/");
    return { success: true, data: JSON.parse(JSON.stringify(updatedProduct)) };
  } catch (error) {
    return { success: false, error: "خطا در ویرایش محصول" };
  }
}

export async function deleteProduct(id: string) {
  try {
    await dbConnect();
    await Product.findByIdAndDelete(id);
    revalidatePath("/");
    return { success: true };
  } catch (error) {
    return { success: false, error: "خطا در حذف محصول" };
  }
}