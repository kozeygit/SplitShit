import React from "react";
import {
  Pressable,
  PressableProps,
  StyleProp,
  StyleSheet,
  ViewStyle,
} from "react-native";

type TouchableProps = Omit<PressableProps, "style"> & {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  /**
   * Opacity applied to the component while pressed.
   * Defaults to 0.7. Adjust here or swap out for a different
   * feedback mechanism (e.g. scale, background colour) later.
   */
  pressedOpacity?: number;
};

/**
 * Drop-in replacement for TouchableNativeFeedback backed by Pressable.
 * Applies a dimming effect on press. All feedback logic is centralised
 * here so it can be updated in one place.
 */
const Touchable = ({
  children,
  style,
  pressedOpacity = 0.7,
  ...props
}: TouchableProps) => {
  return (
    <Pressable
      style={({ pressed }) => [
        styles.base,
        style,
        // ─── Feedback ──────────────────────────────────────────────────────
        // To change press feedback, edit here. Ideas:
        //   - Scale:      { transform: [{ scale: pressed ? 0.97 : 1 }] }
        //   - Highlight:  { backgroundColor: pressed ? "rgba(0,0,0,0.05)" : "transparent" }
        //   - Combined:   mix opacity + scale
        pressed && { opacity: pressedOpacity },
        // ───────────────────────────────────────────────────────────────────
      ]}
      {...props}
    >
      {children}
    </Pressable>
  );
};

export default Touchable;

const styles = StyleSheet.create({
  base: {
    // Pressable defaults to no flex; match the layout-neutral behaviour
    // of TouchableNativeFeedback so it doesn't disturb existing layouts.
    flexShrink: 1,
  },
});
