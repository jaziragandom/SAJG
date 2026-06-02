"use server";

import dbConnect from "@/lib/mongodb";
import Product from "@/models/Product";
import { revalidatePath } from "next/cache";

export async function getProducts(filter = {}) {
  try {
    await dbConnect();
    // populate برای آوردن اطلاعات برندِ متصل به محصول است
    const products = await Product.find(filter).populate('brandId', 'faName enName slug').sort({ createdAt: -1 }).lean();
    return { success: true, data: JSON.parse(JSON.stringify(products)) };
  } catch (error) {
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