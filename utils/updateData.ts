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
import { insertBillItem, insertBillPayer } from "./insertData";
import { isEqual } from "lodash";
import { removeBillItem, removeBillPayer } from "./removeData";

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
  const oldPayers = await fetchPayers(bill.id);
  
  const oldIds = oldPayers.map(p => p.id);
  const newIds = bill.payers.map(p => p.id);

  // 1. DELETE: Payers in DB but NOT in the new draft
  const toDelete = oldPayers.filter(p => !newIds.includes(p.id));
  for (const payer of toDelete) {
    await removeBillPayer(bill.id, payer.id);
  }

  // 2. INSERT: Payers in draft but NOT in DB
  const toInsert = bill.payers.filter(p => !oldIds.includes(p.id));
  for (const payer of toInsert) {
    await insertBillPayer(bill.id, payer);
  }

  // 3. UPDATE: Payers in both, but partySize might have changed
  const toUpdate = bill.payers.filter(p => oldIds.includes(p.id));
  for (const payer of toUpdate) {
    const oldPayer = oldPayers.find(op => op.id === payer.id);
    // Only touch the DB if the data actually changed
    if (oldPayer && oldPayer.partySize !== payer.partySize) {
       await updateBillPayerPartySize(bill.id, payer);
    }
  }
};

const updateBillItems = async (bill: Bill): Promise<void> => {
  const oldItems = await fetchBillItems(bill.id);
  
  const oldIds = oldItems.map(i => i.id);
  const newIds = bill.items.map(i => i.id);

  // 1. DELETE: Items in DB but NOT in the draft
  const toDelete = oldItems.filter(i => !newIds.includes(i.id));
  for (const item of toDelete) {
    // Cascade handles assignedItems cleanup automatically!
    await removeBillItem(item.id);
  }

  // 2. INSERT: Truly new items (IDs > 1 billion)
  const toInsert = bill.items.filter(i => i.id > 1_000_000_000);
  for (const item of toInsert) {
    const newId = await insertBillItem(item, bill.id);
    item.id = newId; // Update local ID for subsequent steps
  }

  // 3. UPDATE: Existing items that have actually changed
  const toUpdate = bill.items.filter(i => oldIds.includes(i.id));
  for (const item of toUpdate) {
    const oldItem = oldItems.find(oi => oi.id === item.id);
    // Use isEqual to check if properties like price, name, or quantity changed
    if (oldItem && !isEqual(oldItem, item)) {
      await updateBillItem(item);
    }
  }
};

export const updateBillItem = async (item: BillItem): Promise<number> => {
  try {
    const mappedItem = mapBillItemToDB(item);

    const updated = await db
      .update(schema.billItems)
      .set(mappedItem)
      .where(eq(schema.billItems.id, item.id))
      .returning({ id: schema.billItems.id });

    return updated[0]?.id ?? -1;
  } catch (error) {
    console.error("Error in updateBillItem:", error);
    return -1;
  }
};

export const updateBillPayerPartySize = async (billId: number, payer: Payer) => {
  return await db
    .update(schema.billPayers)
    .set({ partySize: payer.partySize })
    .where(and(
      eq(schema.billPayers.billId, billId),
      eq(schema.billPayers.payerId, payer.id)
    ));
};