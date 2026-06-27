"use server";

import dbConnect from "@/lib/mongodb";
import Setting from "@/models/Setting";
import { revalidatePath } from "next/cache";

export async function getSettings(keys: string[]) {
  try {
    await dbConnect();
    const settings = await Setting.find({ key: { $in: keys } }).lean();
    
    const settingsObject: Record<string, any> = {};
    settings.forEach((setting: any) => {
      settingsObject[setting.key] = setting.value;
    });
    
    return { success: true, data: JSON.parse(JSON.stringify(settingsObject)) };
  } catch (error) {
    console.error("Error fetching settings:", error);
    return { success: false, data: {} };
  }
}

export async function saveSettings(settingsData: Record<string, any>) {
  try {
    await dbConnect();
    
    const promises = Object.keys(settingsData).map(key => 
      Setting.findOneAndUpdate(
        { key: key },
        { key: key, value: settingsData[key] },
        { upsert: true, new: true }
      )
    );
    
    await Promise.all(promises);
    revalidatePath('/', 'layout'); 
    
    return { success: true, message: "تنظیمات با موفقیت ذخیره شد." };
  } catch (error: any) {
    console.error("Error saving settings:", error);
    return { success: false, error: "خطا در ذخیره تنظیمات." };
  }
}