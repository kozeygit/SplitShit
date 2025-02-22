import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
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
import { BillItem, NewBillItem } from "@/models/bill";
import { removeBillItem } from "@/utils/removeData";
import { updateBillItem } from "@/utils/updateData";
import { insertBillItem } from "@/utils/insertData";

const EditItemModal = () => {
  const { getBillItem } = useGetData();
  const router = useRouter();

  const { billId, itemId } = useLocalSearchParams<{
    billId: string;
    itemId?: string;
  }>();

  const [item, setItem] = useState<BillItem | undefined>(undefined);
  const [name, setName] = useState("");
  const [quantity, setQuantity] = useState("");
  const [price, setPrice] = useState("");
  const [totalPrice, setTotalPrice] = useState("");
  const [isTotalPriceEditing, setIsTotalPriceEditing] = useState(false);

  const nameInputRef = useRef<TextInput>(null);
  const quantityInputRef = useRef<TextInput>(null);
  const priceInputRef = useRef<TextInput>(null);
  const totalPriceInputRef = useRef<TextInput>(null);

  useEffect(() => {
    if (itemId === undefined) {
      setName("");
      setQuantity("");
      setPrice("");
      setTotalPrice("");
      return;
    }

    const fetchBill = async () => {
      const oldItem = await getBillItem(parseInt(itemId));
      if (oldItem === undefined) {
        throw Error("Uh Oh Stinky");
      }
      setItem(oldItem);
      setName(oldItem.name);
      setQuantity(oldItem.quantity.toString());
      setPrice(oldItem.price.toFixed(2).toString());
      setTotalPrice(oldItem.totalPrice.toFixed(2).toString());
    };

    fetchBill();
  }, [getBillItem]);

  const calculateTotalPrice = () => {
    const numQuantity = parseInt(quantity, 10) || 0;
    const numPrice = parseFloat(price) || 0;
    const newTotalPrice = (numQuantity * numPrice).toFixed(2);
    setTotalPrice(newTotalPrice);
  };

  const calculateUnitPriceFromTotal = () => {
    const numQuantity = parseInt(quantity, 10) || 0;
    const numTotalPrice = parseFloat(totalPrice) || 0;

    if (numQuantity > 0) {
      const newPrice = (numTotalPrice / numQuantity).toFixed(2);
      setPrice(newPrice);
    } else {
      setPrice("0.00");
    }
  };

  useEffect(() => {
    if (!isTotalPriceEditing) {
      calculateTotalPrice();
    }
  }, [price, quantity]);

  useEffect(() => {
    if (isTotalPriceEditing) {
      calculateUnitPriceFromTotal();
    }
  }, [totalPrice, quantity]);

  const handleTotalPriceChange = (newTotalPrice: string) => {
    setIsTotalPriceEditing(true);
    setTotalPrice(newTotalPrice);
  };

  const handlePriceChange = (newPrice: string) => {
    setIsTotalPriceEditing(false);
    setPrice(newPrice);
  };

  const handleQuantityChange = (newQuantity: string) => {
    setQuantity(newQuantity);
    if (!isTotalPriceEditing) {
      calculateTotalPrice();
    } else {
      calculateUnitPriceFromTotal();
    }
  };

  const handleSave = () => {
    const updatedItem: NewBillItem = {
      name: name || "New Item",
      quantity: parseInt(quantity, 10) || 1,
      price: parseFloat(price) || 0,
      totalPrice: parseFloat(totalPrice) || 0,
    };
    if (item) {
      if (
        updatedItem.name == item.name &&
        updatedItem.price == item.price &&
        updatedItem.quantity == item.quantity &&
        updatedItem.totalPrice == item.totalPrice
      ) {
        console.log("No changes to save")
        router.back();
        return;
      }

      item.name = updatedItem.name;
      item.quantity = updatedItem.quantity;
      item.price = updatedItem.price;
      item.totalPrice = updatedItem.totalPrice;

      console.log("Saving item");
      updateBillItem(item);
      router.back();
      return;
    }

    insertBillItem(updatedItem, parseInt(billId));
    console.log("Adding new item");
    router.back();
  };

  const handleCancel = () => {
    console.log("cancelled");
    router.back();
  };

  const handleDelete = () => {
    console.log(item);
    if (item) {
      removeBillItem(item.id);
      console.log("Deleting");
    }
    router.back();
  };

  return (
    <Pressable style={styles.modalBG} onPress={handleCancel}>
      <KeyboardAvoidingView
        behavior={Platform.OS == "ios" ? "padding" : "height"}
        style={styles.modalContainer}
      >
        <TouchableWithoutFeedback>
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
            <View style={[styles.input, { borderColor: Colors.pastel.orange }]}>
              <TextInput
                ref={quantityInputRef}
                placeholder="0"
                style={{ flex: 1 }}
                keyboardType="numeric"
                value={quantity}
                onChangeText={handleQuantityChange}
                returnKeyType="next"
                onSubmitEditing={() => {
                  priceInputRef.current?.focus();
                }}
              />
            </View>

            <Text style={styles.label}>Price</Text>
            <View style={[styles.input, { borderColor: Colors.pastel.green }]}>
              <TextInput
                ref={priceInputRef}
                placeholder="0"
                style={{ flex: 1 }}
                keyboardType="numeric"
                value={price}
                onChangeText={handlePriceChange}
                returnKeyType="next"
                onSubmitEditing={() => {
                  totalPriceInputRef.current?.focus();
                }}
              />
              {!isTotalPriceEditing && <MaterialIcons name="edit" size={14} />}
            </View>

            <Text style={styles.label}>Total Price</Text>
            <View style={[styles.input, { borderColor: Colors.pastel.indigo }]}>
              <TextInput
                ref={totalPriceInputRef}
                placeholder="0"
                style={{ flex: 1 }}
                keyboardType="numeric"
                value={totalPrice}
                onChangeText={handleTotalPriceChange}
                returnKeyType="done"
                onSubmitEditing={handleSave}
              />
              {isTotalPriceEditing && <MaterialIcons name="edit" size={14} />}
            </View>

            <View style={styles.buttonContainer}>
              {item === undefined ? (
                <View style={styles.deleteButtonOuter}>
                  <TouchableNativeFeedback onPress={handleCancel}>
                    <View style={styles.submitButtonInner}>
                      <ThemedText
                        type="defaultSemiBold"
                        style={styles.deleteText}
                      >
                        Cancel
                      </ThemedText>
                    </View>
                  </TouchableNativeFeedback>
                </View>
              ) : (
                <View style={styles.deleteButtonOuter}>
                  <TouchableNativeFeedback onPress={handleDelete}>
                    <View style={styles.submitButtonInner}>
                      <ThemedText
                        type="defaultSemiBold"
                        style={styles.deleteText}
                      >
                        Delete
                      </ThemedText>
                    </View>
                  </TouchableNativeFeedback>
                </View>
              )}
              <View style={styles.submitButtonOuter}>
                <TouchableNativeFeedback onPress={handleSave}>
                  <View style={styles.submitButtonInner}>
                    <ThemedText
                      type="defaultSemiBold"
                      style={styles.submitText}
                    >
                      Save
                    </ThemedText>
                  </View>
                </TouchableNativeFeedback>
              </View>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </Pressable>
  );
};

