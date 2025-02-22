import { Stack } from "expo-router";
import "react-native-reanimated";

export default function MiniModalLayout() {

  return (
    <Stack>
      <Stack.Screen
        name="editItemModal"
        options={{
          headerShown: false,
          presentation: "modal",
        }}
      />
    </Stack>
  );
}
