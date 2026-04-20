export type AssignItem = {
    payerId: number,
    quantity: number
}

import { Price } from "@/utils/priceUtils";

export type Bill = {
    id: number;
    name: string;
    date: Date;
    userEnteredTotal: Price;
    serviceCharge: Price;
    complete: boolean;
    items: BillItem[];
    payers: Payer[];
    groupId?: number;
};

export type BillItem = {
    id: number;
    name: string;
    price: Price;
    quantity: number;
    totalPrice: Price;
    assignedTo: AssignItem[]; 
    category?: string;
};

export type Payer = {
    id: number;
    name: string;
    number?: string;
    email?: string;
    partySize?: number;
    amountToPay?: Price;
    addedWithGroup?: boolean;
};

export type Group = {
    id: number;
    name: string;
    description?: string;
    payers: Payer[];
}


export type NewBill = Omit<Bill, "id" | "payers" | "discounts" | "items" | "complete" >
export type NewBillItem = Omit<BillItem, "id" | "assignedTo" | "isDiscounted" | "discountedPrice" | "discounts" >
export type NewPayer = Omit<Payer, "id" | "partySize" | "amountToPay" | "addedWithGroup" >
export type NewGroup = Omit<Group, "id" | "payers" >