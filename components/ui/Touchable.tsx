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
  onPressIn,
  ...props
}: TouchableProps) => {
  return (
    <Pressable
      onPressIn={(event) => {
        onPressIn?.(event);
        hapticFunction && Haptics.impactAsync(hapticFunction);
      }}
      style={({ pressed }) => [style, pressed && { opacity: pressedOpacity }]}
      {...props}
    >
      {children}
    </Pressable>
  );
};

export default Touchable;
