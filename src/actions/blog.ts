"use server";

import dbConnect from "@/lib/mongodb"; // اگر نام فایل db.ts است، این خط را اصلاح کن
import Blog from "@/models/Blog";
import { revalidatePath } from "next/cache";

// دریافت تمام مقالات
export async function getBlogs(filter = {}) {
  try {
    await dbConnect();
    const blogs = await Blog.find(filter).sort({ createdAt: -1 }).lean();
    return { success: true, data: JSON.parse(JSON.stringify(blogs)) };
  } catch (error) {
    return { success: false, error: "خطا در دریافت مقالات" };
  }
}

// ثبت مقاله جدید
export async function createBlog(data: any) {
  try {
    await dbConnect();
    const newBlog = await Blog.create(data);
    revalidatePath("/");
    return { success: true, data: JSON.parse(JSON.stringify(newBlog)) };
  } catch (error) {
    return { success: false, error: "خطا در ثبت مقاله" };
  }
}

// ویرایش مقاله
export async function updateBlog(id: string, data: any) {
  try {
    await dbConnect();
    const updatedBlog = await Blog.findByIdAndUpdate(id, data, { new: true }).lean();
    revalidatePath("/");
    return { success: true, data: JSON.parse(JSON.stringify(updatedBlog)) };
  } catch (error) {
    return { success: false, error: "خطا در ویرایش مقاله" };
  }
}

// حذف مقاله
export async function deleteBlog(id: string) {
  try {
    await dbConnect();
    await Blog.findByIdAndDelete(id);
    revalidatePath("/");
    return { success: true };
  } catch (error) {
    return { success: false, error: "خطا در حذف مقاله" };
  }
}