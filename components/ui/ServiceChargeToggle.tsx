import React from "react";
import { StyleSheet } from "react-native";
import Touchable from "@/components/ui/Touchable";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import Animated, {
  useAnimatedStyle,
  withSpring,
} from "react-native-reanimated";

type ServiceType = "percentage" | "amount";

type Props = {
  serviceType: ServiceType;
  onSwap: () => void;
};

export const ServiceChargeToggle = ({ serviceType, onSwap }: Props) => {
  const animatedStyle = useAnimatedStyle(() => ({
    left: withSpring(serviceType === "percentage" ? "50%" : "-0.5%", {
      duration: 200,
    }),
  }));

  return (
    <Touchable onPress={onSwap} style={styles.iconSelector}>
      <MaterialIcons name="currency-pound" size={16} color="black" />
      <MaterialIcons name="percent" size={16} color="black" />
      <Animated.View style={[styles.selector, animatedStyle]}>
        <MaterialIcons
          name={serviceType === "amount" ? "percent" : "currency-pound"}
          size={20}
          color="white"
        />
      </Animated.View>
    </Touchable>
  );
};

const styles = StyleSheet.create({
  iconSelector: {
    flexDirection: "row",
    alignItems: "center",
    width: 70,
    height: 30,
    justifyContent: "space-around",
    borderRadius: 40,
    borderWidth: 1,
  },
  selector: {
    position: "absolute",
    width: 38,
    top: -5,
    bottom: -5,
    borderRadius: 40,
    zIndex: 10,
    backgroundColor: "black",
    elevation: 3,
    alignItems: "center",
    justifyContent: "center",
  },
});
