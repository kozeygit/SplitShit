import PayerIcon from "@/components/payer/PayerIcon";
import { ThemedText } from "@/components/ThemedText";
import ContainerView from "@/components/ui/ContainerView";
import { Colors } from "@/constants/Colors";
import { useGetData } from "@/hooks/useGetData";
import { Bill, BillItem, NewBillItem } from "@/models/bill";
import { useBillStore } from "@/utils/billStore";
import { setBillComplete, updateBill } from "@/utils/updateData";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import { isEqual } from "lodash";
import React, { useCallback, useEffect, useState } from "react";
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  TouchableHighlight,
  TouchableNativeFeedback,
  View,
  Text,
  Pressable,
} from "react-native";
import BouncyCheckbox from "react-native-bouncy-checkbox";

const BillDisplay = () => {
  const router = useRouter();
  const {
    originalBill,
    setOriginalBill,
    editedBill,
    setEditedBill,
    resetEditedBill,
  } = useBillStore();

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

  const onSave = () => {
    if (isEqual(originalBill, editedBill)) {
      console.log("No changes made");
      router.back();
      return;
    }
    console.log("Changed");

    if (editedBill) {
      updateBill(editedBill);
      router.back();
    }
  };
  const onCancel = () => {
    resetEditedBill();
    console.log("Cancelled");
    router.back();
  };

  const openItemModal = (item: BillItem | undefined) => {
    router.push({
      pathname: "/(billModals)/editItemModal",
      params: { itemId: item?.id },
    });
  };

  const openBillDetailsModal = () => {
    router.push({
      pathname: "/(billModals)/editBillDetailsModal",
      params: { billId: bill.id },
    });
  };
  
  const openPayerModal = () => {
    router.push({
      pathname: "/(billModals)/editPayerModal",
      params: { billId: bill.id },
    });
  };

  const itemsTotal = bill.items.reduce(
    (acc: number, item: BillItem) => acc + item.totalPrice,
    0
  );

  return (
    <SafeAreaView
      style={{
        flex: 1,
        backgroundColor: Colors.pastel.red,
        paddingHorizontal: 20,
      }}
    >
      <ContainerView>
        <TouchableNativeFeedback onPress={openBillDetailsModal}>
          <View style={styles.header}>
            <ThemedText type="title">{bill.name}</ThemedText>
            <View>
              <ThemedText type="default">
                {bill.date.toLocaleDateString()}
                {"  -  "}
                {bill.payers.reduce(
                  (acc: number, val) => acc + (val.partySize ?? 1),
                  0
                )}{" "}
                People
              </ThemedText>
            </View>
          </View>
        </TouchableNativeFeedback>

        <TouchableNativeFeedback onPress={openPayerModal}>
          <View style={styles.payersContainer}>
            {bill.payers.length > 0 ? (
              <ScrollView
                horizontal={true}
                fadingEdgeLength={100}
                contentContainerStyle={styles.payersScrollView}
              >
                {bill.payers.slice(0, 7).map((payer, index) => (
                  <PayerIcon key={index} payer={payer} />
                ))}
              </ScrollView>
            ) : (
              <View style={styles.addPayerStyleEmpty}>
                <ThemedText type="default">Add Payers</ThemedText>
                <MaterialIcons name="person-add-alt-1" size={20} />
              </View>
            )}
          </View>
        </TouchableNativeFeedback>

        {/* Example for items: */}
        <View style={{ flex: 1 }}>
          <ScrollView
            fadingEdgeLength={20}
            style={styles.itemsContainer}
            contentContainerStyle={{ paddingHorizontal: 10 }}
          >
            {bill.items.map((item) => (
              <TouchableNativeFeedback
                onPress={() => openItemModal(item)}
                key={item.id}
              >
                <View key={item.id} style={styles.infoRow}>
                  {item.price == item.totalPrice ? (
                    <ThemedText>
                      {item.quantity} {item.name}
                    </ThemedText>
                  ) : (
                    <ThemedText>
                      {item.quantity} {item.name} ({item.price.toFixed(2)})
                    </ThemedText>
                  )}
                  <View style={styles.itemPriceSeparator}></View>
                  <ThemedText>{item.totalPrice.toFixed(2)}</ThemedText>
                </View>
              </TouchableNativeFeedback>
            ))}
          </ScrollView>
          <View style={styles.newItemOuter}>
            <TouchableNativeFeedback onPress={() => openItemModal(undefined)}>
              <View style={styles.newItemInner}>
                <ThemedText type="defaultSemiBold">Add Item</ThemedText>
              </View>
            </TouchableNativeFeedback>
          </View>
        </View>

        <View style={styles.billDataContainer}>
          <View style={styles.infoRow}>
            <ThemedText>
              Service Charge: (
              {(
                (bill.serviceCharge /
                  (bill.userEnteredTotal - bill.serviceCharge)) *
                100
              ).toPrecision(3)}
              %)
            </ThemedText>
            <ThemedText>{"£" + bill.serviceCharge.toFixed(2)}</ThemedText>
            {/* Handle optional service charge */}
          </View>
          <View style={styles.infoRow}>
            <ThemedText type="subtitle" style={{ flex: 1 }}>
              Total:
            </ThemedText>
            {bill.userEnteredTotal == itemsTotal + bill.serviceCharge ? (
              <>
                <ThemedText type="subtitle">
                  {"£ " + bill.userEnteredTotal.toFixed(2)}
                </ThemedText>
              </>
            ) : (
              <>
                <ThemedText
                  type="default"
                  style={{ color: "red", fontSize: 18 }}
                >
                  (
                  {itemsTotal + bill.serviceCharge > bill.userEnteredTotal
                    ? "+"
                    : ""}
                  {(
                    itemsTotal +
                    bill.serviceCharge -
                    bill.userEnteredTotal
                  ).toFixed(2)}
                  )
                </ThemedText>
                <Text> </Text>
                <ThemedText type="subtitle">
                  {"£ " + bill.userEnteredTotal.toFixed(2)}
                </ThemedText>
              </>
            )}
          </View>
        </View>
      </ContainerView>
      <View style={styles.buttonContainer}>
        <View style={styles.cancelButtonOuter}>
          <TouchableNativeFeedback onPress={onCancel}>
            <View style={styles.cancelButtonInner}>
              <ThemedText type="defaultSemiBold" style={styles.cancelText}>
                Cancel
              </ThemedText>
            </View>
          </TouchableNativeFeedback>
        </View>
        <View style={styles.submitButtonOuter}>
          <TouchableNativeFeedback onPress={onSave}>
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

export default BillDisplay;

const styles = StyleSheet.create({
  newItemOuter: {
    overflow: "hidden",
    borderColor: "grey",
    borderWidth: 1,
    borderRadius: 20,
    marginVertical: 10,
    elevation: 2,
  },
  newItemInner: {
    backgroundColor: "white",
    alignItems: "center",
    padding: 5,
  },
  billDataContainer: {
    borderTopWidth: 1,
    marginTop: 10,
    paddingTop: 20,
    gap: 5,
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
    paddingVertical: 10,
    gap: 3,
  },
  buttonContainer: {
    marginVertical: 30,
    flexDirection: "row",
    gap: 10,
  },
  addPayerStyleEmpty: {
    flexDirection: "row",
    gap: 10,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "white",
    marginVertical: 10,
  },
  addPayerStyle: {
    position: "absolute",
    borderWidth: 2,
    borderRadius: "100%",
    width: 40,
    aspectRatio: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "white",
    elevation: 5,
    right: 0,
    top: 0,
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
    color: "white",
    fontSize: 20,
  },
});
