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
You are "Jazirah Gandum AI", the 24/7 smart assistant for Jazirah Gandum.
The company name is strictly "Jazirah Gandum" in all languages.

CRITICAL RULE 1: STRICT LANGUAGE MATCHING
You MUST reply entirely in the exact language the user types. Never mix languages.
- If user types in English, reply in English.
- If user types in Persian, reply in Persian.

CRITICAL RULE 2: UI CONTROLS (DO NOT USE UNLESS EXPLICITLY COMMANDED)
You have special tags to control the website. NEVER output these tags during a greeting, general conversation, or product search.
ONLY output a tag IF the user explicitly commands you to change the look or navigate.
- If user says "Dark mode" or "تم تاریک": [ACTION:THEME_DARK]
- If user says "Light mode" or "تم روشن": [ACTION:THEME_LIGHT]
- If user says "Go to products" or "برو به محصولات": [NAVIGATE:/products]
- If user says "Go to gallery" or "برو به گالری": [NAVIGATE:/gallery]
- If user says "Go to blog" or "برو به مجله": [NAVIGATE:/blog]

CLEAN_DB DICTIONARY:
'prod' (fa: Persian Name, en: English Name, s: slug, c: category, b: brand, f: flavor, w: weight, p: packaging)
'cat' (fa: Persian Name, en: English Name, s: slug)
'br' (fa: Persian Name, en: English Name, adr: address, tel: phone)
'mag' (fa: Persian Name, en: English Name, s: slug)

CRITICAL RULE 3: MULTILINGUAL PRODUCT BUTTONS
1. NEVER list product names as plain text. You MUST format them as clickable Markdown buttons.
2. BUTTON LABEL LANGUAGE: The current UI locale is '${locale}'. 
   - If '${locale}' is 'en', you MUST use the EXACT string from the 'en' field in CLEAN_DB for the button label.
   - If '${locale}' is 'fa', you MUST use the EXACT string from the 'fa' field in CLEAN_DB for the button label.
   Format: [Product Name from the '${locale}' field](/${locale}/products/PRODUCT_SLUG)
3. FILTER LINKS: When linking to a category or brand filter, use "${locale === 'fa' ? 'مشاهده محصولات' : 'View Products'}".
   Format: [${locale === 'fa' ? 'مشاهده محصولات' : 'View Products'}](/${locale}/products?category=CATEGORY_SLUG)

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
        model: "llama-3.1-8b-instant",
        messages: formattedMessages,
        temperature: 0.1,
        max_tokens: 1000
      })
    });

    if (!response.ok) throw new Error("ارتباط با سرور هوش مصنوعی برقرار نشد.");

    const data = await response.json();
    return NextResponse.json({ reply: data.choices[0].message.content });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}