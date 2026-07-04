"use server";

import dbConnect from "@/lib/mongodb";
import mongoose from "mongoose";
import PageVisit from "@/models/PageVisit";
import ActivityLog from "@/models/ActivityLog";

export async function logPageView() {
  try {
    await dbConnect();
    const today = new Date().toISOString().split('T')[0];
    await PageVisit.findOneAndUpdate(
      { date: today }, 
      { $inc: { views: 1 } }, 
      { upsert: true, returnDocument: 'after' }
    );
  } catch (error) {}
}

export async function addActivityLog(description: string, type: string = "info") {
  try {
    await dbConnect();
    await ActivityLog.create({ description, type });
  } catch (error) {}
}

export async function getDashboardStats() {
  try {
    await dbConnect();
    
    // استخراج مدل‌های در دسترس
    const Brand = mongoose.models.Brand;
    const User = mongoose.models.User;
    const Product = mongoose.models.Product;
    const Message = mongoose.models.Message;

    const stats = {
      brands: Brand ? await Brand.countDocuments() : 0,
      admins: User ? await User.countDocuments() : 0,
      products: Product ? await Product.countDocuments() : 0,
      messages: Message ? await Message.countDocuments({ status: 'unread' }) : 0,
      agencies: 0,
      views: 0,
      comments: 0
    };

    let categoryDistribution: { name: string; value: number; color: string }[] = [];
    
    if (Product) {
      // گروه‌بندی محصولات بر اساس شناسه دسته‌بندی
      const dist = await Product.aggregate([
        { $group: { _id: "$category", count: { $sum: 1 } } }
      ]);
      
      const categoryMap = new Map();
      
      // روش قدرتمند: ارتباط مستقیم با کالکشن دسته‌بندی‌ها در دیتابیس
      try {
        const categories = await mongoose.connection.collection('categories').find({}).toArray();
        categories.forEach((c: any) => {
          if (c.slug) categoryMap.set(c.slug, c.faName || c.name || c.title);
          if (c._id) categoryMap.set(c._id.toString(), c.faName || c.name || c.title);
        });
      } catch (e) {
        console.error("خطا در دریافت مستقیم دسته‌بندی‌ها:", e);
      }

      // دیکشنری پشتیبان: اگر به هر دلیلی دیتابیس خوانده نشد، این کلمات جایگزین می‌شوند
      const fallbackNames: Record<string, string> = {
        'popcorn-922': 'پاپ‌کورن',
        'puff-361': 'پفک و اسنک',
        'carbonated-284': 'نوشیدنی گازدار',
        'energy': 'انرژی‌زا',
        'chips': 'چیپس',
        'juice': 'آبمیوه',
        'cake': 'کیک و کلوچه'
      };

      const colors = ['#f59e0b', '#ef4444', '#10b981', '#6366f1', '#8b5cf6', '#ec4899', '#14b8a6'];
      
      categoryDistribution = dist.map((item: any, idx: number) => {
        const rawId = item._id ? String(item._id) : 'unknown';
        
        // اولویت انتخاب نام: ۱. دیتابیس  ۲. دیکشنری پشتیبان  ۳. همان نام خام
        let persianName = categoryMap.get(rawId) || fallbackNames[rawId] || rawId;
        
        if (persianName === 'unknown') persianName = 'دسته‌بندی نشده';

        return {
          name: persianName,
          value: item.count,
          color: colors[idx % colors.length]
        };
      });
    }

    // استخراج آمار بازدید ۳۰ روزه
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const dateString = thirtyDaysAgo.toISOString().split('T')[0];
    
    const visits = await PageVisit.find({ date: { $gte: dateString } }).sort({ date: 1 }).lean();
    
    const trafficData = [];
    let totalViews = 0;
    for (let i = 29; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dayStr = d.toISOString().split('T')[0];
      const found = visits.find((v: any) => v.date === dayStr);
      const views = found ? found.views : 0;
      totalViews += views;
      // نمایش تاریخ به صورت کوتاه (مثلاً 07-02)
      trafficData.push({ day: dayStr.substring(5), views: views });
    }
    stats.views = totalViews; 

    // استخراج آخرین لاگ‌های فعالیت
    const recentActivities = await ActivityLog.find().sort({ createdAt: -1 }).limit(5).lean();

    return { 
      success: true, 
      data: { stats, categoryDistribution, trafficData, recentActivities: JSON.parse(JSON.stringify(recentActivities)) } 
    };
  } catch (error) {
    console.error("Dashboard Stats Error:", error);
    return { success: false };
  }
}