'use client';

import { SignInButton, useUser, UserButton, SignedIn } from "@clerk/nextjs";
import Link from "next/link";
import Form from "next/form";
import { PackageIcon, TrolleyIcon } from "@sanity/icons";
import { ClerkLoaded } from "@clerk/nextjs";
import  useBasketStore from "@/store/store";
import { Heart } from "lucide-react";
import useWishlistStore from "@/store/wishlistStore";
import useOrderStore from "@/store/orderStore";

function Header() {
  const { user } = useUser();
  // const basketItems = useBasketStore((state) => state.items);
  const wishlistItems = useWishlistStore((state) => state.items);
  // Only show order count if there are actual orders
  const orders = useOrderStore((state) => state.orders);
  const orderCount = orders?.length || 0;
  const itemCount = useBasketStore((state) =>
    state.items.reduce((total, item) => total + item.quantity, 0)
  );

  const createClerkPasskey = async () => {
    try {
      const response = await user?.createPasskey();
      console.log(response);
    } catch (err) {
      console.log("Error", JSON.stringify(err, null, 2));
    }
  };

  return (
    <header
      className="flex  flex-wrap justify-between items-center px-4 py-2"
    >
      {/* Top Row */}
      <div className=" flex w-full flex-wrap justify-between items-center">
        <Link
          href="/"
          className="text-2xl font-bold font-mickle text-red-500 hover:capacity-50 cursor-pointer mx-auto sm:mx-0"
        >
          Indios
        </Link>
        <Form
          action="/search"
          className=" w-full sm:w-auto sm:flex-1 sm:mx-4 mt-2 sm:mt-0"
        >
          <input
            type="text"
            name="query"
            placeholder="Search for products"
            className="
                     bg-gray-100
                     text-gray-800
                     px-4 py-2 rounded focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50 border w-full max-w-4xl 
            "
          />
        </Form>

        <div className=" flex items-center space-x-4 mt-4 sm:mt-0 flex-1 sm:flex-none">
          <div className="flex items-center space-x-4">
            <Link href="/wishlist" className="relative">
              <Heart className="w-6 h-6 text-gray-600" />
              {wishlistItems.length > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                  {wishlistItems.length}
                </span>
              )}
            </Link>
            <Link
              href="/basket"
              className="relative flex justify-center sm:justify-start sm:flex-none items-center space-x-2 bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
            >
              <TrolleyIcon className=" w-6 h-6" />
              {/* span item count once global state is implemented*/}
              <span className=" absolute -top-2 -right-2 bg-yellow-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs ">
                {itemCount}
              </span>
              <span>My Basket</span>
            </Link>
          </div>

          {/* User Area */}
          <ClerkLoaded>
            <SignedIn>
              <Link
                href="/orders"
                className="flex-1 relative flex justify-center sm:justify-start sm:flex-none items-center space-x-2 bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
              >
                <PackageIcon className=" w-6 h-6" />
                <span>My Orders</span>
                {orderCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-yellow-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                    {orderCount}
                  </span>
                )}
              </Link>
            </SignedIn>

            {user ? (
              <div
                className=" flex items-center space-x-2"
              >
                <UserButton />

                <div className=" hidden sm:block text-xs">
                  <p className=" text-gray-400">Welcome</p>
                  <p className=" font-bold">{user.fullName}!</p>
                </div>
              </div>
            ) : (
              <SignInButton mode="modal" />
            )}

            {user?.passkeys.length == 0 && (
              <button
                onClick={createClerkPasskey}
                className=" bg-white hover:bg-red-700 hover:text-white animate-pulse text-red-500 font-bold py-2 px-4 rounded border-red-300 border"
              >
                Create passkey
              </button>
            )}
          </ClerkLoaded>
        </div>
      </div>
    </header>
  );
}

export default Header;
