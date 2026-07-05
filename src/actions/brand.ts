"use server";

import dbConnect from "@/lib/mongodb";
import Brand from "@/models/Brand";
import { revalidatePath } from "next/cache";

export async function getBrands() {
  try {
    await dbConnect();
    const brands = await Brand.find({}).sort({ order: 1, createdAt: -1 }).lean();
    return { success: true, data: JSON.parse(JSON.stringify(brands)) };
  } catch (error) {
    return { success: false, error: "خطا در دریافت برندها" };
  }
}

export async function getBrandBySlug(slug: string) {
  try {
    await dbConnect();
    const brand = await Brand.findOne({ slug: slug.toLowerCase() }).lean();
    if (!brand) return { success: false, error: "برند یافت نشد" };
    return { success: true, data: JSON.parse(JSON.stringify(brand)) };
  } catch (error) {
    return { success: false, error: "خطا در جستجوی برند" };
  }
}

export async function createBrand(data: any) {
  try {
    await dbConnect();
    const newBrand = await Brand.create(data);
    revalidatePath("/");
    return { success: true, data: JSON.parse(JSON.stringify(newBrand)) };
  } catch (error) {
    return { success: false, error: "خطا در ایجاد برند" };
  }
}

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