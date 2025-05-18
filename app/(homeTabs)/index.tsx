import React, { useCallback, useEffect, useState } from "react";
import {
  StyleSheet,
  FlatList,
  SafeAreaView,
  RefreshControl,
  Pressable,
} from "react-native";

import { Colors } from "@/constants/Colors";

import { Bill } from "@/models/bill";
import BillCard from "@/components/bill/BillCard";
import { useGetData } from "@/hooks/useGetData";
import Logo from "@/components/ui/logo";
import { useFocusEffect, useRouter } from "expo-router";
import { setBillComplete } from "@/utils/updateData";
import { useBillStore } from "@/utils/billStore";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { ThemedText } from "@/components/ThemedText";
import { LinearGradient } from "expo-linear-gradient";

const BillPage = () => {
  const router = useRouter();
  const { getBills, getBill } = useGetData();
  const { setOriginalBill, resetEditedBill } = useBillStore();

  const [refreshing, setRefreshing] = useState(false); // State for refreshing
  const [bills, setBills] = useState<Bill[]>([]); // State for bills

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      const fetchedBills = await getBills();
      setBills(fetchedBills); // Correct: Functional update
    } catch (error) {
      console.error("Error fetching bills:", error);
    } finally {
      setRefreshing(false);
    }
  }, [getBills]);

  useFocusEffect(
    useCallback(() => {
      let bills: Bill[];
      const foo = async () => {
        bills = await getBills();
        setBills(bills); // Correct: Functional update
      };
      foo();
    }, [])
  );

  const [expandedBillId, setExpandedBillId] = useState<number | null>(null);
  const [selectedBillsIds, setSelectedBillsIds] = useState<number[]>([]);
  const [showSelectionOptions, setShowSelectionOptions] =
    useState<boolean>(false);

  const toggleDropdown = (id: number) => {
    if (selectedBillsIds.length > 0) {
      handleSelect(id)
      return
    }
    setExpandedBillId(expandedBillId === id ? null : id);
  };

  const editBill = async (id: number) => {
    setBillComplete(id, false);
    const bill = await getBill(id);
    setOriginalBill(bill);
    resetEditedBill();

    router.push("/bill");
  };

  const completeBill = (id: number) => {
    setBillComplete(id, true);
    onRefresh();
  };

  const handleDeleteBills = (billIds: number[]) => {
    billIds.forEach(element => {
      console.log("Deleting bill:", element)
    });
  };

  const handleSelect = (id: number) => {
    if (selectedBillsIds.includes(id)) {
      setSelectedBillsIds(selectedBillsIds.filter((value) => value !== id));
      return;
    }
    setSelectedBillsIds([...selectedBillsIds, id]);
    setExpandedBillId(null)
  };

  useEffect(() => {
    if (selectedBillsIds.length > 0) {
      console.log("something is selected");
      setShowSelectionOptions(true);
    } else {
      console.log("Selection Cleared");
      setShowSelectionOptions(false);
    }
  }, [selectedBillsIds]);

  return (
    <SafeAreaView style={styles.container}>
      <Logo />

      {/* Bill Cards */}
      <FlatList
        data={bills}
        keyExtractor={(item) => item.id.toString()}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        renderItem={({ item }) => (
          <BillCard
            billData={item}
            isExpanded={expandedBillId === item.id}
            isSelected={selectedBillsIds.includes(item.id)}
            onToggleDropdown={toggleDropdown}
            onEdit={editBill}
            onComplete={completeBill}
            onSelect={handleSelect}
          />
        )}
      />
      {showSelectionOptions && (
        <LinearGradient colors={["rgba(0,0,0,0)", "rgba(0,0,0,1)"]} style={styles.selectionOptions}>
          <Pressable style={[styles.selectionOption, styles.selectionOptionCancel]} onPress={() => {setSelectedBillsIds([])}}>
            <MaterialIcons name="cancel" size={35} />
          </Pressable>
          <Pressable style={styles.selectionOption}>
            <ThemedText type="subtitle" style={{fontSize: 25}}>{selectedBillsIds.length}</ThemedText>
          </Pressable>
          <Pressable style={[styles.selectionOption, styles.selectionOptionDelete]} onPress={() => handleDeleteBills(selectedBillsIds)}>
            <MaterialIcons name="delete" size={35} color={"white"} />
          </Pressable>
        </LinearGradient>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  selectionOptions: {
    position: "absolute",
    paddingBottom: 70,
    paddingTop: 50,
    bottom: 0,
    left: 0,
    right: 0,
    alignSelf: "center",
    height: 200,
    flexDirection: "row",
    justifyContent: "space-evenly",
  },
  selectionOption: {
    borderRadius: 100,
    aspectRatio: 1 / 1,
    borderWidth: 2,
    borderColor: "black",
    backgroundColor: "white",
    alignItems: "center",
    justifyContent: "center",
  },
  selectionOptionCancel: {
    backgroundColor: Colors.pastel.green
  },
  selectionOptionDelete: {
    backgroundColor: "red"
  },
  container: {
    flex: 1,
    paddingHorizontal: 20,
    backgroundColor: Colors.pastel.red,
  },
});

export default BillPage;
