import { Pressable, StyleSheet, View } from "react-native";
import PayerIcon from "@/components/payer/PayerIcon";
import { ThemedText } from "@/components/ThemedText";
import { Payer } from "@/models/bill";
import Animated, {
  LinearTransition,
  useAnimatedStyle,
  useSharedValue,
} from "react-native-reanimated";
import * as Haptics from "expo-haptics";
import Touchable from "../ui/Touchable";

type Props = {
  payer: Payer;
  selected: boolean;
  onToggle: () => void;
};

const SelectPayer = ({ payer, selected, onToggle: onToggle }: Props) => {
  const animatedScale = useSharedValue(1);
  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: animatedScale.value }],
    };
  });

  return (
    <Touchable
      hapticFunction={Haptics.ImpactFeedbackStyle.Rigid}
      onPress={onToggle}
      onPressIn={() => {
        animatedScale.value = 0.98;
      }}
      onPressOut={() => {
        animatedScale.value = 1;
      }}
    >
      <Animated.View style={[styles.payerRow, animatedStyle]}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
          <PayerIcon payer={payer} checked={selected} />
          <ThemedText>{payer.name}</ThemedText>
        </View>
        <Animated.View
          style={styles.addButtonContainer}
          layout={LinearTransition.springify(2)}
        >
          <View style={styles.addButton}>
            <ThemedText style={{ textAlign: "right" }}>
              {selected ? "Remove" : "Add"}
            </ThemedText>
          </View>
        </Animated.View>
      </Animated.View>
    </Touchable>
  );
};

export default SelectPayer;

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
    overflow: "hidden",
  },
});
