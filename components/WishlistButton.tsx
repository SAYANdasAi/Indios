import { Product } from "@/sanity.types";
import useWishlistStore from "@/store/wishlistStore";
import { Heart } from "lucide-react";
import { useEffect, useState } from "react";

interface WishlistButtonProps {
    product: Product;
    className?: string;
}

function WishlistButton({ product, className = "" }: WishlistButtonProps) {
    const { addItem, removeItem, isInWishlist } = useWishlistStore();
    const [mounted, setMounted] = useState(false);
    
    useEffect(() => {
        setMounted(true);
    }, []);

    const isInList = mounted ? isInWishlist(product._id) : false;

    const toggleWishlist = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        
        if (isInList) {
            removeItem(product._id);
        } else {
            addItem(product);
        }
    };

    return (
        <button
            onClick={toggleWishlist}
            className={`p-2 rounded-full bg-white hover:bg-gray-100 transition-colors shadow-md ${className}`}
            aria-label={mounted ? (isInList ? "Remove from wishlist" : "Add to wishlist") : "Add to wishlist"}
        >
            {mounted && isInList ? (
                <Heart className="w-5 h-5 text-red-500 fill-red-500" />
            ) : (
                <Heart className="w-5 h-5 text-gray-600" />
            )}
        </button>
    );
}

export default WishlistButton;
