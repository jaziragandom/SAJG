import mongoose, { Schema, Document } from 'mongoose';

const PageVisitSchema: Schema = new Schema({
  date: { type: String, required: true, unique: true }, // فرمت: YYYY-MM-DD
  views: { type: Number, default: 0 }
});

export default mongoose.models.PageVisit || mongoose.model('PageVisit', PageVisitSchema);