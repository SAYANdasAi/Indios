"use client";
import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
// import useBasketStore from "@/store/store";

function SuccessPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const paymentId = searchParams.get("payment_id");
    const orderId = searchParams.get("order_id");
    const orderNumber = searchParams.get("order_number");
    const [timeLeft, setTimeLeft] = useState(120); // 2 minutes in seconds

    // Format time to mm:ss
    const formatTime = (seconds: number) => {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
    };

    // Redirect if no payment information
    useEffect(() => {
        if (!paymentId || !orderId || !orderNumber) {
            router.push("/");
        }
    }, [paymentId, orderId, orderNumber, router]);

    // Clear basket and handle redirect timer
    useEffect(() => {
        if (paymentId && orderId) {
            // Update order status to paid
            fetch('/api/orders/status', {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    orderId,
                    status: 'paid'
                }),
            }).catch(error => {
                console.error('Failed to update order status:', error);
            });

            // Auto redirect after 2 minutes
            const timer = setInterval(() => {
                setTimeLeft((prev) => {
                    if (prev <= 1) {
                        clearInterval(timer);
                        router.push("/");
                    }
                    return prev - 1;
                });
            }, 1000);

            return () => clearInterval(timer);
        }
    }, [paymentId, orderId, router]);

    if (!paymentId || !orderId || !orderNumber) {
        return null;
    }

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 py-12">
            <div className="bg-white p-8 md:p-12 rounded-xl shadow-lg max-w-2xl w-full mx-4">
                <div className="flex justify-center mb-8">
                    <div className="h-16 w-16 bg-green-100 rounded-full flex items-center justify-center">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-8 w-8 text-green-600"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M5 13l4 4L19 7"
                            />
                        </svg>
                    </div>
                </div>

                <h1 className="text-4xl font-bold mb-6 text-center text-gray-900">
                    Thank You for Your Order!
                </h1>

                <div className="border-t border-b border-gray-200 py-6 mb-6">
                    <p className="text-lg text-gray-700 mb-6 text-center">
                        Your payment was successful and your order has been confirmed.
                    </p>
                    <div className="space-y-3">
                        <p className="text-gray-600 flex items-center justify-between">
                            <span className="font-medium">Order Number:</span>
                            <span className="font-mono text-sm bg-gray-100 px-3 py-1 rounded">
                                {orderNumber}
                            </span>
                        </p>
                        <p className="text-gray-600 flex items-center justify-between">
                            <span className="font-medium">Payment ID:</span>
                            <span className="font-mono text-sm bg-gray-100 px-3 py-1 rounded">
                                {paymentId}
                            </span>
                        </p>
                        <p className="text-gray-600 flex items-center justify-between">
                            <span className="font-medium">Order ID:</span>
                            <span className="font-mono text-sm bg-gray-100 px-3 py-1 rounded">
                                {orderId}
                            </span>
                        </p>
                    </div>
                </div>

                <div className="text-center mb-6">
                    <p className="text-sm text-gray-500">
                        Redirecting to home page in {formatTime(timeLeft)}
                    </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Link href="/" className="inline-block">
                        <button className="w-full px-6 py-3 text-sm font-medium text-white bg-red-500 rounded-md hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2">
                            Continue Shopping
                        </button>
                    </Link>
                    <Link href="/orders" className="inline-block">
                        <button className="w-full px-6 py-3 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2">
                            View Orders
                        </button>
                    </Link>
                </div>
            </div>
        </div>
    );
}

export default SuccessPage;