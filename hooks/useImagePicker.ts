import * as ImagePicker from "expo-image-picker";
import { useState } from "react";

export const useImagePicker = ({ aspect }: { aspect?: [number, number] }) => {
    const [aspectRatio, setAspectRatio] = useState(aspect);

    const updateAspectRatio = (newAspect: [number, number] | undefined) => {
        setAspectRatio(newAspect);
    };

    const launchGallery = async (): Promise<string | null> => {
        const result = await ImagePicker.launchImageLibraryAsync({
            aspect: aspectRatio,
            mediaTypes: ["images"],
            allowsEditing: true,
            quality: 1,
        });
        return result.canceled ? null : result.assets[0].uri;
    };

    const launchCamera = async (): Promise<string | null> => {
        const permission = await ImagePicker.requestCameraPermissionsAsync();
        if (!permission.granted) {
            throw new Error("Camera permission not granted");
        }

        const result = await ImagePicker.launchCameraAsync({
            aspect: aspectRatio,
            mediaTypes: ["images"],
            allowsEditing: true,
            quality: 1,
            cameraType: ImagePicker.CameraType.back,
        });
        return result.canceled ? null : result.assets[0].uri;
    };

    return { launchGallery, launchCamera, updateAspectRatio };
};
