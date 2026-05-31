import { useState } from "react";
import * as ImagePicker from "expo-image-picker";
import { Alert } from "react-native";

export const useImagePicker = ({ aspect }: { aspect?: [number, number] }) => {
    const [cameraEnabled, setCameraEnabled] = useState(true);

    const disableCamera = () => setCameraEnabled(false);
    const enableCamera = () => setCameraEnabled(true);

    const launchGallery = async (): Promise<string | null> => {
        const result = await ImagePicker.launchImageLibraryAsync({
            aspect: aspect,
            mediaTypes: ["images"],
            allowsEditing: true,
            quality: 1,
        });
        return result.canceled ? null : result.assets[0].uri;
    };

    const launchCamera = async (): Promise<string | null> => {
        const permission = await ImagePicker.requestCameraPermissionsAsync();
        if (!permission.granted) {
            Alert.alert(
                "Permission Required",
                "Camera access is needed to take a photo of your bill.",
            );
            return null;
        }

        const result = await ImagePicker.launchCameraAsync({
            aspect: aspect,
            mediaTypes: ["images"],
            allowsEditing: true,
            quality: 1,
            cameraType: ImagePicker.CameraType.back,
        });
        return result.canceled ? null : result.assets[0].uri;
    };

    /**
     * Shows a choice between camera and gallery, then returns the picked
     * image URI, or null if the user cancelled.
     */
    const pickImage = (): Promise<string | null> => {
        if (!cameraEnabled) {
            Alert.alert(
                "Error",
                "Camera functionality is disabled, try again later",
            );
            return Promise.resolve(null);
        }

        // Wrap Alert in a Promise so the caller can simply await it.
        return new Promise((resolve) => {
            Alert.alert("Add Photo", "How would you like to add your photo?", [
                {
                    text: "Take Photo",
                    onPress: async () => resolve(await launchCamera()),
                },
                {
                    text: "Choose from Library",
                    onPress: async () => resolve(await launchGallery()),
                },
                {
                    text: "Cancel",
                    style: "cancel",
                    onPress: () => resolve(null),
                },
            ]);
        });
    };

    return { pickImage, disableCamera, enableCamera };
};
