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
import { eq, lt, gte, ne, count } from "drizzle-orm";

const db = getDrizzleDb();

export const removeBill = async (newBill: NewBill): Promise<number> => {
  try {
    const insertedBill: { id: number }[] = await db
      .insert(schema.bills)
      .values(mapBillToDB(newBill))
      .returning({ id: schema.bills.id });

    console.log(new Date().toLocaleTimeString(), " - insertBill called"); // Log inside insertBill

    return insertedBill[0].id;
  } catch (error) {
    console.error("Error in insertBill:", error);
    return -1;
  }
};

export const removePayer = async (newPayer: NewPayer): Promise<number> => {
  try {
    const insertedPayer: { id: number }[] = await db
      .insert(schema.payers)
      .values(mapPayerToDB(newPayer))
      .returning({ id: schema.payers.id });

    console.log(new Date().toLocaleTimeString(), " - insertPayer called"); // Log inside insertBill

    return insertedPayer[0].id;
  } catch (error) {
    console.error("Error in insertPayer:", error);
    return -1;
  }
};

export const removeBillItem = async (
  itemId: number,
): Promise<number> => {
  try {
    db.transaction

    const removeAssignedItems: { id: number }[] = await db.delete(schema.assignedItems).where(eq(schema.assignedItems.billItemId, itemId)).returning({ id: schema.assignedItems.id })
    const removedItems: { id: number }[] = await db.delete(schema.billItems).where(eq(schema.billItems.id, itemId)).returning({ id: schema.billItems.id })
    
    if (removedItems.length > 1) {
      console.log("uh oh, big problem")
      console.log(removedItems)
      console.log(removeAssignedItems)
      throw new Error("More than 1 item deleted????")
    }

    console.log(new Date().toLocaleTimeString(), " - removeBillItem called");

    return removedItems[0].id;
  } catch (error) {
    console.error("Error in removeBillItem:", error);
    return -1;
  }
};
