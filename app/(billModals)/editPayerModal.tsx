import {
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
import { useGetData } from "@/hooks/useGetData";
import AdjustPayerComponent from "../../components/payer/AdjustPayer";
import ContainerView from "@/components/ui/ContainerView";
import NewPayerPage from "../(modals)/newPayer";

const EditItemModal = () => {
  const router = useRouter();

  const { getPayers } = useGetData();
  const { editedBill, setEditedBill } = useBillStore();
  const flatListRef = useRef<FlatList>(null);

  const [payers, setPayers] = useState<Payer[]>([]);
  const [updatePayers, setUpdatePayers] = useState(false);

  if (!editedBill) {
    router.back();
    return;
  }

  useEffect(() => {
    const fetchPayers = async () => {
      const payers = await getPayers();
      payers.forEach((payer) => {
        const billPayer = editedBill.payers.find((p) => p.id === payer.id);
        if (billPayer) {
          payer.partySize = billPayer.partySize;
        } else {
          payer.partySize = 0;
        }
      });
      setPayers(payers);
    };
    fetchPayers();
  }, [editedBill]);

  useFocusEffect(
    useCallback(() => {
      const fetchPayers = async () => {
        const newPayers = await getPayers();
        newPayers.forEach((payer) => {
          const oldPayer = payers.find((p) => p.id === payer.id);
          if (oldPayer) {
            payer.partySize = oldPayer.partySize;
          } else {
            payer.partySize = 0;
          }
        });
        setPayers(newPayers);
      };
      if (updatePayers) {
        setUpdatePayers(false);
        fetchPayers();
      }
      flatListRef.current?.scrollToEnd({ animated: true });
    }, [updatePayers])
  );


  const handleSave = () => {
    editedBill.payers = payers.filter(
      (payer) => payer.partySize && payer.partySize > 0
    );
    setEditedBill(editedBill);
    router.back();
  };

  const handleBack = () => {
    router.back();
  };

  const handleNewPayer = () => {
    setUpdatePayers(true);
    router.push({ pathname: "/newPayer" });
  }

  return (
    <SafeAreaView style={styles.outer}>
      <ContainerView>
        <View style={styles.title}>
          <ThemedText type="subtitle">{editedBill.name}</ThemedText>
          <ThemedText type="subtitle">
            {editedBill.payers.length}
            {" • "}
            {payers.reduce((acc, payer) => acc + (payer.partySize ?? 1), 0)}
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
            <AdjustPayerComponent payer={item} party={item.partySize ?? 0} />
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

export default EditItemModal;

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
