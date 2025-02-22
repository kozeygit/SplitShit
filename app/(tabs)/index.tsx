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
import { useRouter } from "expo-router";
import { setBillComplete } from "@/utils/updateData";

const BillPage = () => {
  const router = useRouter();
  const { getBills } = useGetData();
  const [refreshing, setRefreshing] = useState(false); // State for refreshing

  const [bills, setBills] = useState<Bill[]>([]); // State for bills

  const fetchBills = useCallback(async () => {
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

  useEffect(() => {
    fetchBills();
  }, [fetchBills]);

  const [expandedBillId, setExpandedBillId] = useState<number | null>(null);

  const toggleDropdown = (id: number) => {
    setExpandedBillId(expandedBillId === id ? null : id);
  };

  const editBill = (id: number) => {
      router.push({pathname: "/editBill", params: {id: id}})
  };

  const completeBill = (id: number) => {
      console.log(id, "completed")
      setBillComplete(id)
    fetchBills();

  };

  const onRefresh = useCallback(() => {
    fetchBills();
  }, [fetchBills]);

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
            onToggleDropdown={toggleDropdown}
            onEdit={editBill}
            onComplete={completeBill}
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
