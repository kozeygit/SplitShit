import { Alert, FlatList, StyleSheet, View } from "react-native";
import Touchable from "@/components/ui/Touchable";
import React, { useCallback, useRef, useState } from "react";
import { ThemedText } from "@/components/ThemedText";
import { Colors } from "@/constants/Colors";
import { useFocusEffect, useRouter } from "expo-router";
import { Payer } from "@/models/bill";
import { useBillStore } from "@/utils/billStore";
import { fetchPayers } from "@/utils/fetchData";
import AdjustPayer from "../../components/payer/AdjustPayer";
import ContainerView from "@/components/ui/ContainerView";

const EditBillPayersModal = () => {
  const router = useRouter();
  const { editedBill, setEditedBill } = useBillStore();
  const flatListRef = useRef<FlatList>(null);
  const isMounted = useRef(false);

  const [payers, setPayers] = useState<Payer[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<number>>(
    new Set(editedBill?.payers.map((p) => p.id) ?? []),
  );

  if (!editedBill) {
    router.back();
    return null;
  }

  useFocusEffect(
    useCallback(() => {
      const refreshAndScroll = async () => {
        try {
          const dbPayers = await fetchPayers();
          setPayers(dbPayers);

          if (isMounted.current) {
            requestAnimationFrame(() => {
              flatListRef.current?.scrollToEnd({ animated: true });
            });
          } else {
            isMounted.current = true;
          }
        } catch (error) {
          console.error("Error loading payers:", error);
        }
      };

      refreshAndScroll();
    }, [editedBill.payers]),
  );

  const handleBack = () => {
    const originalIds = new Set(editedBill.payers.map((p) => p.id));
    const hasChanges =
      selectedIds.size !== originalIds.size ||
      [...selectedIds].some((id) => !originalIds.has(id));

    if (hasChanges) {
      Alert.alert(
        "Discard Changes?",
        "You have unsaved changes to your payers. Are you sure you want to go back?",
        [
          { text: "Keep Editing", style: "cancel" },
          {
            text: "Discard",
            style: "destructive",
            onPress: () => router.back(),
          },
        ],
      );
    } else {
      router.back();
    }
  };

  const togglePayer = (id: number) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const handleSave = () => {
    const updatedBill = {
      ...editedBill,
      payers: payers.filter((p) => selectedIds.has(p.id)),
    };
    setEditedBill(updatedBill);
    router.back();
  };

  const handleNewPayer = () => {
    const updatedBill = {
      ...editedBill,
      payers: payers.filter((p) => selectedIds.has(p.id)),
    };
    setEditedBill(updatedBill);
    router.push({ pathname: "/newPayer" });
  };

  return (
    <View style={styles.outer}>
      <ContainerView>
        <View style={styles.title}>
          <ThemedText type="subtitle">{editedBill.name}</ThemedText>
          <ThemedText type="subtitle">{selectedIds.size} selected</ThemedText>
        </View>

        <FlatList
          ref={flatListRef}
          contentContainerStyle={{ gap: 10, paddingVertical: 10 }}
          numColumns={1}
          data={payers}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <AdjustPayer
              onToggle={() => togglePayer(item.id)}
              payer={item}
              selected={selectedIds.has(item.id)}
            />
          )}
        />
        <View style={styles.newPayerButtonOuter}>
          <Touchable onPress={handleNewPayer}>
            <View style={styles.newPayerButtonInner}>
              <ThemedText type="defaultSemiBold">New Payer</ThemedText>
            </View>
          </Touchable>
        </View>
      </ContainerView>
      <View style={styles.buttonContainer}>
        <View style={styles.cancelButtonOuter}>
          <Touchable onPress={handleBack}>
            <View style={styles.cancelButtonInner}>
              <ThemedText type="defaultSemiBold" style={styles.cancelText}>
                Back
              </ThemedText>
            </View>
          </Touchable>
        </View>
        <View style={styles.submitButtonOuter}>
          <Touchable onPress={handleSave}>
            <View style={styles.submitButtonInner}>
              <ThemedText type="defaultSemiBold" style={styles.cancelText}>
                Save
              </ThemedText>
            </View>
          </Touchable>
        </View>
      </View>
    </View>
  );
};

export default EditBillPayersModal;

const styles = StyleSheet.create({
  newPayerButtonInner: {
    padding: 7,
    justifyContent: "center",
    alignItems: "center",
  },
  newPayerButtonOuter: {
    borderColor: "grey",
    overflow: "hidden",
    borderWidth: 1,
    borderRadius: 50,
    backgroundColor: "white",
    elevation: 2,
  },
  buttonContainer: {
    marginVertical: 30,
    flexDirection: "row",
    gap: 10,
  },
  outer: {
    flex: 1,
    backgroundColor: Colors.pastel.orange,
    paddingHorizontal: 20,
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
