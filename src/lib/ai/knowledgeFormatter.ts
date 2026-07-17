export function formatKnowledge(data: any): string {

    const parts: string[] = [];

    if (data.products?.length) {

        parts.push("### PRODUCTS");

        data.products.forEach((p: any) => {

            parts.push(

`• ${p.title}
Category: ${p.category}
Weight: ${p.weight}
Package: ${p.package}
Brand: ${p.brand}
Link: /products/${p.slug}
`
            );

        });

    }

    if (data.categories?.length) {

        parts.push("\n### CATEGORIES");

        data.categories.forEach((c: any) => {

            parts.push(

`• ${c.title}
Link:
/products?category=${c.slug}
`
            );

        });

    }

    if (data.blogs?.length) {

        parts.push("\n### BLOGS");

        data.blogs.forEach((b: any) => {

            parts.push(

`• ${b.title}
Link:
/blog/${b.slug}
`
            );

        });

    }

    if (data.branches?.length) {

        parts.push("\n### BRANCHES");

        data.branches.forEach((b: any) => {

            parts.push(

`• ${b.faName}
Phone: ${b.phone}
`
            );

        });

    }

    return parts.join("\n");

}