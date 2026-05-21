import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import Touchable from "@/components/ui/Touchable";
import React, { useEffect, useState, useRef, useCallback } from "react";
import { ThemedText } from "@/components/ThemedText";
import { Colors } from "@/constants/Colors";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { BillItem, NewBillItem } from "@/models/bill";
import { useBillStore } from "@/utils/billStore";
import { set } from "lodash";
import Toggle from "@/components/ui/Toggle";
import { is } from "drizzle-orm";
import { Price } from "@/utils/priceUtils";
import { FormButtonRow } from "@/components/ui/FormButtonRow";

const EditItemModal = () => {
  const router = useRouter();

  const { itemId } = useLocalSearchParams<{
    itemId?: string;
  }>();

  const { editedBill, setEditedBill } = useBillStore();
  const [item, setItem] = useState<BillItem | undefined>(undefined);
  const [name, setName] = useState("");

  const [quantity, setQuantity] = useState("1");
  const [priceInput, setPriceInput] = useState("");
  const [isTotalPriceEditing, setIsTotalPriceEditing] = useState(false);

  const quantityInt = Math.max(1, parseInt(quantity) || 1);
  const currentPrice = parseFloat(priceInput) || 0;

  const derivedOtherPrice = isTotalPriceEditing
    ? (currentPrice / quantityInt).toFixed(2) // Calculating Unit Price
    : (currentPrice * quantityInt).toFixed(2); // Calculating Total Price

  const nameInputRef = useRef<TextInput>(null);
  const quantityInputRef = useRef<TextInput>(null);
  const priceInputRef = useRef<TextInput>(null);

  useEffect(() => {
    if (itemId === undefined) {
      setName("");
      setQuantity("");
      setPriceInput("");
      return;
    }

    if (editedBill) {
      const oldItem = editedBill.items.find(
        (item) => item.id == parseInt(itemId),
      );
      if (oldItem === undefined) {
        throw Error("Uh Oh Stinky");
      }
      setItem(oldItem);
      setName(oldItem.name);
      setQuantity(oldItem.quantity.toString());
      setPriceInput(oldItem.price.toDisplay());
    }
  }, []);

  const handleSave = () => {
    if (!editedBill) return;

    let finalUnitPrice: Price;
    let finalTotalPrice: Price;

    if (isTotalPriceEditing) {
      finalTotalPrice = Price.fromDecimal(currentPrice);
      finalUnitPrice = finalTotalPrice.divide(quantityInt);
    } else {
      finalUnitPrice = Price.fromDecimal(currentPrice);
      finalTotalPrice = finalUnitPrice.multiply(quantityInt);
    }

    const updatedItem: BillItem = {
      id: item ? item.id : Date.now(),
      name: name.trim() || "New Item",
      quantity: quantityInt,
      price: finalUnitPrice,
      totalPrice: finalTotalPrice,
      assignedTo: item ? item.assignedTo : [],
    };

    let newItemsList: BillItem[];

    if (item) {
      // UPDATE: Replace the old item with the new one in the array
      newItemsList = editedBill.items.map((i) =>
        i.id === item.id ? updatedItem : i,
      );
    } else {
      // ADD: Append to the end
      newItemsList = [...editedBill.items, updatedItem];
    }

    setEditedBill({
      ...editedBill,
      items: newItemsList,
    });

    router.back();
  };

  const handleCancel = () => {
    // Compare the raw input string against the displayed version of the saved price
    const savedDisplayPrice = isTotalPriceEditing
      ? (item?.totalPrice.toDisplay() ?? "")
      : (item?.price.toDisplay() ?? "");

    const hasChanges =
      name !== (item?.name ?? "") ||
      quantity !== (item?.quantity.toString() ?? "") ||
      priceInput !== savedDisplayPrice;

    if (hasChanges) {
      Alert.alert(
        "Discard Changes?",
        "You have unsaved changes to this item.",
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

  const handleDelete = () => {
    if (item && editedBill) {
      const newItemsList = editedBill.items.filter((i) => i.id !== item.id);

      setEditedBill({
        ...editedBill,
        items: newItemsList,
      });
    }
    router.back();
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
        behavior={Platform.OS == "ios" ? "padding" : "height"}
        style={{
          justifyContent: "flex-end",
        }}
      >
        <View style={styles.container}>
          <ThemedText type="title" style={styles.title}>
            {itemId ? "Edit Item" : "Add Item"}
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
              submitBehavior="submit"
              onSubmitEditing={() => {
                quantityInputRef.current?.focus();
              }}
            />
          </View>

          <Text style={styles.label}>Quantity</Text>
          <View style={[styles.input, { borderColor: Colors.pastel.green }]}>
            <TextInput
              ref={quantityInputRef}
              placeholder="0"
              placeholderTextColor={Colors.light.placeholderText}
              style={{ flex: 1 }}
              keyboardType="numeric"
              value={quantity}
              onChangeText={setQuantity}
              returnKeyType="next"
              submitBehavior="submit"
              onSubmitEditing={() => {
                priceInputRef.current?.focus();
              }}
            />
          </View>

          <Text style={styles.label}>
            {isTotalPriceEditing ? "Total Price" : "Unit Price"}
          </Text>
          <View style={[styles.input, { borderColor: Colors.pastel.blue }]}>
            <TextInput
              ref={priceInputRef}
              placeholder="0"
              placeholderTextColor={Colors.light.placeholderText}
              style={{ flex: 1 }}
              keyboardType="numeric"
              value={priceInput}
              onChangeText={setPriceInput}
              returnKeyType="next"
              onSubmitEditing={handleSave}
            />
          </View>
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              paddingTop: 30,
            }}
          >
            <Toggle
              state={isTotalPriceEditing}
              onToggle={(newState) => {
                setPriceInput(derivedOtherPrice);
                setIsTotalPriceEditing(newState);
              }}
              leftLabel="Unit Price"
              rightLabel="Total Price"
            />
          </View>
        </View>
      </KeyboardAvoidingView>

      <FormButtonRow
        onSubmit={handleSave}
        onCancel={item === undefined ? handleCancel : handleDelete}
        submitLabel={item === undefined ? "Submit" : "Save"}
        cancelLabel={item === undefined ? "Cancel" : "Delete"}
      />
    </View>
  );
};

export default EditItemModal;

const styles = StyleSheet.create({
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
    justifyContent: "center",
    height: 40,
    borderBottomWidth: 1,
    paddingHorizontal: 10,
    backgroundColor: "white",
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
