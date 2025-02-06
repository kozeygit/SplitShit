export type Bill = {
    id: number;
    name: string;
    date: Date;
    userEnteredTotal: number;
    serviceCharge: number;
    complete: boolean;
    items: BillItem[];
    payers: Payer[];
    discounts?: DiscountItem[]; // Discounts applied to the entire bill
};

export type BillItem = {
    id: number;
    name: string;
    price: number;
    quantity: number;
    totalPrice: number;
    assignedTo: Payer[]; // Array of payer IDs or names
    isDiscounted: boolean;
    discountedPrice: number;
    category?: string;
    discounts?: DiscountItem[]; // Discounts applied to this specific item
};

export type Payer = {
    id: number;
    name: string;
    number?: number;
    email?: string;
    partySize?: number;
    amountToPay?: number; // Calculated dynamically
};

export type DiscountItem = {
    id: number;
    usePercentage: boolean;
    percentage?: number;
    amount?: number;
};

export type NewBill = Omit<Bill, "id" | "payers" | "discounts" | "items">
export type NewBillItem = Omit<BillItem, "id">
export type NewPayer = Omit<Payer, "id">
export type NewDiscountItem = Omit<DiscountItem, "id">