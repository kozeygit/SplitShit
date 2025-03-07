import React, { useCallback, useEffect, useState } from "react";
import {
  StyleSheet,
  FlatList,
  SafeAreaView,
  RefreshControl,
} from "react-native";

import { Colors } from "@/constants/Colors";

import { Bill } from "@/models/bill";
import BillCard from "@/components/bill/BillCard";
import { useGetData } from "@/hooks/useGetData";
import Logo from "@/components/ui/logo";
import { useFocusEffect, useRouter } from "expo-router";
import { setBillComplete } from "@/utils/updateData";
import { useBillStore } from "@/utils/billStore";

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
  const [expandedDeleteId, setExpandedDeleteId] = useState<number | null>(null);

  const toggleDropdown = (id: number) => {
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

  const toggleDelete = (id: number) => {
    setExpandedDeleteId(expandedDeleteId === id ? null : id);
  }

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
            isDeleteExpanded={expandedDeleteId === item.id}
            onToggleDropdown={toggleDropdown}
            onEdit={editBill}
            onComplete={completeBill}
            onDelete={toggleDelete}
          />
        )}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    backgroundColor: Colors.pastel.red,
  },
});

export default BillPage;
