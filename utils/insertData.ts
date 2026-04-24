import * as schema from "@/db/schema";
import { mapBillItemToDB, mapBillToDB, mapGroupToDB, mapPayerToDB } from "./mapToDb";
import {
  Bill,
  BillItem,
  NewBill,
  NewBillItem,
  NewGroup,
  NewPayer,
  Payer,
} from "../models/bill";
import { getDrizzleDb } from "./database";
import { eq, lt, gte, ne } from "drizzle-orm";

const db = getDrizzleDb();

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

    console.log(new Date().toLocaleTimeString(), " - insertPayer called");

    return insertedPayer[0].id;
  } catch (error) {
    console.error("Error in insertPayer:", error);
    return -1;
  }
};

export const insertGroup = async(newGroup: NewGroup): Promise<number> => {
    const mappedGroup = mapGroupToDB(newGroup)

    const inserted = await db
      .insert(schema.groups)
      .values(mappedGroup)
      .returning({ id: schema.groups.id });

    console.log(new Date().toLocaleTimeString(), " - insertGroup called");

    return inserted[0].id;
}

export const insertBillPayer = async (billId: number, payer: Payer): Promise<number> => {
  const inserted = await db
    .insert(schema.billPayers)
    .values({
      billId: billId,
      payerId: payer.id,
      partySize: payer.partySize ?? 1 })
    .returning({ id: schema.billPayers.id });

  console.log(new Date().toLocaleTimeString(), " - insertBillPayer called");
  
  return inserted[0].id;
};


export const insertBillItem = async (newBillItem: NewBillItem, billId: number): Promise<number> => {
  const mappedItem = mapBillItemToDB(newBillItem);
  mappedItem.billId = billId;

  const inserted = await db
    .insert(schema.billItems)
    .values(mappedItem)
    .returning({ id: schema.billItems.id });

    console.log(new Date().toLocaleTimeString(), " - insertBillItem called");
    
  return inserted[0].id;
};