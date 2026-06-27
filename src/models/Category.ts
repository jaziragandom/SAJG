import mongoose, { Schema, Document } from 'mongoose';

export interface ICategory extends Document {
  slug: string;
  faName: string;
  enName: string;
  parent: 'beverage' | 'snack' | 'bakery' | 'media' | 'all';
  iconName: string;
  order: number;
  status: 'active' | 'inactive'; // فیلد جدید برای مدیریت نمایش
}

const CategorySchema: Schema = new Schema({
  slug: { type: String, required: true, unique: true, index: true },
  faName: { type: String, required: true },
  enName: { type: String, required: true },
  parent: { type: String, required: true, index: true },
  iconName: { type: String, default: "Layers" },
  order: { type: Number, default: 0 },
  status: { type: String, enum: ['active', 'inactive'], default: 'active' }
}, { timestamps: true });

export default mongoose.models.Category || mongoose.model<ICategory>('Category', CategorySchema);