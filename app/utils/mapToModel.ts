import { bills as billsSchema } from "@/db/schema"; // Your Drizzle schema
import { Bill } from "@/app/models/bill";

export const mapToModel = async (dbBill: typeof billsSchema.$inferSelect): Promise<Bill> => {

    const mappedBill: Bill = {
        id: dbBill.id,
        name: dbBill.name,
        date: new Date(dbBill.date), // Convert string to Date
        userEnteredTotal: dbBill.userEnteredTotal,
        serviceCharge: dbBill.serviceCharge || undefined,
        complete: Boolean(dbBill.complete),
        items: [], // Initialize as empty arrays, you'll populate them later
        Payees: [],
        discounts: []
    };
    return mappedBill;
};