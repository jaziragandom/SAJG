"use server";

import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import { jwtVerify } from "jose";

const JWT_SECRET_KEY = process.env.JWT_SECRET || "Gandum_Island_Super_Secure_Key_2026_!@#";
const encodedKey = new TextEncoder().encode(JWT_SECRET_KEY);

// تابع کمکی برای بررسی هویت سوپر ادمین قبل از هر عملیات
async function verifySuperAdmin() {
  const cookieStore = await cookies();
  const token = cookieStore.get("admin_token")?.value;
  
  if (!token) return false;
  
  try {
    const verified = await jwtVerify(token, encodedKey);
    return verified.payload.role === "super_admin";
  } catch (error) {
    return false;
  }
}

// ---------------------------------------------------

export async function getUsers(filter = {}) {
  // قفل امنیتی: فقط سوپر ادمین می‌تواند لیست کاربران را ببیند
  if (!(await verifySuperAdmin())) {
    return { success: false, error: "دسترسی غیرمجاز! شما اجازه مشاهده این بخش را ندارید." };
  }

  try {
    await dbConnect();
    const users = await User.find(filter).sort({ createdAt: -1 }).select("-passwordHash").lean();
    return { success: true, data: JSON.parse(JSON.stringify(users)) };
  } catch (error) {
    return { success: false, error: "خطا در دریافت لیست کاربران" };
  }
}

export async function createUser(data: any) {
  if (!(await verifySuperAdmin())) return { success: false, error: "دسترسی غیرمجاز!" };

  try {
    await dbConnect();
    const hashedPassword = await bcrypt.hash(data.password, 10);
    const newUserData = { ...data, passwordHash: hashedPassword };
    delete newUserData.password;

    const newUser = await User.create(newUserData);
    revalidatePath("/");
    return { success: true, data: JSON.parse(JSON.stringify(newUser)) };
  } catch (error) {
    return { success: false, error: "خطا در ساخت کاربر (ممکن است ایمیل تکراری باشد)" };
  }
}

export async function updateUser(id: string, data: any) {
  if (!(await verifySuperAdmin())) return { success: false, error: "دسترسی غیرمجاز!" };

  try {
    await dbConnect();
    const updateData = { ...data };
    
    if (updateData.password && updateData.password.trim() !== "") {
      updateData.passwordHash = await bcrypt.hash(updateData.password, 10);
    }
    delete updateData.password;

    const updatedUser = await User.findByIdAndUpdate(id, updateData, { new: true }).select("-passwordHash").lean();
    revalidatePath("/");
    return { success: true, data: JSON.parse(JSON.stringify(updatedUser)) };
  } catch (error) {
    return { success: false, error: "خطا در بروزرسانی اطلاعات کاربر" };
  }
}

export async function deleteUser(id: string) {
  if (!(await verifySuperAdmin())) return { success: false, error: "دسترسی غیرمجاز!" };

  try {
    await dbConnect();
    
    // پیدا کردن کاربری که قرار است حذف شود
    const userToDelete = await User.findById(id);
    if (!userToDelete) {
      return { success: false, error: "کاربر یافت نشد!" };
    }

    // بررسی برای جلوگیری از حذف تنها سوپر ادمین
    if (userToDelete.role === "super_admin") {
      const superAdminCount = await User.countDocuments({ role: "super_admin" });
      if (superAdminCount <= 1) {
        return { success: false, error: "حذف تنها سوپر ادمین سیستم مجاز نیست! سیستم باید حداقل یک سوپر ادمین داشته باشد." };
      }
    }

    await User.findByIdAndDelete(id);
    revalidatePath("/");
    return { success: true };
  } catch (error) {
    return { success: false, error: "خطا در حذف کاربر" };
  }
}

// دریافت اطلاعات جلسه کاربری در سمت سرور
export async function getAdminSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get("admin_token")?.value;
  
  if (!token) return null;
  
  try {
    const verified = await jwtVerify(token, encodedKey);
    return { role: verified.payload.role, permissions: verified.payload.permissions };
  } catch (error) {
    return null;
  }
}