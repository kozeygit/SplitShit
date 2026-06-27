import { Alert, FlatList, StyleSheet, View } from "react-native";
import Touchable from "@/components/ui/Touchable";
import React, { useCallback, useRef, useState } from "react";
import { ThemedText } from "@/components/ThemedText";
import { Colors } from "@/constants/Colors";
import { useFocusEffect, useRouter } from "expo-router";
import { Group, Payer } from "@/models/bill";
import { useBillStore } from "@/hooks/useBillStore";
import { fetchAllGroupsWithPayers, fetchAllPayers } from "@/utils/fetchData";
import AdjustPayer from "@/components/payer/SelectPayer";
import ContainerView from "@/components/ui/ContainerView";
import { FormButtonRow } from "@/components/ui/FormButtonRow";
import {
  addGroupToBillDraft,
  removeGroupFromBillDraft,
} from "@/utils/billUtils";
import GroupCard from "@/components/group/GroupCard";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";

const EditBillPayersModal = () => {
  const router = useRouter();
  const { editedBill, setEditedBill } = useBillStore();
  const flatListRef = useRef<FlatList>(null);
  const isMounted = useRef(false);

  const [payers, setPayers] = useState<Payer[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);

  // apparently sets are a better choice for managing selected IDs than arrays, O(1) lookup
  const [selectedPayerIds, setSelectedPayerIds] = useState<Set<number>>(
    new Set(editedBill?.payers.map((p) => p.id) ?? []),
  );

  const [selectedGroupId, setSelectedGroupId] = useState<number | undefined>(
    editedBill?.groupId,
  );

  if (!editedBill) {
    router.back();
    return null;
  }

  useFocusEffect(
    useCallback(() => {
      const refresh = async () => {
        try {
          const [dbPayers, dbGroups] = await Promise.all([
            fetchAllPayers(),
            fetchAllGroupsWithPayers(),
          ]);

          const targetGroupId = editedBill.groupId;
          const initialPayerIds = new Set(editedBill.payers.map((p) => p.id));

          const currentGroup = dbGroups.find((g) => g.id === targetGroupId);

          let updatedPayers = dbPayers;
          if (currentGroup) {
            const groupPayerIds = new Set(
              currentGroup.payers.map((gp) => gp.id),
            );

            updatedPayers = dbPayers.map((p) =>
              groupPayerIds.has(p.id) ? { ...p, addedWithGroup: true } : p,
            );
          }

          setPayers(updatedPayers);
          setGroups(dbGroups);
          setSelectedGroupId(targetGroupId);
          setSelectedPayerIds(initialPayerIds);
        } catch (error) {
          console.error("Error loading payers:", error);
        }
      };

      refresh();
    }, [editedBill]),
  );

  const handleBack = () => {
    const originalIds = new Set(editedBill.payers.map((p) => p.id));
    const hasChanges =
      selectedPayerIds.size !== originalIds.size ||
      [...selectedPayerIds].some((id) => !originalIds.has(id));

    if (hasChanges) {
      Alert.alert(
        "Discard Changes?",
        "You have unsaved changes to your payers. Are you sure you want to go back?",
        [
          { text: "Keep Editing", style: "cancel" },
          {
            text: "Discard",
            style: "destructive",
            onPress: () => router.back(),
          },
        ],
      );
    } else {
      router.back();
    }
  };

  const togglePayer = (id: number) => {
    const newPayer = payers.find((p) => p.id == id);
    if (!newPayer) return;
    if (newPayer.addedWithGroup) return;

    const newBillState = { ...editedBill };

    if (selectedPayerIds.has(id)) {
      newBillState.payers = newBillState.payers.filter((p) => p.id !== id);
    } else {
      newBillState.payers = [...newBillState.payers, newPayer];
    }

    setEditedBill(newBillState);
  };

  const handleSelectGroup = (id: number) => {
    const selectedGroup = groups.find((group) => group.id == id);
    if (!selectedGroup) return;

    let newBillState;
    if (selectedGroupId == id) {
      setSelectedGroupId(0);
      newBillState = removeGroupFromBillDraft(editedBill);
    } else {
      setSelectedGroupId(id);
      newBillState = addGroupToBillDraft(editedBill, selectedGroup);
    }

    const newIds = new Set(newBillState.payers.map((p) => p.id));
    setSelectedPayerIds(newIds);
    setEditedBill(newBillState);
  };

  const handleSave = () => {
    const updatedBill = {
      ...editedBill,
      payers: payers.filter((p) => selectedPayerIds.has(p.id)),
    };
    setEditedBill(updatedBill);
    router.back();
  };

  const handleNewPayer = () => {
    const updatedBill = {
      ...editedBill,
      payers: payers.filter((p) => selectedPayerIds.has(p.id)),
    };
    setEditedBill(updatedBill);
    router.push({ pathname: "/newPayer" });
  };

  return (
    <View style={styles.outer}>
      <ContainerView>
        <View style={styles.title}>
          <ThemedText type="subtitle">{editedBill.name}</ThemedText>
          <ThemedText type="subtitle">
            {selectedPayerIds.size} selected
          </ThemedText>
        </View>

        {/* TODO: Add your Group dropdown selection anchor component here, wiring up its value updates directly to handleSelectGroup */}
        <View style={styles.groupDropdown}>
          <View style={styles.groupDropdownHeader}>
            <ThemedText type="subtitle">Groups</ThemedText>
            <MaterialIcons name="arrow-drop-down" size={24} color="grey" />
          </View>
          <FlatList
            contentContainerStyle={{ gap: 10, paddingVertical: 10 }}
            numColumns={1}
            data={groups}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => (
              <GroupCard
                groupData={item}
                isSelected={selectedGroupId === item.id}
                onSelect={() => handleSelectGroup(item.id)}
                onPress={handleSelectGroup}
              />
            )}
          />
        </View>

        <FlatList
          ref={flatListRef}
          contentContainerStyle={{ gap: 10, paddingVertical: 10 }}
          numColumns={1}
          data={payers}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <AdjustPayer
              onToggle={() => togglePayer(item.id)}
              payer={item}
              selected={selectedPayerIds.has(item.id)}
            />
          )}
        />
        <View style={styles.newPayerButtonOuter}>
          <Touchable onPress={handleNewPayer}>
            <View style={styles.newPayerButtonInner}>
              <ThemedText type="defaultSemiBold">New Payer</ThemedText>
            </View>
          </Touchable>
        </View>
      </ContainerView>
      <FormButtonRow
        onCancel={handleBack}
        onSubmit={handleSave}
        submitLabel={"Save"}
      />
    </View>
  );
};

export default EditBillPayersModal;

const styles = StyleSheet.create({
  groupDropdownHeader: {
    padding: 20,
    borderBottomWidth: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  groupDropdown: {
    borderColor: "grey",
    overflow: "hidden",
    borderWidth: 1,
    borderRadius: 10,
    backgroundColor: "white",
    marginBottom: 10,
    elevation: 2,
  },
  newPayerButtonInner: {
    padding: 7,
    justifyContent: "center",
    alignItems: "center",
  },
  newPayerButtonOuter: {
    borderColor: "grey",
    overflow: "hidden",
    borderWidth: 1,
    borderRadius: 50,
    backgroundColor: "white",
    elevation: 2,
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
});
