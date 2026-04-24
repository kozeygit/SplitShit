import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableNativeFeedback,
  View,
} from "react-native";
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

  const [show, setShow] = useState(false);
  const [serviceType, setServiceType] = useState<"percentage" | "amount">(
    "amount",
  );

  const onChangeDate = (
    event: DateTimePickerEvent,
    selectedDate: Date | undefined,
  ) => {
    if (selectedDate) {
      setShow(Platform.OS === "ios");
      setDate(selectedDate);
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
    setServiceCharge("0")
  };

  const showDatepicker = () => {
    setShow(true);
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
    let serviceChargeObj = Price.fromDecimal(parseFloat(serviceCharge) || 0);

    if (serviceType === "percentage") {
      const servicePercent = parseFloat(serviceCharge) || 0;
      const subTotal = totalPriceObj.divide(1 + servicePercent / 100);
      serviceChargeObj = totalPriceObj.subtract(subTotal);
    }

    const updatedBill: Bill = {
      ...editedBill,
      name: name.trim() || "Untitled Bill",
      date: date,
      serviceCharge: serviceChargeObj,
      userEnteredTotal: totalPriceObj,
    };

    const isUnchanged = (
      updatedBill.name === editedBill.name &&
      updatedBill.date.getTime() === editedBill.date.getTime() &&
      updatedBill.serviceCharge.equals(editedBill.serviceCharge) &&
      updatedBill.userEnteredTotal.equals(editedBill.userEnteredTotal)
    )
    
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
          { text: "Discard", style: "destructive", onPress: () => router.back()}
        ],
      );
    } else {
      router.back();
    }
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
              style={{ flex: 1 }}
              keyboardType="default"
              value={name}
              onChangeText={setName}
              returnKeyType="next"
              onSubmitEditing={() => {
                setShow(true);
              }}
            />
          </View>

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

          <Text style={styles.label}>Date</Text>
          <TouchableNativeFeedback onPress={showDatepicker}>
            <View style={[styles.input, { borderColor: Colors.pastel.orange }]}>
              <TextInput
                placeholder="Date (YYYY-MM-DD)"
                style={{ flex: 1 }}
                value={date.toLocaleDateString()}
                editable={false}
              />
              <MaterialIcons name="edit-calendar" size={20} />
            </View>
          </TouchableNativeFeedback>

          <Text style={styles.label}>Service Charge</Text>
          <View style={[styles.input, { borderColor: Colors.pastel.green }]}>
            <TextInput
              ref={serviceChargeInputRef}
              placeholder="0"
              style={{ flex: 1 }}
              keyboardType="numeric"
              value={serviceCharge}
              onChangeText={setServiceCharge}
              returnKeyType="next"
              onSubmitEditing={() => {
                totalPriceInputRef.current?.focus();
              }}
            />
            <TouchableNativeFeedback onPress={swapServiceType}>
              {serviceType == "percentage" ? (
                <MaterialIcons
                  name="percent"
                  size={20}
                  color={"black"}
                  style={{
                    alignSelf: "center",
                  }}
                />
              ) : (
                <MaterialIcons
                  name="currency-pound"
                  size={20}
                  color={"black"}
                  style={{
                    alignSelf: "center",
                  }}
                />
              )}
            </TouchableNativeFeedback>
          </View>

          <Text style={styles.label}>Total Price</Text>
          <View style={[styles.input, { borderColor: Colors.pastel.indigo }]}>
            <TextInput
              ref={totalPriceInputRef}
              placeholder="0"
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
      <View style={styles.buttonContainer}>
        <View style={styles.cancelButtonOuter}>
          <TouchableNativeFeedback onPress={handleCancel}>
            <View style={styles.submitButtonInner}>
              <ThemedText type="defaultSemiBold" style={styles.cancelText}>
                Cancel
              </ThemedText>
            </View>
          </TouchableNativeFeedback>
        </View>
        <View style={styles.submitButtonOuter}>
          <TouchableNativeFeedback onPress={handleSave}>
            <View style={styles.submitButtonInner}>
              <ThemedText type="defaultSemiBold" style={styles.submitText}>
                Save
              </ThemedText>
            </View>
          </TouchableNativeFeedback>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default EditBillDetailsModal;

const styles = StyleSheet.create({
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
