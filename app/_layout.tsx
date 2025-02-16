import {
    DarkTheme,
    DefaultTheme,
    NavigationContainer,
    ThemeProvider,
} from "@react-navigation/native";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import "react-native-reanimated";

import { Suspense } from "react";
import { ActivityIndicator } from "react-native";
import { SQLiteProvider, openDatabaseSync } from "expo-sqlite";
import { useMigrations } from "drizzle-orm/expo-sqlite/migrator";
import migrations from "@/drizzle/migrations";

import { useColorScheme } from "@/hooks/useColorScheme";
import { getDrizzleDb } from "../utils/database";
import { BottomTabBar } from "@react-navigation/bottom-tabs";

export const DATABASE_NAME = "bills";
const db = getDrizzleDb(); // Initialize drizzle *outside* the component

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
    const { success, error } = useMigrations(db, migrations);

    if (!success) {
        console.log(error);
    }

    const colorScheme = useColorScheme();

    const [loaded] = useFonts({
        SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
    });

    useEffect(() => {
        if (loaded) {
            SplashScreen.hideAsync();
        }
    }, [loaded]);

    if (!loaded) {
        return null;
    }

    return (
        <Suspense fallback={<ActivityIndicator size="large" />}>
            <SQLiteProvider
                databaseName={DATABASE_NAME}
                options={{ enableChangeListener: true }}
                useSuspense
            >
                <ThemeProvider
                    value={colorScheme === "dark" ? DarkTheme : DefaultTheme}
                >
                    <Stack>
                        <Stack.Screen
                            name="(tabs)"
                            options={{
                                headerShown: false,
                            }}
                        />
                        <Stack.Screen
                            name="(modals)/newBill"
                            options={{
                                headerShown: false,
                                presentation: "modal",
                                animation: "slide_from_bottom"
                            }}
                        />
                        <Stack.Screen
                            name="(modals)/newPayer"
                            options={{
                                headerShown: false,
                                presentation: "modal",
                                animation: "slide_from_bottom"
                            }}
                        />
                        <Stack.Screen
                            name="bill"
                            options={{
                                headerTitle: "Edit Bill"
                            }}
                        />
                        <Stack.Screen name="+not-found" />
                    </Stack>
                    <StatusBar style="inverted" />
                </ThemeProvider>
            </SQLiteProvider>
        </Suspense>
    );
}
