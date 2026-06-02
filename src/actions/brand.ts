"use server";

import dbConnect from "@/lib/mongodb"; // اگر نام فایل را db.ts گذاشته‌اید، این خط را تغییر دهید
import Brand from "@/models/Brand";
import { revalidatePath } from "next/cache";

// دریافت تمام برندها
export async function getBrands() {
  try {
    await dbConnect();
    const brands = await Brand.find({}).sort({ createdAt: -1 }).lean();
    return { success: true, data: JSON.parse(JSON.stringify(brands)) };
  } catch (error) {
    return { success: false, error: "خطا در دریافت برندها" };
  }
}

// ایجاد برند جدید
export async function createBrand(data: any) {
  try {
    await dbConnect();
    const newBrand = await Brand.create(data);
    revalidatePath("/"); // رفرش کردن کش سایت برای نمایش اطلاعات جدید
    return { success: true, data: JSON.parse(JSON.stringify(newBrand)) };
  } catch (error) {
    return { success: false, error: "خطا در ایجاد برند" };
  }
}

// ویرایش برند
export async function updateBrand(id: string, data: any) {
  try {
    await dbConnect();
    const updatedBrand = await Brand.findByIdAndUpdate(id, data, { new: true }).lean();
    revalidatePath("/");
    return { success: true, data: JSON.parse(JSON.stringify(updatedBrand)) };
  } catch (error) {
    return { success: false, error: "خطا در بروزرسانی برند" };
  }
}

// حذف برند
export async function deleteBrand(id: string) {
  try {
    await dbConnect();
    await Brand.findByIdAndDelete(id);
    revalidatePath("/");
    return { success: true };
  } catch (error) {
    return { success: false, error: "خطا در حذف برند" };
  }
}