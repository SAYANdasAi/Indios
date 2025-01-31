import { NextResponse } from "next/server";
import razorpay from "@/lib/razorpay";

export async function POST(req: Request) {
    try {
        // Ensure we have the required environment variables
        if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
            return NextResponse.json(
                { error: "Razorpay configuration is missing" },
                { status: 500 }
            );
        }

        // Parse request body
        const body = await req.json();
        const { amount, orderId } = body;

        if (!amount || !orderId) {
            return NextResponse.json(
                { error: "Amount and orderId are required" },
                { status: 400 }
            );
        }

        // Create Razorpay order
        const order = await razorpay.orders.create({
            amount: Math.round(amount), // Amount should already be in paise
            currency: "INR",
            receipt: orderId,
        });

        // Return the order details needed for frontend
        return NextResponse.json({
            id: order.id,
            amount: order.amount,
            currency: order.currency,
        });
    } catch (error) {
        console.error("Error creating Razorpay order:", error);
        
        // Return a proper error response
        return NextResponse.json(
            { error: "Failed to create payment order" },
            { status: 500 }
        );
    }
}
