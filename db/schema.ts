// schema.ts
import { integer, sqliteTable, text, real } from "drizzle-orm/sqlite-core";

export const bills = sqliteTable("bills", {
    id: integer("id").primaryKey({ autoIncrement: true }),
    name: text("name").notNull(),
    date: text("date").notNull(),
    userEnteredTotal: real("user_entered_total").notNull(),
    serviceCharge: real("service_charge").notNull().default(0),
    complete: integer("complete").notNull(),
});

export const payers = sqliteTable("payers", {
    id: integer("id").primaryKey({ autoIncrement: true }),
    name: text("name").notNull(),
    number: text("number"),
    email: text("email"),
});

export const billItems = sqliteTable("bill_items", {
    id: integer("id").primaryKey({ autoIncrement: true }),
    name: text("name").notNull(),
    price: real("price").notNull(),
    quantity: integer("quantity").notNull(),
    category: text("category"),
    billId: integer("bill_id").references(() => bills.id),
});

export const assignedItems = sqliteTable("assigned_items", {
    id: integer("id").primaryKey({ autoIncrement: true }),
    billItemId: integer("bill_item_id").references(() => billItems.id),
    payerId: integer("payer_id").references(() => payers.id),
});

export const billPayers = sqliteTable("bill_payers", {
    id: integer("id").primaryKey({ autoIncrement: true }),
    billId: integer("bill_id").references(() => bills.id),
    payerId: integer("payer_id").references(() => payers.id),
    partySize: integer("party_size").notNull(),
});