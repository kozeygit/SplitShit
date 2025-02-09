import { ThemedText } from "@/components/ThemedText";
import React, { useCallback, useEffect, useState } from "react";
import {
  View,
  StyleSheet,
  FlatList,
  TouchableNativeFeedback,
  SafeAreaView,
  Image,
  RefreshControl,
} from "react-native";

import { Colors } from "@/constants/Colors";

import { Bill } from "@/models/bill";
import BillCard from "@/components/bill/billCard";
import { useGetData } from "@/hooks/useGetData";
import Logo from "@/components/bill/logo";

const BillPage = () => {
  const { getBasicBills } = useGetData();
  const [refreshing, setRefreshing] = useState(false); // State for refreshing

  const [bills, setBills] = useState<Bill[]>([]); // State for bills

  const fetchBills = useCallback(async () => {
    setRefreshing(true);
    try {
      const fetchedBills = await getBasicBills();
      setBills(fetchedBills); // Correct: Functional update
    } catch (error) {
      console.error("Error fetching bills:", error);
    } finally {
      setRefreshing(false);
    }
  }, [getBasicBills]);

  useEffect(() => {
    fetchBills();
  }, [fetchBills]);

  const [expandedBillId, setExpandedBillId] = useState<number | null>(null);

  const toggleDropdown = (id: number) => {
    setExpandedBillId(expandedBillId === id ? null : id);
  };

  const onRefresh = useCallback(() => {
    fetchBills();
  }, [fetchBills]);

  console.log("BillPage rendered");

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
