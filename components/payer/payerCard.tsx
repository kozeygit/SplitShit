import { ThemedText } from "@/components/ThemedText";
import React, { useState } from "react";
import { Text, View, StyleSheet, TouchableNativeFeedback } from "react-native";

import { Bill, Payer } from "@/models/bill";
import PayerIcon from "./PayerIcon";

const PayerCard = ({ payerData }: { payerData: Payer }) => {
  return (
    <View style={styles.payerCard}>
      <PayerIcon payer={payerData}/>
      <ThemedText type="defaultSemiBold" style={styles.payerName}>
        {payerData.name.length < 20
          ? payerData.name
          : payerData.name.substring(0, 18).trim() + "..."}
      </ThemedText>
    </View>
  );
};

const styles = StyleSheet.create({
  payerCard: {
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
  payerName: {
    paddingTop: 5,
    fontSize: 14,
  },
});

export default PayerCard;
