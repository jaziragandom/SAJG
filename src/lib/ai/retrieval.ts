function normalize(text: string = "") {
    return text
        .toLowerCase()
        .replace(/ي/g, "ی")
        .replace(/ك/g, "ک")
        .replace(/أ|إ|آ/g, "ا")
        .replace(/ة/g, "ه")
        .replace(/_/g, " ")
        .replace(/-/g, " ")
        .replace(/\s+/g, " ")
        .trim();
}

const synonyms: Record<string, string[]> = {
    "بطری": ["گالن", "ظرف", "دبه", "bottle"],
    "گالن": ["بطری", "ظرف", "دبه"],
    "ظرف": ["بطری", "گالن"],

    "پنج": ["5"],
    "۵": ["5"],

    "یک": ["1"],
    "۱": ["1"],

    "دو": ["2"],
    "۲": ["2"],

    "سه": ["3"],
    "۳": ["3"],

    "چهار": ["4"],
    "۴": ["4"],

    "لیتر": ["l", "liter"],

    "روغن": ["oil"],
    "آبمیوه": ["juice", "رانی", "نوشیدنی میوه ای"],
    "نوشابه": ["drink", "انرژیزا", "انرژی زا", "گازدار", "کولا", "سودا"],
    "برند": ["brand"],

    "آب": ["آب معدنی", "water", "mineral water"],
    "آب معدنی": ["آب", "water", "mineral water"],
    "انرژیزا": ["enerjiza", "انرژی زا", "نوشابه انرژی زا", "energy drink", "energy"],
    "انرژی زا": ["enerjiza", "انرژیزا", "نوشابه", "energy drink", "energy"],
    "گازدار": ["carbonated", "سودا", "soda", "نوشابه", "نوشیدنی"],
    "نوشیدنی": ["آبمیوه", "نوشابه", "drink", "juice", "آب"],
};

function calculateScore(q: string, text: string = "") {
    q = normalize(q);
    text = normalize(text);

    let score = 0;

    const words = q.split(" ");

    for (const word of words) {
        if (word.length < 2) continue;

        if (text.includes(word))
            score += 10;

        const alt = synonyms[word];

        if (alt) {
            for (const s of alt) {
                if (text.includes(normalize(s)))
                    score += 6;
            }
        }
    }

    return score;
}

function isProductQuestion(question: string) {

    const q = normalize(question);

    const keywords = [

        "محصول",
        "بطری",
        "گالن",
        "دبه",
        "روغن",
        "نوشابه",
        "آبمیوه",
        "چیپس",
        "اسنک",
        "بیسکویت",
        "آرد",
        "ماکارونی",
        "برند",
        "دسته",
        "آب",
        "انرژیزا",
        "انرژی زا",
        "معرفی",
        "طعم",
        "لیمو",
        "پرتقال",
        "انبه",
        "سیب",
        "کولا",
        "جینسینگ",
        "هلو",
        "انگور",
        "آلبالو",
        "لیموناد",
        "انار",
        "flavor",
        "taste",
        "lemon",
        "orange",
        "apple",
        "cola",
        "mango",
        "grape",
        "peach",
        "pomegranate",
        "ginseng",
        "product",
        "category",
        "brand",
        "oil",
        "juice",
        "drink",
        "bottle",
        "water",
        "energy",
        "گازدار",
        "نوشیدنی",
        "سودا",
        "carbonated",
        "soda"

    ];

    return keywords.some(k => q.includes(normalize(k)));
}

export function retrieveKnowledge(
    db: any,
    question: string
) {

    const needProducts = isProductQuestion(question);

    const products = !needProducts
        ? []
        : (db.products ?? [])
            .map((p: any) => ({

                ...p,

                score:

                    calculateScore(question, p.title) +

                    calculateScore(question, p.titleEn) +

                    calculateScore(question, p.category) +

                    calculateScore(question, p.categoryEn) +

                    calculateScore(question, p.brand) +

                    calculateScore(question, p.brandFa) +

                    calculateScore(question, p.brandEn) +

                    calculateScore(question, p.packagingFa) +

                    calculateScore(question, p.packagingEn) +

                    calculateScore(question, p.weight) +

                    calculateScore(question, p.flavorFa) +

                    calculateScore(question, p.flavorEn) +

                    calculateScore(question, p.descriptionFa) +

                    calculateScore(question, p.descriptionEn) +

                    calculateScore(question, p.descriptionFa) +

                    calculateScore(question, p.descriptionEn) +

                    calculateScore(question, p.tags?.join(" ")) +

                    calculateScore(question, p.slug)

            }))
            .filter((p: any) => p.score > 8)
            .sort((a: any, b: any) => b.score - a.score)
            .slice(0, 12);

    const blogs = (db.blogs ?? [])
        .map((b: any) => ({

            ...b,

            score:

                calculateScore(question, b.title)

        }))
        .filter((b: any) => b.score > 0)
        .sort((a: any, b: any) => b.score - a.score)
        .slice(0, 2);

    const categories = (db.categories ?? [])
        .map((c: any) => ({

            ...c,

            score:

                calculateScore(question, c.title)

        }))
        .filter((c: any) => c.score > 0)
        .sort((a: any, b: any) => b.score - a.score)
        .slice(0, 2);

    return {

        products,

        blogs,

        categories,

        branches: db.branches ?? []

    };

}