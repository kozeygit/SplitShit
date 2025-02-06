import { drizzle } from "drizzle-orm/expo-sqlite";
import { openDatabaseSync, useSQLiteContext } from "expo-sqlite";
import * as schema from "@/db/schema";
import { mapToModel } from "./mapToModel";
import { Bill } from "../models/bill";
import { useCallback } from "react";

export const useTestDb = () => {
        const db = useSQLiteContext();
        const drizzleDb = drizzle(db, { schema });

    const insertDummyData = async () => {
        await drizzleDb.insert(schema.bills).values([
            {
                name: "Linner",
                complete: 1,
                date: "2025-02-05",
                userEnteredTotal: 20.0,
            },
            {
                name: "Brunch",
                complete: 0,
                date: "2024-12-25",
                userEnteredTotal: 20.0,
            },
            {
                name: "TGI Fridays",
                complete: 0,
                date: "2025-01-15",
                userEnteredTotal: 20.0,
            },
            {
                name: "Pizza",
                complete: 1,
                date: "2024-07-05",
                userEnteredTotal: 20.0,
            },
        ]);
    };

    const getBills = useCallback(async (): Promise<Bill[]> => {
        console.log("getBills called: ", new Date().toLocaleTimeString()); // Log inside getBills
        try {
            const result = await drizzleDb.select().from(schema.bills);
            const mappedBills: Bill[] = await Promise.all(
                result.map(async (bill) => await mapToModel(bill))
            );
            return mappedBills;
        } catch (error) {
            console.error("Error in getBills:", error);
            return []; // Or throw the error if you prefer
        }
    }, [mapToModel]); // Add dependencies

    return { getBills, insertDummyData };
};
