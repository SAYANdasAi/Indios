"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import useBasketStore from "@/store/store";
import Image from "next/image";
import { Loader2, X } from "lucide-react";
import { useUser } from "@clerk/nextjs";
import Script from "next/script";
import { QRCodeSVG } from 'qrcode.react';
import useOrderStore from "@/store/orderStore";
import { urlFor } from "@/sanity/lib/image";

declare global {
    interface Window {
        /* eslint-disable @typescript-eslint/no-explicit-any */
        Razorpay: any;
    }
}

// Helper function to generate unique ID
// const generateId = () => {
//     return Math.random().toString(36).substring(2) + Date.now().toString(36);
// };

// Format currency
const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        minimumFractionDigits: 0,
    }).format(amount);
};

// Generate UPI URLuserId: string
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const generateUPIUrl = (amount: number, orderId: string, _name:string ) => {
    const upiId = process.env.NEXT_PUBLIC_YOUR_UPI_ID;
    const merchantName = "Indios Store";
    return `upi://pay?pa=${upiId}&pn=${merchantName}&am=${amount}&tn=Order%20${orderId}&cu=INR`;
};


export default function PaymentPage() {
    const searchParams = useSearchParams();
    const orderId = searchParams.get("orderId");
    const { items, getTotalPrice, clearBasket } = useBasketStore();
    const { addOrder } = useOrderStore();
    const total = getTotalPrice();
    const [loading, setLoading] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState<"whatsapp" | "razorpay" | null>(null);
    const [showQRModal, setShowQRModal] = useState(false);
    // const [paymentConfirmed, setPaymentConfirmed] = useState(false);
    const [billingAddress, setBillingAddress] = useState<any>(null);
    const { user } = useUser();
    const router = useRouter();

    useEffect(() => {
        // Generate a numeric order ID if not provided
        if (!orderId) {
            const numericOrderId = Date.now().toString();
            router.push(`/payment?orderId=${numericOrderId}`);
        }
        // Get billing address from sessionStorage
        const storedBillingAddress = sessionStorage.getItem('billingAddress');
        if (storedBillingAddress) {
            setBillingAddress(JSON.parse(storedBillingAddress));
        } else {
            // Redirect back to billing if no address is found
            router.push('/billing');
        }
    }, [orderId, router]);

    const handleWhatsAppPayment = async () => {
        if (!user || !orderId) return;
        setPaymentMethod("whatsapp");
        setShowQRModal(true);
    };

    const handlePaymentConfirmation = async () => {
        setLoading(true);
        try {
            // Generate a payment ID for WhatsApp payment
            const whatsappPaymentId = `WP${Date.now()}`;
            
            // Create order in Sanity
            const response = await fetch('/api/orders', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    orderId,
                    items: items.map(item => ({
                        product: {
                            _id: item.product._id,
                            name: item.product.name || 'Unnamed Product', 
                            price: item.product.price || 0,
                            image: item.product.image ? {
                                url: urlFor(item.product.image).url()
                            } : null
                        },
                        quantity: item.quantity
                    })),
                    total,
                    paymentId: whatsappPaymentId,
                    paymentMethod: 'whatsapp',
                    billingAddress,
                    userId: user?.id,
                    userEmail: user?.emailAddresses[0]?.emailAddress
                }),
            });

            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.error || 'Failed to create order');
            }

            // Update order status to processing
            const updateResponse = await fetch('/api/orders/status', {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    orderId: data.orderId,
                    status: 'processing'
                }),
            });

            if (!updateResponse.ok) {
                console.error('Failed to update order status');
            }

            // Generate WhatsApp message with billing address
            const message = [
                `*Order #${orderId}*`,
                `*Name:* ${billingAddress?.fullName || user?.fullName}`,
                `*Email:* ${user?.emailAddresses[0]?.emailAddress}`,
                `*Phone:* ${billingAddress?.phone}`,
                '',
                '*Shipping Address:*',
                billingAddress?.addressLine1,
                billingAddress?.addressLine2,
                `${billingAddress?.city}, ${billingAddress?.state}`,
                billingAddress?.postalCode,
                '',
                '*Items:*',
                ...items.map(item => `• ${item.product.name} x${item.quantity} - ₹${(item.product.price || 0) * item.quantity}`),
                '',
                `*Total Amount:* ₹${total}`,
                '',
                '*Payment Status:* Processing'
            ].filter(Boolean).join('\n');
            
            // Get WhatsApp number (remove + if present)
            const phoneNumber = process.env.NEXT_PUBLIC_YOUR_WHATSAPP_NUMBER?.replace(/^\+/, '');
            
            if (!phoneNumber) {
                console.error('WhatsApp number not configured');
                return;
            }
            
            // Create WhatsApp URL with properly encoded message
            const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
            
            // Open WhatsApp after a short delay to ensure success page loads first
            setTimeout(() => {
                window.open(whatsappUrl, '_blank');
            }, 1500);

            // Add order to local store
            addOrder({
                id: data.orderId || orderId || '',
                items: items.map(item => ({
                    product: {
                        _id: item.product._id,
                        name: item.product.name || 'Unnamed Product', 
                        price: item.product.price || 0,
                        image: item.product.image ? {
                            url: urlFor(item.product.image).url()
                        } : null
                    },
                    quantity: item.quantity
                })),
                total,
                status: 'processing',
                date: new Date().toISOString(),
            });
            clearBasket();
            router.push(`/success?payment_id=${whatsappPaymentId}&order_id=${data.orderId}&order_number=${orderId}`);

        } catch (error) {
            console.error('Error processing WhatsApp payment:', error);
        } finally {
            setLoading(false);
            setShowQRModal(false);
        }
    };

    const handleRazorpayPayment = async () => {
        if (!user || !orderId) return;
        
        setLoading(true);
        try {
            const response = await fetch('/api/razorpay', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    amount: total * 100,
                    orderId,
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Payment initialization failed');
            }

            const data = await response.json();
            
            if (data.id) {
                // Create order in Sanity first
                const orderResponse = await fetch('/api/orders', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        orderId,
                        items: items.map(item => ({
                            product: {
                                _id: item.product._id,
                                name: item.product.name || 'Unnamed Product', 
                                price: item.product.price || 0,
                                image: item.product.image ? {
                                    url: urlFor(item.product.image).url()
                                } : null
                            },
                            quantity: item.quantity
                        })),
                        total,
                        paymentId: data.id,
                        paymentMethod: 'razorpay',
                        razorpayOrderId: data.id,
                        billingAddress,
                        userId: user?.id,
                        userEmail: user?.emailAddresses[0]?.emailAddress
                    }),
                });

                if (!orderResponse.ok) {
                    throw new Error('Failed to create order');
                }

                const orderData = await orderResponse.json();

                const options = {
                    key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
                    amount: data.amount,
                    currency: data.currency,
                    name: "Indios",
                    description: `Order #${orderId}`,
                    order_id: data.id,
                    handler: async function (response: any) {
                        try {
                            // Add order to local store for Razorpay payment
                            addOrder({
                                id: orderData.orderId,
                                items: items.map(item => ({
                                    product: {
                                        _id: item.product._id,
                                        name: item.product.name || 'Unnamed Product', 
                                        price: item.product.price || 0,
                                        image: item.product.image ? {
                                            url: urlFor(item.product.image).url()
                                        } : null
                                    },
                                    quantity: item.quantity
                                })),
                                total,
                                status: 'processing',
                                date: new Date().toISOString(),
                            });

                            // Update order status in Sanity
                            await fetch('/api/orders/status', {
                                method: 'PATCH',
                                headers: {
                                    'Content-Type': 'application/json',
                                },
                                body: JSON.stringify({
                                    orderId: orderData.orderId,
                                    status: 'processing',
                                    razorpayPaymentId: response.razorpay_payment_id,
                                }),
                            });

                            clearBasket();
                            router.push(`/success?payment_id=${response.razorpay_payment_id}&order_id=${orderData.orderId}&order_number=${orderId}`);
                        } catch (error) {
                            console.error('Error processing Razorpay success:', error);
                            alert('Payment successful but order processing failed. Please contact support.');
                        }
                    },
                    prefill: {
                        email: user.emailAddresses[0]?.emailAddress,
                        name: user.fullName,
                    },
                    modal: {
                        ondismiss: function() {
                            setLoading(false);
                        }
                    }
                };

                const paymentObject = new window.Razorpay(options);
                paymentObject.open();
            }
        } catch (error) {
            console.error('Error processing Razorpay payment:', error);
            alert(error instanceof Error ? error.message : 'Payment initialization failed');
        } finally {
            setLoading(false);
        }
    };

    // QR Code Modal Component
    const QRModal = () => {
        const upiUrl = generateUPIUrl(total, orderId || '', user?.fullName || 'Customer');
        
        return (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                <div className="bg-white rounded-lg p-6 max-w-md w-full">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-semibold">Scan to Pay</h3>
                        <button 
                            onClick={() => setShowQRModal(false)}
                            className="text-gray-500 hover:text-gray-700"
                        >
                            <X className="w-6 h-6" />
                        </button>
                    </div>
                    
                    <div className="flex flex-col items-center space-y-4">
                        <div className="bg-white p-4 rounded-lg shadow-lg">
                            <QRCodeSVG
                                value={upiUrl}
                                size={200}
                                level="H"
                                includeMargin={true}
                                className="w-full h-full"
                            />
                        </div>
                        <p className="text-lg font-semibold">{formatCurrency(total)}</p>
                        <div className="text-sm text-gray-600 text-center space-y-1">
                            <p>1. Open any UPI app (GPay, PhonePe, Paytm, etc.)</p>
                            <p>2. Scan this QR code</p>
                            <p>3. Complete the payment</p>
                        </div>
                        
                        <button
                            onClick={handlePaymentConfirmation}
                            disabled={loading}
                            className={`w-full py-3 px-4 rounded-lg text-white font-medium 
                                ${loading ? 'bg-green-400' : 'bg-green-600 hover:bg-green-700'}
                                transition-colors`}
                        >
                            {loading ? (
                                <span className="flex items-center justify-center gap-2">
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    Processing...
                                </span>
                            ) : (
                                'I have made the payment'
                            )}
                        </button>
                    </div>
                </div>
            </div>
        );
    };

    if (!orderId || !items.length || !user) {
        return (
            <div className="container mx-auto p-4">
                <div className="text-center py-10">
                    <h1 className="text-2xl font-bold mb-4">Invalid Order</h1>
                    <p className="text-gray-600">Please try placing your order again.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto p-4 max-w-2xl">
            <h1 className="text-2xl font-bold mb-6">Choose Payment Method</h1>
            
            <div className="space-y-4">
                <button
                    onClick={() => {
                        setPaymentMethod("whatsapp");
                        handleWhatsAppPayment();
                    }}
                    disabled={loading}
                    className={`w-full p-6 rounded-lg flex items-center justify-center space-x-4 
                    border-2 transition-all duration-200
                    ${loading && paymentMethod === "whatsapp" 
                        ? "border-green-300 bg-green-50" 
                        : "border-gray-200 hover:border-green-500 hover:shadow-lg hover:-translate-y-0.5"
                    }
                    disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                    <div className="flex items-center space-x-3">
                        {loading && paymentMethod === "whatsapp" ? (
                            <Loader2 className="animate-spin w-6 h-6 text-green-600" />
                        ) : (
                            <Image src="/whatsapp-icon.png" alt="WhatsApp" width={24} height={24} className="w-6 h-6" />
                        )}
                        <div className="text-left">
                            <p className="font-semibold text-gray-800">Pay via WhatsApp</p>
                            <p className="text-sm text-gray-500">Get payment details on WhatsApp</p>
                        </div>
                    </div>
                </button>

                <div className="relative my-8">
                    <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-gray-200" />
                    </div>
                    <div className="relative flex justify-center text-sm">
                        <span className="px-4 bg-white text-gray-500">Or pay with card</span>
                    </div>
                </div>

                <button
                    onClick={() => {
                        setPaymentMethod("razorpay");
                        handleRazorpayPayment();
                    }}
                    disabled={loading}
                    className={`w-full p-6 rounded-lg flex items-center justify-center space-x-4 
                    border-2 transition-all duration-200
                    ${loading && paymentMethod === "razorpay" 
                        ? "border-blue-300 bg-blue-50" 
                        : "border-gray-200 hover:border-blue-500 hover:shadow-lg hover:-translate-y-0.5"
                    }
                    disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                    <div className="flex items-center space-x-4">
                        <div className="flex-shrink-0">
                            {loading && paymentMethod === "razorpay" ? (
                                <Loader2 className="animate-spin w-8 h-8 text-blue-600" />
                            ) : (
                                <Image 
                                    src="/razorpay-icon.png" 
                                    alt="Razorpay" 
                                    width={120} 
                                    height={40} 
                                    className="object-contain"
                                />
                            )}
                        </div>
                        <div className="text-left">
                            <p className="text-sm text-gray-500">Credit/Debit Card, UPI, & more</p>
                        </div>
                    </div>
                </button>
            </div>

            {showQRModal && <QRModal />}

            <Script
                src="https://checkout.razorpay.com/v1/checkout.js"
                strategy="lazyOnload"
            />
        </div>
    );
}
