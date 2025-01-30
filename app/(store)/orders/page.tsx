"use client";

import { useUser } from "@clerk/nextjs";
import { useEffect, useState } from "react";
import { client } from "@/sanity/lib/client";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import OrderCard from "@/components/OrderCard";

interface OrderItem {
    _key: string;
    product: {
        _ref: string;
        _type: "reference";
        name?: string;
        price?: number;
        /* eslint-disable @typescript-eslint/no-explicit-any */
        image?:any;
    };
    quantity: number;
}

interface Order {
    _id: string;
    orderNumber: string;
    orderDate: string;
    status: "pending" | "paid" | "shipped" | "delivered" | "cancelled";
    amount: number;
    amountDiscounted: number;
    totalPrice: number;
    deliveryCharge: number;
    products: OrderItem[];
    currency: string;
}

export default function OrdersPage() {
    const { user } = useUser();
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchOrders() {
            if (!user) return;

            try {
                const result = await client.fetch<Order[]>(`
                    *[_type == "order" && clerkUserId == $userId] | order(orderDate desc) {
                        _id,
                        orderNumber,
                        orderDate,
                        status,
                        totalPrice,
                        deliveryCharge,
                        currency,
                        amountDiscounted,
                        currency,
                        "products": products[] {
                            _key,
                            quantity,
                            "product": product-> {
                                _id,
                                name,
                                price,
                                image
                            }
                        }
                    }
                `, { userId: user.id });

                setOrders(result);
            } catch (error) {
                console.error("Error fetching orders:", error);
            } finally {
                setLoading(false);
            }
        }

        fetchOrders();
    }, [user]);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[50vh]">
                <Loader2 className="w-8 h-8 animate-spin text-red-500" />
            </div>
        );
    }

    if (!user) {
        return (
            <div className="container mx-auto p-4">
                <div className="text-center py-10">
                    <h1 className="text-2xl font-bold mb-4">Please Sign In</h1>
                    <p className="text-gray-600">You need to be signed in to view your orders.</p>
                </div>
            </div>
        );
    }

    if (orders.length === 0) {
        return (
            <div className="container mx-auto p-4">
                <div className="text-center py-10">
                    <h1 className="text-2xl font-bold mb-4">No Orders Found</h1>
                    <p className="text-gray-600 mb-4">You have not placed any orders yet.</p>
                    <Link href="/">
                        <button className="bg-red-500 text-white px-6 py-2 rounded-md hover:bg-red-600 transition-colors">
                            Start Shopping
                        </button>
                    </Link>
                </div>
            </div>
        );
    }

    const totalAmount = orders.reduce((total, order) => total + order.amount, 0);
    const totalDiscountedAmount = orders.reduce((total, order) => total + order.amountDiscounted, 0);

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-2xl font-bold mb-6">Your Orders</h1>
            <div className="mb-6">
                <p className="text-lg">Total: {totalAmount.toFixed(2)} {orders[0]?.currency}</p>
                <p className="text-lg">Subtotal: {totalDiscountedAmount.toFixed(2)} {orders[0]?.currency}</p>
            </div>
            <div className="space-y-6">
                {orders.map((order) => (
                    <OrderCard key={order._id} order={order} />
                ))}
            </div>
        </div>
    );
}