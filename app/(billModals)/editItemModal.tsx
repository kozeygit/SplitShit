import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableNativeFeedback,
  View,
} from "react-native";
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

    const fetchItem = async () => {
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
    };

    fetchItem();
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
        <View style={styles.container}>
          <ThemedText type="title" style={styles.title}>
            {itemId ? "Edit Item" : "Add Item"}
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
                quantityInputRef.current?.focus();
              }}
            />
          </View>

          <Text style={styles.label}>Quantity</Text>
          <View style={[styles.input, { borderColor: Colors.pastel.green }]}>
            <TextInput
              ref={quantityInputRef}
              placeholder="0"
              style={{ flex: 1 }}
              keyboardType="numeric"
              value={quantity}
              onChangeText={setQuantity}
              returnKeyType="next"
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

      <View style={styles.buttonContainer}>
        {item === undefined ? (
          <View style={styles.cancelButtonOuter}>
            <TouchableNativeFeedback onPress={handleCancel}>
              <View style={styles.submitButtonInner}>
                <ThemedText type="defaultSemiBold" style={styles.cancelText}>
                  Cancel
                </ThemedText>
              </View>
            </TouchableNativeFeedback>
          </View>
        ) : (
          <View style={styles.cancelButtonOuter}>
            <TouchableNativeFeedback onPress={handleDelete}>
              <View style={styles.submitButtonInner}>
                <ThemedText type="defaultSemiBold" style={styles.cancelText}>
                  Delete
                </ThemedText>
              </View>
            </TouchableNativeFeedback>
          </View>
        )}
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

export default EditItemModal;

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
