import mongoose, { Schema, Document } from 'mongoose';

const AgencyFormSchema: Schema = new Schema({
  name: { type: String, required: true },
  phone: { type: String, required: true },
  city: { type: String, required: true },
  experience: { type: String, default: "" },
  description: { type: String, default: "" },
  status: { type: String, enum: ['unread', 'reviewed', 'rejected'], default: 'unread' }
}, { timestamps: true });

export default mongoose.models.AgencyForm || mongoose.model('AgencyForm', AgencyFormSchema);