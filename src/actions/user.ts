"use server";

import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";

// دریافت تمام کاربران (به جز هش پسورد برای امنیت)
export async function getUsers(filter = {}) {
  try {
    await dbConnect();
    const users = await User.find(filter).sort({ createdAt: -1 }).select("-passwordHash").lean();
    return { success: true, data: JSON.parse(JSON.stringify(users)) };
  } catch (error) {
    return { success: false, error: "خطا در دریافت لیست کاربران" };
  }
}

// ساخت کاربر جدید
export async function createUser(data: any) {
  try {
    await dbConnect();
    const hashedPassword = await bcrypt.hash(data.password, 10);
    const newUserData = { ...data, passwordHash: hashedPassword };
    delete newUserData.password; // حذف پسورد خام

    const newUser = await User.create(newUserData);
    revalidatePath("/");
    return { success: true, data: JSON.parse(JSON.stringify(newUser)) };
  } catch (error) {
    return { success: false, error: "خطا در ساخت کاربر (ممکن است ایمیل تکراری باشد)" };
  }
}

// ویرایش کاربر
export async function updateUser(id: string, data: any) {
  try {
    await dbConnect();
    const updateData = { ...data };
    
    // اگر پسورد جدیدی وارد شده بود، آن را هش کن
    if (updateData.password && updateData.password.trim() !== "") {
      updateData.passwordHash = await bcrypt.hash(updateData.password, 10);
    }
    delete updateData.password; // همیشه پسورد خام را حذف کن

    const updatedUser = await User.findByIdAndUpdate(id, updateData, { new: true }).select("-passwordHash").lean();
    revalidatePath("/");
    return { success: true, data: JSON.parse(JSON.stringify(updatedUser)) };
  } catch (error) {
    return { success: false, error: "خطا در بروزرسانی اطلاعات کاربر" };
  }
}

// حذف کاربر
export async function deleteUser(id: string) {
  try {
    await dbConnect();
    await User.findByIdAndDelete(id);
    revalidatePath("/");
    return { success: true };
  } catch (error) {
    return { success: false, error: "خطا در حذف کاربر" };
  }
}