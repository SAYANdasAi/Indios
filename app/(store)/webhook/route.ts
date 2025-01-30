import { NextResponse } from "next/server";
import crypto from "crypto";
import { client } from "@/sanity/lib/client";

export async function POST(req: Request) {
    try {
        const body = await req.text();
        const razorpaySignature = req.headers.get('x-razorpay-signature');

        if (!razorpaySignature) {
            return NextResponse.json(
                { error: "No Razorpay signature found" },
                { status: 400 }
            );
        }

        // Verify webhook signature
        const expectedSignature = crypto
            .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
            .update(body)
            .digest("hex");

        if (expectedSignature !== razorpaySignature) {
            return NextResponse.json(
                { error: "Invalid signature" },
                { status: 400 }
            );
        }

        const webhookBody = JSON.parse(body);
        const { payload } = webhookBody;
        const { payment } = payload;

        if (webhookBody.event === "payment.captured") {
            // Payment successful, update order status
            const { order_id, id: payment_id } = payment.entity;

            // Find the order in Sanity by Razorpay order ID
            const order = await client.fetch(
                `*[_type == "order" && orderId == $orderId][0]`,
                { orderId: order_id }
            );

            if (!order) {
                return NextResponse.json(
                    { error: "Order not found" },
                    { status: 404 }
                );
            }

            // Update order status in Sanity
            await client
                .patch(order._id)
                .set({
                    status: "paid",
                    paymentId: payment_id,
                    updatedAt: new Date().toISOString(),
                })
                .commit();

            return NextResponse.json(
                { message: "Payment successful and order updated" },
                { status: 200 }
            );
        }

        // Handle payment failed event
        if (webhookBody.event === "payment.failed") {
            const { order_id } = payment.entity;

            const order = await client.fetch(
                `*[_type == "order" && orderId == $orderId][0]`,
                { orderId: order_id }
            );

            if (!order) {
                return NextResponse.json(
                    { error: "Order not found" },
                    { status: 404 }
                );
            }

            // Update order status to failed
            await client
                .patch(order._id)
                .set({
                    status: "cancelled",
                    updatedAt: new Date().toISOString(),
                })
                .commit();

            return NextResponse.json(
                { message: "Payment failed and order updated" },
                { status: 200 }
            );
        }

        // For any other events
        return NextResponse.json(
            { message: "Webhook received but no action taken" },
            { status: 200 }
        );
    } catch (error) {
        console.error("Webhook error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
