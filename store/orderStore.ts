import { create } from "zustand";
import { persist } from "zustand/middleware";

interface OrderState {
    orderCount: number;
    setOrderCount: (count: number) => void;
}

const useOrderStore = create<OrderState>()(
    persist(
        (set) => ({
            orderCount: 0,
            setOrderCount: (count) => set({ orderCount: count }),
        }),
        {
            name: "order-store",
        }
    )
);

export default useOrderStore;
