import { Pressable, View, StyleSheet } from "react-native";
import Touchable from "@/components/ui/Touchable";
import React, { useState, useCallback } from "react";
import { ThemedText } from "@/components/ThemedText";
import { Colors } from "@/constants/Colors";
import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import { Bill, BillItem } from "@/models/bill";
import { useBillStore } from "@/hooks/useBillStore";
import { getPayerById } from "@/utils/billUtils";
import PayerIcon from "@/components/payer/PayerIcon";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { Price } from "@/utils/priceUtils";

const EditItemModal = () => {
  const router = useRouter();

  const { itemId } = useLocalSearchParams<{
    itemId?: string;
  }>();

  const { editedBill, setEditedBill } = useBillStore();
  const [itemIndex, setItemIndex] = useState<number | undefined>(undefined);
  const [item, setItem] = useState<BillItem>({
    id: 0,
    name: "",
    price: Price.fromCents(0),
    totalPrice: Price.fromCents(0),
    quantity: 0,
    assignedTo: [],
  });

  useFocusEffect(
    useCallback(() => {
      if (!editedBill || !itemId) return;

      const currentItem = editedBill.items.find(
        (i) => i.id === parseInt(itemId),
      );
      const currentIndex = editedBill.items.findIndex(
        (i) => i.id === parseInt(itemId),
      );

      if (currentItem) {
        setItem(currentItem);
      }
      if (currentIndex !== -1) {
        setItemIndex(currentIndex);
      }
    }, [editedBill, itemId]),
  );

  const toggleAssignPayer = (payerId: number) => {
    if (!item) return;

    const isAlreadyAssigned = item.assignedTo.some(
      (ass) => ass.payerId === payerId,
    );

    const newAssignedTo = isAlreadyAssigned
      ? item.assignedTo.filter((ass) => ass.payerId !== payerId)
      : [...item.assignedTo, { payerId: payerId, quantity: 1 }];

    setItem({
      ...item,
      assignedTo: newAssignedTo,
    });
  };

  const saveCurrentState = (targetBill: Bill) => {
    if (!item) return targetBill;

    const updatedItems = targetBill.items.map((billItem) =>
      billItem.id === item.id
        ? { ...billItem, assignedTo: item.assignedTo }
        : billItem,
    );

    const updatedBill = { ...targetBill, items: updatedItems };
    setEditedBill(updatedBill);
    return updatedBill;
  };

  const handleNext = () => {
    if (
      !editedBill ||
      itemIndex === undefined ||
      itemIndex + 1 >= editedBill.items.length
    )
      return;

    const updatedBill = saveCurrentState(editedBill);
    router.replace({
      pathname: "/assignItemModal",
      params: { itemId: updatedBill.items[itemIndex + 1].id },
    });
  };

  const handlePrevious = () => {
    if (!editedBill || itemIndex === undefined || itemIndex <= 0) return;

    const updatedBill = saveCurrentState(editedBill);
    router.replace({
      pathname: "/assignItemModal",
      params: { itemId: updatedBill.items[itemIndex - 1].id },
    });
  };

  const handleBack = () => {
    if (editedBill) {
      saveCurrentState(editedBill);
    }
    router.back();
  };

  if (!editedBill || !item) return null;

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: Colors.pastel.orange,
        paddingHorizontal: 20,
      }}
    >
      <View style={styles.container}>
        <View>
          <View style={styles.title}>
            <ThemedText type="subtitle">
              {" "}
              {item.quantity}x {item.name}{" "}
            </ThemedText>
            <ThemedText type="subtitle">
              {" "}
              £{item.price.toDisplay()} {item.quantity > 1 ? "each" : ""}{" "}
            </ThemedText>
          </View>
          <View
            style={{
              gap: 10,
              paddingBottom: 10,
              paddingTop: 10,
            }}
          >
            {item.assignedTo.map((ass, index) => {
              const payer = getPayerById(editedBill, ass.payerId);
              if (payer === undefined) {
                return;
              }
              return (
                <View style={styles.payerRow} key={index}>
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      gap: 10,
                    }}
                  >
                    <PayerIcon payer={payer} />
                    <ThemedText style={{ fontSize: 18 }}>
                      {payer.name}
                    </ThemedText>
                  </View>
                  <Pressable
                    hitSlop={10}
                    onPress={() => toggleAssignPayer(ass.payerId)}
                  >
                    <MaterialIcons
                      name="delete-outline"
                      size={20}
                      color="red"
                    />
                  </Pressable>
                </View>
              );
            })}
          </View>
        </View>
        <View style={styles.assignPayersContainer}>
          {editedBill.payers.map((payer, index) => {
            return (
              <View key={index}>
                <Pressable onPress={() => toggleAssignPayer(payer.id)}>
                  <PayerIcon
                    payer={payer}
                    size={50}
                    checked={item.assignedTo.some(
                      (obj) => obj.payerId === payer.id,
                    )}
                  />
                </Pressable>
              </View>
            );
          })}
        </View>
      </View>
      <View style={styles.buttonContainer}>
        <View style={styles.cancelButtonOuter}>
          <Touchable onPress={handleBack}>
            <View style={styles.cancelButtonInner}>
              <ThemedText type="defaultSemiBold" style={styles.cancelText}>
                Back
              </ThemedText>
            </View>
          </Touchable>
        </View>

        <View style={{ flex: 1, flexDirection: "row", gap: 10 }}>
          <View style={styles.submitButtonOuter}>
            <Touchable onPress={handlePrevious}>
              <View style={styles.submitButtonInner}>
                <MaterialIcons
                  name="arrow-back"
                  size={30}
                  color={itemIndex === 0 ? Colors.pastel.red : "black"}
                />
              </View>
            </Touchable>
          </View>

          <View style={styles.submitButtonOuter}>
            <Touchable onPress={handleNext}>
              <View style={styles.submitButtonInner}>
                <MaterialIcons
                  name="arrow-forward"
                  size={30}
                  color={
                    itemIndex === editedBill.items.length - 1
                      ? Colors.pastel.red
                      : "black"
                  }
                />
              </View>
            </Touchable>
          </View>
        </View>
      </View>
    </View>
  );
};

export default EditItemModal;

const styles = StyleSheet.create({
  buttonContainer: {
    marginVertical: 30,
    flexDirection: "row",
    gap: 10,
  },
  assignPayersContainer: {
    paddingTop: 20,
    borderTopWidth: 2,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 14,
  },
  payerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 10,
  },
  container: {
    justifyContent: "space-between",
    marginTop: 80,
    padding: 30,
    paddingBottom: 40,
    backgroundColor: "white",
    borderWidth: 2,
    borderRadius: 20,
    elevation: 5,
    flex: 1,
  },
  title: {
    flexDirection: "row",
    paddingTop: 10,
    paddingBottom: 20,
    borderBottomWidth: 1,
    marginBottom: 10,
    justifyContent: "space-between",
  },

  submitButtonOuter: {
    flex: 1,
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
    backgroundColor: "white",
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
  },
});
