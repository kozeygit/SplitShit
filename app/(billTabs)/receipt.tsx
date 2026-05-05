import React, { use, useEffect, useState } from "react";
import { Image, StyleSheet, View, useWindowDimensions } from "react-native";
import {
  Gesture,
  GestureDetector,
  GestureHandlerRootView,
} from "react-native-gesture-handler";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import { useBillStore } from "@/utils/billStore";
import { ThemedText } from "@/components/ThemedText";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { Colors } from "@/constants/Colors";

const MIN_SCALE = 1;
const MAX_SCALE = 5;
const DOUBLE_TAP_SCALE = 2;

const ReceiptScreen = () => {
  const { editedBill } = useBillStore();
  const imagePath = editedBill?.imagePath;
  const { width, height } = useWindowDimensions();

  const scale = useSharedValue(1);
  const savedScale = useSharedValue(1);
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const savedTranslateX = useSharedValue(0);
  const savedTranslateY = useSharedValue(0);

  // Max pan distance at current scale — image can't travel beyond its own edges
  const clampTranslate = (
    value: number,
    dimension: number,
    currentScale: number,
  ) => {
    "worklet";
    const maxTranslate = (dimension * (currentScale - 1)) / 2;
    return Math.min(maxTranslate, Math.max(-maxTranslate, value));
  };

  const pinchGesture = Gesture.Pinch()
    .onUpdate((e) => {
      scale.value = Math.min(
        MAX_SCALE,
        Math.max(MIN_SCALE, savedScale.value * e.scale),
      );
    })
    .onEnd(() => {
      savedScale.value = scale.value;
      if (scale.value <= MIN_SCALE) {
        scale.value = withSpring(MIN_SCALE);
        savedScale.value = MIN_SCALE;
        translateX.value = withSpring(0);
        translateY.value = withSpring(0);
        savedTranslateX.value = 0;
        savedTranslateY.value = 0;
      }
    });

  const panGesture = Gesture.Pan()
    .onUpdate((e) => {
      translateX.value = clampTranslate(
        savedTranslateX.value + e.translationX,
        width,
        scale.value,
      );
      translateY.value = clampTranslate(
        savedTranslateY.value + e.translationY,
        height,
        scale.value,
      );
    })
    .onEnd(() => {
      savedTranslateX.value = translateX.value;
      savedTranslateY.value = translateY.value;
    });

  // Double tap: toggle between zoomed in and reset
  const doubleTapGesture = Gesture.Tap()
    .numberOfTaps(2)
    .onEnd(() => {
      if (scale.value > MIN_SCALE) {
        // Already zoomed — reset
        scale.value = withSpring(MIN_SCALE);
        savedScale.value = MIN_SCALE;
        translateX.value = withSpring(0);
        translateY.value = withSpring(0);
        savedTranslateX.value = 0;
        savedTranslateY.value = 0;
      } else {
        // Zoomed out — zoom in
        scale.value = withSpring(DOUBLE_TAP_SCALE);
        savedScale.value = DOUBLE_TAP_SCALE;
      }
    });

  const composed = Gesture.Simultaneous(
    pinchGesture,
    Gesture.Race(doubleTapGesture, panGesture),
  );

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { scale: scale.value },
    ],
  }));

  if (!imagePath) {
    return (
      <View style={styles.outer}>
        <View style={styles.container}>
          <View style={styles.emptyContainer}>
            <MaterialIcons name="image-not-supported" size={48} color="grey" />
            <ThemedText type="default" style={styles.emptyText}>
              No receipt image
            </ThemedText>
          </View>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.outer}>
      <View style={styles.container}>
        <GestureHandlerRootView style={styles.gestureRoot}>
          <GestureDetector gesture={composed}>
            <Animated.View style={[styles.imageWrapper, animatedStyle]}>
              <Image
                source={{ uri: imagePath }}
                style={styles.image}
                resizeMode="contain"
              />
            </Animated.View>
          </GestureDetector>
          <ThemedText style={styles.hint}>
            Pinch to zoom · Double tap to toggle
          </ThemedText>
        </GestureHandlerRootView>
      </View>
    </View>
  );
};

export default ReceiptScreen;

const styles = StyleSheet.create({
  outer: {
    flex: 1,
    backgroundColor: Colors.pastel.yellow,
    paddingHorizontal: 20,
  },
  container: {
    flex: 1,
    marginTop: 80,
    marginBottom: 30,
    backgroundColor: "white",
    borderWidth: 2,
    borderRadius: 20,
    elevation: 5,
    overflow: "hidden",
  },
  gestureRoot: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  imageWrapper: {
    flex: 1,
    width: "100%",
  },
  image: {
    flex: 1,
    width: "100%",
    height: "100%",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 12,
  },
  emptyText: {
    color: "grey",
  },
  hint: {
    position: "absolute",
    bottom: 12,
    color: "rgba(0,0,0,0.3)",
    fontSize: 12,
  },
});
