import { bills as billsSchema } from "@/db/schema"; // Your Drizzle schema
import { payers as payersSchema } from "@/db/schema"; // Your Drizzle schema
import { billPayers as billPayersSchema } from "@/db/schema"; // Your Drizzle schema
import { billItems as billItemsSchema } from "@/db/schema"; // Your Drizzle schema
import { Bill, BillItem, Payer } from "@/models/bill";

export const mapBillToModel = (dbBill: typeof billsSchema.$inferSelect): Bill => {

    const mappedBill: Bill = {
        id: dbBill.id,
        name: dbBill.name,
        date: new Date(dbBill.date),
        userEnteredTotal: dbBill.userEnteredTotal,
        serviceCharge: dbBill.serviceCharge,
        complete: Boolean(dbBill.complete),
        items: [],
        payers: [],
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
        amountToPay: 0
    };

    if (dbBillPayer !== undefined) {
        mappedPayer.partySize = dbBillPayer.partySize
    };


    return mappedPayer;
};

export const mapBillItemToModel = (dbBillItem: typeof billItemsSchema.$inferSelect): BillItem => {

    const mappedBillItem: BillItem = {
        id: dbBillItem.id,
        name: dbBillItem.name,
        price: dbBillItem.price,
        quantity: dbBillItem.quantity,
        totalPrice: dbBillItem.price * dbBillItem.quantity,
        assignedToId: [],
        category: dbBillItem.category || undefined,
        
    };
    return mappedBillItem;
};