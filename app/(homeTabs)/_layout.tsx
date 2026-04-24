import { Tabs, useRouter } from "expo-router";
import React, { useState, useEffect } from "react";
import { Pressable, View, StyleSheet, Dimensions } from "react-native";
import { Colors } from "@/constants/Colors";
import { useDrizzleStudio } from "expo-drizzle-studio-plugin";
import { useSQLiteContext } from "expo-sqlite";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from "react-native-reanimated";
import { ThemedText } from "@/components/ThemedText";

const { width } = Dimensions.get("window");
// We divide by 3 because visually there are only 3 columns of icons
const TAB_WIDTH = width / 3;

export default function TabLayout() {
  const db = useSQLiteContext();
  useDrizzleStudio(db);

  const [activeTab, setActiveTab] = useState(0);
  const router = useRouter();

  const translateX = useSharedValue(0);

  useEffect(() => {
    translateX.value = withSpring(activeTab * TAB_WIDTH, {
      damping: 15,
      stiffness: 120,
    });
  }, [activeTab]);

  const animatedFabStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  const handleAction = () => {
    if (activeTab === 0) router.push("/(modals)/newBill");
    else if (activeTab === 1) router.push("/(modals)/newPayer");
    else if (activeTab === 2) router.push("/(modals)/newGroup");
  };

  return (
    <View style={{ flex: 1 }}>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarStyle: styles.tabBar,
          tabBarInactiveTintColor: "black",
          tabBarActiveTintColor: "black",

        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: "Bills",
            tabBarIcon: ({ color }) => (
              <MaterialIcons size={30} name="receipt" color={color} />
            ),
          }}
          listeners={{ tabPress: () => setActiveTab(0) }}
        />
        <Tabs.Screen
          name="payers"
          options={{
            title: "Payers",
            tabBarIcon: ({ color }) => (
              <MaterialIcons size={30} name="person" color={color} />
            ),
          }}
          listeners={{ tabPress: () => setActiveTab(1) }}
        />
        <Tabs.Screen
          name="groups"
          options={{
            title: "Groups",
            tabBarIcon: ({ color }) => (
              <MaterialIcons size={30} name="group" color={color} />
            ),
          }}
          listeners={{ tabPress: () => setActiveTab(2) }}
        />
      </Tabs>

      {/* THE FAB: This is the visual element that slides */}
      <View style={styles.fabContainer} pointerEvents="box-none">
        <Animated.View style={[styles.fabWrapper, animatedFabStyle]}>
          <Pressable
            onPress={handleAction}
            style={({ pressed }) => [
              styles.fabCircle,
              {
                backgroundColor:
                  activeTab === 0
                    ? Colors.pastel.red
                    : activeTab === 1
                      ? Colors.pastel.blue
                      : Colors.pastel.green,
                transform: [{ scale: pressed ? 0.95 : 1 }], // Extra bit of feedback
              },
            ]}
          >
            <MaterialIcons
              name={
                activeTab === 0
                  ? "post-add"
                  : activeTab === 1
                    ? "person-add"
                    : "group-add"
              }
              size={32}
              color="black"
            />
            <ThemedText type="defaultSemiBold">{
              activeTab === 0
                ? "Add Bill"
                : activeTab === 1
                  ? "Add Person"
                  : "Add Group"
            }</ThemedText>
          </Pressable>
        </Animated.View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    height: 80,
    borderTopWidth: 2,
    borderColor: "black",
    backgroundColor: "white",
    alignContent: "center"
  },
  fabContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "flex-end",
    // This allows you to tap the tabs BEHIND the FAB layer
    zIndex: 10,
  },
  fabWrapper: {
    width: TAB_WIDTH,
    alignItems: "center",
    paddingBottom: 10, // Adjust this to sit "on" the bar
  },
  fabCircle: {
    width: 150,
    height: 100,
    borderRadius: 100,
    borderWidth: 2,
    borderColor: "black",
    elevation: 8,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
});
