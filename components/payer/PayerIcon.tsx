import { Colors } from "@/constants/Colors";
import { View, ScrollView, StyleSheet, Text } from "react-native";
import { ThemedText } from "../ThemedText";
import { Payer } from "@/models/bill";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";

const colorKeys = Object.values(Colors.pastel);

const PayerIcon = ({
  payer,
  size = 40,
  checked = false,
}: {
  payer: Payer;
  size?: number;
  checked?: boolean;
}) => {
  const iconColor = colorKeys[Number(payer.id) % colorKeys.length];
  return (
    <View
      style={[
        styles.payerIconStyle,
        { width: size, height: size, backgroundColor: iconColor },
      ]}
    >
      <ThemedText type="defaultSemiBold" style={{ fontSize: 15 }}>
        {payer.name.substring(0, 3)}
      </ThemedText>
      {checked && (
        <View style={styles.checkedStyle}>
          <MaterialIcons name="check" size={size / 1.5} color={iconColor} />
        </View>
      )}
    </View>
  );
};

export default PayerIcon;

const styles = StyleSheet.create({
  checkedStyle: {
    position: "absolute",
    height: "100%",
    width: "100%",
    aspectRatio: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    borderRadius: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
  payerIconStyle: {
    borderWidth: 1,
    borderRadius: "100%",
    aspectRatio: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
