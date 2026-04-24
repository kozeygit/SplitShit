import { Stack } from "expo-router";
import "react-native-reanimated";

export default function BillModalsLayout() {

  return (
    <Stack>
      <Stack.Screen
        name="editItemModal"
        options={{
          headerShown: false,
          presentation: "modal",
          animation: "none"
        }}
      />
      <Stack.Screen
        name="editBillDetailsModal"
        options={{
          headerShown: false,
          presentation: "modal",
        }}
      />
      <Stack.Screen
        name="editBillPayersModal"
        options={{
          headerShown: false,
          presentation: "modal",
        }}
      />
    </Stack>
  );
}
