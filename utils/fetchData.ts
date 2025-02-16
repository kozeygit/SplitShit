import * as schema from "@/db/schema";
import {
  mapBillItemToModel,
  mapBillToModel,
  mapPayerToModel,
} from "./mapToModel";
import { Bill, BillItem, Payer } from "../models/bill";
import { getDrizzleDb } from "./database";
import { eq, lt, gte, ne } from "drizzle-orm";

const db = getDrizzleDb();

export const fetchBillItems = async (billId?: number): Promise<BillItem[]> => {
  console.log("getItems called: ", new Date().toLocaleTimeString());
  if (billId === undefined) {
    try {
      const result = await db.select().from(schema.billItems);

      const mappedBillItems: BillItem[] = await Promise.all(
        result.map(async (billItem) => await mapBillItemToModel(billItem))
      );
      return mappedBillItems;
    } catch (error) {
      console.error("Error in fetchBills:", error);
      return [];
    }
  } else {
    try {
      const result = await db
        .select()
        .from(schema.billItems)
        .where(eq(schema.billItems.billId, billId));

      const mappedBillItems: BillItem[] = await Promise.all(
        result.map(async (billItem) => await mapBillItemToModel(billItem))
      );
      return mappedBillItems;
    } catch (error) {
      console.error("Error in fetchBills:", error);
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

      return mappedPayers;
    } catch (error) {
      console.error("Error in fetchPayers:", error);
      return [];
    }
  }
};

export const fetchBills = async (): Promise<Bill[]> => {
  console.log("fetchBills called: ", new Date().toLocaleTimeString()); // Log inside getBills
  try {
    const result = await db.select().from(schema.bills);
    const mappedBills: Bill[] = await Promise.all(
      result.map(async (bill) => await mapBillToModel(bill))
    );

    return mappedBills;
  } catch (error) {
    console.error("Error in getBasicBills:", error);
    return [];
  }
};

export const fetchBill = async (billId: number): Promise<Bill | undefined> => {
  console.log("fetchBill called: ", new Date().toLocaleTimeString()); // Log inside getBills
  try {
    const result = await db
      .select()
      .from(schema.bills)
      .where(eq(schema.bills.id, billId))
      .limit(1);
    
    const mappedBill: Bill = await mapBillToModel(result[0]);

    mappedBill.items = await fetchBillItems(mappedBill.id);
    mappedBill.payers = await fetchPayers(mappedBill.id);

    return mappedBill;

  } catch (error) {
    console.error("Error in fetchBill:", error);
    return undefined;
  }
};
