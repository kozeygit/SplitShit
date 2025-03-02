import { Stack } from "expo-router";
import "react-native-reanimated";

export default function AssignModalsLayout() {

  return (
    <Stack>
      <Stack.Screen
        name="assignItemModal"
        options={{
          headerShown: false,
          presentation: "modal",
          animation: "none"
        }}
      />
    </Stack>
  );
}
