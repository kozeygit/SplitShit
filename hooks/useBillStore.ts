import { create } from "zustand";
import { Bill } from "@/models/bill";
import { cloneDeep } from "lodash";

interface BillState {
    originalBill: Bill | undefined;
    editedBill: Bill | undefined;
    setOriginalBill: (bill: Bill | undefined) => void;
    setEditedBill: (bill: Bill | undefined) => void;
    resetEditedBill: () => void;
}

export const useBillStore = create<BillState>((set, get) => ({
    originalBill: undefined,
    editedBill: undefined,
    setOriginalBill: (bill) =>
        set({ originalBill: bill ? cloneDeep(bill) : undefined }),
    setEditedBill: (bill) =>
        set({ editedBill: bill ? cloneDeep(bill) : undefined }),
    resetEditedBill: () =>
        set((state) => ({
            editedBill: state.originalBill
                ? cloneDeep(state.originalBill)
                : undefined,
        })),
}));
