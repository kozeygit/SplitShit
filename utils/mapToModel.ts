import { bills as billsSchema } from "@/db/schema"; // Your Drizzle schema
import { payers as payersSchema } from "@/db/schema"; // Your Drizzle schema
import { billPayers as billPayersSchema } from "@/db/schema"; // Your Drizzle schema
import { billItems as billItemsSchema } from "@/db/schema"; // Your Drizzle schema
import { Bill, BillItem, Payer } from "@/models/bill";

export const mapBillToModel = async (dbBill: typeof billsSchema.$inferSelect): Promise<Bill> => {

    const mappedBill: Bill = {
        id: dbBill.id,
        name: dbBill.name,
        date: new Date(dbBill.date), // Convert string to Date
        userEnteredTotal: dbBill.userEnteredTotal,
        serviceCharge: dbBill.serviceCharge || undefined,
        complete: Boolean(dbBill.complete),
        items: [], // Initialize as empty arrays, you'll populate them later
        Payers: [],
        discounts: []
    };
    return mappedBill;
};

export const mapPayerToModel = async (dbPayer: typeof payersSchema.$inferSelect, dbBillPayer?: typeof billPayersSchema.$inferSelect): Promise<Payer> => {

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

export const mapBillItemToModel = async (dbBillItem: typeof billItemsSchema.$inferSelect): Promise<BillItem> => {

    const mappedBillItem: BillItem = {
        id: dbBillItem.id,
        name: dbBillItem.name,
        price: dbBillItem.price,
        quantity: dbBillItem.quantity,
        totalPrice: dbBillItem.price * dbBillItem.quantity,
        assignedTo: [],
        isDiscounted: Boolean(dbBillItem.isDiscounted),
        discountedPrice: dbBillItem.discountedPrice || 0,
        category: dbBillItem.category || undefined,
        discounts: []
        
    };
    return mappedBillItem;
};