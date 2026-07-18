export function formatKnowledge(data: any): string {
  const parts: string[] = [];

  if (data.products?.length) {
    parts.push("PRODUCTS:");

    data.products.forEach((p: any, index: number) => {
      parts.push(
        [
          `${index + 1}. ${p.title} (English: ${p.titleEn || 'N/A'})`,
          p.brandFa ? `Brand: ${p.brandFa}` : "",
          p.category ? `Category: ${p.category}` : "",
          p.weight ? `Weight: ${p.weight}` : "",
          p.package ? `Package: ${p.package}` : "",
          p.packagingFa ? `Packaging: ${p.packagingFa}` : "",
          p.packagingEn ? `Packaging: ${p.packagingEn}` : "",
          `Slug: ${p.slug}`,
          `Link: /products/${p.slug}`,
        ]
          .filter(Boolean)
          .join(" | ")
      );
    });
  }

  if (data.categories?.length) {
    parts.push("\nCATEGORIES:");

    data.categories.forEach((c: any) => {
      parts.push(
        `${c.title} | Link: /products?category=${c.slug}`
      );
    });
  }

  if (data.blogs?.length) {
    parts.push("\nBLOGS:");

    data.blogs.forEach((b: any) => {
      parts.push(
        `${b.title} | Link: /blog/${b.slug}`
      );
    });
  }

  if (data.branches?.length) {
  parts.push("\nBRANCHES:");

  data.branches.forEach((b: any) => {
    parts.push(
      [
    `Name: ${b.faName}`,
    `English: ${b.enName}`,
    `Phone: ${b.phone}`,
    `Persian Address: ${b.faAddress}`,
    `English Address: ${b.enAddress}`,
    b.mapUrl
        ? `[📍 مشاهده روی گوگل مپ](${b.mapUrl})`
        : "",
]
        .filter(Boolean)
        .join(" | ")
    );
  });
}

if (data.hqData) {

    parts.push("\nHEAD OFFICE:");

    parts.push(
        [
            `Name: ${data.hqData.faName}`,
            `English: ${data.hqData.enName}`,
            `Phone: ${data.hqData.phone}`,
            `Email: ${data.hqData.email}`,
            `Persian Address: ${data.hqData.faAddress}`,
            `English Address: ${data.hqData.enAddress}`,
            data.hqData.mapUrl
    ? `[📍 مشاهده روی گوگل مپ](${data.hqData.mapUrl})`
    : "",
        ]
        .filter(Boolean)
        .join(" | ")
    );

}

  return parts.join("\n");
}