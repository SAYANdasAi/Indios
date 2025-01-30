import { client } from "@/sanity/lib/client";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
    try {
        const body = await req.json();
        console.log('Request body:', body);
        
        const { 
            orderId, 
            items, 
            total, 
            paymentId,
            billingAddress,
            userId,
            userEmail,
            paymentMethod = 'whatsapp', 
            razorpayOrderId = ''
        } = body;

        if (!process.env.SANITY_API_TOKEN) {
            console.error('Missing SANITY_API_TOKEN');
            return NextResponse.json(
                { error: 'Server configuration error' },
                { status: 500 }
            );
        }

        console.log('Billing address:', billingAddress);
        console.log('Items:', items);

        // Ensure billing address has all required fields
        if (!billingAddress || 
            !billingAddress.fullName ||
            !billingAddress.addressLine1 ||
            !billingAddress.city ||
            !billingAddress.state ||
            typeof billingAddress.postalCode !== 'number' ||
            typeof billingAddress.phone !== 'number') {
            console.log('Invalid billing address fields:', {
                fullName: billingAddress?.fullName,
                addressLine1: billingAddress?.addressLine1,
                city: billingAddress?.city,
                state: billingAddress?.state,
                postalCode: typeof billingAddress?.postalCode,
                phone: typeof billingAddress?.phone
            });
            return NextResponse.json(
                { error: 'Invalid billing address' },
                { status: 400 }
            );
        }

        // Create the order data first
        const orderData = {
            _type: 'order',
            orderNumber: orderId,
            orderDate: new Date().toISOString(),
            status: 'pending',
            totalPrice: total,
            currency: 'INR',
            paymentMethod,
            paymentId,
            razorpayOrderId,
            clerkUserId: userId,
            customerName: billingAddress.fullName,
            email: userEmail,
            billingAddress: {
                fullName: billingAddress.fullName,
                addressLine1: billingAddress.addressLine1,
                addressLine2: billingAddress.addressLine2 || '',
                city: billingAddress.city,
                state: billingAddress.state,
                postalCode: Number(billingAddress.postalCode),
                phone: Number(billingAddress.phone)
            },
            /* eslint-disable @typescript-eslint/no-explicit-any */
            products: items.map((item: any) => ({
                _type: 'object',
                _key: `${item.product._id}-${new Date().getTime()}`,
                product: {
                    _type: 'reference',
                    _ref: item.product._id,
                },
                quantity: item.quantity
            }))
        };

        console.log('Order data to create:', orderData);

        try {
            // Create order document in Sanity
            const order = await client.create(orderData);
            console.log('Created order:', order);
            /* eslint-disable @typescript-eslint/no-explicit-any */
            return NextResponse.json({ orderId: order._id });
        } catch (sanityError: any) {
            console.error('Sanity error:', sanityError);
            return NextResponse.json(
                { error: sanityError.message || 'Failed to create order in Sanity' },
                { status: 500 }
            );
        }
        /* eslint-disable @typescript-eslint/no-explicit-any */
    } catch (error: any) {
        console.error('Error creating order:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to create order' },
            { status: 500 }
        );
    }
}
