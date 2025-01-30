import { format } from "date-fns";
import Image from "next/image";
import { imageUrl } from "@/lib/imageUrl";
// import OrderCard from "@/components/OrderCard";

interface OrderItem {
    _key: string;
    product: {
        _ref: string;
        _type: "reference";
        name?: string;
        price?: number;
        /* eslint-disable @typescript-eslint/no-explicit-any */
        image?: any;
    };
    quantity: number;
}

interface OrderCardProps {
    order: {
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
    };
}

function getStatusColor(status: string) {
    switch (status) {
        case "paid":
            return "bg-green-100 text-green-800";
        case "cancelled":
            return "bg-red-100 text-red-800";
        case "shipped":
            return "bg-blue-100 text-blue-800";
        case "delivered":
            return "bg-purple-100 text-purple-800";
        default:
            return "bg-yellow-100 text-yellow-800";
    }
}

export default function OrderCard({ order }: OrderCardProps) {
    return (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="p-4 border-b">
                <div className="flex flex-wrap justify-between items-center gap-4">
                    <div>
                        <h2 className="text-lg font-semibold">
                            Order #{order.orderNumber}
                        </h2>
                        <p className="text-sm text-gray-600">
                            {format(new Date(order.orderDate), "PPP")}
                        </p>
                    </div>
                    <div className={`px-4 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
                        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                    </div>
                </div>
            </div>

            <div className="p-4">
                <div className="space-y-4">
                    {order.products.map((item) => (
                        <div key={item._key} className="flex items-center gap-4">
                            <div className="relative w-20 h-20 flex-shrink-0">
                                {item.product.image && (
                                    <Image
                                        src={imageUrl(item.product.image).url()}
                                        alt={item.product.name || "Product"}
                                        fill
                                        className="object-cover rounded-md"
                                    />
                                )}
                            </div>
                            <div className="flex-grow">
                                <h3 className="font-medium">{item.product.name}</h3>
                                <p className="text-sm text-gray-600">
                                    Quantity: {item.quantity}
                                </p>
                                <p className="text-sm font-medium">
                                    ₹{(item.product.price || 0) * item.quantity}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="mt-6 border-t pt-4">
                    <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Subtotal</span>
                            <span>₹{order.totalPrice}</span>
                        </div>
                        {order.amountDiscounted > 0 && (
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-600">Discount</span>
                                <span className="text-red-500">-₹{order.amountDiscounted}</span>
                            </div>
                        )}
                        <div className="flex justify-between font-medium text-lg">
                            <span>Total</span>
                            <span>₹{order.totalPrice - (order.amountDiscounted || 0)}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
