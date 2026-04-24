import * as schema from "@/db/schema";
import {
  mapBillItemToModel,
  mapBillToModel,
  mapPayerToModel,
  mapGroupToModel,
} from "./mapToModel";
import { Bill, BillItem, Group, Payer } from "../models/bill";
import { getDrizzleDb } from "./database";
import { eq, lt, gte, ne, desc } from "drizzle-orm";

const db = getDrizzleDb();

// New





export const fetchAllBills = async (): Promise<Bill[]> => {
  console.log("fetchAllBills called: ", new Date().toLocaleTimeString()); // Log inside getBills
  try {
    const result = await db
      .select()
      .from(schema.bills)
      .orderBy(desc(schema.bills.date));

    const mappedBills: Bill[] = result.map((bill) => mapBillToModel(bill));

    return mappedBills;
  } catch (error) {
    console.error("Error in fetchAllBills:", error);
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

    if (result.length === 0) { return undefined };
    
    const mappedBill: Bill = mapBillToModel(result[0]);

    mappedBill.items = await fetchBillItems(mappedBill.id);
    mappedBill.payers = await fetchPayers(mappedBill.id);

    return mappedBill;
  } catch (error) {
    console.error("Error in fetchBill:", error);
    return undefined;
  }
};

export const fetchBillItems = async (billId: number): Promise<BillItem[]> => {
  console.log("fetchBillItems called: ", new Date().toLocaleTimeString());
  try {
    const result = await db
      .select()
      .from(schema.billItems)
      .leftJoin(schema.assignedItems, eq(schema.billItems.id, schema.assignedItems.billItemId))
      .leftJoin(schema.billPayers, eq(schema.assignedItems.billPayerId, schema.billPayers.id))
      .where(eq(schema.billItems.billId, billId));


    const itemsMap = new Map<number, BillItem>();

    for (const row of result) {
      const itemId = row.bill_items.id

      if (!itemsMap.has(itemId)) {
        itemsMap.set(itemId, mapBillItemToModel(row.bill_items))
      }

      const currentItem = itemsMap.get(itemId)!;

      if (row.assigned_items && row.bill_payers?.payerId) {
        currentItem.assignedTo.push({
          payerId: row.bill_payers.payerId,
          quantity: row.assigned_items.quantity,
        });
      }
    }
    
    return Array.from(itemsMap.values());
  } catch (error) {
    console.error("Error in fetchBillItems:", error);
    return [];
  }
};

// Old


export const fetchPayers = async (billId?: number): Promise<Payer[]> => {
  console.log("fetchPayers called: ", new Date().toLocaleTimeString());
  if (billId === undefined) {
    try {
      const result = await db.select().from(schema.payers);
      const mappedPayers: Payer[] = await Promise.all(
        result.map(async (payer) => mapPayerToModel(payer)),
      );

      return mappedPayers;
    } catch (error) {
      console.error("Error in fetchPayers:", error);
      return [];
    }
  } else {
    try {
      const result = await db
        .select()
        .from(schema.payers)
        .innerJoin(
          schema.billPayers,
          eq(schema.billPayers.payerId, schema.payers.id),
        )
        .where(eq(schema.billPayers.billId, billId));

      const mappedPayers: Payer[] = await Promise.all(
        result.map(async (payer) =>
          mapPayerToModel(payer.payers, payer.bill_payers),
        ),
      );

      return mappedPayers;
    } catch (error) {
      console.error("Error in fetchPayers:", error);
      return [];
    }
  }
};



export const fetchAllGroups = async (): Promise<Group[]> => {
  console.log("fetchAllGroups called: ", new Date().toLocaleTimeString()); // Log inside getBills
  try {
    const result = await db
      .select()
      .from(schema.groups)
    const mappedGroups: Group[] = await Promise.all(
      result.map(async (group) => mapGroupToModel(group)),
    );

    return mappedGroups;
  } catch (error) {
    console.error("Error in fetchAllGroups:", error);
    return [];
  }
};

export const fetchGroup = async (
  groupId: number,
): Promise<Group | undefined> => {
  console.log("fetchGroup called: ", new Date().toLocaleTimeString());
  try {
    const result = await db
      .select()
      .from(schema.groups)
      .where(eq(schema.groups.id, groupId))
      .limit(1);

    const mappedGroup: Group = mapGroupToModel(result[0]);

    mappedGroup.payers = await fetchGroupPayers(mappedGroup.id);

    return mappedGroup;
  } catch (error) {
    console.error("Error in fetchGroup:", error);
    return undefined;
  }
};

export const fetchGroupPayers = async (groupId: number): Promise<Payer[]> => {
  console.log("fetchPayersInGroup called: ", new Date().toLocaleTimeString());
  try {
    const result = await db
      .select()
      .from(schema.payers)
      .innerJoin(
        schema.groupPayers,
        eq(schema.groupPayers.payerId, schema.payers.id),
      )
      .where(eq(schema.groupPayers.groupId, groupId));

    const mappedPayers: Payer[] = await Promise.all(
      result.map(async (payer) => mapPayerToModel(payer.payers)),
    );

    return mappedPayers;
  } catch (error) {
    console.error("Error in fetchPayersInGroup:", error);
    return [];
  }
};
