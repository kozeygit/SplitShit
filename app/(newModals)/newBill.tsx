import React, { useRef, useState } from "react";
import {
  Alert,
  View,
  TextInput,
  StyleSheet,
  Text,
  Platform,
  KeyboardAvoidingView,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import Touchable from "@/components/ui/Touchable";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Bill, NewBill } from "@/models/bill";
import DateTimePicker, {
  DateTimePickerChangeEvent,
} from "@expo/ui/community/datetime-picker";
import { Colors } from "@/constants/Colors";
import { ThemedText } from "@/components/ThemedText";
import { useRouter } from "expo-router";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { insertBill } from "@/utils/insertData";
import { useBillStore } from "@/hooks/useBillStore";
import { useImagePicker } from "@/hooks/useImagePicker";
import { extractBillFromImage } from "@/utils/createBillFromImage";
import { ingestBill } from "@/utils/insertData";
import { saveReceiptImage } from "@/utils/fileSystem";
import { updateBillImagePath } from "@/utils/updateData";
import { Price } from "@/utils/priceUtils";
import { fetchBill } from "@/utils/fetchData";
import { toServiceChargeRate } from "@/utils/serviceChargeUtils";
import { ServiceChargeToggle } from "@/components/ui/ServiceChargeToggle";
import { FormButtonRow } from "@/components/ui/FormButtonRow";

const billSchema = z.object({
  name: z.string().min(1, "Bill name is required"),
  userEnteredTotal: z.coerce
    .number({ invalid_type_error: "Total price must be a number" })
    .multipleOf(0.01, "More than two decimals.... really? :/")
    .positive("Total price must be positive"),
  date: z.date({ invalid_type_error: "Date is required" }),
  serviceCharge: z.coerce
    .number({ invalid_type_error: "Service charge must be a number" })
    .nonnegative("Service charge cannot be negative")
    .optional(),
});

type BillFormData = z.infer<typeof billSchema>;

