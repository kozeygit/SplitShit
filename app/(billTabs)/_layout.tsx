import { Tabs, useNavigation } from "expo-router";
import React, { useState } from "react";

import { Colors } from "@/constants/Colors";

import MaterialIcons from "@expo/vector-icons/MaterialIcons";

export default function TabLayout() {

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
          tabBarActiveTintColor: Colors.pastel.orange,
          title: "Assign Items",
          tabBarIcon: ({ color }) => (
            <MaterialIcons size={30} name="person" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="breakdown"
        options={{
          tabBarActiveTintColor: Colors.pastel.turquoise,
          title: "Breakdown",
          tabBarIcon: ({ color }) => (
            <MaterialIcons size={30} name="payments" color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
