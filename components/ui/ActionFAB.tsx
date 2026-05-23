import React, { useEffect } from "react";
import { StyleSheet, Pressable, View } from "react-native";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import Animated, {
  useAnimatedStyle,
  withSpring,
  useSharedValue,
  SlideInDown,
  SlideOutDown,
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

const ActionFAB = ({
  activeColor,
  count,
  onAdd,
  onCancel,
  actions,
}: ActionFABProps) => {
  const isSelecting = count > 0;

  return (
    <View style={styles.outerContainer}>
      {/* CENTER HUB: THE MASTER CIRCLE */}
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

      {/* ACCORDION BLOCK */}
      {isSelecting && (
        <Animated.View style={styles.accordionContainer}>
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
        </Animated.View>
      )}
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
    flexDirection: "row-reverse",
    borderWidth: 2,
    borderRadius: 40,
    borderColor: "black",
    overflow: "hidden",
    elevation: 5,
  },
  accordionContainer: {
    flex: 1,
    flexDirection: "row-reverse",
  },
  masterHub: {
    borderRadius: 40,
    height: 60,
    width: 60,
    zIndex: 10,
    justifyContent: "center",
    alignItems: "center",
    padding: 6,
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
  countNumber: {
    fontSize: 28,
    fontWeight: "700",
  },
  actionButton: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    borderRightWidth: 2,
    borderColor: "black",
  },
});
