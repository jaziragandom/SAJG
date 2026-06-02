import mongoose, { Schema, Document } from 'mongoose';

export interface IGallery extends Document {
  type: 'image' | 'video' | 'album' | 'playlist';
  category: string;
  faTitle: string;
  enTitle: string;
  url: string;
  thumbnail: string;
  items: any[];
  status: 'published' | 'draft';
}

const GallerySchema: Schema = new Schema({
  type: { type: String, enum: ['image', 'video', 'album', 'playlist'], required: true, index: true },
  category: { type: String, required: true, index: true },
  faTitle: { type: String, required: true },
  enTitle: { type: String, required: true },
  url: { type: String, default: "" },
  thumbnail: { type: String, default: "" },
  items: [{ type: mongoose.Schema.Types.Mixed }],
  status: { type: String, enum: ['published', 'draft'], default: 'published', index: true }
}, { timestamps: true });

export default mongoose.models.Gallery || mongoose.model<IGallery>('Gallery', GallerySchema);