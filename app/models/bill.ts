// Define a type for a bill
export type Bill = {
    id: string;
    total: number;
    items: BillItem[];
};

// Define a type for a bill item
export type BillItem = {
    id: string;
    name: string;
    price: number;
    quantity: number;
    totalPrice: number;
    assignedTo: string[]; // Array of participant IDs
};

// Define a type for a participant
export type Payee = {
    id: string;
    name: string;
    partySize: number;
};


// Define a type for a participant
export type DiscountItem = {
    id: string;
    usePercentage: boolean;
    percentage: number;
    amount: number;
};