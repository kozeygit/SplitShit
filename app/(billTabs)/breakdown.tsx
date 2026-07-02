import PayerIcon from "@/components/payer/PayerIcon";
import { ThemedText } from "@/components/ThemedText";
import InfoRow from "@/components/ui/InfoRow";
import { Colors } from "@/constants/Colors";
import { Bill, BillItem, Payer } from "@/models/bill";
import { useBillStore } from "@/hooks/useBillStore";
import { useFocusEffect } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import { Price } from "@/utils/priceUtils";
import { StyleSheet, View, FlatList, Pressable } from "react-native";
import { Rate } from "@/utils/rateUtils";

const PayerBillItem = ({
  billItem,
  payer,
}: {
  billItem: BillItem;
  payer: Payer;
}) => {
  const totalQuantity = billItem.assignedTo.reduce(
    (acc, curr) => acc + curr.quantity,
    0,
  );
  const payerQuantity =
    billItem.assignedTo.find((i) => i.payerId === payer.id)?.quantity ?? 1;
  const displayQuantity = (billItem.quantity / totalQuantity) * payerQuantity;
  const payerShare = billItem.totalPrice
    .divide(totalQuantity)
    .multiply(payerQuantity);

  return (
    <InfoRow
      label={
        <ThemedText type="default">
          {displayQuantity.toLocaleString()} • {billItem.name}
        </ThemedText>
      }
      value={<ThemedText>£ {payerShare.toDisplay()}</ThemedText>}
    />
  );
};

const ServiceChargeRow = ({ bill, payer }: { bill: Bill; payer: Payer }) => {
  if (bill.serviceCharge.toDecimal() === 0) return null;

  return (
    <InfoRow
      label={
        <ThemedText>
          Service Charge{" "}
          <ThemedText type="darkGrital">
            ({bill.serviceCharge.toDisplay()})
          </ThemedText>
        </ThemedText>
      }
      value={
        <ThemedText>
          £ {bill.serviceCharge.portionOf(payer.amountToPay!).toDisplay()}
        </ThemedText>
      }
    />
  );
};

const DEFAULT_BILL: Bill = {
  id: 0,
  name: "TempBill",
  date: new Date("2001-11-09"),
  items: [],
  complete: false,
  payers: [],
  serviceCharge: Rate.fromBasisPoints(0),
  userEnteredTotal: Price.fromCents(42069),
};

const buildPayerItems = (bill: Bill): Map<Payer, BillItem[]> => {
  const map = new Map<Payer, BillItem[]>();
  for (const payer of bill.payers) {
    const items = bill.items.filter((item) =>
      item.assignedTo.some((a) => a.payerId === payer.id),
    );
    map.set(payer, items);
  }
  return map;
};

const BillBreakdownDisplay = () => {
  const { editedBill } = useBillStore();

  const [showPriceBreakdown, setShowPriceBreakdown] = useState(false);
  const [totalOwed, setTotalOwed] = useState<Price>(Price.fromCents(0));
  const [bill, setBill] = useState<Bill>(DEFAULT_BILL);
  const [payers, setPayers] = useState<Payer[]>([]);
  const [payerItems, setPayerItems] = useState<Map<Payer, BillItem[]>>(
    new Map(),
  );

  useFocusEffect(
    useCallback(() => {
      if (editedBill) {
        setBill(editedBill);
        setPayers(editedBill.payers);
        setPayerItems(buildPayerItems(editedBill));
      }
    }, [editedBill]),
  );

  useEffect(() => {
    let total = Price.fromCents(0);

    for (const payer of payers) {
      const items = payerItems.get(payer);
      if (!items) continue;

      let itemTotal = Price.fromCents(0);
      for (const item of items) {
        const totalQuantity = item.assignedTo.reduce(
          (acc, curr) => acc + curr.quantity,
          0,
        );
        const payerQuantity =
          item.assignedTo.find((i) => i.payerId === payer.id)?.quantity ?? 1;
        itemTotal = itemTotal.add(
          item.totalPrice.divide(totalQuantity).multiply(payerQuantity),
        );
      }

      payer.amountToPay = itemTotal.add(bill.serviceCharge.applyTo(itemTotal));
      total = total.add(payer.amountToPay);
    }

    setTotalOwed(total);
  }, [payers, payerItems]);

  return (
    <View style={styles.background}>
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
            style={styles.itemsContainer}
            contentContainerStyle={{ paddingHorizontal: 10 }}
            data={payers.filter((payer) => payer.amountToPay?.toDecimal() > 0)}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item: payer }) => (
              <View style={styles.payersContainer}>
                <View style={styles.payerRow}>
                  <View style={styles.payerName}>
                    <PayerIcon payer={payer} />
                    <ThemedText type="defaultSemiBold">{payer.name}</ThemedText>
                  </View>
                  <ThemedText type="subtitle">
                    £{" "}
                    {payer.amountToPay ? payer.amountToPay.toDisplay() : "0.00"}
                  </ThemedText>
                </View>

                {showPriceBreakdown && (
                  <View style={styles.itemsList}>
                    {payerItems.get(payer)?.map((billItem) => (
                      <PayerBillItem
                        key={billItem.id}
                        billItem={billItem}
                        payer={payer}
                      />
                    ))}
                    <ServiceChargeRow bill={bill} payer={payer} />
                  </View>
                )}
              </View>
            )}
          />
        </View>

        <Pressable onPress={() => setShowPriceBreakdown((prev) => !prev)}>
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
  background: {
    flex: 1,
    backgroundColor: Colors.pastel.turquoise,
    paddingHorizontal: 20,
  },
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
  payerRow: {
    paddingBottom: 10,
    paddingTop: 10,
    flexDirection: "row",
    overflow: "hidden",
    justifyContent: "space-between",
    alignItems: "center",
    paddingRight: 5,
  },
  payerName: {
    flexDirection: "row",
    alignItems: "center",
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
