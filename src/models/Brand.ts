import mongoose, { Schema, Document } from 'mongoose';

export interface IBrand extends Document {
  slug: string;
  faName: string;
  enName: string;
  faDesc: string;
  enDesc: string;
  logo: string;
  heroImage: string;
  color: string;
  order: number; // فیلد جدید برای مرتب‌سازی در ناوبار
  status: 'active' | 'inactive'; // فیلد جدید برای مدیریت نمایش
}

const BrandSchema: Schema = new Schema({
  slug: { type: String, required: true, unique: true, lowercase: true },
  faName: { type: String, required: true },
  enName: { type: String, required: true },
  faDesc: { type: String, default: "" },
  enDesc: { type: String, default: "" },
  logo: { type: String, required: true },
  heroImage: { type: String, default: "" },
  color: { type: String, default: "from-gray-400 to-gray-600" },
  order: { type: Number, default: 0 },
  status: { type: String, enum: ['active', 'inactive'], default: 'active' }
}, { timestamps: true });

export default mongoose.models.Brand || mongoose.model<IBrand>('Brand', BrandSchema);