'use server';

import { imageUrl } from "@/lib/imageUrl";
import { BasketItem } from "@/store/store";
import razorpay from "@/lib/razorpay";

export type Metadata = {
    orderNumber: string;
    customerName: string;
    customerEmail: string;
    clerkUserId: string;
};

export type GroupedBasketItem = {
    product: BasketItem["product"];
    quantity: number;
}

export async function createCheckoutSession(
    items: GroupedBasketItem[],
    metadata: Metadata,
) {
    try {
        console.log("Creating checkout session with items:", items);
        
        const itemsWithoutPrice = items.filter((item) => !item.product.price);
        if (itemsWithoutPrice.length > 0) {
            throw new Error("Some items do not have a price");
        }

        // Calculate total amount
        const amount = items.reduce((total, item) => {
            return total + (item.product.price! * item.quantity);
        }, 0);

        console.log("Calculated amount:", amount);

        if (!process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID) {
            throw new Error("NEXT_PUBLIC_RAZORPAY_KEY_ID is not set");
        }

        // Create Razorpay order
        const order = await razorpay.orders.create({
            amount: Math.round(amount * 100), // Amount in paise
            currency: "INR",
            receipt: metadata.orderNumber,
            notes: {
                customerName: metadata.customerName,
                customerEmail: metadata.customerEmail,
                clerkUserId: metadata.clerkUserId,
                orderNumber: metadata.orderNumber,
                items: JSON.stringify(items.map(item => ({
                    id: item.product._id,
                    name: item.product.name,
                    quantity: item.quantity,
                    price: item.product.price
                })))
            }
        });

        console.log("Razorpay order created:", order);

        // Return data needed for Razorpay frontend integration
        const response = {
            key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
            amount: order.amount,
            currency: order.currency,
            id: order.id,
            notes: {
                orderNumber: metadata.orderNumber,
                customerName: metadata.customerName,
                customerEmail: metadata.customerEmail,
                clerkUserId: metadata.clerkUserId
            }
        };

        console.log("Returning response:", response);
        return response;

    } catch (error) {
        console.error("Error in createCheckoutSession:", error);
        throw error;
    }
}