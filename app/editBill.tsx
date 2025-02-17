import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  View,
  Text,
  TouchableNativeFeedback,
  Switch,
  Pressable,
  TouchableOpacity,
  TouchableHighlight,
} from "react-native";
import React, { useEffect, useState } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useGetData } from "@/hooks/useGetData";
import { Colors } from "@/constants/Colors";
import { ThemedText } from "@/components/ThemedText";
import { Bill, Payer } from "@/models/bill";
import BouncyCheckbox from "react-native-bouncy-checkbox";
import PayerIcon from "@/components/payer/PayerIcon";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";

const BillDisplay = () => {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { getBill } = useGetData();
  const [bill, setBill] = useState<Bill | undefined>(undefined); // State for the bill

  useEffect(() => {
    const fetchBill = async () => {
      if (id) {
        const billId = parseInt(id);
        const fetchedBill = await getBill(billId);

        setBill(fetchedBill);
      }
    };

    fetchBill();
  }, [id, getBill]);

  const onSave = () => {
    // updateBill(bill);
    console.log("Submit");
  };
  const onCancel = () => {
    console.log("Cancelled");
    router.back();
  };

  if (!bill) {
    return (
      <SafeAreaView style={styles.container}>
        <ThemedText>Loading...</ThemedText>
        {/* Or a loading indicator */}
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
        <Pressable onLongPress={() => console.log("Holding :)")}>
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
                  fontSize: 20,
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
        </Pressable>

        <View style={styles.payersContainer}>
          <ScrollView horizontal={true} fadingEdgeLength={2} contentContainerStyle={styles.payersScrollView}>
            {bill.payers.map((payer) => (
              <PayerIcon key={payer.id} payer={payer} />
            ))}
          </ScrollView>
          <TouchableOpacity
            style={styles.addPayerStyle}
            onPress={() => console.log("HI")}
          >
            <MaterialIcons name="add" size={20} />
          </TouchableOpacity>
        </View>

        {/* Example for items: */}
        <View style={styles.itemsContainer}>
          {bill.items.map((item) => (
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
              <ThemedText>{item.totalPrice.toFixed(2)}</ThemedText>
            </View>
          ))}
        </View>

        <View style={styles.billDataContainer}>
          <View style={styles.infoRow}>
            <ThemedText>
              Service Charge: (
              {((bill.serviceCharge / bill.userEnteredTotal) * 100).toPrecision(
                3
              )}
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
  container: {
    marginTop: 40,
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
    marginVertical: 10,
    gap: 5,
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
    paddingRight: 5,
    gap: 5
  },
  buttonContainer: {
    marginVertical: 30,
    flexDirection: "row",
    gap: 10,
  },
  addPayerStyle: {
    marginLeft: 5,
    borderWidth: 1,
    borderRadius: "100%",
    padding: 10,
    width: 45,
    aspectRatio: 1,
    justifyContent: "center",
    alignItems: "center",
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
