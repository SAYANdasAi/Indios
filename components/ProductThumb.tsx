import { Product } from "@/sanity.types";
import Link from "next/link";
import Image from "next/image";
import { imageUrl } from "@/lib/imageUrl";
import WishlistButton from "./WishlistButton";

interface ProductThumbProps {
    product: Product;
    children?: React.ReactNode;
}

function ProductThumb({ product, children }: ProductThumbProps) {
    const isOutOfStock = product.stock != null && product.stock <= 0;
    const productImage = product.image;

    return (
        <div className={`group w-full flex flex-col bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-lg transition-all duration-200 overflow-hidden ${isOutOfStock ? "opacity-50" : ""}`}>
            <div className="relative aspect-square w-full overflow-hidden bg-gray-50">
                {children || (
                    <>
                        <Link href={`/product/${product.slug?.current}`} className="block w-full h-full">
                            {productImage?.asset && (
                                <Image 
                                    className="object-cover w-full h-full transition-transform duration-300 group-hover:scale-105"
                                    src={imageUrl(productImage).url()}
                                    alt={product.name || "Product image"}
                                    width={500}
                                    height={500}
                                    layout="responsive"
                                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                    priority={false}
                                />
                            )}
                        </Link>
                        <div className="absolute top-4 right-4 z-10">
                            <WishlistButton product={product} />
                        </div>
                    </>
                )}

                {isOutOfStock && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 z-20">
                        <span className="text-white font-bold text-xl">Out of Stock</span>
                    </div>
                )}
            </div>

            <div className="p-6">
                <Link href={`/product/${product.slug?.current}`}>
                    <h2 className="text-xl font-semibold text-gray-800 truncate hover:text-red-500">
                        {product.name}
                    </h2>
                </Link>
                <p className="mt-3 text-base text-gray-600 line-clamp-2">
                    {product.description?.map((block) => 
                        block._type === "block"
                        ? block.children?.map((child) => child.text).join("")
                        : ""
                    ).join("") || "No description available"}
                </p>
                <div className="mt-4 flex items-center justify-between">
                    <p className="text-2xl font-bold text-gray-900">
                        ₹{product.price?.toFixed(2)}
                    </p>
                </div>
            </div>
        </div>
    );
}

export default ProductThumb;