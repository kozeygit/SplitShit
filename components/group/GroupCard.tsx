import { ThemedText } from "@/components/ThemedText";
import React, { useState } from "react";
import { Text, View, StyleSheet } from "react-native";

import { Bill, Group, Payer } from "@/models/bill";
import PayerIcon from "../payer/PayerIcon";

const GroupCard = ({ groupData: groupData }: { groupData: Group }) => {
  let concatenate = false;
  if (groupData.payers.length > 4) {
    concatenate = true;
  }
  const shuffledPayers = groupData.payers.sort(() => 0.5 - Math.random());

  return (
    <View style={styles.groupCard}>
      <ThemedText type="defaultSemiBold" style={styles.groupName}>
        {groupData.name.length < 20
          ? groupData.name
          : groupData.name.substring(0, 18).trim() + "..."}
      </ThemedText>
      <View style={styles.payerList}>
        {shuffledPayers.slice(0, concatenate ? 3 : 4).map((payer) => (
          <PayerIcon size={30} key={payer.id} payer={payer} />
        ))}
        {concatenate && (
          <View style={styles.moreIconStyle}>
            <ThemedText type="defaultSemiBold" style={{ fontSize: 10 }}>
              {"+"}
              {groupData.payers.length - 3}
            </ThemedText>
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  moreIconStyle: {
    borderWidth: 1,
    borderRadius: "100%",
    aspectRatio: 1,
    justifyContent: "center",
    alignItems: "center",

    width: 30,
    height: 30,
    backgroundColor: "white",
  },
  payerList: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 5,
  },
  groupCard: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 5,

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
