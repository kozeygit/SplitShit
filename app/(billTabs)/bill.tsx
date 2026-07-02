import PayerIcon from "@/components/payer/PayerIcon";
import { ThemedText } from "@/components/ThemedText";
import ContainerView from "@/components/ui/ContainerView";
import InfoRow from "@/components/ui/InfoRow";
import { Colors } from "@/constants/Colors";
import { Bill, BillItem, NewBillItem } from "@/models/bill";
import { useBillStore } from "@/hooks/useBillStore";
import { updateBill } from "@/utils/updateData";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useFocusEffect, useRouter } from "expo-router";
import { isEqual, set } from "lodash";
import React, { useCallback, useEffect, useState } from "react";
import { Price } from "@/utils/priceUtils";
import {
  ScrollView,
  StyleSheet,
  View,
  Text,
  Pressable,
  Alert,
  AlertButton,
} from "react-native";
import Touchable from "@/components/ui/Touchable";
import { useImagePicker } from "@/hooks/useImagePicker";
import { deleteReceiptImage, saveReceiptImage } from "@/utils/fileSystem";
import { Rate } from "@/utils/rateUtils";
import { getBillTotals } from "@/utils/billUtils";
import InfoRowItemLabel from "@/components/ui/InfoRowItemLabel";

const BillDisplay = () => {
  const router = useRouter();
  const {
    originalBill,
    editedBill,
    setOriginalBill,
    resetEditedBill,
    setEditedBill,
  } = useBillStore();

  const [bill, setBill] = useState<Bill>({
    id: 0,
    name: "TempBill",
    date: new Date("2001-09-11"),
    items: [],
    complete: false,
    payers: [],
    serviceCharge: Rate.fromBasisPoints(0),
    userEnteredTotal: Price.fromCents(42069),
  });
  const { launchCamera, launchGallery } = useImagePicker({ aspect: undefined });

  useFocusEffect(
    useCallback(() => {
      if (editedBill) {
        setBill(editedBill);
      }
    }, [editedBill]),
  );

  const onSave = () => {
    if (isEqual(originalBill, editedBill)) {
      console.log("No changes made");
      router.back();
      return;
    }
    console.log("Changed");

    if (editedBill) {
      setOriginalBill(editedBill);
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
    router.push("/(billModals)/editBillDetailsModal");
  };

  const openPayerModal = () => {
    router.push("/(billModals)/editBillPayersModal");
  };

  const setReceiptImage = async (launchFn: () => Promise<string | null>) => {
    try {
      const uri = await launchFn();
      if (!uri) return;

      const imagePath = await saveReceiptImage(uri, bill.id);
      if (imagePath && editedBill) {
        // Automatically clean up old image from system memory if replacing it
        if (bill.imagePath) {
          deleteReceiptImage(bill.imagePath);
        }
        setEditedBill({ ...editedBill, imagePath });
      }
    } catch (error: any) {
      if (error.message === "Camera permission not granted") {
        Alert.alert(
          "Camera Access Required",
          "Please enable camera permissions in your device settings to scan bills.",
        );
      } else {
        Alert.alert("Error", error.message || "Failed to capture image.");
      }
    }
  };

  const handlePhotoButton = () => {
    const alertButtons: AlertButton[] = [
      {
        text: "Take Photo",
        onPress: () => setReceiptImage(launchCamera),
      },
      {
        text: "Choose from Gallery",
        onPress: () => setReceiptImage(launchGallery),
      },
    ];

    if (bill.imagePath) {
      alertButtons.push({
        text: "Delete Current Receipt",
        style: "destructive",
        onPress: () => {
          deleteReceiptImage(bill.imagePath!);
          if (editedBill) {
            setEditedBill({ ...editedBill, imagePath: undefined });
          }
        },
      });
    }

    alertButtons.push({ text: "Cancel", style: "cancel" });

    Alert.alert(
      bill.imagePath ? "Manage Receipt Image" : "Add Receipt Image",
      "Select a source below",
      alertButtons,
    );
  };

  const { itemsTotal, calculatedTotal } = getBillTotals(bill);

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: Colors.pastel.red,
        paddingHorizontal: 20,
      }}
    >
      <ContainerView>
        <Touchable onPress={openBillDetailsModal}>
          <View style={styles.header}>
            <View style={{ flex: 1 }}>
              <ThemedText type="title">{bill.name}</ThemedText>
              <ThemedText type="default">
                {bill.date.toLocaleDateString()}
                {"  -  "}
                {bill.payers.length} People
              </ThemedText>
            </View>
            <Touchable onPress={handlePhotoButton} style={styles.photoButton}>
              <MaterialIcons
                name={bill.imagePath ? "image" : "add-a-photo"}
                size={24}
                color="black"
              />
            </Touchable>
          </View>
        </Touchable>

        <Touchable onPress={openPayerModal}>
          <View style={styles.payersContainer}>
            {bill.payers.length > 0 ? (
              <ScrollView
                horizontal={true}
                /* fadingEdgeLength={50} */ /* TODO: temporarily commented out until fadingEdgeLength rendering issue is resolved */
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
        </Touchable>

        <View style={{ flex: 1 }}>
          <ScrollView
            /* fadingEdgeLength={50} */ /* TODO: temporarily commented out until fadingEdgeLength rendering issue is resolved */
            style={styles.itemsContainer}
            contentContainerStyle={{ paddingHorizontal: 10 }}
          >
            {bill.items.map((item) => (
              <Touchable onPress={() => openItemModal(item)} key={item.id}>
                <View key={item.id}>
                  <InfoRow
                    label={<InfoRowItemLabel item={item} />}
                    value={
                      <ThemedText>{item.totalPrice.toDisplay()}</ThemedText>
                    }
                  />
                </View>
              </Touchable>
            ))}
          </ScrollView>
          <View style={styles.newItemOuter}>
            <Touchable onPress={() => openItemModal(undefined)}>
              <View style={styles.newItemInner}>
                <ThemedText type="defaultSemiBold">Add Item</ThemedText>
              </View>
            </Touchable>
          </View>
        </View>

        <Touchable onPress={openBillDetailsModal}>
          <View style={styles.billDataContainer}>
            <InfoRow
              label={<ThemedText>Subtotal:</ThemedText>}
              value={
                <ThemedText>
                  {"£ " +
                    bill.items
                      .reduce(
                        (acc, item) => acc.add(item.totalPrice),
                        Price.fromDecimal(0),
                      )
                      .toDisplay()}
                </ThemedText>
              }
            />
            <InfoRow
              label={
                <ThemedText>
                  Service Charge: ({bill.serviceCharge.toDisplay()})
                </ThemedText>
              }
              value={
                <ThemedText>
                  {"£ " + bill.serviceCharge.applyTo(itemsTotal)}
                </ThemedText>
              }
            />
            <InfoRow
              label=<ThemedText type="subtitle">Total:</ThemedText>
              value={
                calculatedTotal.equals(bill.userEnteredTotal) ? (
                  <ThemedText type="subtitle">
                    {"£ " + bill.userEnteredTotal.toDisplay()}
                  </ThemedText>
                ) : (
                  <View style={{ flexDirection: "row", alignItems: "center" }}>
                    <ThemedText
                      type="default"
                      style={{ color: "red", fontSize: 18 }}
                    >
                      (
                      {calculatedTotal.isGreaterThan(bill.userEnteredTotal)
                        ? "+"
                        : ""}
                      {calculatedTotal
                        .subtract(bill.userEnteredTotal)
                        .toDisplay()}
                      )
                    </ThemedText>
                    <Text> </Text>
                    <ThemedText type="subtitle">
                      {"£ " + bill.userEnteredTotal.toDisplay()}
                    </ThemedText>
                  </View>
                )
              }
            />
          </View>
        </Touchable>
      </ContainerView>
      <View style={styles.buttonContainer}>
        <View style={styles.cancelButtonOuter}>
          <Touchable onPress={onCancel}>
            <View style={styles.cancelButtonInner}>
              <ThemedText type="defaultSemiBold" style={styles.cancelText}>
                Cancel
              </ThemedText>
            </View>
          </Touchable>
        </View>
        <View style={styles.submitButtonOuter}>
          <Touchable onPress={onSave}>
            <View style={styles.submitButtonInner}>
              <ThemedText type="defaultSemiBold" style={styles.submitText}>
                Save
              </ThemedText>
            </View>
          </Touchable>
        </View>
      </View>
    </View>
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
    flexDirection: "row",
    alignItems: "center",
  },
  photoButton: {
    borderWidth: 1,
    borderRadius: 50,
    padding: 12,
    backgroundColor: "white",
    elevation: 2,
  },

  itemsContainer: {
    marginTop: 10,
    gap: 5,
  },

  payersContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-evenly",
    borderBottomWidth: 1,
    borderColor: "black",
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
