import { NextResponse } from "next/server";

import dbConnect from "@/lib/mongodb";

import Product from "@/models/Product";
import Category from "@/models/Category";
import Blog from "@/models/Blog";
import SiteContent from "@/models/SiteContent";

import { askGroq } from "@/lib/ai/groq";
import { buildHistory } from "@/lib/ai/history";
import { buildPrompt } from "@/lib/ai/prompt";
import { retrieveKnowledge } from "@/lib/ai/retrieval";
import { buildUI } from "@/lib/ai/uiBuilder";

export const dynamic = "force-dynamic";

let cachedDatabase: any = null;

let lastCache = 0;

const CACHE_TIME = 1000 * 60 * 60;

async function loadKnowledge(locale: string) {

    const now = Date.now();

    if (
        cachedDatabase &&
        now - lastCache < CACHE_TIME
    ) {
        return cachedDatabase;
    }

    await dbConnect();

    const [

        products,

        categories,

        corporate,

        blogs

    ] = await Promise.all([

        Product.find({})
            .populate(
    "brandId",
    "slug faTitle title"
)
            .lean(),

        Category.find({})
            .lean(),

        SiteContent.findOne({
            sectionKey: "corporate_hq"
        }).lean(),

        Blog.find({
            status: "published"
        })
            .limit(10)
            .lean()

    ]);

    // استخراج لیست کامل برندها از محصولات
    const brandsMap = new Map();
    products.forEach((p: any) => {
        if (p.brandId && p.brandId.slug) {
            brandsMap.set(p.brandId.slug, {
                slug: p.brandId.slug,
                faTitle: p.brandId.faTitle || p.brandId.slug,
                title: p.brandId.title || p.brandId.slug
            });
        }
    });

    cachedDatabase = {

        products: products.map((p: any) => ({
    title: p.faTitle,

    titleEn: p.title ?? "",

    slug: p.slug,

    categorySlug:
    typeof p.category === "string"
        ? p.category
        : p.category?.slug ?? "",

category:
    (() => {
        if (typeof p.category !== "string") {
            return p.category?.faTitle ?? "";
        }

        const cat = categories.find(
            (c: any) => c.slug === p.category
        );

        return cat?.faTitle ?? p.category;
    })(),

categoryEn:
    (() => {
        if (typeof p.category !== "string") {
            return p.category?.title ?? "";
        }

        const cat = categories.find(
            (c: any) => c.slug === p.category
        );

        return cat?.title ?? p.category;
    })(),

flavorEn:
    p.specs?.flavorEn ?? "",
    
    weight:
        p.specs?.weight ??
        p.weight ??
        "",

    packagingFa:
    p.specs?.packagingFa ?? "",
    packagingEn:
    p.specs?.packagingEn ?? "",
    flavorFa:
    p.specs?.flavorFa ?? "",

descriptionFa:
    p.faDesc ?? "",

descriptionEn:
    p.enDesc ?? "",

    brand:
    p.brandId?.slug ?? "",

brandFa:
    p.brandId?.faTitle ?? "",

brandEn:
    p.brandId?.title ?? "",
    
flavor:
    p.specs?.flavor ??
    p.specs?.flavorFa ??
    "",

tags:
    p.tags ?? [],
    
image: 
    p.image || 
    p.imageUrl || 
    p.thumbnail || 
    p.cover || 
    p.coverImage || 
    p.images?.main || 
    (p.gallery && p.gallery[0]) || 
    "",
})),

        categories: categories.map((c: any) => ({

            title: c.faTitle,

            slug: c.slug

        })),

        brands: Array.from(brandsMap.values()),

        blogs: blogs.map((b: any) => ({

            title: b.faTitle,

            slug: b.slug

        })),

        branches:
    corporate?.data?.branches ?? [],

hqData:
    corporate?.data?.hqData ?? {}

    };

    lastCache = now;

    return cachedDatabase;
}


