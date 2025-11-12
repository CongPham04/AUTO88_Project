import { create } from 'zustand';

type OrderItem = { id:number; selectedColor:string; quantity:number; price:number; image:string; make:string; model:string; year:number; stockCount?: number; condition?: string };

type State = {
  order: OrderItem[];
  addToOrder: (item: OrderItem) => void;
  removeFromOrder: (id:number, color:string) => void;
  clearOrder: () => void;
};

export const useOrderStore = create<State>((set) => ({
  order: [],
  addToOrder: (item) => set((s) => {
    const exist = s.order.find(i => i.id === item.id && i.selectedColor === item.selectedColor);
    if (exist) return { order: s.order.map(i => i === exist ? { ...i, quantity: i.quantity + item.quantity } : i) };
    return { order: [...s.order, item] };
  }),
  removeFromOrder: (id, color) => set((s) => ({ order: s.order.filter(i => !(i.id === id && i.selectedColor === color)) })),
  clearOrder: () => set({ order: [] }),
}));