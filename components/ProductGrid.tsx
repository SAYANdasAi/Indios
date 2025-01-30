"use client";
import { Product } from "@/sanity.types";
import { AnimatePresence, motion } from "framer-motion";
import ProductThumb from "./ProductThumb";
// import WishlistButton from "./WishlistButton";
// import { imageUrl } from "@/lib/imageUrl";
// import Image from "next/image";
// import Link from "next/link";

function ProductGrid({ products = [] } : { products?: Product | Product[] | null }) {
    // Convert single product to array or handle null/undefined
    const productArray = Array.isArray(products) ? products : products ? [products] : [];

    if (!productArray.length) {
        return (
            <div className="text-center py-10">
                <p className="text-gray-500">No products found</p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 max-w-[1600px] mx-auto px-4">
            {productArray.map((product) => (
                <AnimatePresence key={product._id}>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="flex justify-center"
                    >
                        <ProductThumb product={product} />
                    </motion.div>
                </AnimatePresence>
            ))}
        </div>
    );
}

export default ProductGrid;