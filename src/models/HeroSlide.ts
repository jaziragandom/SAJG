import mongoose from "mongoose";

const heroSlideSchema = new mongoose.Schema(
  {
    id: { type: Number },
    faTitle: { type: String, required: true },
    enTitle: { type: String, required: true },
    faSubtitle: { type: String },
    enSubtitle: { type: String },
    faDesc: { type: String },
    enDesc: { type: String },
    color: { type: String, default: "from-amber-400 to-orange-600" },
    mainImage: { type: String },
    leftImage: { type: String },
    rightImage: { type: String },
    floaters: [{ type: mongoose.Schema.Types.Mixed }], // برای ذخیره آبجکت‌های منعطف (قطعات CSS یا عکس‌های آپلود شده)
    linkedBrand: { type: mongoose.Schema.Types.ObjectId, ref: "Brand" },
    linkedProduct: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
    linkedProductSlug: { type: String },
    order: { type: Number, default: 0 }
  },
  { timestamps: true }
);

export default mongoose.models.HeroSlide || mongoose.model("HeroSlide", heroSlideSchema);