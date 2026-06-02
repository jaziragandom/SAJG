import mongoose, { Schema, Document } from 'mongoose';

export interface IGallery extends Document {
  type: 'image' | 'video';
  category: 'teaser' | 'factory' | 'events' | 'products';
  faTitle: string;
  enTitle: string;
  url: string; // لینک اصلی عکس یا ویدیو
  thumbnail: string; // کاور ویدیو
  episodes: { ep: number; title: string; url: string }[]; // برای ویدیوهای سریالی
  status: 'published' | 'draft';
}

const GallerySchema: Schema = new Schema({
  type: { type: String, enum: ['image', 'video'], required: true, index: true },
  category: { type: String, required: true, index: true },
  faTitle: { type: String, required: true },
  enTitle: { type: String, required: true },
  url: { type: String, required: true },
  thumbnail: { type: String, default: "" },
  episodes: [{ ep: Number, title: String, url: String }],
  status: { type: String, enum: ['published', 'draft'], default: 'published', index: true }
}, { timestamps: true });

export default mongoose.models.Gallery || mongoose.model<IGallery>('Gallery', GallerySchema);