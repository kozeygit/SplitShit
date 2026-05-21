import { Bill, Payer } from "@/models/bill";
import { Price } from "./priceUtils";

export function getPayerById(bill: Bill, payerId: number): Payer | undefined {
    for (const payer of bill.payers) {
        if (payer.id == payerId) {
            return payer;
        }
    }
    return undefined;
}

export const getBillTotals = (bill: Bill) => {
    const itemsTotal = bill.items.reduce(
        (acc, item) => acc.add(item.totalPrice),
        Price.fromCents(0),
    );
    const calculatedTotal = itemsTotal.add(
        bill.serviceCharge.applyTo(itemsTotal),
    );

    return { itemsTotal, calculatedTotal };
};