export default function NewBillPage() {
  const nameRef = useRef<TextInput>(null);
  const totalRef = useRef<TextInput>(null);
  const dateRef = useRef<TextInput>(null);
  const serviceChargeRef = useRef<TextInput>(null);

  const router = useRouter();
  const { setOriginalBill, resetEditedBill } = useBillStore();
  const { launchGallery, launchCamera } = useImagePicker({
    aspect: undefined,
  });

  const [loading, setLoading] = useState(false);
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [serviceType, setServiceType] = useState<"percentage" | "amount">(
    "amount",
  );
  const [cameraEnabled, setCameraEnabled] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<BillFormData>({
    defaultValues: {
      name: "",
      userEnteredTotal: 0,
      date: new Date(),
      serviceCharge: 0,
    },
    resolver: zodResolver(billSchema),
  });

  const onSubmit = async (data: BillFormData) => {
    const serviceChargeObj = toServiceChargeRate(
      data.serviceCharge || 0,
      data.userEnteredTotal || 0,
      serviceType,
    );

    const billToInsert: NewBill = {
      name: data.name,
      date: data.date,
      userEnteredTotal: Price.fromDecimal(data.userEnteredTotal || 0),
      serviceCharge: serviceChargeObj,
    };

    const newBillId = await insertBill(billToInsert);

    if (newBillId < 0) {
      console.log("insert bill failed for some reason????");
    } else {
      const newBill = await fetchBill(newBillId);
      setOriginalBill(newBill);
      resetEditedBill();
      router.replace("/bill");
    }
  };

  const onChangeDate = (
    event: DateTimePickerChangeEvent,
    selectedDate: Date | undefined,
  ) => {
    if (selectedDate) {
      setShowDatePicker(Platform.OS === "ios");
      setDate(selectedDate);
      setValue("date", selectedDate);
      serviceChargeRef.current?.focus();
    } else if (Platform.OS === "ios") {
      setShowDatePicker(false);
    }
  };

  const swapServiceType = () => {
    if (serviceType == "percentage") {
      setServiceType("amount");
    } else {
      setServiceType("percentage");
    }
  };

  const handleAddByCamera = async () => {
    let uri: string | null = null;
    try {
      uri = await launchCamera();
    } catch (error: any) {
      if (error.message == "Camera permission not granted") {
        Alert.alert(
          "Camera Access Required",
          "Please enable camera permissions in your device settings",
        );
      } else {
        Alert.alert("Error", error.message);
      }
    }
    return uri;
  };

  const handleUseImage = async () => {
    const AsyncAlert = async () =>
      new Promise<string | null>(async (resolve) => {
        Alert.alert("Add Receipt", "Scan your bill", [
          {
            text: "Take Photo",
            onPress: async () => {
              resolve(await handleAddByCamera());
            },
          },
          {
            text: "Gallery",
            onPress: async () => {
              resolve(await launchGallery());
            },
          },
          { text: "Cancel", style: "cancel" },
        ]);
      });

    let uri: string | null = null;
    uri = await AsyncAlert();
    console.log("Im Here", uri);
    if (!uri) return;

    setLoading(true);
    const extractedBill = await extractBillFromImage(uri);
    setLoading(false);

    if (!extractedBill) {
      Alert.alert(
        "Could not read receipt",
        "We couldn't extract a bill from that image. Please enter the details manually.",
      );
      return;
    }

    const billId = await ingestBill(extractedBill);
    const imagePath = await saveReceiptImage(uri, billId);
    await updateBillImagePath(billId, imagePath);

    const bill = await fetchBill(billId);
    setOriginalBill(bill);
    resetEditedBill();
    router.replace("/bill");
  };

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: Colors.pastel.red,
        paddingHorizontal: 20,
      }}
    >
      {loading && (
        <View style={styles.loadingView}>
          <ActivityIndicator size="large" color="white" />
          <ThemedText style={{ color: "white", marginTop: 10 }}>
            Extracting bill data...
          </ThemedText>
        </View>
      )}
      <KeyboardAvoidingView
        behavior={Platform.OS == "ios" ? "padding" : "height"}
        style={{
          justifyContent: "flex-end",
        }}
      >
        <ScrollView style={{ overflow: "visible" }}>
          <View style={styles.container}>
            <View style={styles.title}>
              <ThemedText type="title">Add New Bill</ThemedText>
              <Touchable
                onLongPress={() => {
                  alert("Camera enabled");
                  setCameraEnabled(true);
                }}
                delayLongPress={2000}
                onPress={handleUseImage}
                style={styles.photoButton}
              >
                <MaterialIcons name="add-a-photo" size={24} color={"black"} />
              </Touchable>
            </View>
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
                  ref={nameRef}
                  placeholder="Bill Name"
                  placeholderTextColor={Colors.light.placeholderText}
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value}
                />
              )}
            />
            {errors.name && (
              <Text style={styles.errorText}>{errors.name.message}</Text>
            )}

            {/* Date Picker Input */}
            {showDatePicker && (
              <DateTimePicker
                value={date}
                mode={"date"}
                display="default"
                onValueChange={onChangeDate}
              />
            )}

            <Text style={styles.label}>Date</Text>
            <Touchable onPress={() => setShowDatePicker(true)}>
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
                        height: "100%",
                      }}
                    >
                      <TextInput
                        style={{ flex: 1 }}
                        placeholder="Date (YYYY-MM-DD)"
                        value={value.toLocaleDateString()}
                      />
                      <MaterialIcons
                        name="edit-calendar"
                        size={20}
                        style={{
                          alignSelf: "center",
                        }}
                      />
                    </View>
                  )}
                />
              </View>
            </Touchable>
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
                    }}
                  >
                    <TextInput
                      style={{ flex: 2 }}
                      placeholder="Service Charge"
                      placeholderTextColor={Colors.light.placeholderText}
                      keyboardType="numeric"
                      onBlur={onBlur}
                      onChangeText={(text) => onChange(text)}
                      value={value !== undefined ? value.toString() : ""}
                      submitBehavior="submit"
                      onSubmitEditing={totalRef.current?.focus}
                    />
                    <ServiceChargeToggle
                      serviceType={serviceType}
                      onSwap={swapServiceType}
                    />
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
                      placeholderTextColor={Colors.light.placeholderText}
                      keyboardType="numeric"
                      onBlur={onBlur}
                      onChangeText={(text) => onChange(text)}
                      value={value.toString()}
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
            {errors.userEnteredTotal && (
              <Text style={styles.errorText}>
                {errors.userEnteredTotal.message}
              </Text>
            )}
          </View>

          <View style={{ flex: 1 }}></View>
        </ScrollView>
      </KeyboardAvoidingView>
      <FormButtonRow
        onCancel={() => router.back()}
        onSubmit={handleSubmit(onSubmit)}
        submitLabel="Submit"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  photoButton: {
    borderWidth: 1,
    borderRadius: "100%",
    aspectRatio: 1,
    padding: 10,
    backgroundColor: "white",
    elevation: 3,
  },
  loadingView: {
    backgroundColor: "rgba(0,0,0,0.6)",
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 100,
    justifyContent: "center",
    alignItems: "center",
  },
  container: {
    marginTop: 80,
    padding: 30,
    backgroundColor: "white",
    borderWidth: 2,
    borderRadius: 20,
    elevation: 5,
  },
  title: {
    paddingBottom: 20,
    borderBottomWidth: 1,
    marginBottom: 10,
    justifyContent: "space-between",
    flexDirection: "row",
    alignItems: "baseline",
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

  errorText: {
    color: "red",
    fontSize: 12,
    marginTop: 5,
    marginLeft: 5,
  },
});
