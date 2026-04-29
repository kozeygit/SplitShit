import { useState } from "react";
import * as ImagePicker from "expo-image-picker";
import { Alert } from "react-native";
import { processReceipt } from "@/utils/imageProcessor";

export const useCamera = () => {
  const [cameraEnabled, setCameraEnabled] = useState(true);

  const disableCamera = () => setCameraEnabled(false);
  const enableCamera = () => setCameraEnabled(true);

  const processImage = async (
    uri: string,
    successFunc: (newBillId: number) => void,
    failureFunc?: () => void,
    onLoadingChange?: (loading: boolean) => void,
  ) => {
    onLoadingChange?.(true);
    try {
      const newBillId = await processReceipt(uri);
      if (newBillId < 0) {
        Alert.alert(
          "Could not read receipt",
          "We couldn't extract a bill from that image. Please enter the details manually.",
        );
        failureFunc?.();
      } else {
        successFunc(newBillId);
      }
    } finally {
      onLoadingChange?.(false);
    }
  };

  const openGallery = async (
    successFunc: (newBillId: number) => void,
    failureFunc?: () => void,
    onLoadingChange?: (loading: boolean) => void,
  ) => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      quality: 1,
    });

    if (result.canceled) return;

    await processImage(
      result.assets[0].uri,
      successFunc,
      failureFunc,
      onLoadingChange,
    );
  };

  const openCameraCapture = async (
    successFunc: (newBillId: number) => void,
    failureFunc?: () => void,
    onLoadingChange?: (loading: boolean) => void,
  ) => {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) {
      Alert.alert(
        "Permission Required",
        "Camera access is needed to take a photo of your bill.",
      );
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      quality: 1,
      cameraType: ImagePicker.CameraType.back,
    });

    if (result.canceled) return;

    await processImage(
      result.assets[0].uri,
      successFunc,
      failureFunc,
      onLoadingChange,
    );
  };

  const openCamera = async (
    successFunc: (newBillId: number) => void,
    failureFunc?: () => void,
    onLoadingChange?: (loading: boolean) => void,
  ) => {
    if (!cameraEnabled) {
      Alert.alert("Error", "Camera functionality is disabled, try again later");
      return;
    }

    // Alert is non-blocking — loading must start inside the callbacks,
    // after the user has picked an option, not before.
    Alert.alert("Add Receipt", "How would you like to add your receipt?", [
      {
        text: "Take Photo",
        onPress: () =>
          openCameraCapture(successFunc, failureFunc, onLoadingChange),
      },
      {
        text: "Choose from Library",
        onPress: () => openGallery(successFunc, failureFunc, onLoadingChange),
      },
      {
        text: "Cancel",
        style: "cancel",
      },
    ]);
  };

  return { openCamera, disableCamera, enableCamera };
};
