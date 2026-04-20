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
  try {
    const insertedGroup: { id: number }[] = await db
      .insert(schema.groups)
      .values(mapGroupToDB(newGroup))
      .returning({ id: schema.groups.id });

    console.log(new Date().toLocaleTimeString(), " - insertGroup called");

    return insertedGroup[0].id;
  } catch (error) {
    console.error("Error in insertGroup", error)
    return -1
  }
}

export const insertBillItem = async (
  newBillItem: NewBillItem,
  billId: number
): Promise<number> => {
  try {
    const mappedItem = mapBillItemToDB(newBillItem);
    mappedItem.billId = billId;

    const insertedItem: { id: number }[] = await db
      .insert(schema.billItems)
      .values(mappedItem)
      .returning({ id: schema.billItems.id });

    console.log(new Date().toLocaleTimeString(), " - insertBillItem called"); // Log inside insertBill

    return insertedItem[0].id;
  } catch (error) {
    console.error("Error in insertPayer:", error);
    return -1;
  }
};
