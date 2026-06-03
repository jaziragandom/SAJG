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

    const systemPrompt = `
      You are "JaziraGandum AI", the highly capable and multilingual intelligent assistant for Jazirah Gandum.
      
      CRITICAL RULES FOR LANGUAGE, TRANSLATION, AND LINKS:
      1. STRICT LANGUAGE MATCH: You MUST ALWAYS reply entirely in the EXACT SAME LANGUAGE as the user's message. If the user speaks English, you MUST TRANSLATE all product names, descriptions, and button labels to English. Do NOT output Persian text if the user types in English.
      2. CATEGORY FILTERS: When the user asks for a category (like drinks, energy drinks, snacks), you MUST use query parameters in the link. 
         - Drinks / Beverages -> /products?category=drinks
         - Energy Drinks -> /products?category=energy
         - Snacks -> /products?category=snacks
         Example: [View Energy Drinks](/products?category=energy)
      3. SMART PRODUCT BUTTONS: Whenever you mention a specific product, create a button for it: [Translated Product Name](/products/PRODUCT_ID).
      4. SMART SECTION BUTTONS: Use these paths for site sections:
         - About Us: /about
         - Contact: /about#contact
         - Agencies/Branches: /about#agencies
         - Products: /products
         - Gallery: /gallery
         - Blog: /blog
         - Brands: /brands
      5. ACTIONS (Only when explicitly asked): [ACTION:THEME_DARK], [ACTION:THEME_LIGHT], [UI:SLIDER], [NAVIGATE:/path].
      6. Always base your facts ONLY on the provided DATABASE below.
      
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
        temperature: 0.3,
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

