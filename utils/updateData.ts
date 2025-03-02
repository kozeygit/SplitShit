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
import { eq, lt, gte, ne, and } from "drizzle-orm";
import { fetchBillItems, fetchPayers } from "./fetchData";
import { insertBillItem } from "./insertData";
import { isEqual } from "lodash";
import { removeBillItem } from "./removeData";

const db = getDrizzleDb();

export const setBillComplete = async (
  billId: number,
  complete: boolean = true
): Promise<number> => {
  try {
    const insertedBill: { id: number; complete: number }[] = await db
      .update(schema.bills)
      .set({ complete: complete ? 1 : 0 })
      .where(eq(schema.bills.id, billId))
      .returning({ id: schema.bills.id, complete: schema.bills.complete });

    console.log(new Date().toLocaleTimeString(), " - setBillComplete called");

    return insertedBill[0].id;
  } catch (error) {
    console.error("Error in setBillComplete:", error);
    return -1;
  }
};

export const updateBill = async (bill: Bill): Promise<number> => {
  try {
    // Change bill data
    const mappedBill = mapBillToDB(bill);
    const insertedBill = (
      await db
        .update(schema.bills)
        .set(mappedBill)
        .where(eq(schema.bills.id, bill.id))
        .returning()
    )[0];

    // Change bill items
    const oldItems = await fetchBillItems(bill.id);
    for (const oldItem of oldItems) {
      let found = false;
      for (const item of bill.items) {
        if (item.id == oldItem.id) {
          found = true;
        }
      }
      if (!found) {
        removeBillItem(oldItem.id);
      }
    }
    for (const item of bill.items) {
      const isOldItem = oldItems.some((oldItem) => isEqual(oldItem, item));
      if (isOldItem) {
        continue;
      }
      if (item.id > 1_000_000_000) {
        await insertBillItem(item, bill.id);
        continue;
      }
      await updateBillItem(item);
    }

    // Change bill payers
    const oldPayers = await fetchPayers(bill.id);
    // Delete old payers that are not in the new bill
    for (const oldPayer of oldPayers) {
      let found = false;
      for (const payer of bill.payers) {
        if (payer.id == oldPayer.id) {
          found = true;
        }
      }
      if (!found) {
        const deletedBP = await db
          .delete(schema.billPayers)
          .where(and(eq(schema.billPayers.payerId, oldPayer.id), eq(schema.billPayers.billId, bill.id)))
          .returning();
        
        await db
          .delete(schema.assignedItems)
          .where(eq(schema.assignedItems.billPayerId, deletedBP[0].id));
      }
    }


    for (const payer of bill.payers) {
      const isOldPayer = oldPayers.some((oldPayer) => (oldPayer.id == payer.id));
      if (payer.partySize !== undefined) {
        if (isOldPayer) {
          const returnBP = await db
            .update(schema.billPayers)
            .set({ partySize: payer.partySize })
            .where(eq(schema.billPayers.payerId, payer.id))
            .returning();
          console.log(returnBP);
          continue;
        }
        await db.insert(schema.billPayers).values({
          billId: bill.id,
          payerId: payer.id,
          partySize: payer.partySize,
        });
      }
    }

    console.log(new Date().toLocaleTimeString(), " - updateBillItem called"); // Log inside insertBill
    console.log(`
      Changed BillItem ${bill.id}:
      Name: ${bill.name} => ${insertedBill.name}
      Date: ${bill.date.toISOString()} => ${insertedBill.date}
      ServiceCharge: ${bill.serviceCharge} => ${insertedBill.serviceCharge}
      TotalPrice: ${bill.userEnteredTotal} => ${insertedBill.userEnteredTotal}
      `);

    return insertedBill.id;
  } catch (error) {
    console.error("Error in updateBill:", error);
    return -1;
  }
};

export const updateBillItem = async (item: BillItem): Promise<number> => {
  try {
    const mappedItem = mapBillItemToDB(item);

    const insertedItem = (
      await db
        .update(schema.billItems)
        .set(mappedItem)
        .where(eq(schema.billItems.id, item.id))
        .returning()
    )[0];

    console.log(new Date().toLocaleTimeString(), " - updateBillItem called"); // Log inside insertBill
    console.log(`
      Changed BillItem ${item.id}:
      Name: ${item.name} => ${insertedItem.name}
      Quantity: ${item.quantity} => ${insertedItem.quantity}
      Price: ${item.price} => ${insertedItem.price}
      `);

    return insertedItem.id;
  } catch (error) {
    console.error("Error in updateBillItem:", error);
    return -1;
  }
};
