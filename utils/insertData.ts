import * as schema from "@/db/schema";
import { mapBillToDB } from "./mapToDb";
import { Bill, BillItem, NewBill, Payer } from "../models/bill";
import { getDrizzleDb } from "./database";
import { eq, lt, gte, ne } from "drizzle-orm";

const db = getDrizzleDb();

/*
export const fetchBillItems = async (billId?: number): Promise<BillItem[]> => {
    console.log("getItems called: ", new Date().toLocaleTimeString());
    if (billId === undefined) {
        try {
            const result = await db.select().from(schema.billItems);

            const mappedBillItems: BillItem[] = await Promise.all(
                result.map(
                    async (billItem) => await mapBillItemToModel(billItem)
                )
            );
            return mappedBillItems;
        } catch (error) {
            console.error("Error in getBills:", error);
            return [];
        }
    } else {
        try {
            const result = await db
                .select()
                .from(schema.billItems)
                .where(eq(schema.billItems.billId, billId));

            const mappedBillItems: BillItem[] = await Promise.all(
                result.map(
                    async (billItem) => await mapBillItemToModel(billItem)
                )
            );
            return mappedBillItems;
        } catch (error) {
            console.error("Error in getBills:", error);
            return [];
        }
    }
};

export const fetchPayers = async (billId?: number): Promise<Payer[]> => {
    console.log("getPayers called: ", new Date().toLocaleTimeString());
    if (billId === undefined) {
        try {
            const result = await db.select().from(schema.payers);
            const mappedPayers: Payer[] = await Promise.all(
                result.map(async (payer) => await mapPayerToModel(payer))
            );

            console.log(mappedPayers);
            return mappedPayers;
        } catch (error) {
            console.error("Error in getPayers:", error);
            return [];
        }
    } else {
        try {
            const result = await db
                .select()
                .from(schema.payers)
                .innerJoin(
                    schema.billPayers,
                    eq(schema.billPayers.payerId, schema.payers.id)
                )
                .where(eq(schema.billPayers.billId, billId));

            const mappedPayers: Payer[] = await Promise.all(
                result.map(
                    async (payer) =>
                        await mapPayerToModel(payer.payers, payer.bill_payers)
                )
            );

            console.log(mappedPayers);
            return mappedPayers;
        } catch (error) {
            console.error("Error in getPayers:", error);
            return [];
        }
    }
};
*/
export const setBillComplete = async (billId: number): Promise<number> => {
  try {
    const insertedBill: { id: number, complete: number }[] = await db.update(schema.bills).set({complete: 1}).where(eq(schema.bills.id, billId)).returning({id: schema.bills.id, complete: schema.bills.complete})

    console.log(new Date().toLocaleTimeString(), " - setBillComplete called");

    return insertedBill[0].id;
  } catch (error) {
    console.error("Error in setBillComplete:", error);
    return -1;
  }
};

export const insertBill = async (newBill: NewBill): Promise<number> => {
  try {
    const insertedBill: { id: number }[] = await db
      .insert(schema.bills)
      .values(await mapBillToDB(newBill))
      .returning({ id: schema.bills.id });

    console.log(new Date().toLocaleTimeString(), " - insertBill called"); // Log inside insertBill

    return insertedBill[0].id;
  } catch (error) {
    console.error("Error in getBasicBills:", error);
    return -1;
  }
};
