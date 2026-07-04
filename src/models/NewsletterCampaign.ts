import mongoose, { Schema, Document } from 'mongoose';

const NewsletterCampaignSchema: Schema = new Schema({
  subject: { type: String, required: true },
  htmlContent: { type: String, required: true },
  targetSegment: { type: String, required: true },
  recipientsCount: { type: Number, default: 0 },
  sentBy: { type: String, default: "مدیریت سایت" }
}, { timestamps: true });

export default mongoose.models.NewsletterCampaign || mongoose.model('NewsletterCampaign', NewsletterCampaignSchema);