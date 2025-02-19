import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TouchableNativeFeedback,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import React, { useEffect, useState, useRef } from "react";
import { BillItem, NewBillItem } from "@/models/bill";
import { ThemedText } from "@/components/ThemedText";
import { Colors } from "@/constants/Colors";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";

interface props {
  item: BillItem | undefined;
  isOpen: boolean;
  onSave: (oldItem: BillItem | undefined, updatedItem: NewBillItem) => void;
  onCancel: () => void;
}

const EditItemModal = (props: props) => {
  const { item, isOpen, onSave, onCancel } = props;

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
    if (!item) {
      setName("New Item");
      setQuantity("1");
      setPrice("0");
      setTotalPrice("0");
      return;
    }
    setName(item.name);
    setQuantity(item.quantity.toString());
    setPrice(item.price.toString());
    setTotalPrice(item.totalPrice.toString());
  }, [item]);

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
    const updatedItem = {
      name,
      quantity: parseInt(quantity, 10) || 0,
      price: parseFloat(price) || 0,
      totalPrice: parseFloat(totalPrice) || 0,
    };
    onSave(item, updatedItem);
    onCancel();
  };

  return (
    <Modal
      onRequestClose={onCancel}
      visible={isOpen}
      transparent={true}
      statusBarTranslucent={true}
    >
      <Pressable style={styles.modalBG} onPress={onCancel}>
        <KeyboardAvoidingView
          behavior={Platform.OS == "ios" ? "padding" : "height"}
          style={styles.modalContainer}
        >
          <TouchableWithoutFeedback>
            <View style={styles.container}>
              <ThemedText type="title" style={styles.title}>
                {item ? "Edit Item" : "Add Item"}
              </ThemedText>

              <Text style={styles.label}>Name</Text>
              <View style={[styles.input, {borderColor: Colors.pastel.red}]}>
                <TextInput
                  ref={nameInputRef}
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
              <View style={[styles.input, {borderColor: Colors.pastel.orange}]}>
                <TextInput
                  ref={quantityInputRef}
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
              <View style={[styles.input, {borderColor: Colors.pastel.green}]}>
                <TextInput
                  ref={priceInputRef}
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
              <View style={[styles.input, {borderColor: Colors.pastel.indigo}]}>
                <TextInput
                  ref={totalPriceInputRef}
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
            </View>
          </TouchableWithoutFeedback>
        </KeyboardAvoidingView>
      </Pressable>
    </Modal>
  );
};

export default EditItemModal;

const styles = StyleSheet.create({
  submitButtonOuter: {
    flex: 3,
    height: 50,
    borderWidth: 2,
    backgroundColor: Colors.pastel.green,
    borderRadius: 20,
    elevation: 5,
    overflow: "hidden",
    boxShadow: "no"
  },
  submitButtonInner: {
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  submitText: {
    fontSize: 20,
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
  modalContainer: { // Style for the KeyboardAvoidingView
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
