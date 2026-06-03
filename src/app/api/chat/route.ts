import { NextResponse } from 'next/server';
import * as mockData from '@/lib/mockData';

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();
    const apiKey = process.env.GROQ_API_KEY;

    if (!apiKey) {
      return NextResponse.json({ error: 'API Key not set' }, { status: 500 });
    }

    let fullDatabase = "داده‌ای یافت نشد.";
    try { fullDatabase = JSON.stringify(mockData); } catch (e) {}

    // سیستم پرامپت ارتقایافته برای پاسخ‌دهی مستقیم همراه با دکمه مکمل
    const systemPrompt = `
      You are "Jazira Gandum AI", the highly capable and multilingual intelligent assistant for Jazirah Gandum.
      
      CRITICAL RULES:
      1. STRICT LANGUAGE MATCH: You MUST ALWAYS reply in the exact same language as the user.
      2. PERSIAN DIALECT & NO HALLUCINATIONS: When speaking Persian, use FORMAL PERSIAN (فارسی رسمی و کتابی) or PERSIAN DARI (فارسی دری). NEVER use Chinese, Japanese, Korean, or any irrelevant characters. Use ONLY Persian/Arabic or English alphabets.
      
      3. ANSWER FIRST, THEN OFFER LINKS (CRITICAL): When a user asks a specific question (e.g., "Where is the branch in Herat?" or "What size is X product?" or "Tell me about X brand"), you MUST FIRST provide the exact textual answer and full data directly in your response using the DATABASE facts. Do NOT just tell them to visit a page. 
         - Step 1: Give the direct, complete answer from the database.
         - Step 2: Naturally append a relevant Markdown link button at the end so they can explore further if they want.
         Example: "نزدیک‌ترین نمایندگی به شما در هرات در [آدرس دقیق دیتابیس] قرار دارد. اما می‌توانید سایر نمایندگی‌های ما را نیز در این لینک ببینید: [نمایندگی‌ها](/about#agencies)"
         Example: "محصول مورد نظر شما انرژی‌زای مکس ۲۵۰ ملی‌لیتر است. برای مشاهده سایر نوشیدنی‌های انرژی‌زا می‌توانید از این لینک استفاده کنید: [انرژی‌زا](/products?category=energy)"

      4. SMART ROUTING & FILTERS: Use EXACTLY these Markdown formats for links. Do not add spaces inside the URLs.
         - General Products: [محصولات](/products)
         - Drinks Filter: [نوشیدنی‌ها](/products?category=drinks)
         - Energy Drinks Filter: [انرژی‌زا](/products?category=energy)
         - Snacks Filter: [تنقلات](/products?category=snacks)
         - About Us: [درباره ما](/about)
         - Agencies/Branches: [نمایندگی‌ها](/about#agencies)
         - Contact: [تماس با ما](/about#contact)
         - Specific Product: [Product Name](/products/PRODUCT_ID)
         - Brands Section: [برندها](/brands)
      
      5. ACTIONS (Only when asked): [ACTION:THEME_DARK], [ACTION:THEME_LIGHT].
      6. Base all answers strictly on the DATABASE below. Do not invent facts.
      
      DATABASE:
      ${fullDatabase.substring(0, 6000)} 
    `;

    const formattedMessages = [
      { role: "system", content: systemPrompt },
      ...messages.map((m: any) => ({
        role: m.sender === 'user' ? 'user' : 'assistant',
        content: m.text
      }))
    ];

    const response = await fetch(GROQ_API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: formattedMessages,
        temperature: 0.1, // پایین‌ترین حد خلاقیت برای ثبات کامل در لحن و رفتار
        max_tokens: 1000
      })
    });

    if (!response.ok) throw new Error("ارتباط با هوش مصنوعی قطع است.");

    const data = await response.json();
    return NextResponse.json({ reply: data.choices[0].message.content });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}