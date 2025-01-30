"use client";

import { useUser } from "@clerk/nextjs";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

interface Category {
    _id: string;
    name: string;
}

interface Product {
    _id: string;
    name: string;
    price: number;
    image: string | null;
    categories: Category[];
    description: string;
}

interface ProductRecommendationsProps {
    currentProductId?: string;
}

export default function ProductRecommendations({ currentProductId }: ProductRecommendationsProps) {
    const { user } = useUser();
    const [recommendations, setRecommendations] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchRecommendations = async () => {
            if (!user) return;

            try {
                const params = new URLSearchParams({
                    userId: user.id,
                    ...(currentProductId && { productId: currentProductId })
                });

                const response = await fetch(`/api/recommendations?${params}`);
                const data = await response.json();

                if (data.recommendations) {
                    setRecommendations(data.recommendations);
                }
            } catch (error) {
                console.error('Error fetching recommendations:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchRecommendations();
    }, [user, currentProductId]);

    if (loading) {
        return (
            <div className="w-full py-8">
                <div className="container mx-auto px-4">
                    <div className="animate-pulse flex flex-col space-y-4">
                        <div className="h-6 bg-gray-200 rounded w-1/4"></div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                            {[...Array(4)].map((_, i) => (
                                <div key={i} className="bg-gray-100 rounded-lg p-4">
                                    <div className="aspect-square bg-gray-200 rounded-lg mb-4"></div>
                                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (recommendations.length === 0) {
        return null;
    }

    return (
        <div className="w-full py-8 bg-gray-50">
            <div className="container mx-auto px-4">
                <h2 className="text-2xl font-bold mb-6">Recommended for You</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {recommendations.map((product) => (
                        <Link 
                            key={product._id} 
                            href={`/product/${product._id}`}
                            className="group bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200"
                        >
                            <div className="aspect-square relative overflow-hidden rounded-t-lg">
                                {product.image && (
                                    <Image
                                        src={product.image}
                                        alt={product.name}
                                        fill
                                        className="object-cover group-hover:scale-105 transition-transform duration-200"
                                    />
                                )}
                            </div>
                            <div className="p-4">
                                <h3 className="font-semibold text-lg mb-1 group-hover:text-red-500 transition-colors">
                                    {product.name}
                                </h3>
                                <p className="text-gray-600">₹{product.price}</p>
                                <div className="mt-2 flex flex-wrap gap-2">
                                    {product.categories?.map(category => (
                                        <span 
                                            key={category._id}
                                            className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded"
                                        >
                                            {category.name}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    );
}
