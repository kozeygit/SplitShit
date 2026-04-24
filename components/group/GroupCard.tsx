import { ThemedText } from "@/components/ThemedText";
import React, { useState } from "react";
import { Text, View, StyleSheet } from "react-native";

import { Bill, Group, Payer } from "@/models/bill";

const GroupCard = ({ groupData: groupData }: { groupData: Group }) => {
  return (
    <View style={styles.groupCard}>
      <ThemedText type="defaultSemiBold" style={styles.groupName}>
        {groupData.name.length < 20
          ? groupData.name
          : groupData.name.substring(0, 18).trim() + "..."}
      </ThemedText>
    </View>
  );
};

const styles = StyleSheet.create({
  groupCard: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",

    maxHeight: 100,
    aspectRatio: 1,
    overflow: "hidden",

    backgroundColor: "white",
    borderWidth: 2,
    borderRadius: 20,
    margin: 10,

    elevation: 5,
  },
  groupName: {
    paddingTop: 5,
    fontSize: 14,
  },
});

export default GroupCard;
