"use server";

import dbConnect from "@/lib/mongodb";
import Subscriber from "@/models/Subscriber";
import NewsletterCampaign from "@/models/NewsletterCampaign";
import { revalidatePath } from "next/cache";
import nodemailer from "nodemailer";

// تنظیمات ترانسپورتر ارسال ایمیل از اکانت رسمی شرکت
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "mail.jazirahgandumco.com",
  port: Number(process.env.SMTP_PORT) || 465,
  secure: true, // true برای پورت 465
  auth: {
    user: process.env.SMTP_USER || "info@jazirahgandumco.com",
    pass: process.env.SMTP_PASS || "YourEmailPasswordHere"
  }
});

// ثبت‌نام مشترک جدید (سمت کاربر)
export async function subscribeToNewsletter(data: { email: string; name?: string; segment?: string; source?: string }) {
  try {
    await dbConnect();
    const cleanEmail = data.email.toLowerCase().trim();
    
    // بررسی وجود ایمیل از قبل
    const existing = await Subscriber.findOne({ email: cleanEmail });
    if (existing) {
      if (existing.status === 'unsubscribed') {
        existing.status = 'active';
        if (data.segment) existing.segment = data.segment;
        await existing.save();
        return { success: true, message: "عضویت شما در باشگاه مشترکین مجدداً فعال شد." };
      }
      return { success: true, message: "شما قبلاً در باشگاه مشترکین گندم عضو شده‌اید!" };
    }

    await Subscriber.create({
      email: cleanEmail,
      name: data.name || "مشترک گرامی",
      segment: data.segment || 'general',
      source: data.source || "فوتر سایت",
      status: 'active'
    });

    return { success: true, message: "عضویت شما در باشگاه مشترکین با موفقیت انجام شد." };
  } catch (error) {
    return { success: false, error: "خطا در ثبت ایمیل. لطفاً صحت ایمیل وارد شده را بررسی کنید." };
  }
}

// دریافت لیست مشترکین برای پنل ادمین
export async function fetchAllSubscribers() {
  await dbConnect();
  const subs = await Subscriber.find({}).sort({ createdAt: -1 }).lean();
  return { success: true, data: JSON.parse(JSON.stringify(subs)) };
}

// دریافت تاریخچه کمپین‌های ارسالی
export async function fetchCampaignHistory() {
  await dbConnect();
  const campaigns = await NewsletterCampaign.find({}).sort({ createdAt: -1 }).lean();
  return { success: true, data: JSON.parse(JSON.stringify(campaigns)) };
}

// عملیات گروهی روی مشترکین (حذف یا تغییر وضعیت)
export async function bulkUpdateSubscribers(ids: string[], action: 'active' | 'unsubscribed' | 'delete') {
  await dbConnect();
  if (action === 'delete') {
    await Subscriber.deleteMany({ _id: { $in: ids } });
  } else {
    await Subscriber.updateMany({ _id: { $in: ids } }, { status: action });
  }
  revalidatePath("/");
  return { success: true };
}

// ارسال ایمیل جمعی (Blast) به یک دسته‌بندی خاص
export async function sendNewsletterBlast(data: { subject: string; htmlContent: string; targetSegment: string }) {
  try {
    await dbConnect();

    // فیلتر کردن مشترکین بر اساس دسته انتخابی
    const query: any = { status: 'active' };
    if (data.targetSegment !== 'all') {
      query.segment = data.targetSegment;
    }

    const subscribers = await Subscriber.find(query).lean();
    if (subscribers.length === 0) {
      return { success: false, error: "هیچ مشترک فعالی در این دسته‌بندی یافت نشد." };
    }

    const emailList = subscribers.map((s: any) => s.email);

    // قالب‌بندی حرفه‌ای ایمیل ارسالی با هدر و فوتر رسمی شرکت
    const fullHtmlTemplate = `
      <div style="font-family: Tahoma, Arial, sans-serif; max-width: 650px; margin: 0 auto; background-color: #ffffff; border: 1px solid #e5e7eb; border-radius: 16px; overflow: hidden; direction: rtl; text-align: right;">
        <div style="background-color: #f59e0b; padding: 24px; text-align: center;">
          <h2 style="color: #111827; margin: 0; font-size: 22px; font-weight: 900;">شرکت صنعتی جزیره گندم</h2>
        </div>
        <div style="padding: 32px; color: #374151; font-size: 15px; line-height: 1.8;">
          ${data.htmlContent}
        </div>
        <div style="background-color: #111827; padding: 20px; text-align: center; color: #9ca3af; font-size: 12px;">
          <p style="margin: 0 0 8px 0;">شما این ایمیل را به دلیل عضویت در باشگاه مشتریان جزیره گندم دریافت کرده‌اید.</p>
          <p style="margin: 0;">www.jazirahgandumco.com</p>
        </div>
      </div>
    `;

    // ارسال ایمیل از طریق SMTP رسمی
    await transporter.sendMail({
      from: `"باشگاه مشتریان جزیره گندم" <${process.env.SMTP_USER || "info@jazirahgandumco.com"}>`,
      bcc: emailList, // استفاده از BCC برای حفظ حریم خصوصی ایمیل کاربران
      subject: data.subject,
      html: fullHtmlTemplate
    });

    // ثبت در تاریخچه کمپین‌ها
    await NewsletterCampaign.create({
      subject: data.subject,
      htmlContent: data.htmlContent,
      targetSegment: data.targetSegment,
      recipientsCount: emailList.length
    });

    revalidatePath("/");
    return { success: true, message: `ایمیل با موفقیت به ${emailList.length} مشترک ارسال شد.` };
  } catch (error: any) {
    console.error("Newsletter Send Error:", error);
    return { success: false, error: "خطا در ارتباط با سرور ایمیل (SMTP). لطفاً اطلاعات حساب ایمیل در فایل .env را بررسی کنید." };
  }
}