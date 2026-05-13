import { Pressable, StyleSheet, View } from "react-native";
import PayerIcon from "@/components/payer/PayerIcon";
import { ThemedText } from "@/components/ThemedText";
import { Payer } from "@/models/bill";
import Animated, { LinearTransition } from "react-native-reanimated";
import * as Haptics from "expo-haptics";
import Touchable from "../ui/Touchable";

type Props = {
  payer: Payer;
  selected: boolean;
  onAddPayer: () => void;
  onRemovePayer: () => void;
};

const AdjustPayer = ({
  payer,
  selected,
  onAddPayer: addPayer,
  onRemovePayer: removePayer,
}: Props) => {
  return (
    <View style={styles.payerRow}>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
        <Touchable
          hapticFunction={Haptics.ImpactFeedbackStyle.Rigid}
          onPress={selected ? removePayer : addPayer}
        >
          <PayerIcon payer={payer} checked={selected} />
        </Touchable>
        <ThemedText>{payer.name}</ThemedText>
      </View>
      <Animated.View
        style={styles.addButtonContainer}
        layout={LinearTransition.springify(2)}
      >
        <Touchable
          hapticFunction={Haptics.ImpactFeedbackStyle.Soft}
          style={styles.addButton}
          onPress={selected ? removePayer : addPayer}
        >
          <ThemedText>{selected ? "Remove" : "Add"}</ThemedText>
        </Touchable>
      </Animated.View>
    </View>
  );
};

export default AdjustPayer;

const styles = StyleSheet.create({
  payerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 10,
    paddingRight: 10,
  },
  addButtonContainer: {
    borderWidth: 1,
    borderRadius: 50,
    overflow: "hidden",
    alignItems: "center",
  },
  addButton: {
    backgroundColor: "white",
    padding: 5,
    paddingHorizontal: 20,
    alignItems: "flex-start",
    overflow: "hidden",
  },
});
