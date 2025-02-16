import { Colors } from "@/constants/Colors";
import { SafeAreaView, ScrollView, StyleSheet, View, Text } from "react-native";
import { ThemedText } from "../ThemedText";
import { Payer } from "@/models/bill";

const colorKeys = Object.values(Colors.pastel);

const PayerIcon = ({ payer }: { payer: Payer }) => {
  const iconColor = colorKeys[Number(payer.id) % colorKeys.length];
  return (
    <View style={[styles.payerIconStyle, { backgroundColor: iconColor }]}>
      <ThemedText type="defaultSemiBold">
        {payer.name.substring(0, 2)}
      </ThemedText>
    </View>
  );
};

export default PayerIcon;

const styles = StyleSheet.create({
  payerIconStyle: {
    borderWidth: 1,
    borderRadius: "100%",
    padding: 10,
    width: 45,
    aspectRatio: 1,
    justifyContent: "center",
    alignItems: "center",
  },
})