import { client } from "@/sanity/lib/client";
import { NextResponse } from "next/server";

export async function PATCH(req: Request) {
    try {
        const body = await req.json();
        const { orderId, status, razorpayPaymentId } = body;

        if (!orderId || !status) {
            return NextResponse.json(
                { error: "Order ID and status are required" },
                { status: 400 }
            );
        }

        // Update the order in Sanity
        const updatedOrder = await client
            .patch(orderId)
            .set({
                status: status,
                ...(razorpayPaymentId && { razorpayPaymentId: razorpayPaymentId })
            })
            .commit();

        return NextResponse.json({ success: true, order: updatedOrder });
    } catch (error) {
        console.error("Error updating order status:", error);
        return NextResponse.json(
            { error: "Failed to update order status" },
            { status: 500 }
        );
    }
}
