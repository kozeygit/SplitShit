import * as schema from "@/db/schema";
import { getDrizzleDb } from "./database";
import { eq, lt, gte, ne, count, and } from "drizzle-orm";

const db = getDrizzleDb();

// Not Finished
export const removeBill = async (billId: number): Promise<number> => {
  try {
    const removed = await db
      .delete(schema.bills)
      .where(eq(schema.bills.id, billId))
      .returning({ id: schema.bills.id });

    if (removed.length === 0) {
      console.log("No bill found to delete");
      return -1;
    }

    console.log(new Date().toLocaleTimeString(), " - removeBill called");
    return removed[0].id;
  } catch (error) {
    console.error("Error in removeBill:", error);
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

// actually just archiving the payer
export const removePayer = async (payerId: number): Promise<number> => {
  try {
    const removed = await db
      .update(schema.payers)
      .set({ isArchived: true})
      .where(eq(schema.payers.id, payerId))
      .returning({ id: schema.payers.id });

    
    if (removed.length === 0) {
      console.log("No payer found to delete");
      return -1;
    }

    if (removed.length > 1) {
      console.error("uh oh, big problem - multiple items deleted");
      throw new Error("More than 1 item deleted????");
    }

    console.log(new Date().toLocaleTimeString(), " - removePayer called");

    return removed[0].id
  } catch (error) {
    console.error("Error in removePayer:", error);
    return -1;
  }
};

// actually just archiving the group
export const removeGroup = async (groupId: number): Promise<number> => {
  try {
    const removed = await db
      .update(schema.groups)
      .set({ isArchived: true })
      .where(eq(schema.groups.id, groupId))
      .returning({ id: schema.groups.id });

    if (removed.length === 0) {
      console.log("No group found to delete");
      return -1;
    }

    console.log(new Date().toLocaleTimeString(), " - removeGroup called");
    return removed[0].id;
  } catch (error) {
    console.error("Error in removeGroup:", error);
    return -1;
  }
};

export const removeBillItem = async (
  itemId: number,
): Promise<number> => {
  try {
    const removed = await db
      .delete(schema.billItems)
      .where(eq(schema.billItems.id, itemId))
      .returning({ id: schema.billItems.id });

    if (removed.length === 0) {
        console.log("No item found to delete");
        return -1;
    }

    if (removed.length > 1) {
      console.error("uh oh, big problem - multiple items deleted");
      throw new Error("More than 1 item deleted????");
    }

    console.log(new Date().toLocaleTimeString(), " - removeBillItem called (cascade cleanup handled by DB)");

    return removed[0].id;
  } catch (error) {
    console.error("Error in removeBillItem:", error);
    return -1;
  }
};
