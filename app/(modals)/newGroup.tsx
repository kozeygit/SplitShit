import React from "react";
import {
  View,
  TextInput,
  StyleSheet,
  Text,
  Platform,
  TouchableNativeFeedback,
  KeyboardAvoidingView,
  SafeAreaView,
  ScrollView,
} from "react-native";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Colors } from "@/constants/Colors";
import { ThemedText } from "@/components/ThemedText";
import { useRouter } from "expo-router";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { insertGroup } from "@/utils/insertData"; // Ensure you have this utility
import { NewGroup } from "@/models/bill";

// Validation Schema
const groupSchema = z.object({
  name: z.string().min(1, "Group name is required"),
});


export default function NewGroupPage() {
  const router = useRouter();
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<NewGroup>({
    defaultValues: {
      name: "",
    },
    resolver: zodResolver(groupSchema),
  });

  const onSubmit = async (data: NewGroup) => {
    try {
      const newGroupId = await insertGroup(data);
      if (newGroupId < 0) {
        console.error("Failed to insert group");
      } else {
        router.back();
      }
    } catch (error) {
      console.error("Database error:", error);
    }
  };

  return (
    <SafeAreaView
      style={{
        flex: 1,
        backgroundColor: Colors.pastel.green, // Theme color for Groups
        paddingHorizontal: 20,
      }}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ justifyContent: "flex-end" }}
      >
        <ScrollView>
          <View style={styles.container}>
            <ThemedText type="title" style={styles.title}>
              Add New Group
            </ThemedText>

            <Text style={styles.label}>Group Name</Text>
            <View
              style={[
                styles.input,
                errors.name ? styles.inputError : undefined,
              ]}
            >
              <Controller
                control={control}
                name="name"
                render={({ field: { onChange, onBlur, value } }) => (
                  <View style={{ flexDirection: "row", height: "100%" }}>
                    <TextInput
                      style={{ flex: 1 }}
                      placeholder="e.g. Spain Trip"
                      keyboardType="default"
                      onBlur={onBlur}
                      onChangeText={onChange}
                      value={value}
                    />
                    <MaterialIcons
                      name="group"
                      size={20}
                      color={errors.name ? "red" : "black"}
                      style={{ alignSelf: "center" }}
                    />
                  </View>
                )}
              />
            </View>
            {errors.name && (
              <Text style={styles.errorText}>{errors.name.message}</Text>
            )}
          </View>

          {/* Submit Buttons */}
          <View style={styles.buttonContainer}>
            <View style={styles.cancelButtonOuter}>
              <TouchableNativeFeedback onPress={() => router.back()}>
                <View style={styles.cancelButtonInner}>
                  <ThemedText type="defaultSemiBold" style={styles.cancelText}>
                    Cancel
                  </ThemedText>
                </View>
              </TouchableNativeFeedback>
            </View>
            <View style={styles.submitButtonOuter}>
              <TouchableNativeFeedback onPress={handleSubmit(onSubmit)}>
                <View style={styles.submitButtonInner}>
                  <ThemedText type="defaultSemiBold" style={styles.submitText}>
                    Submit
                  </ThemedText>
                </View>
              </TouchableNativeFeedback>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 100,
    padding: 30,
    paddingVertical: 40,
    backgroundColor: "white",
    borderWidth: 2,
    borderRadius: 20,
    elevation: 5,
  },
  title: {
    paddingBottom: 20,
    borderBottomWidth: 1,
    marginBottom: 10,
  },
  label: {
    fontSize: 16,
    fontWeight: "bold",
    paddingTop: 20,
    paddingBottom: 5,
  },
  input: {
    height: 50,
    borderBottomWidth: 1,
    borderColor: "lightgrey",
    paddingHorizontal: 10,
    backgroundColor: "white",
    justifyContent: "center",
  },
  inputError: {
    borderColor: "red",
  },
  buttonContainer: {
    marginVertical: 30,
    flexDirection: "row",
    gap: 10,
  },
  submitButtonOuter: {
    flex: 3,
    height: 70,
    borderWidth: 2,
    backgroundColor: "white",
    borderRadius: 20,
    elevation: 5,
    overflow: "hidden",
  },
  submitButtonInner: {
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  submitText: {
    fontSize: 20,
  },
  cancelButtonOuter: {
    flex: 1,
    height: 70,
    borderWidth: 2,
    backgroundColor: "red",
    borderRadius: 20,
    elevation: 5,
    overflow: "hidden",
  },
  cancelButtonInner: {
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  cancelText: {
    fontSize: 20,
    color: "white",
  },
  errorText: {
    color: "red",
    fontSize: 12,
    marginTop: 5,
    marginLeft: 5,
  },
});