import mongoose, { Schema, Document } from 'mongoose';

export interface IProduct extends Document {
  brandId: mongoose.Types.ObjectId; // ارتباط مستقیم با کالکشن برند
  faTitle: string;
  enTitle: string;
  slug: string;
  mainCat: string; // محدودیت enum برداشته شد تا اسلاگ‌های داینامیک را قبول کند
  category: string; // دسته‌بندی فرعی
  status: string;
  isFeatured: boolean;
  faDesc: string; // اضافه شدن فیلد توضیح کوتاه فارسی
  enDesc: string; // اضافه شدن فیلد توضیح کوتاه انگلیسی
  images: {
    main: string;
    gallery: string[];
    nutrition: string;
  };
  // جزئیات دیتاشیت گرافیکی
  specs: {
    flavorFa: string;
    flavorEn: string;
    ingredientsFa: string;
    ingredientsEn: string;
    shelfLifeFa: string;
    shelfLifeEn: string;
    weight: string;
    packagingFa: string;
    packagingEn: string;
    itemsPerPackage: string;
  };
}

const ProductSchema: Schema = new Schema({
  brandId: { type: Schema.Types.ObjectId, ref: 'Brand', required: true },
  faTitle: { type: String, required: true },
  enTitle: { type: String, required: true },
  slug: { type: String, required: true, unique: true, lowercase: true },
  mainCat: { type: String, required: true }, 
  category: { type: String, required: true },
  status: { type: String, default: 'draft' },
  isFeatured: { type: Boolean, default: false },
  
  faDesc: { type: String, default: "" }, // اضافه شدن فیلد دیتابیس
  enDesc: { type: String, default: "" }, // اضافه شدن فیلد دیتابیس

  images: {
    main: { type: String, required: true },
    gallery: [{ type: String }],
    nutrition: { type: String, default: "" }
  },
  
  specs: {
    flavorFa: { type: String, default: "" },
    flavorEn: { type: String, default: "" },
    ingredientsFa: { type: String, default: "" },
    ingredientsEn: { type: String, default: "" },
    shelfLifeFa: { type: String, default: "" },
    shelfLifeEn: { type: String, default: "" },
    weight: { type: String, default: "" },
    packagingFa: { type: String, default: "" },
    packagingEn: { type: String, default: "" },
    itemsPerPackage: { type: String, default: "" }
  }
}, { timestamps: true });

export default mongoose.models.Product || mongoose.model<IProduct>('Product', ProductSchema);