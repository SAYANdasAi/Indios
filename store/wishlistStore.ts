import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { Product } from '@/sanity.types'

interface WishlistState {
    items: Product[]
    addItem: (product: Product) => void
    removeItem: (productId: string) => void
    clearWishlist: () => void
    isInWishlist: (productId: string) => boolean
}

const useWishlistStore = create<WishlistState>()(
    persist(
        (set, get) => ({
            items: [],
            addItem: (product) => {
                const currentItems = get().items
                const existingItem = currentItems.find(item => item._id === product._id)
                
                if (!existingItem) {
                    set((state) => ({
                        items: [...state.items, {
                            ...product,
                            _type: "product" // Ensure _type is set for Sanity
                        }]
                    }))
                }
            },
            removeItem: (productId) => {
                set((state) => ({
                    items: state.items.filter(item => item._id !== productId)
                }))
            },
            clearWishlist: () => {
                set({ items: [] })
            },
            isInWishlist: (productId) => {
                return get().items.some(item => item._id === productId)
            }
        }),
        {
            name: 'wishlist-storage',
            version: 1
        }
    )
)

export default useWishlistStore
