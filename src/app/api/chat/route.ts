import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Product from '@/models/Product';
import SiteContent from '@/models/SiteContent';
import Blog from '@/models/Blog';
import Category from '@/models/Category';

export const dynamic = 'force-dynamic';

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';

export async function POST(req: Request) {
  try {
    const { messages, locale = 'fa' } = await req.json();
    const apiKey = process.env.GROQ_API_KEY;

    if (!apiKey) {
      return NextResponse.json({ error: 'API Key not set' }, { status: 500 });
    }

    await dbConnect();

    // دریافت اطلاعات سایت
    const [products, categories, hqContent, blogs] = await Promise.all([
      Product.find({}).populate('brandId', 'slug').lean(),
      Category.find({}).lean(),
      SiteContent.findOne({ sectionKey: 'corporate_hq' }).lean(),
      Blog.find({ status: 'published' }).limit(15).lean()
    ]);

    // فشرده‌سازی حداکثری کلیدها (کاهش ۵۰ درصدی حجم برای جلوگیری از خطای Token Limit در Groq)
    const cleanProducts = products.map((p: any) => ({
      n: p.faTitle,
      s: p.slug, 
      c: p.category,
      b: p.brandId?.slug || '',
      f: p.flavor || p.specs?.flavor || '',
      w: p.specs?.weight || p.weight || '',
      p: p.packaging || p.specs?.packaging || ''
    }));

    const cleanCategories = categories.map((c: any) => ({
      n: c.faTitle,
      s: c.slug
    }));

    const hqData = hqContent?.data || {};
    const cleanBranches = hqData.branches?.map((b: any) => ({
      n: b.faName,
      adr: b.faAddress,
      tel: b.phone
    })) || [];

    const cleanBlogs = blogs.map((b: any) => ({
      t: b.faTitle,
      s: b.slug
    }));

    const realDatabase = {
      prod: cleanProducts,
      cat: cleanCategories,
      br: cleanBranches,
      mag: cleanBlogs
    };

    const dbString = JSON.stringify(realDatabase);

    const systemPrompt = `
You are "Jazira Gandum AI", the 24/7 smart assistant for Jazirah Gandum.
Your language MUST match the user's input language immediately. (Current UI locale: ${locale === 'en' ? 'English' : 'Persian'}).

UI CONTROLS & NAVIGATION (Output these exact tags anywhere in your response to control the site):
- Dark Mode: [ACTION:THEME_DARK]
- Light Mode: [ACTION:THEME_LIGHT]
- Change language to English: [NAVIGATE:/en]
- Change language to Persian: [NAVIGATE:/fa]
- Go to Products Page: [NAVIGATE:/products]
- Go to Gallery Page: [NAVIGATE:/gallery]
- Go to Blog Page: [NAVIGATE:/blog]

CLEAN_DB DICTIONARY:
'prod' = Products (n: name, s: slug, c: category, b: brand, f: flavor, w: weight, p: packaging)
'cat' = Categories (n: name, s: slug)
'br' = Branches (n: name, adr: address, tel: phone)
'mag' = Magazine Articles (t: title, s: slug)

CRITICAL RULES FOR PRODUCTS & BUTTONS:
1. NEVER list product names as plain text. 
2. EVERY SINGLE TIME you mention a specific product, you MUST format its name as a clickable Markdown button linking to its exact page. 
   Format: [Exact Product Name from DB](/${locale}/products/PRODUCT_SLUG)
   Example: [نوشابه گازدار نیک (کولا)](/${locale}/products/nick-cola-1-5l)
3. FILTER LINKS (GROUPS): When you provide a link to a category or brand filter, the button text MUST be "${locale === 'fa' ? 'مشاهده محصولات' : 'View Products'}".
   Example for Brand: [${locale === 'fa' ? 'مشاهده محصولات' : 'View Products'}](/${locale}/products?brand=BRAND_SLUG)
   Example for Category: [${locale === 'fa' ? 'مشاهده محصولات' : 'View Products'}](/${locale}/products?category=CATEGORY_SLUG)
4. OTHER LINKS:
   - All Branches: [${locale === 'fa' ? 'لیست نمایندگی‌ها' : 'All Branches'}](/${locale}/about#branches)
   - Contact Us: [${locale === 'fa' ? 'تماس با ما' : 'Contact Us'}](/${locale}/about#contact)

You ONLY know what is in CLEAN_DB. Never invent info or URLs. Use exact 's' (slug) from CLEAN_DB.
CLEAN_DB:
${dbString}
    `;

    // محدود کردن تاریخچه ارسالی فقط به ۵ پیام آخر برای حفظ پایداری سرور
    const recentMessages = messages.slice(-5).map((m: any) => ({
      role: m.sender === 'user' ? 'user' : 'assistant',
      content: m.text
    }));

    const formattedMessages = [
      { role: "system", content: systemPrompt },
      ...recentMessages
    ];

    const response = await fetch(GROQ_API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
      body: JSON.stringify({
        model: "llama-3.1-8b-instant",
        messages: formattedMessages,
        temperature: 0.1, // تضمین استخراج دقیق نام و اسلاگ بدون خیال‌پردازی
        max_tokens: 1000
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Groq API Error Details:", errorText);
      throw new Error("ارتباط با سرور هوش مصنوعی برقرار نشد.");
    }

    const data = await response.json();
    return NextResponse.json({ reply: data.choices[0].message.content });

  } catch (error: any) {
    console.error("Chat API Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}