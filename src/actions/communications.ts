"use server";

import dbConnect from "@/lib/mongodb";
import Message from "@/models/Message";
import Comment from "@/models/Comment";
import AgencyForm from "@/models/AgencyForm";
import { revalidatePath } from "next/cache";

// تابع کمکی برای استخراج امن متن از هر نوع ساختار ورودی
function extractValue(input: any, possibleKeys: string[], defaultValue: string = ""): string {
  if (!input) return defaultValue;
  
  if (typeof input.get === 'function') {
    for (const key of possibleKeys) {
      const val = input.get(key);
      if (val && typeof val === 'string' && val.trim() !== '') return val.trim();
    }
  }

  for (const key of possibleKeys) {
    if (input[key] && typeof input[key] === 'string' && input[key].trim() !== '') {
      return input[key].trim();
    }
  }

  if (typeof input === 'object') {
    for (const prop in input) {
      if (typeof input[prop] === 'object' && input[prop] !== null) {
        for (const key of possibleKeys) {
          if (input[prop][key] && typeof input[prop][key] === 'string' && input[prop][key].trim() !== '') {
            return input[prop][key].trim();
          }
        }
      }
    }
  }

  return defaultValue;
}

// ==========================================
// 1. MESSAGES
// ==========================================
export async function fetchAllMessages() {
  await dbConnect();
  const msgs = await Message.find({}).sort({ createdAt: -1 }).lean();
  return { success: true, data: JSON.parse(JSON.stringify(msgs)) };
}

export async function submitMessage(data: any) {
  try {
    await dbConnect();
    const name = extractValue(data, ['name', 'fullName', 'faName', 'username', 'author'], "کاربر مهمان");
    const email = extractValue(data, ['email', 'mail', 'userEmail'], "بدون ایمیل");
    const subject = extractValue(data, ['subject', 'title'], "پیام عمومی از سایت");
    const text = extractValue(data, ['text', 'message', 'content', 'body', 'desc', 'description'], "بدون متن");

    await Message.create({ name, email, subject, text, status: 'unread' });
    revalidatePath("/");
    return { success: true, message: "پیام شما با موفقیت ارسال شد." };
  } catch (e) { 
    return { success: false, error: "خطا در ارسال پیام." }; 
  }
}

export async function updateMessageStatus(id: string, status: 'unread' | 'replied' | 'ignored') {
  await dbConnect();
  await Message.findByIdAndUpdate(id, { status });
  revalidatePath("/");
  return { success: true };
}

export async function bulkUpdateMessages(ids: string[], action: 'unread' | 'replied' | 'ignored' | 'delete') {
  await dbConnect();
  if (action === 'delete') {
    await Message.deleteMany({ _id: { $in: ids } });
  } else {
    await Message.updateMany({ _id: { $in: ids } }, { status: action });
  }
  revalidatePath("/");
  return { success: true };
}

// ==========================================
// 2. COMMENTS (ارتقا یافته با سیستم پاسخ‌دهی چندسطحی)
// ==========================================
export async function fetchAllComments() {
  await dbConnect();
  const cmts = await Comment.find({}).sort({ createdAt: -1 }).lean();
  return { success: true, data: JSON.parse(JSON.stringify(cmts)) };
}

export async function submitComment(data: any) {
  try {
    await dbConnect();
    const name = extractValue(data, ['name', 'fullName', 'author', 'username'], "کاربر مهمان");
    const email = extractValue(data, ['email', 'mail'], "بدون ایمیل");
    const text = extractValue(data, ['text', 'message', 'content', 'body', 'comment'], "بدون متن");
    const articleId = extractValue(data, ['articleId', 'postId', 'slug'], "");
    const parentId = extractValue(data, ['parentId', 'replyToId'], "");

    await Comment.create({ 
      name, 
      email, 
      text, 
      articleId, 
      parentId, 
      isAdminReply: false, 
      status: 'unread' 
    });
    revalidatePath("/");
    return { success: true, message: "دیدگاه شما ثبت شد و پس از تایید نمایش داده می‌شود." };
  } catch (e) { 
    return { success: false, error: "خطا در ثبت دیدگاه." }; 
  }
}

