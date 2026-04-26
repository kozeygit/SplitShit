import { Tabs, useRouter } from "expo-router";
import React, { useState, useEffect } from "react";
import { Pressable, View, StyleSheet, Dimensions } from "react-native";
import { Colors } from "@/constants/Colors";
import { useDrizzleStudio } from "expo-drizzle-studio-plugin";
import { useSQLiteContext } from "expo-sqlite";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";

export default function TabLayout() {
  const db = useSQLiteContext();
  useDrizzleStudio(db);
  const insets = useSafeAreaInsets();

  return (
    <View style={{ flex: 1, paddingBottom: insets.bottom, backgroundColor: "black"}}>
      <Tabs
        safeAreaInsets={{ bottom: 0 }} // 1. Tell the navigator NOT to add space at the bottom
        screenOptions={{
          headerShown: false,
          tabBarActiveBackgroundColor: "black",
          tabBarInactiveTintColor: "black",
          tabBarStyle: {
          height: 60,
          borderTopWidth: 2,
          borderColor: "black",
        },

        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: "Bills",
            tabBarActiveTintColor: Colors.pastel.red,
            tabBarIcon: ({ color }) => (
              <MaterialIcons size={30} name="receipt" color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="groups"
          options={{
            title: "Groups",
            tabBarActiveTintColor: Colors.pastel.green,
            tabBarIcon: ({ color }) => (
              <MaterialIcons size={30} name="group" color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="payers"
          options={{
            title: "Payers",
            tabBarActiveTintColor: Colors.pastel.blue,
            tabBarIcon: ({ color }) => (
              <MaterialIcons size={30} name="person" color={color} />
            ),
          }}
        />
      </Tabs>

    </View>
  );
}