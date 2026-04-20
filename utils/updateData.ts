import * as schema from "@/db/schema";
import { mapBillItemToDB, mapBillToDB, mapPayerToDB } from "./mapToDb";
import {
  Bill,
  BillItem,
  Group,
  NewBill,
  NewBillItem,
  NewPayer,
  Payer,
} from "../models/bill";
import { getDrizzleDb } from "./database";
import { eq, lt, gte, ne, and } from "drizzle-orm";
import { fetchBillItems, fetchGroupPayers, fetchPayers } from "./fetchData";
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

    updateBillItems(bill);
    updateBillPayers(bill);
    updateItemAssignments(bill);

    return insertedBill.id;
  } catch (error) {
    console.error("Error in updateBill:", error);
    return -1;
  }
};

const updateItemAssignments = async (bill: Bill): Promise<void> => {
  const billPayers = await db
    .select()
    .from(schema.billPayers)
    .where(eq(schema.billPayers.billId, bill.id));

  // Change bill item assignments
  for (const item of bill.items) {
    const oldAssignments = await db
      .select()
      .from(schema.assignedItems)
      .where(eq(schema.assignedItems.billItemId, item.id));

    for (const oldAssignment of oldAssignments) {
      let found = false;
      for (const bp of billPayers) {
        if (bp.id == oldAssignment.billPayerId) {
          found = true;
          if (item.assignedTo.find((obj) => obj.payerId == bp.payerId) === undefined) {
            found = false;
          }
        }
      }
      if (!found) {
        await db
          .delete(schema.assignedItems)
          .where(eq(schema.assignedItems.id, oldAssignment.id));
      }
    }

    for (const bp of billPayers) {
      const isOldAssignment = oldAssignments.some(
        (oldAssignment) => oldAssignment.billPayerId == bp.id
      );
      if (isOldAssignment) {
        continue;
      }
      const assignedTo = item.assignedTo.find((obj) => obj.payerId == bp.payerId)
      if (assignedTo === undefined) {
        continue
      }

      await db.insert(schema.assignedItems).values({
        quantity: assignedTo.quantity,
        billItemId: item.id,
        billPayerId: bp.id,
      });
    }
  }
};


const updateGroupPayers = async (group: Group): Promise<void> => {
  // Change group payers
  const oldPayers = await fetchGroupPayers(group.id);
  // Delete old payers that are not in the new group
  for (const oldPayer of oldPayers) {
    let found = false;
    for (const payer of group.payers) {
      if (payer.id == oldPayer.id) {
        found = true;
      }
    }
    if (!found) {
      const deletedGP = await db
        .delete(schema.groupPayers)
        .where(
          and(
            eq(schema.groupPayers.payerId, oldPayer.id),
            eq(schema.groupPayers.groupId, group.id)
          )
        )
        .returning();

      await db
        .delete(schema.assignedItems)
        .where(eq(schema.assignedItems.billPayerId, deletedGP[0].id));
    }
  }

  for (const payer of group.payers) {
    const isOldPayer = oldPayers.some((oldPayer) => oldPayer.id == payer.id);
      if (isOldPayer) {
        continue;
      }
      await db.insert(schema.groupPayers).values({
        groupId: group.id,
        payerId: payer.id,
      });
  }
};



const updateBillPayers = async (bill: Bill): Promise<void> => {
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
        .where(
          and(
            eq(schema.billPayers.payerId, oldPayer.id),
            eq(schema.billPayers.billId, bill.id)
          )
        )
        .returning();

      await db
        .delete(schema.assignedItems)
        .where(eq(schema.assignedItems.billPayerId, deletedBP[0].id));
    }
  }

  for (const payer of bill.payers) {
    const isOldPayer = oldPayers.some((oldPayer) => oldPayer.id == payer.id);
    if (payer.partySize !== undefined) {
      if (isOldPayer) {
        const returnBP = await db
          .update(schema.billPayers)
          .set({ partySize: payer.partySize })
          .where(eq(schema.billPayers.payerId, payer.id))
          .returning();
        continue;
      }
      await db.insert(schema.billPayers).values({
        billId: bill.id,
        payerId: payer.id,
        partySize: payer.partySize,
      });
    }
  }
};

const updateBillItems = async (bill: Bill): Promise<void> => {
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

      await db
        .delete(schema.assignedItems)
        .where(eq(schema.assignedItems.billPayerId, oldItem.id));
    }
  }
  for (const item of bill.items) {
    const isOldItem = oldItems.some((oldItem) => isEqual(oldItem, item));
    if (isOldItem) {
      continue;
    }
    if (item.id > 1_000_000_000) {
      const newId = await insertBillItem(item, bill.id);
      item.id = newId;
      continue;
    }
    await updateBillItem(item);
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

    return insertedItem.id;
  } catch (error) {
    console.error("Error in updateBillItem:", error);
    return -1;
  }
};