export default EditItemModal;

const styles = StyleSheet.create({
  submitButtonOuter: {
    flex: 3,
    height: 50,
    borderWidth: 2,
    backgroundColor: Colors.pastel.green,
    borderRadius: 15,
    elevation: 5,
    overflow: "hidden",
    boxShadow: "no",
  },
  submitButtonInner: {
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  deleteButtonOuter: {
    flex: 1,
    height: 50,
    borderWidth: 2,
    backgroundColor: "red",
    borderRadius: 15,
    elevation: 5,
    overflow: "hidden",
    boxShadow: "no",
    color: "white",
  },
  deleteText: {
    fontSize: 18,
    color: "white",
  },
  submitText: {
    fontSize: 18,
  },
  buttonContainer: {
    marginTop: 30,
    flexDirection: "row",
    gap: 10,
  },
  modalBG: {
    height: "100%",
    backgroundColor: "rgba(0,0,0,0.6)",
  },
  modalContainer: {
    // Style for the KeyboardAvoidingView
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 30,
  },
  container: {
    paddingVertical: 45,
    paddingHorizontal: 35,

    borderWidth: 2,
    borderRadius: 20,

    elevation: 5,

    backgroundColor: "white",
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
    paddingBottom: 20,
    borderBottomWidth: 1,
    marginBottom: 10,
  },
});
