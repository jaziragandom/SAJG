import mongoose, { Schema, Document } from 'mongoose';

export interface IProduct extends Document {
  brandId: mongoose.Types.ObjectId; // ارتباط مستقیم با کالکشن برند
  faTitle: string;
  enTitle: string;
  slug: string;
  mainCat: 'beverage' | 'snack' | 'bakery' | 'all';
  category: string; // دسته‌بندی فرعی
  status: 'published' | 'draft' | 'out_of_stock';
  isFeatured: boolean;
  images: {
    main: string;
    gallery: string[];
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
  };
}

const ProductSchema: Schema = new Schema({
  brandId: { type: Schema.Types.ObjectId, ref: 'Brand', required: true },
  faTitle: { type: String, required: true },
  enTitle: { type: String, required: true },
  slug: { type: String, required: true, unique: true, lowercase: true },
  mainCat: { type: String, enum: ['beverage', 'snack', 'bakery', 'all'], required: true },
  category: { type: String, required: true },
  status: { type: String, enum: ['published', 'draft', 'out_of_stock'], default: 'draft' },
  isFeatured: { type: Boolean, default: false },
  
  images: {
    main: { type: String, required: true },
    gallery: [{ type: String }]
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
    packagingEn: { type: String, default: "" }
  }
}, { timestamps: true });

export default mongoose.models.Product || mongoose.model<IProduct>('Product', ProductSchema);