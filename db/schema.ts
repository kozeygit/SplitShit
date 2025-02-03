// schema.ts
import {
    integer,
    sqliteTable,
    text,
    real,
    int,
} from "drizzle-orm/sqlite-core";

export const bills = sqliteTable("bills", {
    id: text("id").primaryKey(),
    name: text("name").notNull(),
    date: text("date").notNull(),
    userEnteredTotal: real("user_entered_total").notNull(),
    subTotal: real("sub_total").notNull(),
    finalTotal: real("final_total").notNull(),
    serviceCharge: real("service_charge").default(0),
    complete: int("complete").notNull(),
});

export const payers = sqliteTable("payers", {
    id: text("id").primaryKey(),
    name: text("name").notNull(),
});

export const billItems = sqliteTable("bill_items", {
    id: text("id").primaryKey(),
    name: text("name").notNull(),
    price: real("price").notNull(),
    quantity: integer("quantity").notNull(),
    totalPrice: real("total_price").notNull(),
    assignedTo: text("assigned_to").notNull(),
    isDiscounted: int("is_discounted").default(0),
    discountedPrice: real("discounted_price"),
    category: text("category"),
    billId: text("bill_id").references(() => bills.id),
});

export const assignedItems = sqliteTable("assigned_items", {
    id: text("id").primaryKey(),
    billItemId: text("bill_item_id").references(() => billItems.id),
    payerId: text("payer_id").references(() => payers.id),
});

export const discounts = sqliteTable("discounts", {
    id: text("id").primaryKey(),
    usePercentage: int("use_percentage").notNull(),
    percentage: real("percentage"),
    amount: real("amount"),
});

export const billPayers = sqliteTable("bill_payers", {
    id: text("id").primaryKey(),
    billId: text("bill_id").references(() => bills.id),
    payerId: text("payer_id").references(() => payers.id),
    partySize: integer("party_size").notNull(),
    amountToPay: real("amount_to_pay").notNull(),
});
