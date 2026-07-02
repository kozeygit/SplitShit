import PayerIcon from "@/components/payer/PayerIcon";
import { ThemedText } from "@/components/ThemedText";
import ContainerView from "@/components/ui/ContainerView";
import InfoRow from "@/components/ui/InfoRow";
import { Colors } from "@/constants/Colors";
import { Bill, BillItem, NewBillItem } from "@/models/bill";
import { useBillStore } from "@/hooks/useBillStore";
import { getPayerById } from "@/utils/billUtils";
import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import { StyleSheet, View, FlatList } from "react-native";
import Touchable from "@/components/ui/Touchable";
import { Price } from "@/utils/priceUtils";
import InfoRowItemLabel from "@/components/ui/InfoRowItemLabel";

const AssignItemsDisplay = () => {
  const router = useRouter();
  const { editedBill, setEditedBill } = useBillStore();

  const openAssignModal = (item: BillItem | undefined) => {
    if (item)
      router.push({
        pathname: "/assignItemModal",
        params: { itemId: item?.id },
      });
  };

  if (!editedBill) {
    return (
      <View
        style={[
          styles.mainLayout,
          { justifyContent: "center", alignItems: "center" },
        ]}
      >
        <ThemedText>Loading bill workspace context...</ThemedText>
      </View>
    );
  }
  return (
    <View style={styles.mainLayout}>
      <ContainerView>
        <View style={styles.header}>
          <ThemedText type="title">{editedBill.name}</ThemedText>
        </View>
        <View style={{ flex: 1 }}>
          <FlatList
            ListEmptyComponent={
              <View style={styles.noItems}>
                <ThemedText>So no items?</ThemedText>
                <ThemedText type="grital">*breaks skateboard*</ThemedText>
                <ThemedText>Go back to the bill and add some!</ThemedText>
              </View>
            }
            /* fadingEdgeLength={50} // TODO: temporarily commented out until fadingEdgeLength rendering issue is resolved */
            style={styles.itemsContainer}
            contentContainerStyle={{ paddingHorizontal: 10 }}
            data={editedBill.items}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => (
              <Touchable onPress={() => openAssignModal(item)}>
                <View
                  style={{
                    borderBottomWidth: 2,
                    borderBottomColor: "lightgrey",
                    paddingVertical: 5,
                  }}
                >
                  <InfoRow
                    label={<InfoRowItemLabel item={item} />}
                    value={
                      <ThemedText>£{item.totalPrice.toDisplay()}</ThemedText>
                    }
                  />
                  {item.assignedTo.length >= 1 && (
                    <View style={styles.assignedPayersContainer}>
                      {item.assignedTo.map((obj, index) => {
                        const payer = getPayerById(editedBill, obj.payerId);
                        if (payer === undefined) {
                          return;
                        }
                        return <PayerIcon key={index} payer={payer} />;
                      })}
                    </View>
                  )}
                </View>
              </Touchable>
            )}
          />
        </View>
      </ContainerView>
    </View>
  );
};

export default AssignItemsDisplay;

const styles = StyleSheet.create({
  mainLayout: {
    flex: 1,
    backgroundColor: Colors.pastel.orange,
    paddingHorizontal: 20,
    paddingBottom: 30,
  },
  noItems: {
    paddingTop: 50,
    flex: 1,
    gap: 10,
  },
  assignedPayersContainer: {
    paddingBottom: 5,
    gap: 5,
    paddingTop: 10,
    flexDirection: "row",
    overflow: "hidden",
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

  itemsContainer: {
    marginTop: 10,
    gap: 5,
  },
});
