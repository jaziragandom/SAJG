"use server";

import { cookies } from "next/headers";
import { SignJWT } from "jose";
import bcrypt from "bcryptjs";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";

const JWT_SECRET_KEY = process.env.JWT_SECRET || "Gandum_Island_Super_Secure_Key_2026_!@#";
const encodedKey = new TextEncoder().encode(JWT_SECRET_KEY);

export async function loginAction(email: string, password: string) {
  try {
    await dbConnect();
    
    // جستجوی کاربر با حروف کوچک برای جلوگیری از خطای تایپی
    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user || user.status !== 'active') {
      return { error: "کاربری با این مشخصات یافت نشد یا حساب غیرفعال است." };
    }

    // مقایسه رمز عبور وارد شده با هشِ داخل دیتابیس
    const isMatch = await bcrypt.compare(password, user.passwordHash);
    
    if (!isMatch) {
      return { error: "ایمیل یا رمز عبور اشتباه است." };
    }

    // تولید توکن امنیتی (JWT) با اعتبار ۲۴ ساعت
    const token = await new SignJWT({ 
      id: user._id.toString(), // تبدیل آبجکتِ آیدی به متن ساده
      role: user.role, 
      permissions: [...user.permissions] // تبدیل آرایه مخصوص مونگو به آرایه استاندارد
    })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime("24h")
      .sign(encodedKey);

    // ذخیره توکن در کوکیِ غیرقابل دسترسی توسط جاوااسکریپت مرورگر (XSS Protection)
    const cookieStore = await cookies();
    cookieStore.set("admin_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production", // در سرور اصلی روی HTTPS قفل می‌شود
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 // 1 Day
    });

    // ثبت زمان آخرین ورود
    user.lastLogin = new Date();
    await user.save();

    return { success: true };
  } catch (error) {
    console.error("Login System Error:", error);
    return { error: "خطای سرور. لطفاً دوباره تلاش کنید." };
  }
}