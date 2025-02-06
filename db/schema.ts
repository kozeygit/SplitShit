// schema.ts
import { integer, sqliteTable, text, real } from "drizzle-orm/sqlite-core";

export const bills = sqliteTable("bills", {
    id: integer("id").primaryKey({ autoIncrement: true }),
    name: text("name").notNull(),
    date: text("date").notNull(),
    userEnteredTotal: real("user_entered_total").notNull(),
    serviceCharge: real("service_charge").default(0),
    complete: integer("complete").notNull(),
});

export const payers = sqliteTable("payers", {
    id: integer("id").primaryKey({ autoIncrement: true }),
    name: text("name").notNull(),
    number: integer("number"),
    email: text("email"),
});

export const billItems = sqliteTable("bill_items", {
    id: integer("id").primaryKey({ autoIncrement: true }),
    name: text("name").notNull(),
    price: real("price").notNull(),
    quantity: integer("quantity").notNull(),
    isDiscounted: integer("is_discounted").default(0),
    discountedPrice: real("discounted_price"),
    category: text("category"),
    billId: text("bill_id").references(() => bills.id),
});

export const assignedItems = sqliteTable("assigned_items", {
    id: integer("id").primaryKey({ autoIncrement: true }),
    billItemId: text("bill_item_id").references(() => billItems.id),
    payerId: text("payer_id").references(() => payers.id),
});

export const discounts = sqliteTable("discounts", {
    id: integer("id").primaryKey({ autoIncrement: true }),
    usePercentage: integer("use_percentage").notNull(),
    percentage: real("percentage"),
    amount: real("amount"),
});

export const billDiscounts = sqliteTable("bill_discounts", {
    id: integer("id").primaryKey({ autoIncrement: true }),
    billId: text("bill_id").references(() => bills.id),
    discountId: text("discount_id").references(() => discounts.id),
});

export const billItemDiscounts = sqliteTable("bill_item_discounts", {
    id: integer("id").primaryKey({ autoIncrement: true }),
    billItemId: text("bill_item_id").references(() => billItems.id),
    discountId: text("discount_id").references(() => discounts.id),
});

export const billPayers = sqliteTable("bill_payers", {
    id: integer("id").primaryKey({ autoIncrement: true }),
    billId: text("bill_id").references(() => bills.id),
    payerId: text("payer_id").references(() => payers.id),
    partySize: integer("party_size").notNull(),
});