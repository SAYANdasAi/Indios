"use client";

import { useEffect, useState } from "react";
import useWishlistStore from "@/store/wishlistStore";
import Link from "next/link";
import ProductThumb from "@/components/ProductThumb";

function WishlistPage() {
    const [isClient, setIsClient] = useState(false);
    const { items: wishlistItems } = useWishlistStore();

    useEffect(() => {
        setIsClient(true);
    }, []);

    if (!isClient) {
        return (
            <div className="flex justify-center items-center min-h-[50vh]">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-500"></div>
            </div>
        );
    }

    if (wishlistItems.length === 0) {
        return (
            <div className="container mx-auto p-4 flex flex-col items-center justify-center min-h-[50vh]">
                <h1 className="text-2xl font-bold mb-6 text-gray-800">Your Wishlist</h1>
                <p className="text-gray-600 text-lg mb-4">Your wishlist is empty</p>
                <Link href="/">
                    <button className="px-6 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors">
                        Continue Shopping
                    </button>
                </Link>
            </div>
        );
    }

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-2xl font-bold mb-6 text-gray-800">Your Wishlist</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {wishlistItems.map((product) => (
                    <ProductThumb key={product._id} product={product} />
                ))}
            </div>
        </div>
    );
}

export default WishlistPage;
