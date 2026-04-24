import * as schema from "@/db/schema";
import { mapBillItemToDB, mapBillToDB, mapPayerToDB } from "./mapToDb";
import {
  Bill,
  BillItem,
  NewBill,
  NewBillItem,
  NewPayer,
  Payer,
} from "../models/bill";
import { getDrizzleDb } from "./database";
import { eq, lt, gte, ne, count, and } from "drizzle-orm";

const db = getDrizzleDb();

// Not Finished
export const removeBill = async (billId: number): Promise<number> => {
  try {
    // Check if bill id is in table,
    // remove all billPayer links
    // remove all billItems (use method and assigned items will be handles as well)
    // remove bill
    

    console.log(new Date().toLocaleTimeString(), " - removeBill called"); // Log inside insertBill
    return 1
  } catch (error) {
    console.error("Error in insertBill:", error);
    return -1;
  }
};

export const removeBillPayer = async (billId: number, payerId: number) => {
  return await db
    .delete(schema.billPayers)
    .where(
      and(
        eq(schema.billPayers.billId, billId),
        eq(schema.billPayers.payerId, payerId)
      )
    );
};

// Not Finished
export const removePayer = async (payerId: number): Promise<number> => {
  try {
    const removedPayers = await db
      .delete(schema.payers)
      .where(eq(schema.payers.id, payerId))
      .returning({ id: schema.payers.id });

    
    if (removedPayers.length === 0) {
      console.log("No payer found to delete");
      return -1;
    }

    if (removedPayers.length > 1) {
      console.error("uh oh, big problem - multiple items deleted");
      throw new Error("More than 1 item deleted????");
    }

    console.log(new Date().toLocaleTimeString(), " - removePayer called");

    return removedPayers[0].id
  } catch (error) {
    console.error("Error in removePayer:", error);
    return -1;
  }
};

export const removeBillItem = async (
  itemId: number,
): Promise<number> => {
  try {
    const removedItems = await db
      .delete(schema.billItems)
      .where(eq(schema.billItems.id, itemId))
      .returning({ id: schema.billItems.id });

    if (removedItems.length === 0) {
        console.log("No item found to delete");
        return -1;
    }

    if (removedItems.length > 1) {
      console.error("uh oh, big problem - multiple items deleted");
      throw new Error("More than 1 item deleted????");
    }

    console.log(new Date().toLocaleTimeString(), " - removeBillItem called (cascade cleanup handled by DB)");

    return removedItems[0].id;
  } catch (error) {
    console.error("Error in removeBillItem:", error);
    return -1;
  }
};
