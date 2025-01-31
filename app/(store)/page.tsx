import ProductsView from "@/components/ProductsView";
import { getAllProducts } from "@/sanity/lib/products/getAllProducts";
import { getAllCategories } from "@/sanity/lib/products/getAllCategories";
import BlackFridayBanner from "@/components/BlackFridayBanner";

export const dynamic = "force-static";
export const revalidate = 60;

export default async function Home() {
  const products = await getAllProducts();
  const categories = await getAllCategories();

  const logId = crypto.randomUUID().slice(0, 5);
  console.log(
    `${logId} >>>>> Referenced the product page cache for ${products.length} products and ${categories.length} categories`
  );

  return (
    <div className="w-full max-w-screen-xl mx-auto">
      <BlackFridayBanner />

      <div className="flex flex-col items-center justify-start bg-gray-100 p-4 sm:p-6 md:p-8">
        <ProductsView products={products} categories={categories} />
      </div>
    </div>
  );
}
