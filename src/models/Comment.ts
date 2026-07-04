import mongoose, { Schema, Document } from 'mongoose';

const CommentSchema: Schema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  text: { type: String, default: "" },
  articleId: { type: String, required: true },
  parentId: { type: String, default: "" }, // اگر خالی باشد کامنت اصلی است، اگر شناسه داشته باشد پاسخ (Reply) است
  isAdminReply: { type: Boolean, default: false }, // تشخیص پاسخ ادمین
  status: { type: String, enum: ['unread', 'approved', 'rejected', 'replied'], default: 'unread' }
}, { timestamps: true });

export default mongoose.models.Comment || mongoose.model('Comment', CommentSchema);