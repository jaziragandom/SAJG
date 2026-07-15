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

    const [products, categories, hqContent, blogs] = await Promise.all([
      Product.find({}).populate('brandId', 'slug').lean(),
      Category.find({}).lean(),
      SiteContent.findOne({ sectionKey: 'corporate_hq' }).lean(),
      Blog.find({ status: 'published' }).limit(15).lean()
    ]);

    const cleanProducts = products.map((p: any) => ({
      fa: p.faTitle,
      en: p.enTitle || p.faTitle,
      s: p.slug, 
      c: p.category,
      b: p.brandId?.slug || '',
      f: p.flavor || p.specs?.flavor || '',
      w: p.specs?.weight || p.weight || '',
      p: p.packaging || p.specs?.packaging || ''
    }));

    const cleanCategories = categories.map((c: any) => ({
      fa: c.faTitle,
      en: c.enTitle || c.faTitle,
      s: c.slug
    }));

    const hqData = hqContent?.data || {};
    const cleanBranches = hqData.branches?.map((b: any) => ({
      fa: b.faName,
      en: b.enName || b.faName,
      adr: b.faAddress,
      tel: b.phone
    })) || [];

    const cleanBlogs = blogs.map((b: any) => ({
      fa: b.faTitle,
      en: b.enTitle || b.faTitle,
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
You are the 24/7 smart assistant for the company.
COMPANY NAME RULE: Use "جزیره گندم" when responding in Persian. Use "Jazirah Gandum" when responding in English or any other language. NEVER write "جزرا گندوم".

CRITICAL RULE 1: ABSOLUTE LANGUAGE MATCHING
You MUST detect the language of the user's LAST message and reply ENTIRELY in that exact language.
- If the user types in English, your entire response MUST be in English.
- If the user types in Persian, your entire response MUST be in Persian.

CRITICAL RULE 2: UI CONTROLS (DO NOT USE UNLESS COMMANDED)
ONLY output a tag IF the user explicitly commands you to change the look or navigate.
- "Dark mode" / "تم تاریک": [ACTION:THEME_DARK]
- "Light mode" / "تم روشن": [ACTION:THEME_LIGHT]
- "Go to products" / "برو به محصولات": [NAVIGATE:/products]
- "Go to gallery" / "برو به گالری": [NAVIGATE:/gallery]
- "Go to blog" / "برو به مجله": [NAVIGATE:/blog]

CLEAN_DB DICTIONARY:
'prod' (fa: Persian Name, en: English Name, s: slug, c: category, b: brand, f: flavor, w: weight, p: packaging)
'cat' (fa: Persian Name, en: English Name, s: slug)

CRITICAL RULE 3: INLINE PRODUCT BUTTONS
You are FORBIDDEN from writing a product's name as normal text. Every time you mention a product, embed it as a Markdown link pointing to its slug.
Format: [Product Name](/${locale}/products/SLUG)

CRITICAL RULE 4: DIFFERENTIATING SIMILAR PRODUCTS (STRICT)
If multiple products have the same or similar names, you MUST include their distinguishing features (like weight 'w' or packaging 'p') INSIDE the button label to tell them apart.
Example: [آب انار گازدار شیک (1.5 لیتر)](/${locale}/products/shik-pomegranate-1-5) and [آب انار گازدار شیک (250 میلی‌لیتر)](/${locale}/products/shik-pomegranate-250)

CRITICAL RULE 5: GROUP FILTER BUTTON (MANDATORY)
Whenever a user asks for a specific group of products (e.g., "pomegranate flavor", "brand X"), after listing the individual product buttons, you MUST append a final filter button at the end of your response to view all related items.
- For categories/flavors/packaging: [${locale === 'fa' ? 'مشاهده همه موارد این گروه' : 'View All Related Products'}](/${locale}/products?category=EXACT_SLUG)
- For brands: [${locale === 'fa' ? 'مشاهده محصولات این برند' : 'View Brand Products'}](/${locale}/products?brand=EXACT_SLUG)

You ONLY know what is in CLEAN_DB.
CLEAN_DB:
${dbString}
    `;

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
        model: "llama-3.3-70b-versatile", // بازگشت به باهوش‌ترین مدل
        messages: formattedMessages,
        temperature: 0.1,
        max_tokens: 1500
      })
    });

    if (!response.ok) throw new Error("ارتباط با سرور هوش مصنوعی برقرار نشد.");

    const data = await response.json();
    return NextResponse.json({ reply: data.choices[0].message.content });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}