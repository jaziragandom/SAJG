import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  name: string;
  email: string;
  passwordHash: string; // رمز عبور باید هش شده ذخیره شود
  role: 'super_admin' | 'admin' | 'editor';
  status: 'active' | 'inactive';
  avatar: string;
  permissions: string[];
  lastLogin: Date;
}

const UserSchema: Schema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  passwordHash: { type: String, required: true },
  role: { type: String, enum: ['super_admin', 'admin', 'editor'], default: 'editor' },
  status: { type: String, enum: ['active', 'inactive'], default: 'active' },
  avatar: { type: String, default: "" },
  permissions: [{ type: String }], // آرایه‌ای از دسترسی‌ها مانند ["blog", "gallery"]
  lastLogin: { type: Date, default: Date.now }
}, { timestamps: true });

export default mongoose.models.User || mongoose.model<IUser>('User', UserSchema);