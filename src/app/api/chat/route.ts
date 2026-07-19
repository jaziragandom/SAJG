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

        brands: Array.from(
            new Map(
                products
                    .filter((p: any) => p.brandId && p.brandId.slug)
                    .map((p: any) => [
                        p.brandId.slug,
                        { slug: p.brandId.slug, faTitle: p.brandId.faTitle || p.brandId.slug, title: p.brandId.title || p.brandId.slug }
                    ])
            ).values()
        ),

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
// سیستم همگام‌سازی اسلایدر با متن هوش مصنوعی
// فقط محصولاتی در اسلایدر نمایش داده می‌شوند که لینک آن‌ها در متن پیام باشد
const syncedProducts = productsForUi.filter((p: any) => reply.includes(p.slug));

if (syncedProducts.length > 0) {
    reply += "\n\n[UI:SLIDER]";
}
// ----------------------------------------------------

if (!reply) {

    reply =
        locale === "fa"
            ? "پاسخی دریافت نشد."
            : "No response received.";

}

reply = reply
    .replace(/```/g, "")
    .replace(/\[ACTION:[^\]]+\]/g, "")
    .trim();

return NextResponse.json({
    reply,
    products: syncedProducts // ارسال محصولات همگام‌سازی شده به جای لیست پیش‌فرض
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