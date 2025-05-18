import { bills as billsSchema } from "@/db/schema"; // Your Drizzle schema
import { payers as payersSchema } from "@/db/schema"; // Your Drizzle schema
import { billPayers as billPayersSchema } from "@/db/schema"; // Your Drizzle schema
import { billItems as billItemsSchema } from "@/db/schema"; // Your Drizzle schema
import { Bill, BillItem, NewBill, NewBillItem, NewPayer, Payer } from "@/models/bill";

type bill_db = typeof billsSchema.$inferInsert
type payer_db = typeof payersSchema.$inferInsert
type billItem_db = typeof billItemsSchema.$inferInsert

export const mapBillToDB = (bill: NewBill): bill_db => {

    const mappedBill: bill_db = {
        name: bill.name,
        date: bill.date.toISOString(),
        userEnteredTotal: bill.userEnteredTotal,
        serviceCharge: bill.serviceCharge,
        complete: 0,
    };
    return mappedBill;
};

export const mapPayerToDB = (payer: NewPayer): payer_db => {

    const mappedPayer: payer_db = {
        name: payer.name,
        number: payer.number,
        email: payer.email
    };

    return mappedPayer;
};

export const mapBillItemToDB = (item: NewBillItem): billItem_db => {

    const mappedItem: billItem_db = {
        name: item.name,
        quantity: item.quantity,
        price: item.price,
    };

    return mappedItem;
};