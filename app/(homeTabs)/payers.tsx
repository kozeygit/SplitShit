import React, { useCallback, useEffect, useState } from "react";
import {
  View,
  StyleSheet,
  FlatList,
  RefreshControl,
  Alert,
  AlertOptions,
  AlertButton,
} from "react-native";

import { Colors } from "@/constants/Colors";

import { Bill, BillItem, Payer } from "../../models/bill";
import PayerCard from "@/components/payer/PayerCard";
import Logo from "@/components/ui/Logo";
import { useFocusEffect, useRouter } from "expo-router";
import { fetchAllPayers } from "@/utils/fetchData";
import ActionFAB from "@/components/ui/ActionFAB";
import { useImagePicker } from "@/hooks/useImagePicker";
import { updatePayerImagePath } from "@/utils/updateData";
import { deletePayerImage, savePayerImage } from "@/utils/fileSystem";
import { setProfileImage } from "@/utils/imageUtils";

const PayerPage = () => {
  const router = useRouter();

  const [refreshing, setRefreshing] = useState(false);
  const [payers, setPayers] = useState<Payer[]>([]);
  const [selectedPayerIds, setSelectedPayerIds] = useState<number[]>([]);
  const { launchCamera, launchGallery } = useImagePicker({ aspect: [1, 1] });

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      const fetchedPayers = await fetchAllPayers();
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

  const handleManageProfileImage = async (payer: Payer) => {
    // A tiny configuration blueprint mapping Payer functions to the generic handler
    const triggerUpdate = (launchFn: () => Promise<string | null>) =>
      setProfileImage({
        launchFn,
        currentImagePath: payer.imagePath,
        saveImageFn: (uri) => savePayerImage(uri, payer.id),
        deleteImageFn: deletePayerImage,
        updateDbFn: (path) => updatePayerImagePath(payer.id, path),
        onRefresh,
      });

    const alertButtons: AlertButton[] = [
      { text: "Take Photo", onPress: () => triggerUpdate(launchCamera) },
      {
        text: "Choose from Gallery",
        onPress: () => triggerUpdate(launchGallery),
      },
    ];

    if (payer.imagePath) {
      alertButtons.push({
        text: "Delete Current Photo",
        style: "destructive",
        onPress: async () => {
          deletePayerImage(payer.imagePath!);
          await updatePayerImagePath(payer.id, undefined);
          onRefresh();
        },
      });
    }

    alertButtons.push({ text: "Cancel", style: "cancel" });

    Alert.alert(
      payer.imagePath ? "Manage Profile Photo" : "Add Profile Photo",
      "Select an option below",
      alertButtons,
    );
  };

  const handleSelect = (id: number) => {
    if (selectedPayerIds.length === 0) {
      return;
    }
    if (selectedPayerIds.includes(id)) {
      setSelectedPayerIds(selectedPayerIds.filter((value) => value !== id));
      return;
    }
    setSelectedPayerIds([...selectedPayerIds, id]);
  };

  const handleLongSelect = (id: number) => {
    if (selectedPayerIds.includes(id)) {
      setSelectedPayerIds(selectedPayerIds.filter((value) => value !== id));
      return;
    }
    setSelectedPayerIds([...selectedPayerIds, id]);
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
            payerData={item}
            // onPress={handleSelect}
            onPress={() => handleManageProfileImage(item)} // just for testing, replace with actual onPress when i have something to use it for
            isSelected={selectedPayerIds.includes(item.id)}
            onSelect={handleLongSelect}
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
