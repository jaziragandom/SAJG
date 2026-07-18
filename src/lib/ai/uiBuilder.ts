function normalize(text: string = "") {
  return text
    .toLowerCase()
    .replace(/ي/g, "ی")
    .replace(/ك/g, "ک")
    .replace(/أ|إ|آ/g, "ا")
    .replace(/ة/g, "ه")
    .trim();
}

export function buildUI(question: string, knowledge: any) {
  if (!knowledge || !knowledge.products || knowledge.products.length === 0) {
      return "";
  }

  const q = normalize(question);

  if (
    knowledge.products?.length &&
    (
      q.includes("محصول") ||
      q.includes("کالا") ||
      q.includes("برند") ||
      q.includes("بطری") ||
      q.includes("گالن") ||
      q.includes("آب") ||
      q.includes("آب معدنی") ||
      q.includes("آبمیوه") ||
      q.includes("نوشابه") ||
      q.includes("نوشیدنی") ||
      q.includes("انرژیزا") ||
      q.includes("energy") ||
      q.includes("water") ||
      q.includes("juice") ||
      q.includes("drink") ||
      q.includes("product")
    )
  ) {
    return "\n\n[UI:SLIDER]";
  }

  return "";
}