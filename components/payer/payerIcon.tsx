import { Colors } from "@/constants/Colors";
import { SafeAreaView, ScrollView, StyleSheet, View, Text } from "react-native";
import { ThemedText } from "../ThemedText";
import { Payer } from "@/models/bill";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";

const colorKeys = Object.values(Colors.pastel);

const PayerIcon = ({ payer, size = 40, checked = false }: { payer: Payer, size?: number, checked?: boolean }) => {
  const iconColor = colorKeys[Number(payer.id) % colorKeys.length];
  return (
    <View style={[styles.payerIconStyle, { width: size, height: size, backgroundColor: iconColor }]}>
      <ThemedText type="defaultSemiBold">
        {payer.name.substring(0, 2)}
      </ThemedText>
                  {checked ? (
                    <View
                      style={{
                        position: "absolute",
                        height: "100%",
                        width: "100%",
                        aspectRatio: 1,
                        backgroundColor: "rgba(0,0,0,0.5)",
                        borderRadius: "100%",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <MaterialIcons name="check" size={size/2} color="white" />
                    </View>
      ) : null}
    </View>
  );
};

export default PayerIcon;

const styles = StyleSheet.create({
  payerIconStyle: {
    borderWidth: 1,
    borderRadius: "100%",
    aspectRatio: 1,
    justifyContent: "center",
    alignItems: "center",
  },
})