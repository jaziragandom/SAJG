"use server";

import dbConnect from "@/lib/mongodb"; // اگر نام فایل db.ts است، این خط را اصلاح کن
import Gallery from "@/models/Gallery";
import { revalidatePath } from "next/cache";

// دریافت تمام مدیاها (عکس و فیلم)
export async function getGalleryItems(filter = {}) {
  try {
    await dbConnect();
    const items = await Gallery.find(filter).sort({ createdAt: -1 }).lean();
    return { success: true, data: JSON.parse(JSON.stringify(items)) };
  } catch (error) {
    return { success: false, error: "خطا در دریافت فایل‌های رسانه" };
  }
}

// ثبت مدیا جدید در دیتابیس
export async function createGalleryItem(data: any) {
  try {
    await dbConnect();
    const newItem = await Gallery.create(data);
    revalidatePath("/");
    return { success: true, data: JSON.parse(JSON.stringify(newItem)) };
  } catch (error) {
    return { success: false, error: "خطا در ثبت فایل رسانه" };
  }
}

// ویرایش اطلاعات مدیا
export async function updateGalleryItem(id: string, data: any) {
  try {
    await dbConnect();
    const updatedItem = await Gallery.findByIdAndUpdate(id, data, { new: true }).lean();
    revalidatePath("/");
    return { success: true, data: JSON.parse(JSON.stringify(updatedItem)) };
  } catch (error) {
    return { success: false, error: "خطا در ویرایش اطلاعات رسانه" };
  }
}

// حذف مدیا از دیتابیس
export async function deleteGalleryItem(id: string) {
  try {
    await dbConnect();
    await Gallery.findByIdAndDelete(id);
    revalidatePath("/");
    return { success: true };
  } catch (error) {
    return { success: false, error: "خطا در حذف رسانه" };
  }
}