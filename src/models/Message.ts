import mongoose, { Schema, Document } from 'mongoose';

const MessageSchema: Schema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  subject: { type: String, default: "" },
  text: { type: String, default: "" },
  status: { type: String, enum: ['unread', 'replied', 'ignored', 'read'], default: 'unread' }
}, { timestamps: true });

export default mongoose.models.Message || mongoose.model('Message', MessageSchema);