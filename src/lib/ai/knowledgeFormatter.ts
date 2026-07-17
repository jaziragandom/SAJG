export function formatKnowledge(data: any): string {
  const parts: string[] = [];

  if (data.products?.length) {
    parts.push("PRODUCTS:");

    data.products.forEach((p: any) => {
      parts.push(
        [
          p.title,
          p.brand ? `Brand: ${p.brand}` : "",
          p.category ? `Category: ${p.category}` : "",
          p.weight ? `Weight: ${p.weight}` : "",
          p.package ? `Package: ${p.package}` : "",
          `Link: /products/${p.slug}`
        ]
          .filter(Boolean)
          .join(" | ")
      );
    });
  }

  if (data.categories?.length) {
    parts.push("\nCATEGORIES:");

    data.categories.forEach((c: any) => {
      parts.push(`${c.title} | /products?category=${c.slug}`);
    });
  }

  if (data.blogs?.length) {
    parts.push("\nBLOGS:");

    data.blogs.forEach((b: any) => {
      parts.push(`${b.title} | /blog/${b.slug}`);
    });
  }

  if (data.branches?.length) {
    parts.push("\nBRANCHES:");

    data.branches.forEach((b: any) => {
      parts.push(`${b.faName} | ${b.phone}`);
    });
  }

  return parts.join("\n");
}