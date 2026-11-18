import { create } from "zustand";
import { collection, WatchPiece, StoneId } from "@/data/collection";

export type CursorMode = "DEFAULT" | "VIEW" | "DRAG" | "HOLD" | "HIDDEN";

export interface WaitlistState {
  email: string;
  preferredPieceId: StoneId | null;
  restingPlateInterest: "yes" | "no" | "maybe" | "unanswered";
  consent: boolean;
  setEmail: (email: string) => void;
  setPreferredPieceId: (id: StoneId | null) => void;
  setRestingPlateInterest: (choice: "yes" | "no" | "maybe" | "unanswered") => void;
  setConsent: (consent: boolean) => void;
  resetWaitlist: () => void;
}

export interface CartAllocation {
  pieceId: StoneId;
  dialNo: string;
  timestamp: number;
}

export interface CartItem {
  id: string; // unique item id
  pieceId: StoneId;
  name: string;
  stone: string;
  price: number; // 1280
  size: string; // "38mm" | "41mm"
  strap: string; // "Integrated Steel" | "Midnight Suede" | "Italian Calfskin"
  addSelenite: boolean;
  selenitePrice: number; // 180
  dialNo: string;
}

export interface StoreState {
  // Active color world theme
  activeWorld: StoneId | "base" | "selenite";
  setActiveWorld: (world: StoneId | "base" | "selenite") => void;

  // Cursor state
  cursorMode: CursorMode;
  cursorLabel: string;
  setCursor: (mode: CursorMode, label?: string) => void;
  resetCursor: () => void;

  // Inspected modal / quick view piece
  inspectedPiece: WatchPiece | null;
  setInspectedPiece: (piece: WatchPiece | null) => void;

  // Prelaunch Waitlist Modal
  isWaitlistOpen: boolean;
  waitlistPreselect: StoneId | null;
  openWaitlist: (stone?: StoneId | null) => void;
  closeWaitlist: () => void;

  // Cart Drawer State
  isCartOpen: boolean;
  openCart: () => void;
  closeCart: () => void;

  // Cart items
  cartItems: CartItem[];
  addToCart: (item: Omit<CartItem, "id">) => void;
  removeFromCart: (id: string) => void;
  toggleCartSelenite: (id: string) => void;
  clearCart: () => void;

  // Waitlist form state
  waitlist: WaitlistState;

  // Legacy Allocation Bag compatibility
  allocations: CartAllocation[];
  addAllocation: (pieceId: StoneId, dialNo?: string) => void;
  removeAllocation: (pieceId: StoneId) => void;
  clearAllocations: () => void;
}

export const useStore = create<StoreState>((set) => ({
  activeWorld: "base",
  setActiveWorld: (world) => set({ activeWorld: world }),

  cursorMode: "DEFAULT",
  cursorLabel: "",
  setCursor: (mode, label = "") => set({ cursorMode: mode, cursorLabel: label }),
  resetCursor: () => set({ cursorMode: "DEFAULT", cursorLabel: "" }),

  inspectedPiece: null,
  setInspectedPiece: (piece) => set({ inspectedPiece: piece }),

  // Waitlist Modal
  isWaitlistOpen: false,
  waitlistPreselect: null,
  openWaitlist: (stone = null) => set({ isWaitlistOpen: true, waitlistPreselect: stone }),
  closeWaitlist: () => set({ isWaitlistOpen: false }),

  isCartOpen: false,
  openCart: () => set({ isCartOpen: true }),
  closeCart: () => set({ isCartOpen: false }),

  cartItems: [],
  addToCart: (item) =>
    set((state) => {
      const newItem: CartItem = {
        ...item,
        id: `${item.pieceId}-${Date.now()}`,
      };
      return {
        cartItems: [...state.cartItems, newItem],
        allocations: [
          ...state.allocations,
          { pieceId: item.pieceId, dialNo: item.dialNo, timestamp: Date.now() },
        ],
        isCartOpen: true,
      };
    }),
  removeFromCart: (id) =>
    set((state) => ({
      cartItems: state.cartItems.filter((i) => i.id !== id),
      allocations: state.allocations.filter((a, idx) => idx !== 0),
    })),
  toggleCartSelenite: (id) =>
    set((state) => ({
      cartItems: state.cartItems.map((item) =>
        item.id === id ? { ...item, addSelenite: !item.addSelenite } : item
      ),
    })),
  clearCart: () => set({ cartItems: [], allocations: [] }),

  waitlist: {
    email: "",
    preferredPieceId: null,
    restingPlateInterest: "unanswered",
    consent: false,
    setEmail: (email) =>
      set((state) => ({ waitlist: { ...state.waitlist, email } })),
    setPreferredPieceId: (id) =>
      set((state) => ({ waitlist: { ...state.waitlist, preferredPieceId: id } })),
    setRestingPlateInterest: (choice) =>
      set((state) => ({ waitlist: { ...state.waitlist, restingPlateInterest: choice } })),
    setConsent: (consent) =>
      set((state) => ({ waitlist: { ...state.waitlist, consent } })),
    resetWaitlist: () =>
      set((state) => ({
        waitlist: {
          ...state.waitlist,
          email: "",
          preferredPieceId: null,
          restingPlateInterest: "unanswered",
          consent: false,
        },
      })),
  },

  allocations: [],
  addAllocation: (pieceId, dialNo = "0147") =>
    set((state) => {
      const exists = state.allocations.some((a) => a.pieceId === pieceId);
      if (exists) return state;
      return {
        allocations: [
          ...state.allocations,
          { pieceId, dialNo, timestamp: Date.now() },
        ],
      };
    }),
  removeAllocation: (pieceId) =>
    set((state) => ({
      allocations: state.allocations.filter((a) => a.pieceId !== pieceId),
    })),
  clearAllocations: () => set({ allocations: [] }),
}));
