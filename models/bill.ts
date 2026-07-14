import { Price } from "@/utils/priceUtils";
import { Rate } from "@/utils/rateUtils";

export type AssignItem = {
    payerId: number;
    quantity: number;
};

export type Bill = {
    id: number;
    name: string;
    date: Date;
    userEnteredTotal: Price;
    serviceCharge: Rate;
    complete: boolean;
    items: BillItem[];
    payers: Payer[];
    groupId?: number;
    imagePath?: string;
};

export type BillItem = {
    id: number;
    name: string;
    price: Price;
    quantity: number;
    totalPrice: Price;
    assignedTo: AssignItem[];
    category?: string;
    splitMode?: "equal" | "custom";
};

export type Payer = {
    id: number;
    name: string;
    number?: string;
    email?: string;
    amountToPay: Price;
    addedWithGroup?: boolean;
    isArchived: boolean;
    imagePath?: string;
};

export type Group = {
    id: number;
    name: string;
    description?: string;
    payers: Payer[];
    isArchived: boolean;
    imagePath?: string;
};

export type NewBill = Omit<
    Bill,
    "id" | "payers" | "discounts" | "items" | "complete"
>;
export type NewBillItem = Omit<BillItem, "id" | "assignedTo">;
export type NewPayer = Omit<
    Payer,
    "id" | "amountToPay" | "addedWithGroup" | "isArchived"
>;
export type NewGroup = Omit<Group, "id" | "payers" | "isArchived">;
