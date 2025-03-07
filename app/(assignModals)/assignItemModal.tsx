import {
  Pressable,
  SafeAreaView,
  StyleSheet,
  TouchableNativeFeedback,
  View,
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
    price: 0,
    totalPrice: 0,
    quantity: 0,
    assignedToId: [],
  });

  const [bill, setBill] = useState<Bill>({
    id: 0,
    name: "TempBill",
    date: new Date("2001-09-11"),
    items: [],
    complete: false,
    payers: [],
    serviceCharge: 0,
    userEnteredTotal: 420.69,
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

  const assignPayer = (payerId: number) => {
    if (item === undefined) {
      return;
    }
    if (item.assignedToId.includes(payerId)) {
      item.assignedToId = item.assignedToId.filter((id) => id !== payerId);
      setItem({ ...item });
    } else {
      item.assignedToId.push(payerId);
      setItem({ ...item });
    }
  };

  const calculatePricePerPayer = () => {
    if (item === undefined) {
      return 0;
    }
    return item.price / item.assignedToId.length;
  };

  const save = () => {
    bill.items.map((billItem) => {
      if (billItem.id === item?.id) {
        billItem.assignedToId = item?.assignedToId;
      }
    });
    setEditedBill(bill)
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
    <SafeAreaView
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
              £{item.price.toFixed(2)} {item.quantity > 1 ? "each" : ""}{" "}
            </ThemedText>
          </View>
          <View
            style={{
              gap: 10,
              paddingBottom: 10,
              paddingTop: 10,
            }}
          >
            {item.assignedToId.map((id, index) => {
              const payer = getPayerById(bill, id);
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
                  <Pressable hitSlop={10} onPress={() => assignPayer(id)}>
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
                <Pressable onPress={() => assignPayer(payer.id)}>
                  <PayerIcon payer={payer} size={50} checked={ item.assignedToId.includes(payer.id)} />
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
                    itemIndex === bill.items.length - 1 ? Colors.pastel.red : "black"
                  }
                />
              </View>
            </TouchableNativeFeedback>
          </View>
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
