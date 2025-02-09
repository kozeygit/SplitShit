import { Tabs, useNavigation } from "expo-router";
import React, { useState } from "react";

import { Colors } from "@/constants/Colors";
import { useDrizzleStudio } from "expo-drizzle-studio-plugin";

import { useSQLiteContext } from "expo-sqlite";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useRouter } from "expo-router";
import { NavigationState, useRoute } from "@react-navigation/native";

export default function TabLayout() {
  const db = useSQLiteContext();
  useDrizzleStudio(db);

  const [activeTab, setActiveTab] = useState(0); // Store active tab index
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
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          tabBarActiveTintColor: Colors.pastel.red,
          title: "Bills",
          tabBarIcon: ({ color }) => (
            <MaterialIcons size={30} name="receipt" color={color} />
          ),
        }}
        listeners={() => ({
          tabPress: (e) => {
            setActiveTab(0);
          },
        })}
      />
      {
        <Tabs.Screen
          name="placeholder"
          listeners={() => ({
            tabPress: (e) => {
              e.preventDefault();

              console.log("Active Tab Index:", activeTab);

              if (activeTab === 0) {
                router.push("/(modals)/newBill");
              } else if (activeTab === 1) {
                router.push("/(modals)/newPayer");
              }
            },
          })}
          options={{
            tabBarItemStyle: {
              position: "absolute",
              marginHorizontal: "auto",
              right: 0,
              left: 0,

              maxWidth: 100,
              aspectRatio: 1,

              borderWidth: 2,
              backgroundColor: "white",
              borderRadius: "100%",

              elevation: 5,
            },
            tabBarLabelStyle: {
              paddingTop: 5,
            },
            tabBarIcon: ({ color }) => (
              activeTab === 0
                ? <MaterialIcons size={30} name="post-add" color={color} />
                : <MaterialIcons size={30} name="person-add" color={color} />
            ),
          }}
        />
      }
      <Tabs.Screen
        name="payers"
        options={{
          tabBarActiveTintColor: Colors.pastel.blue,
          tabBarLabelStyle: {
            paddingTop: 0,
          },
          title: "Payers",
          tabBarIcon: ({ color }) => (
            <MaterialIcons size={30} name="person" color={color} />
          ),
        }}
        listeners={() => ({
          tabPress: (e) => {
            setActiveTab(1);
          },
        })}
      />
    </Tabs>
  );
}
