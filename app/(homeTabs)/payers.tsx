import { ThemedText } from "@/components/ThemedText";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
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

import { Bill, BillItem, Payer } from "../../models/bill";
import PayerCard from "@/components/payer/PayerCard";
import Logo from "@/components/ui/logo";
import { useFocusEffect, useRouter } from "expo-router";
import { fetchPayers } from "@/utils/fetchData";

const PayerPage = () => {
  const router = useRouter();

  const [refreshing, setRefreshing] = useState(false);
  const [payers, setPayers] = useState<Payer[]>([]);
  
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      const fetchedPayers = await fetchPayers();
      setPayers(fetchedPayers);
    } catch (error) {
      console.error("Error fetching payers:", error);
    } finally {
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      onRefresh();
    }, [onRefresh])
  );
  
  return (
    <SafeAreaView style={styles.container}>
      <Logo />

      {/* Payer Cards */}
      <FlatList
        numColumns={2}
        data={payers}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => <PayerCard payerData={item} />}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    backgroundColor: Colors.pastel.blue,
  },
});

export default PayerPage;
