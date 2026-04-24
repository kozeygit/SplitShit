import { useEffect, useState } from "react";
import { Pressable, StyleSheet, Text, View, LayoutChangeEvent } from "react-native";
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withSpring, 
  interpolate 
} from "react-native-reanimated";
import { Colors } from "@/constants/Colors";

type ToggleProps = {
  state: boolean;
  onToggle: (value: boolean) => void;
  leftLabel: string;
  rightLabel: string;
};

const Toggle = ({ state, onToggle, leftLabel, rightLabel }: ToggleProps) => {
  // Initialize exactly where the prop says to start
  const offset = useSharedValue(state ? 1 : 0);
  const [containerWidth, setContainerWidth] = useState(0);

  const onLayout = (event: LayoutChangeEvent) => {
    setContainerWidth(event.nativeEvent.layout.width);
  };

const animatedStyle = useAnimatedStyle(() => {
  return {
    // We animate from 0% to 50% left position
    left: withSpring(state ? "50.5%" : "-0.5%", {
      duration: 500
    }),
  };
});

  return (
    <Pressable onPress={() => onToggle(!state)} style={{ flex: 1 }}>
      <View style={styles.container} onLayout={onLayout}>
        <View style={styles.labelContainer}>
          <Text style={[styles.label, !state && styles.selectedLabel]}>
            {leftLabel}
          </Text>
        </View>
        <View style={styles.labelContainer}>
          <Text style={[styles.label, state && styles.selectedLabel]}>
            {rightLabel}
          </Text>
        </View>

        <Animated.View style={[styles.selector, animatedStyle]} />
      </View>
    </Pressable>
  );
};

export default Toggle;

const styles = StyleSheet.create({
  selectedLabel: {
    color: "black",
    zIndex: 1,
  },
  label: {
    color: "grey",
    fontWeight: "bold",
  },
  labelContainer: {
    flex: 1,
    padding: 5,
    justifyContent: "center",
    alignItems: "center",
  },
  container: {
    flexDirection: "row",
    height: 40,
    overflow: "hidden",
    borderColor: "black",
    borderWidth: 1,
    borderRadius: 10,
  },
  selector: {
    alignSelf: "center",
    borderWidth: 1,
    backgroundColor: Colors.pastel.green,
    width: "50%",
    height: "110%",
    position: "absolute",
  },
});
