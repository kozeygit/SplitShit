import React from "react";
import {
  Pressable,
  PressableProps,
  StyleProp,
  StyleSheet,
  ViewStyle,
} from "react-native";
import * as Haptics from "expo-haptics";

type TouchableProps = Omit<PressableProps, "style"> & {
  hapticFunction?: Haptics.ImpactFeedbackStyle;
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  pressedOpacity?: number;
};

const Touchable = ({
  hapticFunction,
  children,
  style,
  pressedOpacity = 0.8,
  ...props
}: TouchableProps) => {
  return (
    <Pressable
      onPressIn={() => hapticFunction && Haptics.impactAsync(hapticFunction)}
      style={({ pressed }) => [style, pressed && { opacity: pressedOpacity }]}
      {...props}
    >
      {children}
    </Pressable>
  );
};

export default Touchable;
