import mongoose from 'mongoose';

const settingSchema = new mongoose.Schema({
  key: { type: String, required: true, unique: true }, // مثلاً 'site_logo' یا 'contact_phone'
  value: { type: mongoose.Schema.Types.Mixed, required: true } // مقدار می‌تواند متن، آدرس عکس یا یک آبجکت باشد
}, { timestamps: true });

export default mongoose.models.Setting || mongoose.model('Setting', settingSchema);