import React, { useEffect } from "react";
import { StyleSheet, Pressable, View, TouchableOpacity } from "react-native";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import Animated, {
  useAnimatedStyle,
  withSpring,
  useSharedValue,
  SlideOutRight,
  SlideInRight,
  SlideInUp,
  SlideInDown,
  SlideOutDown,
} from "react-native-reanimated";
import { Colors } from "@/constants/Colors";
import { ThemedText } from "@/components/ThemedText";

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

  // Animation for the master hub content swap
  const rotation = useSharedValue(0);

  useEffect(() => {
    rotation.value = withSpring(isSelecting ? 180 : 0, { damping: 12 });
  }, [isSelecting]);

  const hubIconStyle = useAnimatedStyle(() => ({
    transform: [{ scale: withSpring(isSelecting ? 0 : 1) }],
    opacity: withSpring(isSelecting ? 0 : 1),
  }));

  const hubNumberStyle = useAnimatedStyle(() => ({
    opacity: withSpring(isSelecting ? 1 : 0),
    transform: [{ scale: withSpring(isSelecting ? 1 : 0) }],
  }));

  return (
    <View
      style={[
        styles.outerContainer,
        // When selecting, we want the background to be white
        { backgroundColor: isSelecting ? "white" : activeColor,
         top: isSelecting ? 600 : undefined }
      ]}
    >
      {/* CENTER HUB: THE MASTER CIRCLE */}
      <TouchableOpacity
        onPress={isSelecting ? undefined : onAdd}
        // Remove borderRadius here, it's handled by outerContainer
        style={styles.masterHub}
      >
        <Animated.View style={[styles.centerContent, hubIconStyle]}>
          <MaterialIcons name="add" size={40} color="black" />
        </Animated.View>

        <Animated.View style={[StyleSheet.absoluteFill, styles.centerContent, hubNumberStyle]}>
          <ThemedText type="subtitle" style={styles.countNumber}>
            {count}
          </ThemedText>
        </Animated.View>
      </TouchableOpacity>

      {/* ACCORDION BLOCK */}
      {isSelecting && (
        <Animated.View
          entering={SlideInDown}
          exiting={SlideOutDown}
          style={styles.accordionContainer}
        >
          {/* Cancel Button */}
          <Pressable
            style={[styles.actionButton, { backgroundColor: Colors.pastel.cyan }]}
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
    position: "absolute",
    bottom: 20,
    right: 20,
    flexDirection: "column-reverse",
    borderWidth: 2,
    borderRadius: 40,
    borderColor: "black",
    overflow: "hidden",
    elevation: 5,
    backgroundColor: "black"
  },
  accordionContainer: {
    flex: 1, 
    flexDirection: "column-reverse",
  },
  masterHub: {
    borderRadius: 40,
    height: 60,
    width: 60,
    zIndex: 10,
    justifyContent: "center",
    alignItems: "center",
    borderColor: "black",
    outlineColor: "red",
    outline: "solid"
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
    borderBottomWidth: 2,
    borderColor: "black",
  },
});
