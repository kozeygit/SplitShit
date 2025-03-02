import { create } from 'zustand';
import { Bill } from '@/models/bill'; // Assuming you have a billTypes.ts file
import { cloneDeep } from 'lodash';

interface BillState {
  originalBill: Bill | undefined; // Use undefined
  editedBill: Bill | undefined; // Use undefined
  setOriginalBill: (bill: Bill | undefined) => void;
  setEditedBill: (bill: Bill | undefined) => void;
  resetEditedBill: () => void;
}

export const useBillStore = create<BillState>((set, get) => ({
  originalBill: undefined, // Use undefined
  editedBill: undefined, // Use undefined
  setOriginalBill: (bill) => set({ originalBill: bill ? cloneDeep(bill) : undefined }), // Clone or undefined
  setEditedBill: (bill) => set({ editedBill: bill ? cloneDeep(bill) : undefined }), // Clone or undefined
  resetEditedBill: () => set((state) => ({
    editedBill: state.originalBill ? cloneDeep(state.originalBill) : undefined, // Clone or undefined
  })),
}));