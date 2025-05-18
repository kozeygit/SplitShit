import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import Animated, { useSharedValue, withSpring, withTiming } from "react-native-reanimated";
import { Colors } from "@/constants/Colors";

type ToggleProps = {
  state: boolean;
  onToggle: (value: boolean) => void;
  leftLabel: string;
  rightLabel: string;
};

const Toggle = (props: ToggleProps) => {
  const [currentState, setCurrentState] = useState(props.state);
  const left = useSharedValue(-2);
  const handleToggle = () => {
    console.log("Toggle pressed");
    setCurrentState(!currentState);
    left.value = withSpring(currentState ? -2 : 148, { duration: 500 });
    props.onToggle(!currentState);
  };

  return (
    <Pressable onPress={handleToggle} style={{ flex: 1 }}>
      <View style={styles.container}>
          <View style={styles.labelContainer}>
            <Text style={[styles.label, currentState ? "" : styles.selectedLabel]}>{props.leftLabel}</Text>
          </View>
          <View style={styles.labelContainer}>
            <Text style={[styles.label, currentState ? styles.selectedLabel : ""]}>{props.rightLabel}</Text>
          </View>
        <Animated.View style={[styles.selector, { left }]}></Animated.View>
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
    borderWidth: 1,
    backgroundColor: Colors.pastel.green,
    top: -2,
    width: "52%",
    height: "112%",
    position: "absolute",
  },
});
