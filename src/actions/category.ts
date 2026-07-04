"use server";

import dbConnect from "@/lib/mongodb";
import Category from "@/models/Category";
import { revalidatePath } from "next/cache";

export async function getCategories(filter = {}) {
  try {
    await dbConnect();
    const categories = await Category.find(filter).sort({ order: 1, createdAt: -1 }).lean();
    return { success: true, data: JSON.parse(JSON.stringify(categories)) };
  } catch (error) {
    return { success: false, error: "خطا در دریافت دسته‌بندی‌ها" };
  }
}

export async function getCategoryBySlug(slug: string) {
  try {
    await dbConnect();
    const category = await Category.findOne({ slug: slug.toLowerCase() }).lean();
    if (!category) return { success: false, error: "دسته‌بندی یافت نشد" };
    return { success: true, data: JSON.parse(JSON.stringify(category)) };
  } catch (error) {
    return { success: false, error: "خطا در دریافت دسته‌بندی" };
  }
}

export async function createCategory(data: any) {
  try {
    await dbConnect();
    const newCategory = await Category.create(data);
    revalidatePath("/");
    return { success: true, data: JSON.parse(JSON.stringify(newCategory)) };
  } catch (error) {
    return { success: false, error: "خطا در ثبت دسته‌بندی" };
  }
}

export async function updateCategory(id: string, data: any) {
  try {
    await dbConnect();
    const updatedCategory = await Category.findByIdAndUpdate(id, data, { new: true }).lean();
    revalidatePath("/");
    return { success: true, data: JSON.parse(JSON.stringify(updatedCategory)) };
  } catch (error) {
    return { success: false, error: "خطا در ویرایش دسته‌بندی" };
  }
}

export async function deleteCategory(id: string) {
  try {
    await dbConnect();
    await Category.findByIdAndDelete(id);
    revalidatePath("/");
    return { success: true };
  } catch (error) {
    return { success: false, error: "خطا در حذف دسته‌بندی" };
  }
}