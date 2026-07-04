import mongoose, { Schema, Document } from 'mongoose';

const SubscriberSchema: Schema = new Schema({
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  name: { type: String, default: "مشترک گرامی" },
  segment: { type: String, enum: ['general', 'blog_health', 'blog_news', 'agency', 'vip'], default: 'general' },
  source: { type: String, default: "سایت اصلی" },
  status: { type: String, enum: ['active', 'unsubscribed'], default: 'active' }
}, { timestamps: true });

export default mongoose.models.Subscriber || mongoose.model('Subscriber', SubscriberSchema);