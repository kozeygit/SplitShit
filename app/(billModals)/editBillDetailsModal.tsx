import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import Touchable from "@/components/ui/Touchable";
import React, { useEffect, useState, useRef } from "react";
import { ThemedText } from "@/components/ThemedText";
import { Colors } from "@/constants/Colors";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useRouter } from "expo-router";
import { Bill } from "@/models/bill";
import DateTimePicker, {
  DateTimePickerEvent,
} from "@react-native-community/datetimepicker";
import { useBillStore } from "@/utils/billStore";
import { Price } from "@/utils/priceUtils";
import { toServiceChargeRate } from "@/utils/serviceChargeUtils";
import { ServiceChargeToggle } from "@/components/ui/ServiceChargeToggle";
import { FormButtonRow } from "@/components/ui/FormButtonRow";

const EditBillDetailsModal = () => {
  const router = useRouter();

  const { editedBill, setEditedBill } = useBillStore();
  const [name, setName] = useState("");
  const [date, setDate] = useState<Date>(new Date());
  const [serviceCharge, setServiceCharge] = useState("");
  const [totalPrice, setTotalPrice] = useState("");

  const nameInputRef = useRef<TextInput>(null);
  const totalPriceInputRef = useRef<TextInput>(null);
  const serviceChargeInputRef = useRef<TextInput>(null);

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [serviceType, setServiceType] = useState<"percentage" | "amount">(
    "percentage",
  );

  const onChangeDate = (
    event: DateTimePickerEvent,
    selectedDate: Date | undefined,
  ) => {
    if (selectedDate) {
      setShowDatePicker(Platform.OS === "ios");
      setDate(selectedDate);

      serviceChargeInputRef.current?.focus();
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
    setServiceCharge("0");
  };

  useEffect(() => {
    if (!editedBill) return;

    setName(editedBill.name);
    setDate(editedBill.date);
    setServiceCharge(editedBill.serviceCharge.toDisplay());
    setTotalPrice(editedBill.userEnteredTotal.toDisplay());
  }, []);

  const handleSave = () => {
    if (!editedBill) return;

    const totalPriceObj = Price.fromDecimal(parseFloat(totalPrice) || 0);
    const serviceChargeObj = toServiceChargeRate(
      parseFloat(serviceCharge) || 0,
      parseFloat(totalPrice),
      serviceType,
    );

    const updatedBill: Bill = {
      ...editedBill,
      name: name.trim() || "Untitled Bill",
      date: date,
      serviceCharge: serviceChargeObj,
      userEnteredTotal: totalPriceObj,
    };

    const isUnchanged =
      updatedBill.name === editedBill.name &&
      updatedBill.date.getTime() === editedBill.date.getTime() &&
      updatedBill.serviceCharge.equals(editedBill.serviceCharge) &&
      updatedBill.userEnteredTotal.equals(editedBill.userEnteredTotal);

    if (isUnchanged) {
      router.back();
      return;
    }

    setEditedBill(updatedBill);
    router.back();
  };

  const handleCancel = () => {
    // Compare current state vs the store
    const hasChanges =
      name !== editedBill?.name ||
      date.getTime() !== editedBill?.date.getTime() ||
      serviceCharge !== editedBill?.serviceCharge.toDisplay() ||
      totalPrice !== editedBill?.userEnteredTotal.toDisplay();

    if (hasChanges) {
      Alert.alert(
        "Discard Changes?",
        "You have unsaved changes to this bill's details.",
        [
          { text: "Keep Editing", style: "cancel" },
          {
            text: "Discard",
            style: "destructive",
            onPress: () => router.back(),
          },
        ],
      );
    } else {
      router.back();
    }
  };

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: Colors.pastel.red,
        paddingHorizontal: 20,
      }}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS == "ios" ? "padding" : "position"}
        style={{
          justifyContent: "flex-end",
        }}
      >
        <View style={styles.container}>
          <ThemedText type="title" style={styles.title}>
            Edit Bill Details
          </ThemedText>

          <Text style={styles.label}>Name</Text>
          <View style={[styles.input, { borderColor: Colors.pastel.red }]}>
            <TextInput
              ref={nameInputRef}
              placeholder="Item Name"
              placeholderTextColor={Colors.light.placeholderText}
              style={{ flex: 1 }}
              keyboardType="default"
              value={name}
              onChangeText={setName}
              returnKeyType="next"
              onSubmitEditing={() => {
                setShowDatePicker(true);
              }}
            />
          </View>

          {/* Date Picker */}
          {showDatePicker && (
            <DateTimePicker
              id="dateTimePicker"
              value={date}
              mode={"date"}
              display="default"
              onChange={onChangeDate}
            />
          )}

          <Text style={styles.label}>Date</Text>
          <Touchable onPress={() => setShowDatePicker(true)}>
            <View style={[styles.input, { borderColor: Colors.pastel.orange }]}>
              <TextInput
                placeholder="Date (YYYY-MM-DD)"
                style={{ flex: 1 }}
                value={date.toLocaleDateString()}
                editable={false}
              />
              <MaterialIcons name="edit-calendar" size={20} />
            </View>
          </Touchable>

          <Text style={styles.label}>Service Charge</Text>
          <View style={[styles.input, { borderColor: Colors.pastel.green }]}>
            <TextInput
              ref={serviceChargeInputRef}
              placeholder="0"
              placeholderTextColor={Colors.light.placeholderText}
              style={{ flex: 1 }}
              keyboardType="numeric"
              value={serviceCharge}
              onChangeText={setServiceCharge}
              returnKeyType="next"
              submitBehavior="submit"
              onSubmitEditing={() => {
                totalPriceInputRef.current?.focus();
              }}
            />
            <ServiceChargeToggle
              serviceType={serviceType}
              onSwap={swapServiceType}
            />
          </View>

          <Text style={styles.label}>Total Price</Text>
          <View style={[styles.input, { borderColor: Colors.pastel.indigo }]}>
            <TextInput
              ref={totalPriceInputRef}
              placeholder="0"
              placeholderTextColor={Colors.light.placeholderText}
              style={{ flex: 1 }}
              keyboardType="numeric"
              value={totalPrice}
              onChangeText={setTotalPrice}
              returnKeyType="done"
              onSubmitEditing={handleSave}
            />
          </View>
        </View>
      </KeyboardAvoidingView>
      <FormButtonRow
        onCancel={handleCancel}
        onSubmit={handleSave}
        submitLabel="Save"
      />
    </View>
  );
};

export default EditBillDetailsModal;

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  container: {
    marginTop: 80,
    padding: 30,
    paddingBottom: 40,
    backgroundColor: "white",
    borderWidth: 2,
    borderRadius: 20,
    elevation: 5,
  },
  label: {
    fontSize: 16,
    fontWeight: "bold",
    paddingTop: 20,
    paddingBottom: 5,
  },
  input: {
    flexDirection: "row",
    alignItems: "center",
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
  title: {
    paddingTop: 10,
    paddingBottom: 20,
    borderBottomWidth: 1,
    marginBottom: 10,
  },
});
