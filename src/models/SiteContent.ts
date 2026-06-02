import mongoose, { Schema, Document } from 'mongoose';

export interface ISiteContent extends Document {
  sectionKey: string; // مثال: 'hero_slides', 'footer_settings', 'why_us'
  data: mongoose.Schema.Types.Mixed; // ذخیره منعطف JSON
}

const SiteContentSchema: Schema = new Schema({
  sectionKey: { type: String, required: true, unique: true, index: true },
  data: { type: Schema.Types.Mixed, required: true } // دیتای هر بخش اینجا به صورت آبجکت ذخیره می‌شود
}, { timestamps: true, strict: false });

export default mongoose.models.SiteContent || mongoose.model<ISiteContent>('SiteContent', SiteContentSchema);