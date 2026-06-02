// src/lib/mockData.ts

// ۱. گروه‌های اصلی محصولات (کاتالوگ اصلی)
export const MAIN_CATEGORIES = [
  { id: "all", label: "همه محصولات" },
  { id: "beverage", label: "نوشیدنی‌ها" },
  { id: "snack", label: "اسنک و تنقلات" },
  { id: "bakery", label: "کیک و بیسکویت" },
];

// ۲. تمام ۷ گروه فیلتر تخصصی فرعی (مجموعاً ۸ گروه با گروه اصلی)
export const FILTER_GROUPS = {
  brands: ["خندان", "شیک", "سون اسکای", "نیک", "ام فور", "صدف"],
  beverage_type: ["آبمیوه", "انرژی‌زا", "آب معدنی", "گازدار"],
  snack_type: ["پفک", "پاپ‌کورن", "چیپس"],
  packaging: ["قوطی فلزی", "بطری PET", "پاکت سلفونی"],
  flavor: ["پرتقال", "انار", "نمکی", "شکلاتی", "پنیری"],
  weight: ["250ml", "60g", "1kg"],
  status: ["موجود", "توقف تولید"]
};

// ۳. لیست محصولات تستی متصل به فیلترهای فوق
export const MOCK_PRODUCTS = [
  { 
    id: 1, 
    faTitle: "انرژی‌زا مکس ۲۵۰ میل", 
    enTitle: "Max Energy 250ml", 
    brand: "ام فور", 
    mainCatId: "beverage", 
    beverage_type: "انرژی‌زا", 
    packaging: "قوطی فلزی", 
    flavor: "بدون طعم", 
    weight: "250ml",
    status: "موجود",
    subCategory: "نوشیدنی انرژی‌زا",
    img: "https://placehold.co/400x400/f8fafc/0f172a?text=Energy", 
    isFeatured: true 
  },
  { 
    id: 2, 
    faTitle: "چیپس نمکی ترد ۶۰ گرم", 
    enTitle: "Crispy Salty Chips 60g", 
    brand: "خندان", 
    mainCatId: "snack", 
    snack_type: "چیپس", 
    packaging: "پاکت سلفونی", 
    flavor: "نمکی", 
    weight: "60g",
    status: "موجود",
    subCategory: "چیپس",
    img: "https://placehold.co/400x400/f8fafc/0f172a?text=Chips", 
    isFeatured: false 
  },
  { 
    id: 3, 
    faTitle: "آب انار گازدار", 
    enTitle: "Carbonated Pomegranate", 
    brand: "نیک", 
    mainCatId: "beverage", 
    beverage_type: "گازدار", 
    packaging: "بطری PET", 
    flavor: "انار", 
    weight: "250ml",
    status: "توقف تولید",
    subCategory: "نوشیدنی گازدار",
    img: "https://placehold.co/400x400/f8fafc/0f172a?text=Pomegranate", 
    isFeatured: false 
  },
  { 
    id: 4, 
    faTitle: "پفک پنیری خانواده", 
    enTitle: "Cheese Curls Family", 
    brand: "خندان", 
    mainCatId: "snack", 
    snack_type: "پفک", 
    packaging: "پاکت سلفونی", 
    flavor: "پنیری", 
    weight: "1kg",
    status: "موجود",
    subCategory: "پفک",
    img: "https://placehold.co/400x400/f8fafc/0f172a?text=Curls", 
    isFeatured: true 
  },
  { 
    id: 5, 
    faTitle: "آب پرتقال طبیعی", 
    enTitle: "Natural Orange Juice", 
    brand: "سون اسکای", 
    mainCatId: "beverage", 
    beverage_type: "آبمیوه", 
    packaging: "بطری PET", 
    flavor: "پرتقال", 
    weight: "1kg",
    status: "موجود",
    subCategory: "آبمیوه طبیعی",
    img: "https://placehold.co/400x400/f8fafc/0f172a?text=Orange", 
    isFeatured: false 
  },
  { 
    id: 6, 
    faTitle: "بیسکویت شکلاتی شیری", 
    enTitle: "Milk Chocolate Biscuit", 
    brand: "صدف", 
    mainCatId: "bakery", 
    packaging: "پاکت سلفونی", 
    flavor: "شکلاتی", 
    weight: "60g",
    status: "موجود",
    subCategory: "کیک و بیسکویت",
    img: "https://placehold.co/400x400/f8fafc/0f172a?text=Biscuit", 
    isFeatured: true 
  }
  ]
  export const MOCK_MEDIA = [
  {
    id: 1,
    type: "video", // video | playlist | image | album
    category: "teaser", // teaser | graphic | bts
    faTitle: "تیزر معرفی محصولات تابستانی",
    enTitle: "Summer Products Teaser",
    thumbnail: "https://placehold.co/800x600/1e293b/ffffff?text=Summer+Teaser",
    videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4",
    isFeatured: true, // کارت بزرگ در گرید بنتو
    date: "2026-05-10"
  },
  {
    id: 2,
    type: "album",
    category: "bts",
    faTitle: "پشت صحنه خط تولید جدید",
    enTitle: "Behind the Scenes: New Production Line",
    thumbnail: "https://placehold.co/600x600/f59e0b/ffffff?text=BTS+Album",
    isFeatured: false,
    date: "2026-04-22",
    items: [
      "https://placehold.co/800x600/f59e0b/ffffff?text=Image+1",
      "https://placehold.co/800x600/ea580c/ffffff?text=Image+2",
      "https://placehold.co/800x600/dc2626/ffffff?text=Image+3"
    ]
  },
  {
    id: 3,
    type: "image",
    category: "graphic",
    faTitle: "پوستر تبلیغاتی ام‌فور",
    enTitle: "M4 Promotional Poster",
    thumbnail: "https://placehold.co/400x800/2563eb/ffffff?text=M4+Poster",
    imageUrl: "https://placehold.co/1200x1800/2563eb/ffffff?text=M4+Poster+HQ",
    isFeatured: false,
    date: "2026-05-01"
  },
  {
    id: 4,
    type: "playlist",
    category: "teaser",
    faTitle: "سریال آموزشی: سلامت تغذیه",
    enTitle: "Educational Series: Nutrition Health",
    thumbnail: "https://placehold.co/800x400/10b981/ffffff?text=Nutrition+Series",
    isFeatured: true,
    date: "2026-03-15",
    items: [
      { ep: 1, title: "قسمت اول: ویتامین‌ها", url: "https://www.w3schools.com/html/mov_bbb.mp4" },
      { ep: 2, title: "قسمت دوم: قند طبیعی", url: "https://www.w3schools.com/html/mov_bbb.mp4" }
    ]
  }
];
export const MOCK_BLOG_POSTS = [
  {
    id: 1,
    faTitle: "نقش نوشیدنی‌های انرژی‌زا در تمرینات ورزشی",
    enTitle: "The Role of Energy Drinks in Workouts",
    slug: "energy-drinks-in-workouts",
    category: "health",
    excerpt: "بررسی علمی تاثیر کافئین و ویتامین‌های گروه B در افزایش راندمان ورزشکاران...",
    content: "<p>محتوای کامل مقاله در اینجا قرار می‌گیرد...</p>",
    coverImage: "https://placehold.co/1200x600/1e293b/ffffff?text=Energy+Workout",
    thumbnailImage: "https://placehold.co/600x600/1e293b/ffffff?text=Energy+Thumb",
    readTime: "۵ دقیقه",
    author: "تیم تحریریه",
    date: "2026-05-20",
    status: "published", // published | draft
    seo: {
      title: "تاثیر نوشیدنی انرژی‌زا در ورزش | جزیره گندم",
      description: "همه چیز درباره مصرف اصولی نوشیدنی‌های انرژی‌زا قبل و بعد از تمرین.",
      keywords: "انرژی زا, ورزش, کافئین, سلامتی"
    }
  },
  {
    id: 2,
    faTitle: "گزارش حضور جزیره گندم در نمایشگاه بین‌المللی",
    enTitle: "Gandom Island at International Exhibition",
    slug: "gandom-island-exhibition-2026",
    category: "news",
    excerpt: "استقبال بی‌نظیر از خط تولید جدید محصولات ارگانیک در نمایشگاه امسال...",
    content: "<p>محتوای کامل مقاله در اینجا قرار می‌گیرد...</p>",
    coverImage: "https://placehold.co/1200x600/f59e0b/ffffff?text=Exhibition+Cover",
    thumbnailImage: "https://placehold.co/600x600/f59e0b/ffffff?text=Exhibition+Thumb",
    readTime: "۳ دقیقه",
    author: "روابط عمومی",
    date: "2026-05-18",
    status: "published",
    seo: {
      title: "حضور جزیره گندم در نمایشگاه ۲۰۲۶",
      description: "گزارش تصویری و خبری از غرفه جزیره گندم.",
      keywords: "اخبار, نمایشگاه, جزیره گندم"
    }
  }
];
// دیتا و سطوح دسترسی کاربران ادمین
export const MOCK_USERS = [
  {
    id: 1,
    name: "حمید فصیحی",
    email: "hamid@gandom.com",
    role: "super_admin", // سوپر ادمین (دسترسی کامل)
    status: "active",
    avatar: "https://placehold.co/150x150/c72127/ffffff?text=HF",
    permissions: ["all"],
    lastLogin: "2026-05-30 10:00",
  },
  {
    id: 2,
    name: "مهندس اجمل",
    email: "ajmal@gandom.com",
    role: "admin", // مدیر ارشد (دسترسی محدودتر)
    status: "active",
    avatar: "https://placehold.co/150x150/f59e0b/ffffff?text=AJ",
    permissions: ["products", "gallery", "blog"],
    lastLogin: "2026-05-29 14:30",
  },
  {
    id: 3,
    name: "عزیز",
    email: "aziz@gandom.com",
    role: "editor", // نویسنده (فقط مجله)
    status: "inactive",
    avatar: "https://placehold.co/150x150/3b82f6/ffffff?text=AZ",
    permissions: ["blog"],
    lastLogin: "2026-05-20 09:15",
  }
];
// اطلاعات جامع سازمان برای تغذیه هوش مصنوعی
export const COMPANY_INFO = `
نام شرکت: پلتفرم سازمانی و فروشگاهی جزیره گندم (Gandom Island)
زمینه فعالیت: تولید و پخش محصولات FMCG شامل نوشیدنی‌های انرژی‌زا، آبمیوه و تنقلات سالم.
شماره تماس پشتیبانی: 021-12345678 و 09120000000
آدرس دفتر مرکزی: تهران، برج گندم، طبقه ۱۰
ساعات کاری: شنبه تا چهارشنبه ۹ صبح تا ۵ عصر.
سوالات متداول:
- آیا نمایندگی می‌پذیرید؟ بله، از طریق صفحه "درخواست نمایندگی" در سایت می‌توانید فرم مربوطه را پر کنید.
- هزینه ارسال محصولات چقدر است؟ خریدهای بالای ۵۰۰ هزار تومان دارای ارسال رایگان هستند.
- آیا امکان مرجوع کردن کالا وجود دارد؟ بله، تا ۷ روز پس از تحویل در صورت باز نشدن پلمپ.
`;