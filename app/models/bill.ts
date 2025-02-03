export type Bill = {
    id: string;
    name: string;
    date: Date;
    userEnteredTotal: number;
    subTotal: number; // Automatically calculated from the sum of all `BillItem.totalPrice`
    finalTotal: number; // Derived: subTotal + serviceCharge - discounts
    items: BillItem[];
    Payees: Payer[];
    serviceCharge?: number; // Optional service charge (defaults to 0 if not provided)
    discounts?: DiscountItem[];
    complete: boolean;
};

export type BillItem = {
    id: string;
    name: string;
    price: number; // Price per unit of the item (Can be derived from totalPrice / quantity)
    quantity: number;
    totalPrice: number; // Total price items (Can be derived from totalPrice * quantity)
    assignedTo: string[];
    discounts?: DiscountItem[];
    isDiscounted?: boolean;
    discountedPrice?: number;
    category?: string; // Optional: for grouping or analytics
};

export type Payer = {
    id: string;
    name: string;
    partySize: number; // Number of people represented by this payee (for service charge splitting)
    amountToPay: number;
};

export type DiscountItem = {
    id: string;
    usePercentage: boolean; // True if the discount is percentage-based
    percentage?: number; // Discount percentage (used if `usePercentage` is true)
    amount?: number; // Fixed discount amount (used if `usePercentage` is false)
};
