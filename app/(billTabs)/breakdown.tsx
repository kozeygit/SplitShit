import PayerIcon from "@/components/payer/PayerIcon";
import { ThemedText } from "@/components/ThemedText";
import InfoRow from "@/components/ui/InfoRow";
import { Colors } from "@/constants/Colors";
import { Bill, BillItem, NewBillItem, Payer } from "@/models/bill";
import { useBillStore } from "@/hooks/useBillStore";
import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import { Price } from "@/utils/priceUtils";
import { StyleSheet, View, FlatList, Pressable } from "react-native";
import { Rate } from "@/utils/rateUtils";

const BillBreakdownDisplay = () => {
  const { editedBill } = useBillStore();

  const [showPriceBreakdown, setShowPriceBreakdown] = useState<boolean>(false);
  const [totalOwed, setTotalOwed] = useState<Price>(Price.fromCents(0));

  const [payers, setPayers] = useState<Payer[]>([]);
  const [payerItems, setPayerItems] = useState<Map<Payer, BillItem[]>>(
    new Map<Payer, BillItem[]>(),
  );

  const [bill, setBill] = useState<Bill>({
    id: 0,
    name: "TempBill",
    date: new Date("2001-11-09"),
    items: [],
    complete: false,
    payers: [],
    serviceCharge: Rate.fromBasisPoints(0),
    userEnteredTotal: Price.fromCents(42069),
  });

  useFocusEffect(
    useCallback(() => {
      if (editedBill) {
        setBill(editedBill);
        setPayers(editedBill.payers);

        for (const payer of editedBill.payers) {
          let itemList: BillItem[] = [];

          for (const item of editedBill.items) {
            for (const assTo of item.assignedTo) {
              if (assTo.payerId == payer.id) {
                const oldItems = itemList;
                itemList = [...oldItems, item];
              }
            }
          }
          payerItems.set(payer, itemList);
        }

        setPayerItems(payerItems);
      }
    }, [editedBill]),
  );

  useEffect(() => {
    let total = Price.fromCents(0);
    for (const payer of payers) {
      payer.amountToPay = Price.fromDecimal(0);

      const items = payerItems.get(payer);
      if (items === undefined) {
        break;
      }

      let itemTotal = Price.fromCents(0);

      for (const item of items) {
        const currItem = item.assignedTo.find((i) => i.payerId == payer.id);
        const payerQuantity = currItem?.quantity ?? 1;
        const itemShare = item.totalPrice
          .divide(item.assignedTo.length)
          .multiply(payerQuantity);
        itemTotal = itemTotal.add(itemShare);
      }

      const serviceCharge = bill.serviceCharge.applyTo(itemTotal);

      payer.amountToPay = itemTotal;
      payer.amountToPay = payer.amountToPay.add(serviceCharge);

      total = total.add(payer.amountToPay);
    }

    setTotalOwed(total);
  }, [payers, payerItems]);

  return (
    <View
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
            /* fadingEdgeLength={50} */ /* TODO: temporarily commented out until fadingEdgeLength rendering issue is resolved */
            style={styles.itemsContainer}
            contentContainerStyle={{ paddingHorizontal: 10 }}
            data={payers}
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
                    £ {item.amountToPay ? item.amountToPay.toDisplay() : "0.00"}
                  </ThemedText>
                </View>
                {showPriceBreakdown && (
                  <View style={styles.itemsList}>
                    {payerItems.get(item)?.map((billItem, index) => (
                      <InfoRow
                        key={index}
                        label={
                          <ThemedText type="default">
                            {(
                              billItem.quantity / billItem.assignedTo.length
                            ).toLocaleString()}{" "}
                            x {billItem.name}
                          </ThemedText>
                        }
                        value={
                          <ThemedText>
                            £{" "}
                            {billItem.totalPrice
                              .divide(billItem.assignedTo.length)
                              .toDisplay()}
                          </ThemedText>
                        }
                      />
                    ))}
                    {bill.serviceCharge.toDecimal() !== 0 && (
                      <InfoRow
                        label={
                          <ThemedText>
                            Service Charge: ({bill.serviceCharge.toDisplay()})
                          </ThemedText>
                        }
                        value={
                          <ThemedText>
                            {"£ " +
                              bill.serviceCharge
                                .portionOf(item.amountToPay!)
                                .toDisplay()}
                          </ThemedText>
                        }
                      />
                    )}
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
              {totalOwed.toDisplay()} / {bill.userEnteredTotal.toDisplay()}
            </ThemedText>
          </View>
        </Pressable>
      </View>
    </View>
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

  itemsContainer: {
    gap: 5,
  },
});