export async function POST(req: Request) {

    try {

        const {

            messages,

            locale = "fa"

        } = await req.json();

        if (!messages || !Array.isArray(messages)) {

            return NextResponse.json(
                {
                    error: "Invalid messages"
                },
                {
                    status: 400
                }
            );

        }

        const history = buildHistory(messages);

const lastUserMessage =
    [...history]
        .reverse()
        .find(m => m.role === "user");

        if (!lastUserMessage) {

            return NextResponse.json(
                {
                    error: "No user message"
                },
                {
                    status: 400
                }
            );

        }

// ----------------------------------------------------
// سیستم میان‌بر هوشمند (Fast-Path)
// صفر کردن مصرف توکن برای احوال‌پرسی‌ها و دستورات تغییر سایت
// ----------------------------------------------------
const userTextNorm = lastUserMessage.text.trim().toLowerCase();

if (/^(سلام|خوبه|ممنون|مرسی|تشکر|hello|hi|thanks|thank you)$/i.test(userTextNorm)) {
    return NextResponse.json({
        reply: locale === "fa" ? "سلام! من دستیار هوشمند جزیره گندم هستم. چطور می‌توانم کمکتان کنم؟" : "Hello! I am the Jazirah Gandum smart assistant. How can I help you?",
        products: [],
        action: null
    });
}

let directAction = null;
let directReply = "";

if (/(تاریک|دارک|dark)/i.test(userTextNorm) && /(تم|حالت|قالب|theme|mode)/i.test(userTextNorm)) {
    directAction = { type: "theme", value: "dark" };
    directReply = locale === "fa" ? "حالت تاریک سایت با موفقیت فعال شد 🌙" : "Dark mode activated successfully 🌙";
} else if (/(روشن|لایت|light)/i.test(userTextNorm) && /(تم|حالت|قالب|theme|mode)/i.test(userTextNorm)) {
    directAction = { type: "theme", value: "light" };
    directReply = locale === "fa" ? "حالت روشن سایت با موفقیت فعال شد ☀️" : "Light mode activated successfully ☀️";
} else if (/(انگلیسی|english)/i.test(userTextNorm) && /(زبان|language|تغییر|سویچ|switch|change)/i.test(userTextNorm)) {
    directAction = { type: "language", value: "en" };
    directReply = locale === "fa" ? "در حال تغییر زبان به انگلیسی..." : "Switching language to English...";
} else if (/(فارسی|persian)/i.test(userTextNorm) && /(زبان|language|تغییر|سویچ|switch|change)/i.test(userTextNorm)) {
    directAction = { type: "language", value: "fa" };
    directReply = locale === "fa" ? "در حال تغییر زبان به فارسی..." : "Switching language to Persian...";
}

if (directAction) {
    return NextResponse.json({
        reply: directReply,
        products: [],
        action: directAction
    });
}
// ----------------------------------------------------

        const database =
            await loadKnowledge(locale);

        const filteredKnowledge =
    retrieveKnowledge(
        database,
        lastUserMessage.text
    );

    const userLang =
  /^[a-z]/i.test(lastUserMessage.text.trim())
    ? "en"
    : "fa";

const productsForUi =
    filteredKnowledge.products
        ?.map((p: any) => ({

            title:
    userLang === "fa"
        ? p.title
        : p.titleEn || p.title,

            slug: p.slug,

            brand:
    userLang === "fa"
        ? p.brandFa
        : (p.brandEn || p.brandFa),

            category:
    userLang === "fa"
        ? p.category
        : (p.categoryEn || p.category),

categorySlug:
    p.categorySlug,

            image:
                p.image ||

                p.images?.main ||

                "",

            weight:
                p.weight ||

                p.specs?.weight ||

                "",

           packaging:
    userLang === "fa"
        ? p.packagingFa
        : (p.packagingEn || p.packagingFa),
flavor:
    userLang === "fa"
        ? p.flavor
        : (p.flavorEn || p.flavor),
        })) ?? [];

        const systemPrompt = buildPrompt(
           filteredKnowledge,
           lastUserMessage.text,
           locale
          );

        const aiResponse =
    await askGroq(
        systemPrompt,
        history
    );
        if (!aiResponse.success) {

            return NextResponse.json(
                {
                    reply:
                        locale === "fa"
                            ? "متأسفم، در حال حاضر ارتباط با هوش مصنوعی برقرار نیست."
                            : "AI service is currently unavailable."
                }
            );

        }

       let reply = aiResponse.text?.trim() ?? "";

// ----------------------------------------------------
// شکار اتوماتیک دستورات عملیاتی
// ----------------------------------------------------
let actionPayload = null;

const themeMatch = reply.match(/\[ACTION:THEME_(DARK\vert{}LIGHT)\]/i);
if (themeMatch) {
    actionPayload = { type: "theme", value: themeMatch[1].toLowerCase() };
}

const langMatch = reply.match(/\[ACTION:LANG_(EN\vert{}FA)\]/i);
if (langMatch) {
    actionPayload = { type: "language", value: langMatch[1].toLowerCase() };
}

const navMatch = reply.match(/\[NAVIGATE:([^\]]+)\]/i);
if (navMatch) {
    actionPayload = { type: "navigate", value: navMatch[1].trim() };
}

reply = reply.replace(/\[ACTION:[^\]]+\]/gi, "");
reply = reply.replace(/\[NAVIGATE:[^\]]+\]/gi, "");

reply = reply.trim();

if (!reply && actionPayload) {
    reply = locale === "fa" ? "در حال انجام درخواست شما..." : "Processing your request...";
}
// ----------------------------------------------------

// سیستم همگام‌سازی اسلایدر با متن هوش مصنوعی
const syncedProducts = productsForUi.filter((p: any) => reply.includes(p.slug));

if (syncedProducts.length > 0) {
    reply += "\n\n[UI:SLIDER]";
}

if (!reply) {

    reply =
        locale === "fa"
            ? "پاسخی دریافت نشد."
            : "No response received.";

}

reply = reply.replace(/```/g, "").trim();

return NextResponse.json({
    reply,
    products: syncedProducts,
    action: actionPayload
});

    } catch (error: any) {

        console.error("=================================");
        console.error("CHAT API ERROR");
        console.error(error);
        console.error("=================================");

        return NextResponse.json(
            {
                reply:
                    "متأسفم، هنگام پردازش درخواست مشکلی پیش آمد. لطفاً چند لحظه دیگر دوباره امتحان کنید."
            },
            {
                status: 500
            }
        );

    }

}