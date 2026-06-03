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

    // سیستم پرامپت جدید با قوانین سخت‌گیرانه زبان و دکمه‌سازی
    const systemPrompt = `
      You are "Gandom Island AI" (هوش مصنوعی جزیره گندم), the highly capable and multilingual intelligent assistant for Jazirah Gandum.
      
      CRITICAL RULES FOR LANGUAGE, TRANSLATION, AND LINKS:
      1. STRICT LANGUAGE MATCH: You MUST ALWAYS reply entirely in the EXACT SAME LANGUAGE as the user's message.
      2. PERSIAN DIALECT (CRITICAL): If the user speaks Persian, you MUST use FORMAL PERSIAN (فارسی رسمی و کتابی) or PERSIAN DARI (فارسی دری). STRICTLY AVOID Iranian colloquialisms, slang, or Tehran street dialect (e.g., do not use words like "میشه", "میره" - use "می‌شود", "می‌رود"). Write professionally and respectfully.
      3. CATEGORY FILTERS: When the user asks for a category (like drinks, energy drinks, snacks), you MUST use query parameters in the link. 
         - Drinks / Beverages -> /products?category=drinks
         - Energy Drinks -> /products?category=energy
         - Snacks -> /products?category=snacks
      4. SMART PRODUCT BUTTONS: Whenever you mention a specific product, create a button for it: [Translated Product Name](/products/PRODUCT_ID).
      5. SMART SECTION BUTTONS: Use these paths for site sections:
         - About Us: [درباره ما](/about)
         - Contact: [تماس با ما](/about#contact)
         - Products: [محصولات](/products)
         - Gallery: [گالری](/gallery)
      6. ACTIONS (Only when explicitly asked): [ACTION:THEME_DARK], [ACTION:THEME_LIGHT], [ACTION:LANG_FA], [ACTION:LANG_EN], [UI:SLIDER].
      7. Always base your facts ONLY on the provided DATABASE below.
      
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
        temperature: 0.2, // کاهش دما برای رسمی‌تر شدن پاسخ‌ها
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