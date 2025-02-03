import { ThemedText } from "@/components/ThemedText";
import React from "react";
import { View, TouchableOpacity, StyleSheet, FlatList } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { IconSymbol } from "@/components/ui/IconSymbol";
import { Colors } from "@/constants/Colors";

const IndexPage = () => {
  const dummyBills = [
    {
      id: "1",
      name: "Dinner at Luigi's",
      date: "2025-02-01",
      time: "7:30 PM",
      total: "$120.50",
      isPaid: false,
    },
    {
      id: "2",
      name: "Brunch with Friends",
      date: "2025-01-28",
      time: "11:00 AM",
      total: "$85.00",
      isPaid: true,
    },
  ];

  return (
    <SafeAreaView style={{ flex: 1, padding: 20 }}>
      {/* Title */}
      <ThemedText type="title" style={styles.titleText}>
        💵 SPLIT-SHIT!!! 💩
      </ThemedText>

      {/* Bill Cards */}
      <FlatList
        data={dummyBills}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.billCard}>
            <IconSymbol
              size={35}
              name="note"
              color="#000"
              style={styles.billIcon}
            />
            <View style={styles.billDetails}>
              <ThemedText type="defaultSemiBold" style={styles.billName}>
                {item.name}
              </ThemedText>
              <ThemedText type="default" style={styles.billSubtext}>
                {`${item.date}, ${item.time}`}
              </ThemedText>
            </View>
            <View style={styles.billMeta}>
              <ThemedText type="subtitle" style={styles.billTotal}>
                {item.total}
              </ThemedText>
            </View>
          </View>
        )}
      />

      {/* Add Bill Button */}
      <TouchableOpacity
        style={styles.addBillButton}
        onPress={() => {
          console.log("Add Bill button pressed");
        }}
      >
        <ThemedText type="defaultSemiBold" style={styles.addBillText}>
          New Bill
        </ThemedText>
        <IconSymbol
          size={24}
          name="plus.app.fill"
          color={Colors.dark.text}
          style={styles.addBillIcon}
        />
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  titleText: {
    marginVertical: 50,
    textAlign: "center",
  },
  
  billCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f9f9f9",
    padding: 15,
    marginVertical: 10,
    borderRadius: 10,
    shadowColor: "#000",
    shadowOpacity: 0.25,
    shadowRadius: 3,
    elevation: 5,
  },
  billIcon: {
    marginRight: 15,
  },
  billDetails: {
    flex: 1,
  },
  billName: {
    fontSize: 16,
    marginBottom: 5,
  },
  billSubtext: {
    fontSize: 14,
    color: "#888",
  },
  billMeta: {
    alignItems: "flex-end",
  },
  billTotal: {
    fontSize: 18,
  },
  addBillButton: {
    position: "absolute",
    flexDirection: "row",
    bottom: 30,
    right: 30,
    gap: 10,
    backgroundColor: "rgb(25, 150, 125)",
    borderRadius: 10,
    paddingVertical: 5,
    paddingHorizontal: 5,
    justifyContent: "space-evenly",
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.25,
    shadowRadius: 3,
    elevation: 5,
  },
  addBillIcon: {
    backgroundColor: "rgba(0,0,0,0.3)",
    borderRadius: 10,
    padding: 4,
  },
  addBillText: {
    color: "white",
    fontSize: 18,
    marginLeft: 10,
  },
});

export default IndexPage;
