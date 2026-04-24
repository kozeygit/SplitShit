import {
  Alert,
  FlatList,
  SafeAreaView,
  StyleSheet,
  TouchableNativeFeedback,
  View,
} from "react-native";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { ThemedText } from "@/components/ThemedText";
import { Colors } from "@/constants/Colors";
import { useFocusEffect, useRouter } from "expo-router";
import { Payer } from "@/models/bill";
import { useBillStore } from "@/utils/billStore";
import { fetchPayers } from "@/utils/fetchData"; // Direct fetch
import AdjustPayerComponent from "../../components/payer/AdjustPayer";
import ContainerView from "@/components/ui/ContainerView";

const syncPayersWithDraft = (dbPayers: Payer[], draftPayers: Payer[]) => {
  const draftMap = new Map(draftPayers.map((p) => [p.id, p.partySize]));
  return dbPayers.map((payer) => ({
    ...payer,
    partySize: draftMap.get(payer.id) ?? 0,
  }));
};

const EditBillPayersModal = () => {
  const router = useRouter();

  const { editedBill, setEditedBill } = useBillStore();
  const flatListRef = useRef<FlatList>(null);

  const [payers, setPayers] = useState<Payer[]>([]);
  const [updatePayers, setUpdatePayers] = useState(false);

  if (!editedBill) {
    router.back();
    return null;
  }

  useEffect(() => {
    const loadData = async () => {
      try {
        const dbPayers = await fetchPayers();
        const synced = syncPayersWithDraft(dbPayers, editedBill.payers);
        setPayers(synced);
      } catch (error) {
        console.error("Error loading payers:", error);
      }
    };
    loadData();
  }, [editedBill.id]);

  useFocusEffect(
    useCallback(() => {
      if (!updatePayers) return;

      const refreshAndScroll = async () => {
        const dbPayers = await fetchPayers();
        const synced = syncPayersWithDraft(dbPayers, editedBill.payers);
        
        setPayers(synced);
        setUpdatePayers(false);

        // Ensure the list has rendered the new person before scrolling
        requestAnimationFrame(() => {
          flatListRef.current?.scrollToEnd({ animated: true });
        });
      };

      refreshAndScroll();
    }, [updatePayers, editedBill.payers])
  );

  const handleBack = () => {
    const savedMap = new Map(editedBill.payers.map(p => [p.id, p.partySize ?? 0]));

    const hasChanges = payers.some(p => {
      const savedSize = savedMap.get(p.id) ?? 0;
      const currentSize = p.partySize ?? 0;
      return currentSize !== savedSize;
    });

    if (hasChanges) {
      Alert.alert(
        "Discard Changes?",
        "You have unsaved changes to your payers. Are you sure you want to go back?",
        [
          { text: "Keep Editing", style: "cancel" },
          { 
            text: "Discard", 
            style: "destructive", 
            onPress: () => router.back() 
          },
        ]
      );
    } else {
      router.back();
    }
  };

  const handlePayerSizeChange = (id: number, newSize: number) => {
    setPayers((prevPayers) =>
      prevPayers.map((p) =>
        p.id === id ? { ...p, partySize: newSize } : p
      )
    );
  };

  const handleSave = () => {
    // Create a new bill object (Immutability) for Zustand
    const updatedBill = {
      ...editedBill,
      payers: payers.filter((p) => (p.partySize ?? 0) > 0),
    };
    
    setEditedBill(updatedBill);
    router.back();
  };

  const handleNewPayer = () => {
    setUpdatePayers(true);
    router.push({ pathname: "/newPayer" });
  };

  return (
    <SafeAreaView style={styles.outer}>
      <ContainerView>
        <View style={styles.title}>
          <ThemedText type="subtitle">{editedBill.name}</ThemedText>
          <ThemedText type="subtitle">
            {editedBill.payers.length}
            {" • "}
            {payers.reduce((acc, payer) => acc + (payer.partySize ?? 0), 0)}
          </ThemedText>
        </View>

        <FlatList
        ref={flatListRef}
          fadingEdgeLength={200}
          contentContainerStyle={{ gap: 10, paddingVertical: 10 }}
          numColumns={1}
          data={payers}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <AdjustPayerComponent onValueChange={(newSize) => {handlePayerSizeChange(item.id, newSize)}} payer={item} party={item.partySize ?? 0} />
          )}
        />
            <View style={styles.newPayerButtonOuter}>
          <TouchableNativeFeedback onPress={handleNewPayer}>
            <View style={styles.newPayerButtonInner}>
              <ThemedText>New Payer</ThemedText>
            </View>
          </TouchableNativeFeedback>
        </View>
      </ContainerView>
      <View style={styles.buttonContainer}>
        <View style={styles.cancelButtonOuter}>
          <TouchableNativeFeedback onPress={handleBack}>
            <View style={styles.cancelButtonInner}>
              <ThemedText type="defaultSemiBold" style={styles.cancelText}>
                Back
              </ThemedText>
            </View>
          </TouchableNativeFeedback>
        </View>

        <View style={styles.submitButtonOuter}>
          <TouchableNativeFeedback onPress={handleSave}>
            <View style={styles.submitButtonInner}>
              <ThemedText type="defaultSemiBold" style={styles.cancelText}>
                Save
              </ThemedText>
            </View>
          </TouchableNativeFeedback>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default EditBillPayersModal;

const styles = StyleSheet.create({
  newPayerButtonInner: {
    padding: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  newPayerButtonOuter: {
    marginHorizontal: 20,
    marginTop: 10,
    overflow: "hidden",
    borderWidth: 2,
    borderRadius: 15,
    backgroundColor: "white",
    elevation: 5,
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
