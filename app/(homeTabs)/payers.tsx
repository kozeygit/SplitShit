import { ThemedText } from "@/components/ThemedText";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import React, { useCallback, useEffect, useState } from "react";
import {
  View,
  StyleSheet,
  FlatList,
  RefreshControl,
  Alert,
} from "react-native";

import { Colors } from "@/constants/Colors";

import { Bill, BillItem, Payer } from "../../models/bill";
import PayerCard from "@/components/payer/PayerCard";
import Logo from "@/components/ui/Logo";
import { useFocusEffect, useRouter } from "expo-router";
import { fetchPayers } from "@/utils/fetchData";
import ActionFAB from "@/components/ui/ActionFAB";
import { useImagePicker } from "@/hooks/useImagePicker";
import { updatePayerImagePath } from "@/utils/updateData";
import { deletePayerImage, savePayerImage } from "@/utils/fileSystem";

const PayerPage = () => {
  const router = useRouter();

  const [refreshing, setRefreshing] = useState(false);
  const [payers, setPayers] = useState<Payer[]>([]);
  const [selectedPayerIds, setSelectedPayerIds] = useState<number[]>([]);
  const { pickImage } = useImagePicker({ aspect: [1, 1] });

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
    }, [onRefresh]),
  );

  const handlePickAndSaveImage = async (payer: Payer) => {
    const uri = await pickImage();
    if (!uri) return;

    const imagePath = await savePayerImage(uri, payer.id);
    await updatePayerImagePath(payer.id, imagePath);
    onRefresh();
  };

  const handleChangeImage = async (payer: Payer) => {
    if (!payer.imagePath) {
      await handlePickAndSaveImage(payer);
      return;
    }
    Alert.alert("Change Image", "Are you sure you want to change the image?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          if (payer.imagePath) {
            deletePayerImage(payer.imagePath);
          }
          await updatePayerImagePath(payer.id, undefined);
          onRefresh();
        },
      },
      {
        text: "Change",
        onPress: async () => {
          await handlePickAndSaveImage(payer);
        },
      },
    ]);
  };

  return (
    <View style={styles.container}>
      <Logo />

      {/* Payer Cards */}
      <FlatList
        numColumns={2}
        data={payers}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <PayerCard
            onLongPress={() => handleChangeImage(item)}
            payerData={item}
          />
        )}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      />

      <ActionFAB
        activeColor={Colors.pastel.blue}
        count={selectedPayerIds.length}
        onAdd={() => router.push("/(newModals)/newPayer")}
        onCancel={() => setSelectedPayerIds([])}
        actions={[
          {
            icon: "delete",
            color: "red",
            iconColor: "white",
            onPress: () => console.log("Delete payers:", selectedPayerIds),
          },
        ]}
      />
    </View>
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
