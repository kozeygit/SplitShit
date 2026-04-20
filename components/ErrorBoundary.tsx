import React from "react";
import { View, Text, Button, ScrollView } from "react-native";

interface ErrorFallbackProps {
  error: Error;
  resetError: () => void;
}

export function ErrorFallback({ error, resetError }: ErrorFallbackProps) {
  return (
    <ScrollView
      contentContainerStyle={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        padding: 20,
        backgroundColor: "#f5f5f5",
      }}
    >
      <View>
        <Text
          style={{
            fontSize: 24,
            fontWeight: "bold",
            marginBottom: 10,
            color: "#333",
          }}
        >
          Oops" Something went wrong
        </Text>
        <Text
          style={{
            fontSize: 14,
            color: "#666",
            marginBottom: 20,
            textAlign: "center",
            fontFamily: "monospace",
          }}
        >
          {error.message}
        </Text>
        <Button title="Try Again" onPress={resetError} color="#007AFF"></Button>
      </View>
    </ScrollView>
  );
}
