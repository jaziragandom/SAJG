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

    category:
        typeof p.category === "string"
            ? p.category
            : p.category?.faTitle ??
              p.category?.title ??
              "",

    categoryEn:
        typeof p.category === "string"
            ? p.category
            : p.category?.title ??
              "",

    weight:
        p.specs?.weight ??
        p.weight ??
        "",

    package:
        p.specs?.packaging ??
        p.packaging ??
        "",

    brand:
    p.brandId?.slug ?? "",

brandFa:
    p.brandId?.faTitle ?? "",

brandEn:
    p.brandId?.title ?? "",
})),

        categories: categories.map((c: any) => ({

            title: c.faTitle,

            slug: c.slug

        })),

        blogs: blogs.map((b: any) => ({

            title: b.faTitle,

            slug: b.slug

        })),

        branches:
            corporate?.data?.branches ??
            []

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
const productsForUi =
    filteredKnowledge.products
        ?.slice(0, 5)
        .map((p: any) => ({
            title:
                locale === "fa"
                    ? p.title
                    : p.titleEn || p.title,

            slug: p.slug,

            brand:
                locale === "fa"
                    ? p.brandFa
                    : p.brandEn,

            category:
                locale === "fa"
                    ? p.category
                    : p.categoryEn,
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
       reply += buildUI(
    lastUserMessage.text,
    filteredKnowledge
);

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
    products: productsForUi
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