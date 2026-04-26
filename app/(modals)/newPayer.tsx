import React from "react";
import {
  View,
  TextInput,
  StyleSheet,
  Text,
  Platform,
  TouchableNativeFeedback,
  KeyboardAvoidingView,
  ScrollView,
} from "react-native";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { NewPayer } from "@/models/bill";
import { Colors } from "@/constants/Colors";
import { ThemedText } from "@/components/ThemedText";
import { useRouter } from "expo-router";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { insertPayer } from "@/utils/insertData";

const payerSchema = z.object({
  name: z.string().min(1, "Payer name is required"),
  email: z.string().email().optional().or(z.literal("")),
  number: z.string().optional(),
});

export default function NewPayerPage() {
  const router = useRouter();
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<NewPayer>({
    defaultValues: {
      name: "",
      email: undefined,
      number: undefined,
    },
    resolver: zodResolver(payerSchema),
  });

  const onSubmit = async (data: NewPayer) => {
    if (data.email === "") {
      data.email = undefined;
    }
    const newPayerId = await insertPayer(data);
    if (newPayerId < 0) {
      console.log("insert payer failed for some reason????");
    } else {
      router.back();
    }
  };

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: Colors.pastel.blue,
        paddingHorizontal: 20,
      }}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS == "ios" ? "padding" : "height"}
        style={{
          justifyContent: "flex-end",
        }}
      >
        <ScrollView>
          <View style={styles.container}>
            <ThemedText type="title" style={styles.title}>
              Add New Payer
            </ThemedText>
            {/* Bill Name Input */}
            <Text style={styles.label}>Name</Text>
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
                  <View
                    style={{
                      flexDirection: "row",
                      height: "100%",
                    }}
                  >
                    <TextInput
                      style={{ flex: 1 }}
                      placeholder="John Smith"
                      placeholderTextColor={Colors.light.placeholderText}
                      keyboardType="default"
                      onBlur={onBlur}
                      onChangeText={(text) => onChange(text)}
                      value={value} // Convert number to string for display
                    />
                    <MaterialIcons
                      name="person"
                      size={20}
                      color={errors.name ? "red" : "black"}
                      style={{
                        alignSelf: "center",
                      }}
                    />
                  </View>
                )}
              />
            </View>
            {errors.name && (
              <Text style={styles.errorText}>{errors.name.message}</Text>
            )}

            {/* Email Input */}
            <Text style={styles.label}>Email</Text>
            <View
              style={[
                styles.input,
                errors.email ? styles.inputError : undefined,
              ]}
            >
              <Controller
                control={control}
                name="email"
                render={({ field: { onChange, onBlur, value } }) => (
                  <View
                    style={{
                      flexDirection: "row",
                      height: "100%",
                    }}
                  >
                    <TextInput
                      style={{ flex: 1 }}
                      placeholder="email@domain.com"
                      placeholderTextColor={Colors.light.placeholderText}
                      keyboardType="email-address"
                      onBlur={onBlur}
                      onChangeText={(text) => onChange(text)}
                      value={value}
                    />
                    <MaterialIcons
                      name="email"
                      size={20}
                      color={errors.email ? "red" : "black"}
                      style={{
                        alignSelf: "center",
                      }}
                    />
                  </View>
                )}
              />
            </View>
            {errors.email && (
              <Text style={styles.errorText}>{errors.email.message}</Text>
            )}

            {/* Phone Number Input */}
            <Text style={styles.label}>Phone Number</Text>
            <View
              style={[
                styles.input,
                errors.number ? styles.inputError : undefined,
              ]}
            >
              <Controller
                control={control}
                name="number"
                render={({ field: { onChange, onBlur, value } }) => (
                  <View
                    style={{
                      flexDirection: "row",
                      height: "100%",
                    }}
                  >
                    <TextInput
                      style={{ flex: 1 }}
                      placeholder="Number"
                      placeholderTextColor={Colors.light.placeholderText}
                      keyboardType="phone-pad"
                      onBlur={onBlur}
                      onChangeText={(text) => onChange(text)} // Convert text to number
                      value={value}
                    />
                    <MaterialIcons
                      name="phone"
                      size={20}
                      color={errors.number ? "red" : "black"}
                      style={{
                        alignSelf: "center",
                      }}
                    />
                  </View>
                )}
              />
            </View>
            {errors.number && (
              <Text style={styles.errorText}>{errors.number.message}</Text>
            )}
          </View>

          {/* Submit Button */}
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
          <View style={{ flex: 1 }}></View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
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
    marginBottom: 0,
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
