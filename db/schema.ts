// schema.ts
import { integer, sqliteTable, text, unique } from "drizzle-orm/sqlite-core";

export const bills = sqliteTable("bills", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  date: text("date").notNull(),
  userEnteredTotal: integer("user_entered_total").notNull(),
  serviceCharge: integer("service_charge").notNull().default(0),
  complete: integer("complete").notNull(),
  groupId: integer("group_id").references(() => groups.id) 
});

export const payers = sqliteTable("payers", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  number: text("number"),
  email: text("email"),
  isArchived: integer("is_archived", { mode: 'boolean' }).notNull().default(false),
});

export const billItems = sqliteTable("bill_items", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  price: integer("price").notNull(),
  quantity: integer("quantity").notNull(),
  category: text("category"),
  billId: integer("bill_id").references(() => bills.id, { onDelete: "cascade" }),
});

export const billPayers = sqliteTable("bill_payers", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  billId: integer("bill_id").references(() => bills.id, { onDelete: "cascade" }),
  payerId: integer("payer_id").references(() => payers.id), 
  partySize: integer("party_size").notNull(),
  addedWithGroup: integer("added_with_group", { mode: 'boolean' }).notNull().default(false),
}, (table) => [
  unique("bill_payer_unique").on(table.billId, table.payerId),
]);

export const assignedItems = sqliteTable("assigned_items", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  quantity: integer("quantity").notNull(),
  billItemId: integer("bill_item_id").references(() => billItems.id, { onDelete: "cascade" }),
  billPayerId: integer("bill_payer_id").references(() => billPayers.id, { onDelete: "cascade" }),
});

export const groups = sqliteTable("groups", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  description: text("description"),
  isArchived: integer("is_archived", { mode: 'boolean' }).notNull().default(false),
});

export const groupPayers = sqliteTable("group_payers", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  groupId: integer("group_id").references(() => groups.id, { onDelete: "cascade" }),
  payerId: integer("payer_id").references(() => payers.id),
}, (table) => [
  unique("group_payer_unique").on(table.groupId, table.payerId),
]);