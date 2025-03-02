import React, { useState } from "react";
import {
  View,
  TextInput,
  Button,
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
import { NewBill } from "@/models/bill"; // Replace with your actual path
import DateTimePicker, {
  DateTimePickerEvent,
} from "@react-native-community/datetimepicker";
import { Colors } from "@/constants/Colors";
import { ThemedText } from "@/components/ThemedText";
import { useRouter } from "expo-router";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { insertBill } from "@/utils/insertData";

const billSchema = z.object({
  name: z.string().min(1, "Bill name is required"),
  userEnteredTotal: z.coerce
    .number({
      invalid_type_error: "Total price must be a number",
    })
    .multipleOf(0.01, "More than two decimals.... really? :/")
    .positive("Total price must be positive"),
  date: z.date({
    invalid_type_error: "Date is required",
  }),
  serviceCharge: z.coerce
    .number({
      invalid_type_error: "Service charge must be a number",
    })
    .nonnegative("Service charge cannot be negative")
    .optional(),
});

export default function NewBillPage() {
  const router = useRouter();
  const {
    control,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<NewBill>({
    defaultValues: {
      name: "",
      userEnteredTotal: 0,
      date: new Date(),
      serviceCharge: 0,
    },
    resolver: zodResolver(billSchema),
  });

  const onSubmit = async (data: NewBill) => {
    if (serviceType == "percentage") {
      data.serviceCharge = data.userEnteredTotal * data.serviceCharge / 100
    }

    const newBillId = await insertBill(data);
    if (newBillId < 0) {
      console.log("insert bill failed for some reason????");
    } else {
      router.replace({ pathname: "/bill", params: { id: newBillId } });
    }
  };

  const [date, setDate] = useState(new Date());
  const [show, setShow] = useState(false);
  const [serviceType, setServiceType] = useState<"percentage" | "amount">(
    "amount"
  );

  const onChangeDate = (
    event: DateTimePickerEvent,
    selectedDate: Date | undefined
  ) => {
    if (selectedDate) {
      setShow(Platform.OS === "ios");
      setDate(selectedDate);
      setValue("date", selectedDate);
    } else if (Platform.OS === "ios") {
      setShow(false);
    }
  };

  const swapServiceType = () => {
    if (serviceType == "percentage") {
      setServiceType("amount");
    } else {
      setServiceType("percentage");
    }
  };

  const showDatepicker = () => {
    setShow(true);
  };

  return (
    <SafeAreaView
      style={{
        flex: 1,
        backgroundColor: Colors.pastel.red,
        paddingHorizontal: 20,
      }}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS == "ios" ? "padding" : "height"}
        style={{
          justifyContent: "flex-end",
        }}
      >
        <ScrollView style={{ overflow: "visible" }}>
          <View style={styles.container}>
            <ThemedText type="title" style={styles.title}>
              Add New Bill
            </ThemedText>
            {/* Bill Name Input */}
            <Text style={styles.label}>Bill Name</Text>
            <Controller
              control={control}
              name="name"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  style={[
                    styles.input,
                    errors.name ? styles.inputError : undefined,
                  ]}
                  placeholder="Bill Name"
                  onBlur={onBlur}
                  onChangeText={onChange} // Update form state on text change
                  value={value} // Bind the value to the form state
                />
              )}
            />
            {errors.name && (
              <Text style={styles.errorText}>{errors.name.message}</Text>
            )}

            {errors.userEnteredTotal && (
              <Text style={styles.errorText}>
                {errors.userEnteredTotal.message}
              </Text>
            )}

            {/* Date Picker */}
            {show && (
              <DateTimePicker
                id="dateTimePicker"
                value={date}
                mode={"date"}
                display="default"
                onChange={onChangeDate}
              />
            )}

            {/* Display Selected Date */}
            <Text style={styles.label}>Date</Text>
            <TouchableNativeFeedback onPress={showDatepicker}>
              <View
                style={[
                  styles.input,
                  errors.date ? styles.inputError : undefined,
                ]}
              >
                <Controller
                  control={control}
                  name="date"
                  render={({ field: { value } }) => (
                    <View
                      style={{
                        flexDirection: "row",
                        justifyContent: "space-between",
                      }}
                    >
                      <TextInput
                        placeholder="Date (YYYY-MM-DD)"
                        value={value.toLocaleDateString()} // Format date for display
                        editable={false}
                      />
                      <MaterialIcons name="edit-calendar" size={20} />
                    </View>
                  )}
                />
              </View>
            </TouchableNativeFeedback>
            {errors.date && (
              <Text style={styles.errorText}>{errors.date.message}</Text>
            )}

            {/* Service Charge Input */}
            <Text style={styles.label}>Service Charge</Text>
            <View
              style={[
                styles.input,
                errors.date ? styles.inputError : undefined,
              ]}
            >
              <Controller
                control={control}
                name="serviceCharge"
                render={({ field: { onChange, onBlur, value } }) => (
                  <View
                    style={{
                      flexDirection: "row",
                      height: "100%",
                    }}
                  >
                    <TextInput
                      style={{ flex: 1 }}
                      placeholder="Service Charge"
                      keyboardType="numeric"
                      onBlur={onBlur}
                      onChangeText={(text) => onChange(text)} // Convert text to number
                      value={value.toString()} // Convert number to string for display
                    />
                    <TouchableNativeFeedback
                      onPress={swapServiceType}
                    >
                      {serviceType == "percentage" ? (
                        <MaterialIcons
                          name="percent"
                          size={20}
                          color={errors.serviceCharge ? "red" : "black"}
                          style={{
                            alignSelf: "center",
                          }}
                        />
                      ) : (
                        <MaterialIcons
                          name="currency-pound"
                          size={20}
                          color={errors.serviceCharge ? "red" : "black"}
                          style={{
                            alignSelf: "center",
                          }}
                        />
                      )}
                    </TouchableNativeFeedback>
                  </View>
                )}
              />
            </View>
            {errors.serviceCharge && (
              <Text style={styles.errorText}>
                {errors.serviceCharge.message}
              </Text>
            )}
            {/* Total Amount Input */}
            <Text style={styles.label}>Total Price</Text>
            <View
              style={[
                styles.input,
                errors.userEnteredTotal ? styles.inputError : undefined,
              ]}
            >
              <Controller
                control={control}
                name="userEnteredTotal"
                render={({ field: { onChange, onBlur, value } }) => (
                  <View
                    style={{
                      flexDirection: "row",
                      height: "100%",
                    }}
                  >
                    <TextInput
                      style={{ flex: 1 }}
                      placeholder="Total Amount"
                      keyboardType="numeric"
                      onBlur={onBlur}
                      onChangeText={(text) => onChange(text)} // Convert text to number
                      value={value.toString()} // Convert number to string for display
                    />
                    <MaterialIcons
                      name="price-change"
                      size={20}
                      color={errors.userEnteredTotal ? "red" : "black"}
                      style={{
                        alignSelf: "center",
                      }}
                    />
                  </View>
                )}
              />
            </View>
          </View>

          <View style={{ flex: 1 }}></View>
        </ScrollView>
      </KeyboardAvoidingView>
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
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 80,
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
