// bills.ts (or your models file)

export type Bill = {
    id: number;
    name: string;
    date: Date;
    userEnteredTotal: number;
    serviceCharge?: number;
    complete: boolean;
    items: BillItem[];
    Payees: Payer[];
    discounts?: DiscountItem[]; // Discounts applied to the entire bill
};

export type BillItem = {
    id: number;
    name: string;
    price: number;
    quantity: number;
    totalPrice: number;
    assignedTo: string[]; // Array of payer IDs or names
    isDiscounted?: boolean;
    discountedPrice?: number;
    category?: string;
    discounts?: DiscountItem[]; // Discounts applied to this specific item
};

export type Payer = {
    id: number;
    name: string;
    number?: number;
    email?: string;
    partySize: number;
    amountToPay: number; // Calculated dynamically
};

export type DiscountItem = {
    id: number;
    usePercentage: boolean;
    percentage?: number;
    amount?: number;
};