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
import { useGetData } from "@/hooks/useGetData";
import Logo from "@/components/ui/logo";
import { useFocusEffect, useRouter } from "expo-router";

const PayerPage = () => {
  const router = useRouter();

  const { getPayers } = useGetData();

  const [refreshing, setRefreshing] = useState(false); // State for refreshing

  const [payers, setPayers] = useState<Payer[]>([]); // State for payers

  useEffect(() => {
    if (!refreshing) { return }

    let ignore = false;
    getPayers().then((result) => {
      if (!ignore) {
        setPayers(result);
        setRefreshing(false);
      }
    });
    return () => {
      ignore = true;
    };
  }, [refreshing]);

  const onRefresh = () => {
    setRefreshing(true);
  };

  useFocusEffect(
    useCallback(() => {
      onRefresh();
    }, [])
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
