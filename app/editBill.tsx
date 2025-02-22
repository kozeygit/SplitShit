import PayerIcon from "@/components/payer/PayerIcon";
import { ThemedText } from "@/components/ThemedText";
import { Colors } from "@/constants/Colors";
import { useGetData } from "@/hooks/useGetData";
import { Bill, BillItem, NewBillItem } from "@/models/bill";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  TouchableHighlight,
  TouchableNativeFeedback,
  View,
} from "react-native";
import BouncyCheckbox from "react-native-bouncy-checkbox";

const BillDisplay = () => {
  const [updated, setUpdated] = useState(false);
  const router = useRouter();

  const { id } = useLocalSearchParams<{ id: string }>();
  const { getBill } = useGetData();

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

  useFocusEffect(useCallback(() => {
    const fetchBill = async () => {
      if (id) {
        const billId = parseInt(id);
        const fetchedBill = await getBill(billId);
        if (fetchedBill === undefined) {
          throw Error("uh oh, stinky");
        }
        setBill(fetchedBill);
      }
    };

    fetchBill();
  }, [id, getBill]));


  const onSave = () => {
    console.log(bill);
    console.log("Submit");
  };
  const onCancel = () => {
    console.log("Cancelled");
    router.back();
  };

  const openItemModal = (item: BillItem | undefined) => {
    router.push({
      pathname: "/(miniModals)/editItemModal",
      params: { billId: bill.id, itemId: item?.id },
    });
  };

  if (!bill) {
    return (
      <SafeAreaView style={styles.container}>
        <ThemedText>Loading...</ThemedText>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      style={{
        flex: 1,
        backgroundColor: Colors.pastel.red,
        paddingHorizontal: 20,
      }}
    >
      <View style={styles.container}>
        <TouchableNativeFeedback onPress={() => {}}>
          <View style={styles.header}>
            <View style={{}}>
              <BouncyCheckbox
                isChecked={bill.complete}
                size={25}
                style={{
                  flexDirection: "row-reverse",
                  paddingBottom: 10,
                }}
                fillColor="green"
                text={bill.name}
                iconStyle={{ borderColor: Colors.pastel.red, borderWidth: 2 }}
                innerIconStyle={{
                  borderWidth: 0,
                  borderColor: Colors.pastel.red,
                }}
                textStyle={{
                  fontSize: 30,
                  fontWeight: "bold",
                  color: "black",
                  textAlign: "left",
                }}
                textContainerStyle={{ marginLeft: 0 }}
                onPress={(isChecked: boolean) => {
                  console.log(isChecked);
                  bill.complete = isChecked;
                  console.log(bill.complete);
                }}
              />
            </View>
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

        <View style={styles.payersContainer}>
          {bill.payers.length > 0 ? (
            <ScrollView
              horizontal={true}
              fadingEdgeLength={100}
              contentContainerStyle={styles.payersScrollView}
            >
              {bill.payers.map((payer) => (
                <PayerIcon key={payer.id} payer={payer} />
              ))}
            </ScrollView>
          ) : (
            <ThemedText type="grital">No one paying? haha poor.</ThemedText>
          )}
          <TouchableHighlight
            underlayColor={"lightgrey"}
            style={
              bill.payers.length > 0
                ? styles.addPayerStyle
                : styles.addPayerStyleEmpty
            }
            onPress={() => console.log("HI")}
          >
            <MaterialIcons name="add" size={20} />
          </TouchableHighlight>
        </View>

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
            <ThemedText type="subtitle">Total:</ThemedText>
            <ThemedText type="subtitle">
              {"£ " + bill.userEnteredTotal.toFixed(2)}
            </ThemedText>
          </View>
        </View>
      </View>
      {/* Submit Button */}
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
  container: {
    flex: 1,
    marginTop: 80,
    padding: 30,
    backgroundColor: "white",
    borderWidth: 2,
    borderRadius: 20,
    elevation: 5,
  },
  billDataContainer: {
    borderTopWidth: 1,
    marginTop: 10,
    paddingTop: 20,
    gap: 5,
  },
  header: {
    paddingBottom: 20,
    borderBottomWidth: 1,
    marginBottom: 10,
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
    paddingBottom: 10,
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
});
