import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface Order {
  id: string;
  // ...add other order properties you need
}

interface OrderStore {
  orders: Order[];
  addOrder: (order: Order) => void;
  clearOrders: () => void;
}

const useOrderStore = create<OrderStore>()(
  persist(
    (set) => ({
      orders: [],
      addOrder: (order) => set((state) => ({ 
        orders: [...state.orders, order] 
      })),
      clearOrders: () => set({ orders: [] }),
    }),
    {
      name: 'order-store',
    }
  )
)

export default useOrderStore;
