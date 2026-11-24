import { create } from "zustand";
export const useStore = create((set) => ({
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
    // Watch currently shown in the hero — used to preselect it in the waitlist form
    heroWatchId: "overflow",
    setHeroWatchId: (id) => set({ heroWatchId: id }),
    openWaitlist: (stone = null) => set({ isWaitlistOpen: true, waitlistPreselect: stone }),
    closeWaitlist: () => set({ isWaitlistOpen: false }),
    isCartOpen: false,
    openCart: () => set({ isCartOpen: true }),
    closeCart: () => set({ isCartOpen: false }),
    cartItems: [],
    addToCart: (item) => set((state) => {
        const newItem = {
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
    removeFromCart: (id) => set((state) => ({
        cartItems: state.cartItems.filter((i) => i.id !== id),
        allocations: state.allocations.filter((a, idx) => idx !== 0),
    })),
    toggleCartSelenite: (id) => set((state) => ({
        cartItems: state.cartItems.map((item) => item.id === id ? { ...item, addSelenite: !item.addSelenite } : item),
    })),
    clearCart: () => set({ cartItems: [], allocations: [] }),
    waitlist: {
        email: "",
        preferredPieceId: null,
        restingPlateInterest: "unanswered",
        consent: false,
        setEmail: (email) => set((state) => ({ waitlist: { ...state.waitlist, email } })),
        setPreferredPieceId: (id) => set((state) => ({ waitlist: { ...state.waitlist, preferredPieceId: id } })),
        setRestingPlateInterest: (choice) => set((state) => ({ waitlist: { ...state.waitlist, restingPlateInterest: choice } })),
        setConsent: (consent) => set((state) => ({ waitlist: { ...state.waitlist, consent } })),
        resetWaitlist: () => set((state) => ({
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
    addAllocation: (pieceId, dialNo = "0147") => set((state) => {
        const exists = state.allocations.some((a) => a.pieceId === pieceId);
        if (exists)
            return state;
        return {
            allocations: [
                ...state.allocations,
                { pieceId, dialNo, timestamp: Date.now() },
            ],
        };
    }),
    removeAllocation: (pieceId) => set((state) => ({
        allocations: state.allocations.filter((a) => a.pieceId !== pieceId),
    })),
    clearAllocations: () => set({ allocations: [] }),
}));