"use client";

import AddToBasketButton from "@/components/AddToBasketButton";
import useBasketStore from "@/store/store";
import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useState } from "react";
import Image from "next/image";
import { imageUrl } from "@/lib/imageUrl";

function BasketPage() {
    const groupedItems = useBasketStore((state) => state.getGroupedItems());
    const { isSignedIn } = useAuth();
    // const { user } = useUser();
    const router = useRouter();

    // const [isClient, setIsClient] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    // Calculate total price
    const total = groupedItems.reduce((total, item) => {
        return total + (item.product.price || 0) * item.quantity;
    }, 0);

    if(groupedItems.length === 0) {
        return (
            <div className=" container mx-auto p-4 flex flex-col items-center justify-center min-h-[50vh]">
                <h1 className=" text-2xl font-bold mb-6 text-gray-800">Your Basket</h1>
                <p className=" text-gray-600 text-lg">Your basket is empty</p>
            </div>
        )
    }
    

    const handleCheckout = async () => {
        if (!isSignedIn) {
            router.push('/sign-in');
            return;
        }

        try {
            setIsLoading(true);
            // Generate a unique order ID
            const orderId = Math.random().toString(36).substring(2) + Date.now().toString(36);
            // Redirect to billing page with order details
            router.push(`/billing?orderId=${orderId}`);
        } catch (error) {
            console.error('Error during checkout:', error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="container mx-auto p-4 max-w-6xl">
            <h1 className="text-2xl font-bold mb-4">Your Basket</h1>
            <div className="flex flex-col lg:flex-row gap-8">
                <div className=" flex-grow">
                {groupedItems.map((item) => {
                    return (
                        <div key={item.product._id} className=" mb-4 p-4 border rounded flex items-center justify-between">

                            <div 
                                className=" flex items-center cursor-pointer flex-1 min-w-0"
                                onClick={()=> router.push(`/products/${item.product.slug?.current}`)}
                            >
                                <div className=" w-20 h-20 sm:w-24 sm:h-24 flex-shrink-0 mr-4">
                                        {item.product.image && (
                                            <Image
                                                src={imageUrl(item.product.image).url()}
                                                alt={item.product.name ?? "Product image"}
                                                className=" w-full h-full object-cover rounded"
                                                width={100}
                                                height={100}
                                            />
                                        )}
                                    
                                </div>
                            </div>
                           <div>{item.product.name}</div>

                           <div className=" flex items-center ml-4 flex-shrink-0">
                            <AddToBasketButton product={item.product} />
                           </div>
                        </div>
                    )
                })}
                </div>
                {/* Order Summary Section */}
                <div className="lg:w-96 bg-white p-8 h-fit rounded-lg shadow-lg">
                    <h2 className="text-2xl font-semibold mb-6">Order Summary</h2>
                    <div className="space-y-4">
                        <div className="flex justify-between text-lg">
                            <span>Items ({groupedItems.reduce((acc, item) => acc + item.quantity, 0)})</span>
                            <span>₹{total.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-lg">
                            <span>Delivery</span>
                            <span className="text-green-600 font-medium">Free</span>
                        </div>
                        <div className="border-t pt-4 mt-4">
                            <div className="flex justify-between text-xl font-semibold">
                                <span>Total</span>
                                <span>₹{total.toFixed(2)}</span>
                            </div>
                        </div>
                        <button
                            onClick={handleCheckout}
                            disabled={isLoading}
                            className="w-full bg-red-500 text-white py-3 px-4 rounded-md hover:bg-red-600 transition-colors mt-6 disabled:bg-red-400 disabled:cursor-not-allowed flex items-center justify-center text-lg font-medium"
                        >
                            {isLoading ? (
                                <>
                                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Processing...
                                </>
                            ) : isSignedIn ? 'Proceed to Checkout' : 'Sign in to Checkout'}
                        </button>
                    </div>
                </div>
            </div>
           
        </div>
    )
}

export default BasketPage;