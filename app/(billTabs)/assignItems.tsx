import PayerIcon from "@/components/payer/PayerIcon";
import { ThemedText } from "@/components/ThemedText";
import { Colors } from "@/constants/Colors";
import { useGetData } from "@/hooks/useGetData";
import { Bill, BillItem, NewBillItem } from "@/models/bill";
import { useBillStore } from "@/utils/billStore";
import {getPayerById} from "@/utils/billUtils";
import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
  SafeAreaView,
  StyleSheet,
  TouchableNativeFeedback,
  View,
  FlatList,
} from "react-native";

const AssignItemsDisplay = () => {
  const router = useRouter();
  const {
    editedBill,
    setEditedBill,
  } = useBillStore();

  const [bill, setBill] = useState<Bill>({
    id: 0,
    name: "TempBill",
    date: new Date("2001-11-09"),
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

  const onSave = () => {
    console.log(JSON.stringify(bill, null, 1));
    console.log("Submit");
    router.back();
  };
  const onCancel = () => {
    console.log("Cancelled");
    router.back();
  };

  const openAssignModal = (item: BillItem | undefined) => {
    if (item)
    router.push({
      pathname: "/assignItemModal",
      params: { itemId: item?.id },
    });
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
        <TouchableNativeFeedback onPress={() => {}}>
          <View style={styles.header}>
            <ThemedText type="title">{bill.name}</ThemedText>
          </View>
        </TouchableNativeFeedback>

        <View style={{ flex: 1 }}>
          <FlatList
            ListEmptyComponent={
              <View style={styles.noItems}>
                <ThemedText>So no items?</ThemedText>
                <ThemedText type="grital">*breaks skateboard*</ThemedText>
                <ThemedText>Go back to the bill and add some!</ThemedText>
              </View>
            }
            fadingEdgeLength={100}
            style={styles.itemsContainer}
            contentContainerStyle={{ paddingHorizontal: 10 }}
            data={bill.items}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => (
              <TouchableNativeFeedback onPress={() => openAssignModal(item)}>
                <View style={{ borderBottomWidth: 1, paddingVertical: 5 }}>
                  <View style={styles.infoRow}>
                    {item.assignedToId.length < 1 ? (
                      <ThemedText>
                        {item.quantity} {item.name}
                      </ThemedText>
                    ) : (
                      <ThemedText>
                        {item.quantity} {item.name} (
                        {(item.totalPrice / item.assignedToId.length).toFixed(
                          2
                        )}{" "}
                        per payer)
                      </ThemedText>
                    )}
                    <View style={styles.itemPriceSeparator}></View>
                    <ThemedText>{item.totalPrice.toFixed(2)}</ThemedText>
                  </View>
                  <View
                    style={{
                      paddingBottom: 10,
                      gap: 5,
                      paddingTop: 10,
                      flexDirection: "row",
                      overflow: "hidden",
                    }}
                  >
                    {item.assignedToId.map((id, index) => {
                      const payer = getPayerById(bill, id);
                      if (payer === undefined) {
                        return;
                      }
                      return <PayerIcon key={index} payer={payer} />;
                    })}
                  </View>
                </View>
              </TouchableNativeFeedback>
            )}
          />
        </View>
      </View>
    </SafeAreaView>
  );
};

export default AssignItemsDisplay;

const styles = StyleSheet.create({
  noItems: {
    paddingTop: 50,
    flex: 1,
    gap: 10,
  },
  container: {
    flex: 1,
    marginTop: 80,
    marginBottom: 30,
    padding: 30,
    backgroundColor: "white",
    borderWidth: 2,
    borderRadius: 20,
    elevation: 5,
  },

  header: {
    paddingBottom: 20,
    paddingTop: 10,
    gap: 10,
    borderBottomWidth: 1,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  itemsContainer: {
    marginTop: 10,
    gap: 5,
  },
  itemPriceSeparator: {
    borderBottomWidth: 1,
    flex: 1,
    height: "50%",
    borderStyle: "dotted",
    marginHorizontal: 5,
    borderColor: "grey",
  },
  payersContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-evenly",
    borderBottomWidth: 1,
    borderColor: "lightgrey",
  },
  payersScrollView: {
    paddingRight: 50,
    gap: 3,
  },
  buttonContainer: {
    marginVertical: 30,
    flexDirection: "row",
    gap: 10,
  },
  addPayerStyleEmpty: {
    borderWidth: 2,
    borderRadius: "100%",
    width: 35,
    aspectRatio: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "white",
    elevation: 5,
  },
  addPayerStyle: {
    position: "absolute",
    borderWidth: 2,
    borderRadius: "100%",
    width: 45,
    aspectRatio: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "white",
    elevation: 5,
    right: 0,
    top: 0,
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
    backgroundColor: Colors.pastel.yellow,
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
