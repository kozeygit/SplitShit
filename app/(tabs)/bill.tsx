import { ThemedText } from "@/components/ThemedText";
import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { IconSymbol } from "@/components/ui/IconSymbol";
import { Colors } from "@/constants/Colors";

const IndexPage = () => {
  return (
    <SafeAreaView style={{ flex: 1, justifyContent: "space-between", padding: 20 }}>
      {/* Title */}
      <ThemedText
        type="title"
        style={ styles.titleText }
      >
        💵 SPLIT-SHIT!!! 💩
      </ThemedText>

      {/* Add Bill Button */}
      <TouchableOpacity
        style={ styles.addBillButton }
        onPress={() => {
          console.log("Add Bill button pressed");
        }}
      >
        <ThemedText type="defaultSemiBold" style={styles.addBillText}>New Bill</ThemedText>
        <IconSymbol size={24} name="plus.app.fill" color={Colors.dark.text} style={ styles.addBillIcon } />,
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  titleText: {
    textAlign: "center",
    marginTop: 50,
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
    shadowRadius: 3.84,
    elevation: 5,
  },

  addBillIcon: {
    backgroundColor: "rgba(0,0,0,0.3)",
    borderRadius: 10,
    padding: 4,
  },

  addBillText: 
  {
    color: "white",
    fontSize: 18,
    marginLeft: 10,
  }
});

export default IndexPage;
