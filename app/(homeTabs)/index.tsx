import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  StyleSheet,
  FlatList,
  View,
  RefreshControl,
  Pressable,
} from "react-native";

import { Colors } from "@/constants/Colors";

import { Bill } from "@/models/bill";
import BillCard from "@/components/bill/BillCard";
import Logo from "@/components/ui/logo";
import { useFocusEffect, useRouter } from "expo-router";
import { setBillComplete } from "@/utils/updateData";
import { useBillStore } from "@/utils/billStore";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { ThemedText } from "@/components/ThemedText";
import { LinearGradient } from "expo-linear-gradient";

import Animated, { SlideInRight, SlideOutRight, useReducedMotion } from "react-native-reanimated";
import { fetchAllBills, fetchBill } from "@/utils/fetchData";
import ActionFAB from "@/components/ui/ActionFAB";
import { removeBill } from "@/utils/removeData";

const BillPage = () => {
  const router = useRouter();
  const { setOriginalBill, resetEditedBill } = useBillStore();

  const [refreshing, setRefreshing] = useState(false); // State for refreshing
  const [bills, setBills] = useState<Bill[]>([]); // State for bills

  const billsFlatList = useRef<FlatList>(null);

  const loadBills = useCallback(async () => {
    setRefreshing(true);
    try {
      const fetchedBills = await fetchAllBills();
      setBills(fetchedBills);
    } catch (error) {
      console.error("Error fetching bills:", error);
    } finally {
      setRefreshing(false);
    }
  }, [fetchAllBills]);

  useFocusEffect(
    useCallback(() => {
      loadBills();
    }, [loadBills]),
  );

  // onRefresh already points to loadBills
  const onRefresh = loadBills;

  const [expandedBillId, setExpandedBillId] = useState<number | null>(null);
  const [selectedBillsIds, setSelectedBillsIds] = useState<number[]>([]);

  const toggleDropdown = (id: number) => {
    if (selectedBillsIds.length > 0) {
      handleSelect(id);
      return;
    }
    setExpandedBillId(expandedBillId === id ? null : id);
  };

  const editBill = async (id: number) => {
    setBillComplete(id, false);
    const bill = await fetchBill(id);
    setOriginalBill(bill);
    resetEditedBill();
    router.push("/bill");
  };

  const completeBill = (id: number) => {
    setBillComplete(id, true);
    onRefresh();
  };

  const handleComplete = (ids: number[]) => {
    for (const billId of ids) {
      setBillComplete(billId, true);
    }
    onRefresh();
    setSelectedBillsIds([]);
  };

  const handleDelete = async (billIds: number[]) => {
    for (const billId of billIds) {
      await removeBill(billId);
      console.log("Deleting bill:", billId);
    }
    onRefresh();
    setSelectedBillsIds([]);
  };

  const handleSelect = (id: number) => {
    if (selectedBillsIds.includes(id)) {
      setSelectedBillsIds(selectedBillsIds.filter((value) => value !== id));
      return;
    }
    setSelectedBillsIds([...selectedBillsIds, id]);
    setExpandedBillId(null);
  };

  return (
    <View style={styles.container}>
      <Logo />

      {/* Bill Cards */}
      <FlatList
        data={bills}
        ref={billsFlatList}
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

      <ActionFAB 
        activeColor={Colors.pastel.red}
        count={selectedBillsIds.length}
        onAdd={() => router.push("/(modals)/newBill")}
        onCancel={() => setSelectedBillsIds([])}
        actions={[
          { icon: "check", color: Colors.pastel.green, onPress: () => handleComplete(selectedBillsIds) },
          { icon: "delete", color: "red", iconColor: "white", onPress: () => handleDelete(selectedBillsIds) }
        ]}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  selectionOptions: {
    backgroundColor: Colors.light.background,
    position: "absolute",
    borderTopLeftRadius: 50,
    borderBottomLeftRadius: 50,
    borderWidth: 2,
    borderRightWidth: 0,
    paddingHorizontal: 15,
    paddingVertical: 15,
    marginBottom: 40,
    bottom: 0,
    right: 0,
    height: 90,
    flexDirection: "row",
    justifyContent: "space-evenly",
    gap: 10,
    elevation: 5,
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
  selectionOptionComplete: {
    backgroundColor: Colors.pastel.green,
  },
  selectionOptionCancel: {
    backgroundColor: Colors.pastel.cyan,
  },
  selectionOptionDelete: {
    backgroundColor: "red",
  },
  container: {
    flex: 1,
    paddingHorizontal: 20,
    backgroundColor: Colors.pastel.red,
  },
});

export default BillPage;
