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
    floaters: [{ type: mongoose.Schema.Types.Mixed }],
    
    // نوع اتصال دکمه: برند، دسته‌بندی یا محصول تکی
    linkType: { type: String, enum: ['brand', 'category', 'product'], default: 'product' },
    
    // متن شخصی‌سازی شده دکمه
    faButtonText: { type: String, default: "مشاهده محصول" },
    enButtonText: { type: String, default: "View Product" },

    // اتصال بر اساس برند
    linkedBrand: { type: mongoose.Schema.Types.ObjectId, ref: "Brand" },
    linkedBrandSlug: { type: String },

    // اتصال بر اساس دسته‌بندی (گروه اصلی یا زیردسته)
    linkedCategorySlug: { type: String },

    // اتصال بر اساس محصول خاص
    linkedProduct: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
    linkedProductSlug: { type: String },

    order: { type: Number, default: 0 }
  },
  { timestamps: true }
);

export default mongoose.models.HeroSlide || mongoose.model("HeroSlide", heroSlideSchema);