import React, { useEffect, useRef, useState } from "react";
import { StyleSheet, Pressable, View } from "react-native";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import Animated, {
  useAnimatedStyle,
  withSpring,
  useSharedValue,
} from "react-native-reanimated";
import { Colors } from "@/constants/Colors";
import { ThemedText } from "@/components/ThemedText";
import Touchable from "@/components/ui/Touchable";
import { ImpactFeedbackStyle } from "expo-haptics";

export type FABAction = {
  icon: keyof typeof MaterialIcons.glyphMap;
  color: string;
  onPress: () => void;
  iconColor?: string;
};

type ActionFABProps = {
  activeColor: string;
  count: number;
  onAdd: () => void;
  onCancel: () => void;
  actions: FABAction[];
};

const SPRING_CONFIG = {
  damping: 20,
  stiffness: 300,
  mass: 0.5,
};

const ActionFAB = ({
  activeColor,
  count,
  onAdd,
  onCancel,
  actions,
}: ActionFABProps) => {
  const isSelecting = count > 0;
  const width = useSharedValue(0);
  const measured = useRef(false);
  const [measuredWidth, setMeasuredWidth] = useState(0);

  const handleLayout = (e: any) => {
    if (measured.current) return;
    const w = e.nativeEvent.layout.width;
    if (w > 0) {
      measured.current = true;
      setMeasuredWidth(w);
    }
  };

  useEffect(() => {
    if (measuredWidth === 0) return;
    width.value = withSpring(isSelecting ? measuredWidth : 0, SPRING_CONFIG);
  }, [isSelecting, measuredWidth]);

  const animatedStyle = useAnimatedStyle(() => ({
    width: width.value,
  }));

  const buttonCount = actions.length + 1; // +1 for cancel

  return (
    <View style={styles.outerContainer}>
      {/* Hidden measure — rendered once, never changes */}
      <View
        style={styles.hiddenMeasure}
        onLayout={handleLayout}
        pointerEvents="none"
      >
        {Array.from({ length: buttonCount }).map((_, i) => (
          <View key={i} style={styles.actionButton} />
        ))}
      </View>

      {/* Accordion grows leftward from behind the hub */}
      <Animated.View style={[styles.accordionContainer, animatedStyle]}>
        <View style={styles.accordionInner}>
          {/* Cancel Button */}
          <Pressable
            style={[
              styles.actionButton,
              { backgroundColor: Colors.pastel.cyan },
            ]}
            onPress={onCancel}
          >
            <MaterialIcons name="close" size={24} color="black" />
          </Pressable>

          {/* Dynamic Action Buttons */}
          {actions.map((action, index) => (
            <Pressable
              key={index}
              style={[styles.actionButton, { backgroundColor: action.color }]}
              onPress={action.onPress}
            >
              <MaterialIcons
                name={action.icon}
                size={24}
                color={action.iconColor || "black"}
              />
            </Pressable>
          ))}
        </View>
      </Animated.View>

      {/* Hub — always on the right, never moves */}
      <Touchable
        onPress={isSelecting ? undefined : onAdd}
        style={styles.masterHub}
        hapticFunction={ImpactFeedbackStyle.Heavy}
      >
        <View style={[styles.innerCircle, { backgroundColor: activeColor }]}>
          <View style={[StyleSheet.absoluteFill, styles.centerContent]}>
            {isSelecting ? (
              <ThemedText type="subtitle">{count}</ThemedText>
            ) : (
              <MaterialIcons name="add" size={30} color="black" />
            )}
          </View>
        </View>
      </Touchable>
    </View>
  );
};

export default ActionFAB;

const styles = StyleSheet.create({
  outerContainer: {
    backgroundColor: "white",
    position: "absolute",
    bottom: 20,
    right: 20,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 2,
    borderRadius: 40,
    borderColor: "black",
    overflow: "hidden",
    elevation: 5,
  },
  hiddenMeasure: {
    position: "absolute",
    flexDirection: "row",
    opacity: 0,
  },
  accordionContainer: {
    overflow: "hidden",
    height: 60,
  },
  accordionInner: {
    flexDirection: "row",
    height: 60,
  },
  masterHub: {
    borderRadius: 40,
    height: 60,
    width: 60,
    justifyContent: "center",
    alignItems: "center",
    padding: 6,
    zIndex: 10,
  },
  innerCircle: {
    flex: 1,
    width: "100%",
    borderRadius: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  centerContent: {
    justifyContent: "center",
    alignItems: "center",
  },
  actionButton: {
    width: 60,
    height: 60,
    justifyContent: "center",
    alignItems: "center",
    borderRightWidth: 2,
    borderColor: "black",
  },
});
