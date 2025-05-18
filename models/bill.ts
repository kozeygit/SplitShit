export type AssignItem = {
    payerId: number,
    quantity: number
}

export type Bill = {
    id: number;
    name: string;
    date: Date;
    userEnteredTotal: number;
    serviceCharge: number;
    complete: boolean;
    items: BillItem[];
    payers: Payer[];
};

export type BillItem = {
    id: number;
    name: string;
    price: number;
    quantity: number;
    totalPrice: number;
    assignedTo: AssignItem[]; 
    category?: string;
};

export type Payer = {
    id: number;
    name: string;
    number?: string;
    email?: string;
    partySize?: number;
    amountToPay?: number; // Calculated dynamically
};

export type NewBill = Omit<Bill, "id" | "payers" | "discounts" | "items" | "complete">
export type NewBillItem = Omit<BillItem, "id" | "assignedTo" | "isDiscounted" | "discountedPrice" | "discounts">
export type NewPayer = Omit<Payer, "id" | "partySize" | "amountToPay">