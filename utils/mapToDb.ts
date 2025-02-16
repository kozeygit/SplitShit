import { bills as billsSchema } from "@/db/schema"; // Your Drizzle schema
import { payers as payersSchema } from "@/db/schema"; // Your Drizzle schema
import { billPayers as billPayersSchema } from "@/db/schema"; // Your Drizzle schema
import { billItems as billItemsSchema } from "@/db/schema"; // Your Drizzle schema
import { Bill, BillItem, NewBill, Payer } from "@/models/bill";

type bill_db = typeof billsSchema.$inferInsert
type payer_db = typeof payersSchema.$inferInsert

export const mapBillToDB = async (bill: NewBill): Promise<bill_db> => {

    const mappedBill: bill_db = {
        name: bill.name,
        date: bill.date.toUTCString(),
        userEnteredTotal: bill.userEnteredTotal,
        serviceCharge: bill.serviceCharge,
        complete: 0,
    };
    return mappedBill;
};

export const mapPayerToDB = async (payer: Payer): Promise<payer_db> => {

    const mappedPayer: payer_db = {
        name: payer.name,
        number: payer.number,
        email: payer.email
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