// تابع جدید: پاسخ مستقیم ادمین از پنل به یک کامنت
export async function adminReplyToComment(commentId: string, replyText: string) {
  try {
    await dbConnect();
    const parentComment = await Comment.findById(commentId);
    if (!parentComment) return { success: false, error: "کامنت اصلی یافت نشد." };

    // ۱. ایجاد پاسخ ادمین به صورت خودکار تایید شده
    await Comment.create({
      name: "مدیریت جزیره گندم",
      email: "admin@jazirahgandumco.com",
      text: replyText.trim(),
      articleId: parentComment.articleId,
      parentId: parentComment._id.toString(),
      isAdminReply: true,
      status: 'approved'
    });

    // ۲. تغییر وضعیت کامنت کاربر به «پاسخ داده شده»
    parentComment.status = 'replied';
    await parentComment.save();

    revalidatePath("/");
    return { success: true, message: "پاسخ ادمین با موفقیت ثبت شد." };
  } catch (e) {
    return { success: false, error: "خطا در ثبت پاسخ ادمین." };
  }
}

// دریافت تمام کامنت‌های تایید شده و پاسخ داده شده برای صفحه مقاله
export async function getApprovedComments(articleId: string) {
  try {
    await dbConnect();
    const comments = await Comment.find({ 
      articleId, 
      status: { $in: ['approved', 'replied'] } 
    }).sort({ createdAt: 1 }).lean(); // مرتب‌سازی صعودی برای نمایش صحیح درخت گفتگو
    return { success: true, data: JSON.parse(JSON.stringify(comments)) };
  } catch (e) { 
    return { success: false, data: [] }; 
  }
}

export async function updateCommentStatus(id: string, status: 'unread' | 'approved' | 'rejected' | 'replied') {
  await dbConnect();
  await Comment.findByIdAndUpdate(id, { status });
  revalidatePath("/");
  return { success: true };
}

export async function bulkUpdateComments(ids: string[], action: 'unread' | 'approved' | 'rejected' | 'replied' | 'delete') {
  await dbConnect();
  if (action === 'delete') {
    await Comment.deleteMany({ _id: { $in: ids } });
  } else {
    await Comment.updateMany({ _id: { $in: ids } }, { status: action });
  }
  revalidatePath("/");
  return { success: true };
}

// ==========================================
// 3. AGENCY FORMS
// ==========================================
export async function fetchAllAgencyForms() {
  await dbConnect();
  const forms = await AgencyForm.find({}).sort({ createdAt: -1 }).lean();
  return { success: true, data: JSON.parse(JSON.stringify(forms)) };
}

export async function submitAgencyForm(data: any) {
  try {
    await dbConnect();
    const name = extractValue(data, ['name', 'fullName', 'company', 'companyName'], "نامشخص");
    const phone = extractValue(data, ['phone', 'mobile', 'tel', 'phoneNumber'], "بدون شماره");
    const city = extractValue(data, ['city', 'province', 'location'], "نامشخص");
    const experience = extractValue(data, ['experience', 'exp', 'years'], "");
    const description = extractValue(data, ['description', 'desc', 'text', 'message', 'facilities'], "");

    await AgencyForm.create({ name, phone, city, experience, description, status: 'unread' });
    revalidatePath("/");
    return { success: true, message: "درخواست نمایندگی شما با موفقیت ثبت شد." };
  } catch (e) { 
    return { success: false, error: "خطا در ارسال درخواست." }; 
  }
}

export async function updateAgencyFormStatus(id: string, status: 'unread' | 'reviewed' | 'rejected') {
  await dbConnect();
  await AgencyForm.findByIdAndUpdate(id, { status });
  revalidatePath("/");
  return { success: true };
}

export async function bulkUpdateAgencyForms(ids: string[], action: 'unread' | 'reviewed' | 'rejected' | 'delete') {
  await dbConnect();
  if (action === 'delete') {
    await AgencyForm.deleteMany({ _id: { $in: ids } });
  } else {
    await AgencyForm.updateMany({ _id: { $in: ids } }, { status: action });
  }
  revalidatePath("/");
  return { success: true };
}