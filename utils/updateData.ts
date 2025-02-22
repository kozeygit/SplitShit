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
import { eq, lt, gte, ne } from "drizzle-orm";

const db = getDrizzleDb();

export const setBillComplete = async (billId: number): Promise<number> => {
  try {
    const insertedBill: { id: number; complete: number }[] = await db
      .update(schema.bills)
      .set({ complete: 1 })
      .where(eq(schema.bills.id, billId))
      .returning({ id: schema.bills.id, complete: schema.bills.complete });

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
      .values(mapBillToDB(newBill))
      .returning({ id: schema.bills.id });

    console.log(new Date().toLocaleTimeString(), " - insertBill called"); // Log inside insertBill

    return insertedBill[0].id;
  } catch (error) {
    console.error("Error in insertBill:", error);
    return -1;
  }
};

export const insertPayer = async (newPayer: NewPayer): Promise<number> => {
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

export const updateBillItem = async (
  item: BillItem
): Promise<number> => {
  try {
    const mappedItem = mapBillItemToDB(item);

    const insertedItem = (await db
      .update(schema.billItems)
      .set(mappedItem)
      .where(eq(schema.billItems.id, item.id))
      .returning())[0]
    
    console.log(`
      Changed BillItem ${item.id}:
      Name: ${item.name} => ${insertedItem.name}
      Quantity: ${item.quantity} => ${insertedItem.quantity}
      Price: ${item.price} => ${insertedItem.price}
      `)
    console.log(new Date().toLocaleTimeString(), " - updateBillItem called"); // Log inside insertBill

    return insertedItem.id;
  } catch (error) {
    console.error("Error in updateBillItem:", error);
    return -1;
  }
};
