import { defineQuery } from "next-sanity"
import { sanityFetch } from "../live";

export const getProductByCategory = async (categorySlug: string) => {
    const PRODUCT_BY_CATEGORY_QUERY = defineQuery(`
          *[
            _type == "product" && references(*[_type == "category" && slug.current == $categorySlug]._id)
          ] | order(name asc)[0]
        `);
    try {
        const products = await sanityFetch({
            query: PRODUCT_BY_CATEGORY_QUERY,
            params: {
                categorySlug,
            },
        });

        return products.data || null;
    } catch (error) {
        console.error("Error fetching product by ID:",error);
        return null;
    }
}