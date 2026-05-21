import React from "react";
import { View, StyleSheet } from "react-native";
import Touchable from "@/components/ui/Touchable";
import { ThemedText } from "@/components/ThemedText";
import * as Haptics from "expo-haptics";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
} from "react-native-reanimated";

type Props = {
  onCancel: () => void;
  onSubmit: () => void;
  submitLabel?: string;
  cancelLabel?: string;
};

type AnimatedButtonProps = {
  onPress: () => void;
  outerStyle: object;
  textStyle: object;
  label: string;
};

const AnimatedButton = ({
  onPress,
  outerStyle,
  textStyle,
  label,
}: AnimatedButtonProps) => {
  const scale = useSharedValue(1);
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Animated.View style={[outerStyle, animatedStyle]}>
      <Touchable
        onPress={onPress}
        hapticFunction={Haptics.ImpactFeedbackStyle.Light}
        onPressIn={() => {
          scale.value = 0.97;
        }}
        onPressOut={() => {
          scale.value = 1;
        }}
      >
        <View style={styles.buttonInner}>
          <ThemedText type="defaultSemiBold" style={textStyle}>
            {label}
          </ThemedText>
        </View>
      </Touchable>
    </Animated.View>
  );
};

export const FormButtonRow = ({
  onCancel,
  onSubmit,
  submitLabel = "Submit",
  cancelLabel = "Cancel",
}: Props) => {
  return (
    <View style={styles.buttonContainer}>
      <AnimatedButton
        onPress={onCancel}
        outerStyle={styles.cancelButtonOuter}
        textStyle={styles.cancelText}
        label={cancelLabel}
      />
      <AnimatedButton
        onPress={onSubmit}
        outerStyle={styles.submitButtonOuter}
        textStyle={styles.submitText}
        label={submitLabel}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  buttonContainer: {
    marginVertical: 30,
    flexDirection: "row",
    gap: 10,
  },
  submitButtonOuter: {
    flex: 2.5,
    height: 70,
    borderWidth: 2,
    backgroundColor: "white",
    borderRadius: 20,
    elevation: 5,
    overflow: "hidden",
  },
  buttonInner: {
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  submitText: {
    fontSize: 20,
  },
  cancelButtonOuter: {
    flex: 1,
    height: 70,
    borderWidth: 2,
    backgroundColor: "red",
    borderRadius: 20,
    elevation: 5,
    overflow: "hidden",
  },
  cancelText: {
    fontSize: 20,
    color: "white",
  },
});
