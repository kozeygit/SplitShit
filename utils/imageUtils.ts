import { Alert } from "react-native";

interface ProfileImageConfig {
    launchFn: () => Promise<string | null>;
    currentImagePath?: string | null;
    saveImageFn: (uri: string) => Promise<string>;
    deleteImageFn: (path: string) => void;
    updateDbFn: (path?: string) => Promise<void>;
    onRefresh: () => void;
}

export const setProfileImage = async ({
    launchFn,
    currentImagePath,
    saveImageFn,
    deleteImageFn,
    updateDbFn,
    onRefresh,
}: ProfileImageConfig) => {
    try {
        const uri = await launchFn();
        if (!uri) return;

        const newImagePath = await saveImageFn(uri);

        if (newImagePath) {
            if (currentImagePath) {
                deleteImageFn(currentImagePath); // Clean up old file safely
            }
            await updateDbFn(newImagePath);
            onRefresh();
        }
    } catch (error: any) {
        if (error.message === "Camera permission not granted") {
            Alert.alert(
                "Camera Access Required",
                "Please enable camera permissions in your device settings.",
            );
        } else {
            Alert.alert("Error", error.message || "Failed to process image.");
        }
    }
};
