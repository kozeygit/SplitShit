import { ThemedText } from "@/components/ThemedText";
import React, { useState } from "react";
import { Text, View, StyleSheet } from "react-native";
import Touchable from "@/components/ui/Touchable";
import { Bill, Payer } from "@/models/bill";
import PayerIcon from "./PayerIcon";

const PayerCard = ({
  payerData,
  onLongPress,
}: {
  payerData: Payer;
  onLongPress: () => void;
}) => {
  return (
    <Touchable onLongPress={onLongPress} style={styles.payerCard}>
      <PayerIcon payer={payerData} />
      <ThemedText type="defaultSemiBold" style={styles.payerName}>
        {payerData.name.length < 20
          ? payerData.name
          : payerData.name.substring(0, 18).trim() + "..."}
      </ThemedText>
    </Touchable>
  );
};

const styles = StyleSheet.create({
  payerCard: {
    padding: 10,
    flex: 1,
    alignItems: "center",
    justifyContent: "space-evenly",

    overflow: "hidden",

    backgroundColor: "white",
    borderWidth: 2,
    borderRadius: 20,
    margin: 10,

    elevation: 5,
  },
  payerName: {
    textAlign: "center",
    lineHeight: 18,
    paddingTop: 5,
    fontSize: 14,
  },
});

export default PayerCard;
