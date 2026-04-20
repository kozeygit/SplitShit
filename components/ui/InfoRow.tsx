import { ThemedText } from "@/components/ThemedText";
import React, { ReactNode } from "react";
import { View, StyleSheet } from "react-native";

interface InfoRowProps {
  label: ReactNode;
  value: ReactNode;
  showSeparator?: boolean;
}

const InfoRow = ({ label, value, showSeparator = true }: InfoRowProps) => {
  return (
    <View style={styles.infoRow}>
      <View style={styles.labelContainer}>{label}</View>
      {showSeparator && <View style={styles.itemPriceSeparator} />}
      <View style={styles.valueContainer}>{value}</View>
    </View>
  );
};

export default InfoRow;

const styles = StyleSheet.create({
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  labelContainer: {
    flex: 0,
  },
  valueContainer: {
    flex: 0,
  },
  itemPriceSeparator: {
    borderBottomWidth: 1,
    flex: 1,
    height: "50%",
    borderStyle: "dotted",
    marginHorizontal: 5,
    borderColor: "grey",
  },
});
