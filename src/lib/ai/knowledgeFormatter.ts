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
          p.categorySlug ? `CategorySlug: ${p.categorySlug}` : "",
          p.weight ? `Weight: ${p.weight}` : "",
          p.flavorFa ? `Flavor: ${p.flavorFa}` : "",
          p.flavorEn ? `FlavorEn: ${p.flavorEn}` : "",
          p.tags?.length ? `Tags: ${p.tags.join(", ")}` : "",
          p.package ? `Package: ${p.package}` : "",
          p.packagingFa ? `Packaging: ${p.packagingFa}` : "",
          p.packagingEn ? `Packaging: ${p.packagingEn}` : "",
          `Slug: ${p.slug}`,
          `ProductLink: [/products/${p.slug}]`,
        ]
          .filter(Boolean)
          .join(" | ")
      );
    });
  }

  if (data.brands?.length) {
    parts.push("\nBRANDS:");

    data.brands.forEach((b: any) => {
      parts.push(
        `${b.faTitle} | BrandLink: [/brands/${b.slug}]`
      );
    });
  }

  if (data.categories?.length) {
    parts.push("\nCATEGORIES:");

    data.categories.forEach((c: any) => {
      parts.push(
        `${c.title} | CategoryLink: [/products?category=${c.slug}]`
      );
    });
  }

  if (data.blogs?.length) {
    parts.push("\nBLOGS:");

    data.blogs.forEach((b: any) => {
      parts.push(
        `${b.title} | BlogLink: [/blog/${b.slug}]`
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