import mongoose, { Schema, Document } from 'mongoose';

export interface IBrand extends Document {
  slug: string;
  faName: string;
  enName: string;
  faSlogan: string;
  enSlogan: string;
  logo: string;
  logoFa: string;
  logoEn: string;
  heroImage: string;
  color: string;
  order: number;
  status: 'active' | 'inactive';
}

const BrandSchema: Schema = new Schema({
  slug: { type: String, required: true, unique: true, lowercase: true },
  faName: { type: String, required: true },
  enName: { type: String, required: true },
  faSlogan: { type: String, default: "" },
  enSlogan: { type: String, default: "" },
  logo: { type: String, required: true },
  logoFa: { type: String, default: "" },
  logoEn: { type: String, default: "" },
  heroImage: { type: String, default: "" },
  color: { type: String, default: "from-gray-400 to-gray-600" },
  order: { type: Number, default: 0 },
  status: { type: String, enum: ['active', 'inactive'], default: 'active' }
}, { 
  timestamps: true 
});

// جلوگیری از کش شدن مدل قدیمی (بدون فیلدهای جدید) در محیط توسعه Next.js
if (process.env.NODE_ENV !== 'production' && mongoose.models.Brand) {
  delete mongoose.models.Brand;
}

export default mongoose.models.Brand || mongoose.model<IBrand>('Brand', BrandSchema);