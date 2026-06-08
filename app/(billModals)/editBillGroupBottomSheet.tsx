import { useState } from "react";
import { Host, Column, Button, BottomSheet, Text } from "@expo/ui";

export default function BottomSheetExample() {
  const [isPresented, setIsPresented] = useState(false);

  return (
    <Host style={{ flex: 1 }}>
      <Button label="Open sheet" onPress={() => setIsPresented(true)} />
      <BottomSheet
        isPresented={isPresented}
        onDismiss={() => setIsPresented(false)}
      >
        <Column spacing={12}>
          <Text textStyle={{ fontSize: 18, fontWeight: "700" }}>
            Sheet contents
          </Text>
          <Text>Drag down or tap the overlay to dismiss.</Text>
          <Button label="Close" onPress={() => setIsPresented(false)} />
        </Column>
      </BottomSheet>
    </Host>
  );
}
