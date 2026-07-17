export function buildUI(question: string, knowledge: any) {
    const q = question.toLowerCase();

    // محصولات
    if (
        q.includes("محصول") ||
        q.includes("روغن") ||
        q.includes("آرد") ||
        q.includes("product")
    ) {
        return "\n\n[UI:SLIDER]";
    }

    return "";
}