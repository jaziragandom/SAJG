import mongoose, { Schema, Document } from 'mongoose';

export interface IBlog extends Document {
  slug: string;
  faTitle: string;
  enTitle: string;
  category: 'health' | 'news' | 'products';
  excerpt: string;
  content: string;
  readTime: string;
  author: string;
  status: 'published' | 'draft';
  coverImage: string;
  thumbnailImage: string;
  seo: {
    title: string;
    description: string;
    keywords: string;
  };
}

const BlogSchema: Schema = new Schema({
  slug: { type: String, required: true, unique: true, lowercase: true },
  faTitle: { type: String, required: true },
  enTitle: { type: String, required: true },
  category: { type: String, enum: ['health', 'news', 'products'], default: 'health' },
  excerpt: { type: String, required: true, maxlength: 150 },
  content: { type: String, required: true },
  readTime: { type: String, default: "۵ دقیقه" },
  author: { type: String, default: "تحریریه جزیره گندم" },
  status: { type: String, enum: ['published', 'draft'], default: 'draft' },
  coverImage: { type: String, required: true },
  thumbnailImage: { type: String, required: true },
  seo: {
    title: { type: String, default: "" },
    description: { type: String, default: "" },
    keywords: { type: String, default: "" }
  }
}, { timestamps: true });

export default mongoose.models.Blog || mongoose.model<IBlog>('Blog', BlogSchema);