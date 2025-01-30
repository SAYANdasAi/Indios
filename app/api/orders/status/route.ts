import { client } from "@/sanity/lib/client";
import { NextResponse } from "next/server";

export async function PATCH(req: Request) {
    try {
        const body = await req.json();
        const { orderId, status } = body;

        if (!orderId || !status) {
            return NextResponse.json(
                { error: 'Order ID and status are required' },
                { status: 400 }
            );
        }

        // Validate status
        const validStatuses = ['pending', 'processing', 'paid', 'shipped', 'delivered', 'cancelled'];
        if (!validStatuses.includes(status)) {
            return NextResponse.json(
                { error: 'Invalid status' },
                { status: 400 }
            );
        }

        // Update order status in Sanity
        const updatedOrder = await client
            .patch(orderId)
            .set({ status })
            .commit();

        return NextResponse.json({ order: updatedOrder });
    } catch (error) {
        console.error('Error updating order status:', error);
        return NextResponse.json(
            { error: 'Failed to update order status' },
            { status: 500 }
        );
    }
}
