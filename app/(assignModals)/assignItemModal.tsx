import {
  Pressable,
  View,
  StyleSheet,
  TouchableNativeFeedback,
} from "react-native";
import React, { useEffect, useState, useCallback } from "react";
import { ThemedText } from "@/components/ThemedText";
import { Colors } from "@/constants/Colors";
import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import { Bill, BillItem, Payer } from "@/models/bill";
import { useBillStore } from "@/utils/billStore";
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

  const [bill, setBill] = useState<Bill>({
    id: 0,
    name: "TempBill",
    date: new Date("2001-09-11"),
    items: [],
    complete: false,
    payers: [],
    serviceCharge: Price.fromCents(0),
    userEnteredTotal: Price.fromCents(42069),
  });

  useFocusEffect(
    useCallback(() => {
      if (editedBill) {
        setBill(editedBill);
      }
    }, [editedBill])
  );

  useEffect(() => {
    if (itemId === undefined) {
      return;
    }

    const fetchItem = async () => {
      const oldItem = bill.items.find((item) => item.id == parseInt(itemId));
      if (oldItem === undefined) {
        throw Error("Uh Oh Stinky");
      }
      setItem(oldItem);
    };

    fetchItem();
  }, [itemId, bill]);

  useEffect(() => {
    const currentIndex = bill.items.findIndex(
      (billItem) => billItem.id === item?.id
    );
    if (currentIndex === undefined) {
      console.log("Item index not found in bill");
      return;
    }
    setItemIndex(currentIndex);
  }, [item, bill]);

  const toggleAssignPayer = (payerId: number) => {
    if (item === undefined) {
      return;
    }
    if (item.assignedTo.some((ass) => ass.payerId === payerId)) {
      item.assignedTo = item.assignedTo.filter(
        (ass) => ass.payerId !== payerId
      );
      setItem({ ...item });
    } else {
      item.assignedTo.push({ payerId: payerId, quantity: 1 });
      setItem({ ...item });
    }
  };

  const increaseAssignQuantity = (payerId: number) => {
    if (item === undefined) {
      return;
    }
    
    const assignedTo = item.assignedTo.find((ass) => ass.payerId === payerId);
    
    if (assignedTo === undefined) {
      return;
    }

    if (assignedTo.quantity == item.quantity) {
      return
    }

    // now check if the total quanity for assigned people has enough remoaining for an increase :)

    setItem({ ...item });
  };

  const decreaseAssignQuantity = (payerId: number) => {};

  const save = () => {
    bill.items.map((billItem) => {
      if (billItem.id === item?.id) {
        billItem.assignedTo = item?.assignedTo;
      }
    });
    setEditedBill(bill);
  };

  const handleNext = () => {
    save();
    if (itemIndex === undefined) {
      return;
    }
    if (itemIndex + 1 >= bill.items.length) {
      return;
    }

    router.replace({
      pathname: "/assignItemModal",
      params: { itemId: bill.items[itemIndex + 1].id },
    });
    return;
  };

  const handlePrevious = () => {
    save();
    if (itemIndex === undefined) {
      return;
    }
    if (itemIndex <= 0) {
      return;
    }

    router.replace({
      pathname: "/assignItemModal",
      params: { itemId: bill.items[itemIndex - 1].id },
    });
    return;
  };

  const handleBack = () => {
    save();
    router.back();
  };

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
              const payer = getPayerById(bill, ass.payerId);
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
                      {payer.name} - {payer.partySize}
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
          {bill.payers.map((payer, index) => {
            return (
              <View key={index}>
                <Pressable onPress={() => toggleAssignPayer(payer.id)}>
                  <PayerIcon
                    payer={payer}
                    size={50}
                    checked={item.assignedTo.some(
                      (obj) => obj.payerId === payer.id
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
          <TouchableNativeFeedback onPress={handleBack}>
            <View style={styles.cancelButtonInner}>
              <ThemedText type="defaultSemiBold" style={styles.cancelText}>
                Back
              </ThemedText>
            </View>
          </TouchableNativeFeedback>
        </View>

        <View style={{ flex: 1, flexDirection: "row", gap: 10 }}>
          <View style={styles.submitButtonOuter}>
            <TouchableNativeFeedback onPress={handlePrevious}>
              <View style={styles.submitButtonInner}>
                <MaterialIcons
                  name="arrow-back"
                  size={30}
                  color={itemIndex === 0 ? Colors.pastel.red : "black"}
                />
              </View>
            </TouchableNativeFeedback>
          </View>

          <View style={styles.submitButtonOuter}>
            <TouchableNativeFeedback onPress={handleNext}>
              <View style={styles.submitButtonInner}>
                <MaterialIcons
                  name="arrow-forward"
                  size={30}
                  color={
                    itemIndex === bill.items.length - 1
                      ? Colors.pastel.red
                      : "black"
                  }
                />
              </View>
            </TouchableNativeFeedback>
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
