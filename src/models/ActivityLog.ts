import mongoose, { Schema, Document } from 'mongoose';

const ActivityLogSchema: Schema = new Schema({
  description: { type: String, required: true },
  type: { type: String, default: "info" } // info, success, warning
}, { timestamps: true });

export default mongoose.models.ActivityLog || mongoose.model('ActivityLog', ActivityLogSchema);