import PayerIcon from "@/components/payer/PayerIcon";
import { ThemedText } from "@/components/ThemedText";
import { Colors } from "@/constants/Colors";
import { useGetData } from "@/hooks/useGetData";
import { Bill, BillItem, NewBillItem, Payer } from "@/models/bill";
import { useBillStore } from "@/utils/billStore";
import { getPayerById } from "@/utils/billUtils";
import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import { set } from "lodash";
import React, { useCallback, useEffect, useState } from "react";
import {
  SafeAreaView,
  StyleSheet,
  TouchableNativeFeedback,
  View,
  FlatList,
  Pressable,
} from "react-native";

const BillBreakdownDisplay = () => {
  const { editedBill, setEditedBill } = useBillStore();

  const [servicePerPerson, setServicePerPerson] = useState(0);
  const [showPriceBreakdown, setShowPriceBreakdown] = useState<boolean>(false);
  const [totalOwed, setTotalOwed] = useState<number>(0);

  const [payers, setPayers] = useState<Payer[]>([]);
  const [payerItems, setPayerItems] = useState<Map<Payer, BillItem[]>>(
    new Map()
  );

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
        setPayers(editedBill.payers);
        for (const payer of editedBill.payers) {
          payerItems.set(payer, []);
          for (const item of editedBill.items) {
            if (item.assignedToId.includes(payer.id)) {
              const oldItems = payerItems.get(payer);
              payerItems.set(payer, oldItems ? [...oldItems, item] : [item]);
            }
          }
        }
        setPayerItems(payerItems);
      }
    }, [editedBill])
  );

  useEffect(() => {
    const numberOfPeople = bill.payers.reduce(
      (acc, val) => acc + (val.partySize ?? 1),
      0
    );
    const service = bill.serviceCharge / numberOfPeople;
    setServicePerPerson(service);
  }, [bill]);

  useEffect(() => {
    let total = 0;
    for (const payer of payers) {
      payer.amountToPay = 0;
      payer.amountToPay += servicePerPerson * (payer.partySize ?? 1);

      for (const item of payerItems.get(payer) ?? []) {
        payer.amountToPay += item.totalPrice / item.assignedToId.length;
        console.log(item.name, item.assignedToId);
      }

      total += payer.amountToPay;
    }

    setTotalOwed(total);
  }, [payers, payerItems, servicePerPerson]);

  return (
    <SafeAreaView
      style={{
        flex: 1,
        backgroundColor: Colors.pastel.turquoise,
        paddingHorizontal: 20,
      }}
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <ThemedText type="title">{bill.name}</ThemedText>
        </View>

        <View style={{ flex: 1 }}>
          <FlatList
            ListEmptyComponent={
              <View style={styles.noPayers}>
                <ThemedText>Nobodys paying for anything here</ThemedText>
                <ThemedText type="grital">dine and dash huh?</ThemedText>
              </View>
            }
            fadingEdgeLength={100}
            style={styles.itemsContainer}
            contentContainerStyle={{ paddingHorizontal: 10 }}
            data={bill.payers}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => (
              <View style={styles.payersContainer}>
                <View
                  style={{
                    paddingBottom: 10,
                    paddingTop: 10,
                    flexDirection: "row",
                    overflow: "hidden",
                    justifyContent: "space-between",
                    alignItems: "center",
                    paddingRight: 5,
                  }}
                >
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      gap: 10,
                    }}
                  >
                    <PayerIcon payer={item} />
                    <ThemedText type="defaultSemiBold">{item.name}</ThemedText>
                  </View>
                  <ThemedText type="defaultSemiBold">
                    £ {item.amountToPay ? item.amountToPay.toFixed(2) : "0.00"}
                  </ThemedText>
                </View>
                {showPriceBreakdown && (
                  <View style={styles.itemsList}>
                    {payerItems.get(item)?.map((billItem, index) => (
                      <View style={styles.infoRow} key={index}>
                        <ThemedText type="default">
                          {(
                            billItem.quantity / billItem.assignedToId.length
                          ).toLocaleString()}{" "}
                          x {billItem.name}
                        </ThemedText>
                        <ThemedText>
                          £{" "}
                          {(
                            billItem.totalPrice / billItem.assignedToId.length
                          ).toFixed(2)}
                        </ThemedText>
                      </View>
                    ))}
                    <View style={styles.infoRow}>
                      <ThemedText type="default">
                        {item.partySize} x Service Charge
                      </ThemedText>
                      <ThemedText>
                        £{" "}
                        {(servicePerPerson * (item.partySize ?? 1)).toFixed(2)}
                      </ThemedText>
                    </View>
                  </View>
                )}
              </View>
            )}
          />
        </View>
        <Pressable
          onPress={() => {
            setShowPriceBreakdown(!showPriceBreakdown);
          }}
        >
          <View style={styles.footer}>
            <ThemedText type="subtitle">
              {totalOwed.toFixed(2)} / {bill.userEnteredTotal.toFixed(2)}
            </ThemedText>
          </View>
        </Pressable>
      </View>
    </SafeAreaView>
  );
};

export default BillBreakdownDisplay;

const styles = StyleSheet.create({
  noPayers: {
    paddingTop: 50,
    flex: 1,
    gap: 10,
  },
  itemsList: {
    paddingHorizontal: 5,
    paddingBottom: 10,
  },
  payersContainer: {
    borderBottomWidth: 1,
    borderColor: "lightgrey",
    paddingVertical: 5,
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
    borderBottomWidth: 1,
  },
  footer: {
    paddingBottom: 10,
    paddingTop: 20,
    alignItems: "center",
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  itemsContainer: {
    gap: 5,
  },
});
