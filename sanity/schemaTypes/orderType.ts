import { BasketIcon } from "@sanity/icons";
import { defineArrayMember, defineField, defineType } from "sanity";

export const orderType = defineType({
    name: "order",
    title: "Order",
    type: "document",
    icon: BasketIcon,
    fields: [
        defineField({
            name: "orderNumber",
            title: "Order Number",
            type: "string",
            validation: (Rule) => Rule.required(),
        }),
        defineField({
            name: "paymentMethod",
            title: "Payment Method",
            type: "string",
            options: {
                list: [
                    { title: "WhatsApp", value: "whatsapp" },
                    { title: "Razorpay", value: "razorpay" }
                ]
            },
            validation: (Rule) => Rule.required(),
        }),
        defineField({
            name: "paymentId",
            title: "Payment ID",
            type: "string",
            validation: (Rule) => Rule.required(),
        }),
        defineField({
            name: "razorpayOrderId",
            title: "Razorpay Order ID",
            type: "string",
        }),
        defineField({
            name: "clerkUserId",
            title: "Store User ID",
            type: "string",
            validation: (Rule) => Rule.required(),
        }),
        defineField({
            name: "customerName",
            title: "Customer Name",
            type: "string",
            validation: (Rule) => Rule.required(),
        }),
        defineField({
            name: "email",
            title: "Customer Email",
            type: "string",
            validation: (Rule) => Rule.required().email(),
        }),
        defineField({
            name: "billingAddress",
            title: "Billing Address",
            type: "object",
            fields: [
                defineField({
                    name: "fullName",
                    title: "Full Name",
                    type: "string",
                    validation: (Rule) => Rule.required(),
                }),
                defineField({
                    name: "addressLine1",
                    title: "Address Line 1",
                    type: "string",
                    validation: (Rule) => Rule.required(),
                }),
                defineField({
                    name: "addressLine2",
                    title: "Address Line 2",
                    type: "string",
                }),
                defineField({
                    name: "city",
                    title: "City",
                    type: "string",
                    validation: (Rule) => Rule.required(),
                }),
                defineField({
                    name: "state",
                    title: "State",
                    type: "string",
                    validation: (Rule) => Rule.required(),
                }),
                defineField({
                    name: "postalCode",
                    title: "Postal Code",
                    type: "number",
                    validation: (Rule) => Rule.required().min(0),
                }),
                defineField({
                    name: "phone",
                    title: "Phone",
                    type: "number",
                    validation: (Rule) => Rule.required().min(0),
                }),
            ],
        }),
        defineField({
            name: "products",
            title: "Products",
            type: "array",
            of: [
                defineArrayMember({
                    type: "object",
                    fields: [
                        defineField({
                            name: "product",
                            title: "Product",
                            type: "reference",
                            to: [{ type: "product" }],
                            validation: (Rule) => Rule.required(),
                        }),
                        defineField({
                            name: "quantity",
                            title: "Quantity Purchased",
                            type: "number",
                            validation: (Rule) => Rule.required().min(1),
                        }),
                    ],
                    preview: {
                        select: {
                            title: 'product.name',
                            quantity: 'quantity',
                            media: 'product.images.0',
                            price: 'product.price'
                        },
                        prepare(selection: any) {
                            const { title, quantity, media, price } = selection;
                            return {
                                title: title || 'Untitled Product',
                                subtitle: `Qty: ${quantity || 0} × ₹${price || 0} = ₹${(quantity || 0) * (price || 0)}`,
                                media: media
                            };
                        },
                    },
                }),
            ],
            validation: (Rule) => Rule.required(),
        }),
        defineField({
            name: "totalPrice",
            title: "Total Price",
            type: "number",
            validation: (Rule) => Rule.required(),
        }),
        defineField({
            name: "currency",
            title: "Currency",
            type: "string",
            validation: (Rule) => Rule.required(),
        }),
        defineField({
            name: "status",
            title: "Order Status",
            type: "string",
            options: {
                list: [
                    { title: "Pending", value: "pending" },
                    { title: "Processing", value: "processing" },
                    { title: "Shipped", value: "shipped" },
                    { title: "Delivered", value: "delivered" },
                    { title: "Cancelled", value: "cancelled" },
                ],
            },
            validation: (Rule) => Rule.required(),
        }),
        defineField({
            name: "orderDate",
            title: "Order Date",
            type: "datetime",
            validation: (Rule) => Rule.required(),
        }),
    ],
    preview: {
        select: {
            orderNumber: 'orderNumber',
            customerName: 'customerName',
            totalPrice: 'totalPrice',
            status: 'status',
            media: 'products.0.product.images.0'
        },
        prepare(selection: any) {
            const { orderNumber, customerName, totalPrice, status, media } = selection;
            return {
                title: `Order #${orderNumber}`,
                subtitle: `${customerName} - ₹${totalPrice} - ${status?.charAt(0).toUpperCase()}${status?.slice(1)}`,
                media: media
            };
        },
    }
});