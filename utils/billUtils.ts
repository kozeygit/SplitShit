import { Bill, Payer, Group } from "@/models/bill";
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

export const addGroupToBillDraft = (bill: Bill, group: Group): Bill => {
    const updatedBill = removeGroupFromBillDraft(bill);
    updatedBill.groupId = group.id;
    const existingPayersMap = new Map<number, Payer>(
        updatedBill.payers.map((p) => [p.id, p]),
    );
    const groupPayersMapped: Payer[] = group.payers.map((groupPayer) => ({
        ...groupPayer,
        addedWithGroup: true,
    }));

    groupPayersMapped.forEach((payer) => {
        if (!existingPayersMap.has(payer.id)) {
            existingPayersMap.set(payer.id, payer);
        } else {
            const existing = existingPayersMap.get(payer.id)!;
            existingPayersMap.set(payer.id, {
                ...existing,
                addedWithGroup: true,
            });
        }
    });

    updatedBill.payers = Array.from(existingPayersMap.values());
    return updatedBill;
};

export const removeGroupFromBillDraft = (bill: Bill): Bill => {
    const updatedBill = { ...bill };
    updatedBill.groupId = undefined;
    updatedBill.payers = updatedBill.payers.filter(
        (payer) => !payer.addedWithGroup,
    );
    return updatedBill;
};
