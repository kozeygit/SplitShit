// In your database.ts (or similar utility file):
import { drizzle } from "drizzle-orm/expo-sqlite";
import { openDatabaseSync } from "expo-sqlite";
import * as schema from "@/db/schema";

let drizzleDbInstance: ReturnType<typeof drizzle> | null = null;

export const getDrizzleDb = () => {
    if (!drizzleDbInstance) {
        const db = openDatabaseSync("bills");

        // 1. Enable Foreign Keys (The one you definitely need for Cascade)
        db.execSync('PRAGMA foreign_keys = ON;');
        
        // 2. Enable WAL Mode (The performance booster)
        db.execSync('PRAGMA journal_mode = WAL;');

        // 3. Enable Recursive Triggers (The 'Safety Net' for Cascade)
        db.execSync('PRAGMA recursive_triggers = ON;');

        drizzleDbInstance = drizzle(db, { schema });
    }
    return drizzleDbInstance;
};