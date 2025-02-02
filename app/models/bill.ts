// Define a type for a bill
export type Bill = {
    id: string;
    total: number; // This should be a user entered total
    subTotal: number; // This should be calculated from the sum of the bill items totals
    items: BillItem[];
};

export type BillItem = {
    id: string;
    name: string;
    price: number; // if quantity and total price is entered, then price is totalPrice / quantity
    quantity: number;
    totalPrice: number; // if quantity and price is entered, then totalPrice is price * quantity
    assignedTo: string[]; // Array of participant IDs
};

export type Payee = {
    id: string;
    name: string;
    partySize: number; // Accounts for service charge split when paying for multiple people.
};

export type DiscountItem = {
    id: string;
    usePercentage: boolean;
    percentage: number; // either percentage or amount is used, not both
    amount: number;
};