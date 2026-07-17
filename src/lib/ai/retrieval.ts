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

    "بطری": ["گالن","ظرف","دبه"],

    "گالن": ["بطری","ظرف"],

    "ظرف": ["بطری","گالن"],

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

    "لیتر": ["l","liter"]

};

function calculateScore(q: string, text: string) {

    q = normalize(q);
    text = normalize(text);

    let score = 0;

    const words = q.split(" ");

    for (const word of words) {

        if (word.length < 2)
            continue;

        if (text.includes(word))
            score += 10;

        const alt = synonyms[word];

        if (alt) {

            for (const s of alt) {

                if (text.includes(s))
                    score += 6;

            }

        }

    }

    return score;

}

export function retrieveKnowledge(
    db: any,
    question: string
) {

    const products = db.products

        .map((p: any) => ({

            ...p,

            score:

                calculateScore(question, p.title) +

                calculateScore(question, p.category) +

                calculateScore(question, p.brand)

        }))

        .filter((p: any) => p.score > 0)

        .sort((a: any, b: any) => b.score - a.score)

        .slice(0, 10);

    const blogs = db.blogs

        .map((b: any) => ({

            ...b,

            score:

                calculateScore(question, b.title)

        }))

        .filter((b: any) => b.score > 0)

        .sort((a: any, b: any) => b.score - a.score)

        .slice(0, 5);

    const categories = db.categories

        .map((c: any) => ({

            ...c,

            score:

                calculateScore(question, c.title)

        }))

        .filter((c: any) => c.score > 0)

        .sort((a: any, b: any) => b.score - a.score)

        .slice(0, 5);

    return {

        products,

        blogs,

        categories,

        branches: db.branches

    };

}