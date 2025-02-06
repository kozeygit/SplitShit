// In your database.ts (or similar utility file):
import { drizzle } from "drizzle-orm/expo-sqlite";
import { openDatabaseSync } from "expo-sqlite";
import * as schema from "@/db/schema";

let drizzleDbInstance: ReturnType<typeof drizzle> | null = null;

export const getDrizzleDb = () => {
    if (!drizzleDbInstance) {
        const db = openDatabaseSync("bills"); // Or your database name
        drizzleDbInstance = drizzle(db, {schema});
    }
    return drizzleDbInstance;
};