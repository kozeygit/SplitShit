import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableNativeFeedback,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import React, { useEffect, useState, useRef, useCallback } from "react";
import { ThemedText } from "@/components/ThemedText";
import { Colors } from "@/constants/Colors";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useGetData } from "@/hooks/useGetData";
import { Bill, BillItem, NewBill, NewBillItem } from "@/models/bill";
import DateTimePicker, {
  DateTimePickerEvent,
} from "@react-native-community/datetimepicker";
import { useBillStore } from "@/utils/billStore";

const EditBillDetailsModal = () => {
  const { getBill } = useGetData();
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
    "amount"
  );

  const onChangeDate = (
    event: DateTimePickerEvent,
    selectedDate: Date | undefined
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
  };

  const showDatepicker = () => {
    setShow(true);
  };

  useEffect(() => {
    const fetchBill = async () => {
      const oldBill = editedBill!;
      setName(oldBill.name);
      setDate(oldBill.date);
      setServiceCharge(oldBill.serviceCharge.toFixed(2).toString());
      setTotalPrice(oldBill.userEnteredTotal.toFixed(2).toString());
    };

    fetchBill();
  }, [getBill]);

  const handleSave = () => {
    const updatedBill: NewBill = {
      name: name || "New Item",
      date: date,
      serviceCharge:
        serviceType == "percentage"
          ? ((parseFloat(serviceCharge) || 0) * (parseFloat(totalPrice) || 0)) /
            100
          : parseFloat(serviceCharge) || 0,
      userEnteredTotal: parseFloat(totalPrice) || 0,
    };
    if (editedBill) {
      if (
        updatedBill.name == editedBill.name &&
        updatedBill.date == editedBill.date &&
        updatedBill.serviceCharge == editedBill.serviceCharge &&
        updatedBill.userEnteredTotal == editedBill.userEnteredTotal
      ) {
        console.log("No changes to save");
        router.back();
        return;
      }

      editedBill.name = updatedBill.name;
      editedBill.date = updatedBill.date;
      editedBill.serviceCharge = updatedBill.serviceCharge;
      editedBill.userEnteredTotal = updatedBill.userEnteredTotal;
      
      setEditedBill(editedBill)

      console.log("Saving editedBill");
      router.back();
      return;
    }

    console.log("This shouldn't be logged :/");
    router.back();
  };

  const handleCancel = () => {
    console.log("cancelled");
    router.back();
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
