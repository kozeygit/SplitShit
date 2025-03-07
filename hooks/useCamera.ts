import { useEffect, useState } from "react"
import * as ImagePicker from "expo-image-picker";
import { createBillFromImage } from "@/utils/createBillFromImage";
import { Alert } from "react-native";

export const useCamera = () => {
  const [isCameraEnabled, setIsCameraEnabled] = useState(false)

  useEffect(() => {
    disableCamera()
  }, [])

  const disableCamera = () => {
    setIsCameraEnabled(false)
  }

  const enableCamera = () => {
    setIsCameraEnabled(true)
  }
  
  const openCamera = async (
    successFunc: (newBillId: number) => void,
    failureFunc?: () => void
  ) => {
    if (!isCameraEnabled) {
      Alert.alert("Error", "Camera functionality is disabled, try again later")
      return
    }

    console.log("camera opened");
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      quality: 1,
      cameraType: ImagePicker.CameraType.back,
    });

    if (result.canceled) {
      return
    };


    await createBillFromImage(result.assets[0].uri).then(async (newBillId) => {
      if (newBillId < 0) {
        Alert.alert("Error", "Error in parsing bill from photo.\n\nEnter details manually")
        setIsCameraEnabled(false);
        if (failureFunc !== undefined)
          failureFunc();
        return
      }

      successFunc(newBillId);
    })
  }

  return { openCamera, disableCamera, enableCamera }
} 
