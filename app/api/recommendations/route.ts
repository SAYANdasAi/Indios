import { client } from "@/sanity/lib/client";
import { NextResponse } from "next/server";
import { imageUrl } from "@/lib/imageUrl";

interface OrderProduct {
    product: {
        _ref: string;
    };
    quantity: number;
}

interface Order {
    _id: string;
    products: OrderProduct[];
}

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const userId = searchParams.get('userId');
        const currentProductId = searchParams.get('productId');

        if (!userId) {
            return NextResponse.json(
                { error: 'User ID is required' },
                { status: 400 }
            );
        }

        // Get user's order history with product categories
        const orders = await client.fetch<Order[]>(`
            *[_type == "order" && clerkUserId == $userId] {
                _id,
                products[] {
                    product->{
                        _id,
                        categories[]->{
                            _id,
                            name
                        },
                        name,
                        price,
                        image,
                        description
                    },
                    quantity
                }
            }
        `, { userId });

        // Get the current product's categories if productId is provided
        let currentProductCategories = [];
        if (currentProductId) {
            const currentProduct = await client.fetch(`
                *[_type == "product" && _id == $productId][0] {
                    categories[]->{
                        _id,
                        name
                    }
                }
            `, { productId: currentProductId });
            currentProductCategories = currentProduct?.categories || [];
        }

        // Get all products with their categories
        const allProducts = await client.fetch(`
            *[_type == "product"] {
                _id,
                name,
                price,
                categories[]->{
                    _id,
                    name
                },
                image,
                description
            }
        `);

        // Create a map of category IDs and their purchase frequencies
        const categoryFrequency: { [key: string]: number } = {};
        const purchasedProducts = new Set<string>();

        // Analyze order history
        orders.forEach(order => {
            order.products.forEach(item => {
                const product = item.product;
                if (product) {
                    product.categories?.forEach(category => {
                        categoryFrequency[category._id] = (categoryFrequency[category._id] || 0) + item.quantity;
                    });
                    purchasedProducts.add(product._id);
                }
            });
        });

        // Filter out products the user has already purchased
        const availableProducts = allProducts.filter((product: any) => !purchasedProducts.has(product._id));

        // Score and sort products
        const scoredProducts = availableProducts.map((product: any) => {
            let score = 0;

            // Category matching score
            if (currentProductCategories.length > 0) {
                product.categories?.forEach((category: any) => {
                    if (currentProductCategories.some(cc => cc._id === category._id)) {
                        score += 3; // High score for matching categories
                    }
                });
            }

            // Category frequency score
            product.categories?.forEach((category: any) => {
                score += (categoryFrequency[category._id] || 0) * 0.5;
            });

            return {
                ...product,
                score
            };
        });

        // Sort by score and take top 6 recommendations
        const recommendations = scoredProducts
            .sort((a: any, b: any) => b.score - a.score)
            .slice(0, 6)
            .map((product: any) => ({
                _id: product._id,
                name: product.name,
                price: product.price,
                categories: product.categories,
                image: product.image ? imageUrl(product.image).url() : null,
                description: product.description
            }));

        return NextResponse.json({ recommendations });
    } catch (error) {
        console.error('Error getting recommendations:', error);
        return NextResponse.json(
            { error: 'Failed to get recommendations' },
            { status: 500 }
        );
    }
}