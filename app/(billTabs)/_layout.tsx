import { Tabs, useNavigation } from "expo-router";
import React, { useState } from "react";

import { Colors } from "@/constants/Colors";
import { useDrizzleStudio } from "expo-drizzle-studio-plugin";

import { useSQLiteContext } from "expo-sqlite";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useRouter } from "expo-router";

export default function TabLayout() {
  const db = useSQLiteContext();
  useDrizzleStudio(db);
  const router = useRouter();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveBackgroundColor: "#000",
        headerShown: false,
        tabBarStyle: {
          height: 60,
          borderTopWidth: 3,
          borderColor: "black",
        },
        tabBarInactiveTintColor: "black",
        animation: "none"
      }}
    >
      <Tabs.Screen
        name="bill"
        options={{
          tabBarActiveTintColor: Colors.pastel.red,
          title: "Bill",
          tabBarIcon: ({ color }) => (
            <MaterialIcons size={30} name="receipt" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="assignItems"
        options={{
          tabBarActiveTintColor: Colors.pastel.blue,
          tabBarLabelStyle: {
            paddingTop: 0,
          },
          title: "Assign Items",
          tabBarIcon: ({ color }) => (
            <MaterialIcons size={30} name="person" color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
