import { Pressable, View, StyleSheet } from "react-native";
import Touchable from "@/components/ui/Touchable";
import React, { useState, useCallback, useEffect } from "react";
import { ThemedText } from "@/components/ThemedText";
import { Colors } from "@/constants/Colors";
import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import { AssignItem, Bill, BillItem } from "@/models/bill";
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

  useEffect(() => {
    if (!editedBill || !itemId) return;
    const id = parseInt(itemId);
    const currentIndex = editedBill.items.findIndex((i) => i.id === id);
    if (currentIndex !== -1) {
      setItem(editedBill.items[currentIndex]);
      setItemIndex(currentIndex);
    }
  }, [itemId]);

  const toggleAssignPayer = (payerId: number) => {
    const ass = item.assignedTo.find((ass) => ass.payerId === payerId);
    if (ass) {
      const newAssignedTo = item.assignedTo.filter(
        (ass) => ass.payerId !== payerId,
      );
      setItem({
        ...item,
        assignedTo: newAssignedTo,
      });
      return;
    }

    setItem({
      ...item,
      assignedTo: [...item.assignedTo, { payerId: payerId, quantity: 1 }],
    });
  };

  const increasePayerQuantity = (payerId: number) => {
    if (!item) return;

    const ass = item.assignedTo.find((ass) => ass.payerId === payerId);
    if (!ass) {
      setItem({
        ...item,
        assignedTo: [...item.assignedTo, { payerId: payerId, quantity: 1 }],
      });
      return;
    }

    const newAssignedTo = item.assignedTo.map((ass) =>
      ass.payerId === payerId ? { ...ass, quantity: ass.quantity + 1 } : ass,
    );

    setItem({
      ...item,
      assignedTo: newAssignedTo,
    });
  };

  const decreasePayerQuantity = (payerId: number) => {
    if (!item) return;

    const ass = item.assignedTo.find((ass) => ass.payerId === payerId);
    if (!ass) return;

    let newAssignedTo: AssignItem[] = [];
    if (ass.quantity === 1) {
      newAssignedTo = item.assignedTo.filter((ass) => ass.payerId !== payerId);
    } else {
      newAssignedTo = item.assignedTo.map((ass) =>
        ass.payerId === payerId ? { ...ass, quantity: ass.quantity - 1 } : ass,
      );
    }

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
      itemIndex === undefined ||
      !editedBill ||
      itemIndex + 1 >= editedBill.items.length
    )
      return;
    const updatedBill = saveCurrentState(editedBill);
    const nextIndex = itemIndex + 1;
    setItem(updatedBill.items[nextIndex]);
    setItemIndex(nextIndex);
  };

  const handlePrevious = () => {
    if (itemIndex === undefined || !editedBill || itemIndex <= 0) return;
    const updatedBill = saveCurrentState(editedBill);
    const prevIndex = itemIndex - 1;
    setItem(updatedBill.items[prevIndex]);
    setItemIndex(prevIndex);
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
        <View style={{ flex: 1 }}>
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
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      gap: 15,
                    }}
                  >
                    <Touchable
                      hitSlop={10}
                      onPress={() => decreasePayerQuantity(ass.payerId)}
                    >
                      <MaterialIcons name="remove" size={20} />
                    </Touchable>
                    <ThemedText style={{ fontSize: 18 }}>
                      {ass.quantity}
                    </ThemedText>
                    <Touchable
                      hitSlop={10}
                      onPress={() => increasePayerQuantity(ass.payerId)}
                    >
                      <MaterialIcons name="add" size={20} />
                    </Touchable>
                  </View>
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
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-evenly",
          alignItems: "center",
          paddingInline: 20,
          marginTop: 30,
        }}
      >
        {editedBill.items.map((i, index) => {
          return (
            <View key={index}>
              {index === itemIndex ? (
                <MaterialIcons name="circle" size={12} color={"black"} />
              ) : (
                <MaterialIcons name="circle" size={7} color={"black"} />
              )}
            </View>
          );
        })}
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
    marginTop: 80,
    padding: 30,
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
