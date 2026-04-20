import { bills as billsSchema } from "@/db/schema"; // Your Drizzle schema
import { payers as payersSchema } from "@/db/schema"; // Your Drizzle schema
import { billPayers as billPayersSchema } from "@/db/schema"; // Your Drizzle schema
import { billItems as billItemsSchema } from "@/db/schema"; // Your Drizzle schema
import { groups as groupsSchema } from "@/db/schema"; // Your Drizzle schema
import { Bill, BillItem, Payer, Group } from "@/models/bill";
import { Price } from "@/utils/priceUtils";

export const mapBillToModel = (dbBill: typeof billsSchema.$inferSelect): Bill => {

    const mappedBill: Bill = {
        id: dbBill.id,
        name: dbBill.name,
        date: new Date(dbBill.date),
        userEnteredTotal: Price.fromCents(dbBill.userEnteredTotal),
        serviceCharge: Price.fromCents(dbBill.serviceCharge),
        complete: Boolean(dbBill.complete),
        items: [],
        payers: [],
        groupId: dbBill.groupId || undefined
    };
    return mappedBill;
};

export const mapPayerToModel = (dbPayer: typeof payersSchema.$inferSelect, dbBillPayer?: typeof billPayersSchema.$inferSelect): Payer => {

    const mappedPayer: Payer = {
        id: dbPayer.id,
        name: dbPayer.name,
        number: dbPayer.number || undefined,
        email: dbPayer.email || undefined,
        partySize: 1,
        amountToPay: undefined
    };

    if (dbBillPayer !== undefined) {
        mappedPayer.partySize = dbBillPayer.partySize
    };


    return mappedPayer;
};

export const mapGroupToModel = (dbGroup: typeof groupsSchema.$inferSelect): Group => {

    const mappedGroup: Group = {
        id: dbGroup.id,
        name: dbGroup.name,
        description: dbGroup.description || undefined,
        payers: []
    };

    return mappedGroup;
};
export const mapBillItemToModel = (dbBillItem: typeof billItemsSchema.$inferSelect): BillItem => {

    const totalPriceCents = dbBillItem.price * dbBillItem.quantity;

    const mappedBillItem: BillItem = {
        id: dbBillItem.id,
        name: dbBillItem.name,
        price: Price.fromCents(dbBillItem.price),
        quantity: dbBillItem.quantity,
        totalPrice: Price.fromCents(totalPriceCents),
        assignedTo: [],
        category: dbBillItem.category || undefined,
        
    };
    return mappedBillItem;
};