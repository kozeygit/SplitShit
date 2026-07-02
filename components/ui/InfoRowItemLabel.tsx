import { ThemedText } from "@/components/ThemedText";
import { View, StyleSheet } from "react-native";
import { BillItem } from "@/models/bill";

interface InfoRowProps {
  item: BillItem;
}

const InfoRowItemLabel = ({ item }: InfoRowProps) => {
  return (
    <ThemedText>
      {item.quantity} •{" "}
      {item.name.length > 25 ? item.name.slice(0, 20) + "..." : item.name}
      {item.quantity !== 1 && (
        <ThemedText type="darkGrital"> ({item.price.toDisplay()})</ThemedText>
      )}
    </ThemedText>
  );
};

export default InfoRowItemLabel;
